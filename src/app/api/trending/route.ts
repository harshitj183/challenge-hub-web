import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Submission from '@/lib/db/models/Submission';

// GET /api/trending?period=day|week|month&limit=10
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'week';
        const limit = parseInt(searchParams.get('limit') || '10');

        // Calculate date range
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case 'day':
                startDate.setDate(now.getDate() - 1);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }

        // Get trending submissions (most votes in time period)
        const trending = await Submission.find({
            createdAt: { $gte: startDate },
            status: 'approved',
        })
            .populate('userId', 'name avatar')
            .populate('challengeId', 'title category')
            .sort({ votes: -1, createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            period,
            trending,
            count: trending.length,
        });
    } catch (error: any) {
        console.error('Trending error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch trending' },
            { status: 500 }
        );
    }
}
