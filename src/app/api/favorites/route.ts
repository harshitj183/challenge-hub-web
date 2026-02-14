import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import Favorite from '@/lib/db/models/Favorite';
import { authOptions } from '@/lib/auth/authOptions';

// GET /api/favorites - Get user's favorites
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const favorites = await Favorite.find({ userId: session.user.id })
            .populate({
                path: 'submissionId',
                populate: [
                    { path: 'userId', select: 'name username avatar' },
                    { path: 'challengeId', select: 'title category' }
                ]
            })
            .populate({
                path: 'challengeId',
                select: 'title category image videoUrl isFree entryFee'
            })
            .sort({ createdAt: -1 })
            .lean();

        // Filter out favorites where reference was deleted
        const validFavorites = favorites.filter((fav: any) => fav.submissionId !== null && (fav.challengeId === undefined || fav.challengeId !== null));

        return NextResponse.json({ favorites: validFavorites });
    } catch (error: any) {
        console.error('Get favorites error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch favorites' },
            { status: 500 }
        );
    }
}

// POST /api/favorites - Add to favorites (toggle)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { submissionId, challengeId } = body;

        if (!submissionId && !challengeId) {
            return NextResponse.json(
                { error: 'Submission ID or Challenge ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if already favorited
        const query: any = { userId: session.user.id };
        if (submissionId) query.submissionId = submissionId;
        if (challengeId) query.challengeId = challengeId;

        const existing = await Favorite.findOne(query);

        if (existing) {
            // Remove from favorites
            await Favorite.findByIdAndDelete(existing._id);
            return NextResponse.json({
                message: 'Removed from favorites',
                action: 'removed',
            });
        } else {
            // Add to favorites
            await Favorite.create(query);
            return NextResponse.json({
                message: 'Added to favorites',
                action: 'added',
            }, { status: 201 });
        }
    } catch (error: any) {
        console.error('Toggle favorite error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to toggle favorite' },
            { status: 500 }
        );
    }
}
