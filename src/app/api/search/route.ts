import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Submission from '@/lib/db/models/Submission';
import Challenge from '@/lib/db/models/Challenge';
import User from '@/lib/db/models/User';

// GET /api/search?q=query&type=all|submissions|challenges|users
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const type = searchParams.get('type') || 'all';
        const limit = parseInt(searchParams.get('limit') || '20');

        if (!query || query.length < 2) {
            return NextResponse.json(
                { error: 'Search query must be at least 2 characters' },
                { status: 400 }
            );
        }

        const results: any = {};

        // Search Submissions
        if (type === 'all' || type === 'submissions') {
            const submissions = await Submission.find({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                ],
                status: 'approved',
            })
                .populate('userId', 'name avatar')
                .populate('challengeId', 'title category')
                .sort({ votes: -1, createdAt: -1 })
                .limit(limit)
                .lean();

            results.submissions = submissions;
        }

        // Search Challenges
        if (type === 'all' || type === 'challenges') {
            const challenges = await Challenge.find({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } },
                ],
            })
                .sort({ participants: -1, createdAt: -1 })
                .limit(limit)
                .lean();

            results.challenges = challenges;
        }

        // Search Users
        if (type === 'all' || type === 'users') {
            const users = await User.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } },
                ],
            })
                .select('name email avatar points role')
                .sort({ points: -1 })
                .limit(limit)
                .lean();

            results.users = users;
        }

        return NextResponse.json({
            query,
            results,
            count: {
                submissions: results.submissions?.length || 0,
                challenges: results.challenges?.length || 0,
                users: results.users?.length || 0,
            },
        });
    } catch (error: any) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: error.message || 'Search failed' },
            { status: 500 }
        );
    }
}
