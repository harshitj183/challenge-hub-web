
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Challenge from '@/lib/db/models/Challenge';
import Submission from '@/lib/db/models/Submission';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const [totalChallenges, totalUsers, totalSubmissions] = await Promise.all([
            Challenge.countDocuments(),
            User.countDocuments(),
            Submission.countDocuments(),
        ]);

        // Mock prize money for now as we don't strictly track it yet
        // In reality, you'd sum up challenge prizes
        // const prizePool = await Challenge.aggregate([{ $group: { _id: null, total: { $sum: "$prize.amount" } } }]);
        const totalPrizes = 5000 + (totalChallenges * 100); // Simple formula for demo

        return NextResponse.json({
            stats: {
                totalChallenges,
                totalUsers,
                totalSubmissions,
                totalPrizes
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch public stats' },
            { status: 500 }
        );
    }
}
