import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import Submission from '@/lib/db/models/Submission';
import User from '@/lib/db/models/User';
import { authOptions } from '@/lib/auth/authOptions';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { submissionId, isWinner } = await request.json();

        if (!submissionId) {
            return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
        }

        await connectDB();

        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        const oldWinnerStatus = submission.isWinner;
        submission.isWinner = isWinner;
        await submission.save();

        // If newly marked as winner, increment user's challengesWon stat
        if (isWinner && !oldWinnerStatus) {
            await User.findByIdAndUpdate(submission.userId, {
                $inc: { 'stats.challengesWon': 1, 'stats.totalPoints': 500 }
            });
        }
        // If unmarked as winner, decrement
        else if (!isWinner && oldWinnerStatus) {
            await User.findByIdAndUpdate(submission.userId, {
                $inc: { 'stats.challengesWon': -1, 'stats.totalPoints': -500 }
            });
        }

        return NextResponse.json({
            success: true,
            message: `Submission marked as ${isWinner ? 'winner' : 'not a winner'}`
        });
    } catch (error: any) {
        console.error('Admin winner selection error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update winner status' },
            { status: 500 }
        );
    }
}
