import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import Vote from '@/lib/db/models/Vote';
import Submission from '@/lib/db/models/Submission';
import { authOptions } from '@/lib/auth/authOptions';
import { voteSchema } from '@/lib/utils/validation';
import { checkAndAwardBadges } from '@/lib/badges';

// POST /api/votes - Vote for a submission
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = voteSchema.parse(body);

        await connectDB();

        // Check if submission exists
        const submission = await Submission.findById(validatedData.submissionId);
        if (!submission) {
            return NextResponse.json(
                { error: 'Submission not found' },
                { status: 404 }
            );
        }

        // Check if user already voted
        const existingVote = await Vote.findOne({
            submissionId: validatedData.submissionId,
            userId: session.user.id,
        });

        if (existingVote) {
            // Remove vote (toggle)
            await Vote.findByIdAndDelete(existingVote._id);
            await Submission.findByIdAndUpdate(validatedData.submissionId, {
                $inc: { votes: -1 },
            });

            return NextResponse.json({
                message: 'Vote removed successfully',
                action: 'removed',
            });
        } else {
            // Add vote
            await Vote.create({
                submissionId: validatedData.submissionId,
                userId: session.user.id,
            });

            await Submission.findByIdAndUpdate(validatedData.submissionId, {
                $inc: { votes: 1 },
            });

            // Check badges for voter (Top Voter)
            await checkAndAwardBadges(session.user.id);

            // Check badges for submission author (Creative Genius)
            // submission was fetched earlier
            if (submission.userId) {
                await checkAndAwardBadges(submission.userId.toString());
            }

            return NextResponse.json({
                message: 'Vote added successfully',
                action: 'added',
            });
        }
    } catch (error: any) {
        console.error('Vote error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to process vote' },
            { status: 500 }
        );
    }
}

// GET /api/votes - Get user's votes
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const votes = await Vote.find({ userId: session.user.id })
            .populate('submissionId')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ votes });
    } catch (error: any) {
        console.error('Get votes error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch votes' },
            { status: 500 }
        );
    }
}
