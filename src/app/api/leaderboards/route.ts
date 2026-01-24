import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Leaderboard from '@/lib/db/models/Leaderboard';
import User from '@/lib/db/models/User';

// GET /api/leaderboards - Get leaderboard (global or challenge-specific)
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const challengeId = searchParams.get('challengeId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Build query
        const query: any = {};
        if (challengeId) {
            query.challengeId = challengeId;
        } else {
            query.challengeId = null; // Global leaderboard
        }

        // Get leaderboard entries
        const skip = (page - 1) * limit;
        const entries = await Leaderboard.find(query)
            .populate('userId', 'name email username avatar')
            .populate('challengeId', 'title image')
            .sort({ points: -1, wins: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Calculate ranks
        const entriesWithRank = entries.map((entry, index) => ({
            ...entry,
            rank: skip + index + 1,
        }));

        const total = await Leaderboard.countDocuments(query);

        return NextResponse.json({
            leaderboard: entriesWithRank,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error('Get leaderboard error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}

// POST /api/leaderboards - Update leaderboard (internal use)
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { userId, challengeId, points, wins } = body;

        // Update or create leaderboard entry
        const entry = await Leaderboard.findOneAndUpdate(
            { userId, challengeId: challengeId || null },
            {
                $inc: { points: points || 0, wins: wins || 0 },
            },
            { upsert: true, new: true }
        ).populate('userId', 'name email avatar');

        // Update user stats
        if (!challengeId) {
            // Update global stats
            await User.findByIdAndUpdate(userId, {
                $inc: {
                    'stats.totalPoints': points || 0,
                    'stats.challengesWon': wins || 0,
                },
            });
        }

        return NextResponse.json({
            message: 'Leaderboard updated successfully',
            entry,
        });
    } catch (error: any) {
        console.error('Update leaderboard error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update leaderboard' },
            { status: 500 }
        );
    }
}
