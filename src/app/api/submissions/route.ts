import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import Submission from '@/lib/db/models/Submission';
import Challenge from '@/lib/db/models/Challenge';
import UserChallenge from '@/lib/db/models/UserChallenge';
import User from '@/lib/db/models/User';
import { authOptions } from '@/lib/auth/authOptions';
import { createSubmissionSchema } from '@/lib/utils/validation';
import { checkAndAwardBadges } from '@/lib/badges';

// GET /api/submissions - Get submissions with filters
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const challengeId = searchParams.get('challengeId');
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');
        const id = searchParams.get('id');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Build query
        const query: any = {};
        if (id) query._id = id;
        if (challengeId) query.challengeId = challengeId;
        if (userId) query.userId = userId;
        if (status) query.status = status;

        // Execute query
        const skip = (page - 1) * limit;
        const submissions = await Submission.find(query)
            .populate('userId', 'name email username avatar')
            .populate('challengeId', 'title image badge category')
            .sort({ votes: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Submission.countDocuments(query);

        console.log('GET Submissions - Query:', query);
        console.log('GET Submissions - Found:', submissions.length);
        if (submissions.length > 0) {
            console.log('First submission userId:', submissions[0].userId);
        }

        return NextResponse.json({
            submissions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error('Get submissions error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch submissions' },
            { status: 500 }
        );
    }
}

// POST /api/submissions - Create new submission
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createSubmissionSchema.parse(body);

        await connectDB();

        // Check if challenge exists and is active
        const challenge = await Challenge.findById(validatedData.challengeId);
        if (!challenge) {
            return NextResponse.json(
                { error: 'Challenge not found' },
                { status: 404 }
            );
        }

        if (challenge.status === 'ended') {
            return NextResponse.json(
                { error: 'Challenge has ended. Submissions are no longer accepted.' },
                { status: 400 }
            );
        }

        // Check if user already submitted
        const existingSubmission = await Submission.findOne({
            challengeId: validatedData.challengeId,
            userId: session.user.id,
        });

        if (existingSubmission) {
            return NextResponse.json(
                { error: 'You have already submitted to this challenge' },
                { status: 400 }
            );
        }

        // Create submission
        console.log('Creating submission with session:', {
            userId: session.user.id,
            userEmail: session.user.email,
            userName: session.user.name,
        });

        const submission = await Submission.create({
            ...validatedData,
            userId: session.user.id,
            votes: 0,
            status: 'pending',
            isWinner: false,
        });

        console.log('Submission created with userId:', submission.userId);

        // Update user challenge status
        await UserChallenge.findOneAndUpdate(
            {
                userId: session.user.id,
                challengeId: validatedData.challengeId,
            },
            {
                progress: 100,
                status: 'completed',
                completedAt: new Date(),
            },
            { upsert: true }
        );

        await submission.populate([
            { path: 'userId', select: 'name email avatar' },
            { path: 'challengeId', select: 'title image badge' },
        ]);

        // Update user stats
        await User.findByIdAndUpdate(session.user.id, {
            $inc: {
                'stats.challengesEntered': 1,
                'stats.totalPoints': 50
            }
        });

        // Award Badges
        await checkAndAwardBadges(session.user.id);

        return NextResponse.json(
            {
                message: 'Submission created successfully',
                submission,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create submission error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to create submission' },
            { status: 500 }
        );
    }
}
