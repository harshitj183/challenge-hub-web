import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import Challenge from '@/lib/db/models/Challenge';
import UserChallenge from '@/lib/db/models/UserChallenge';
import { authOptions } from '@/lib/auth/authOptions';

// POST /api/challenges/[id]/join - Join a challenge
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const challengeId = params.id;
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { rulesAccepted, nonRefundableAccepted } = body;

        if (!rulesAccepted || !nonRefundableAccepted) {
            return NextResponse.json(
                { error: 'All agreements must be accepted' },
                { status: 400 }
            );
        }

        await connectDB();

        // 1. Check if challenge exists and is active
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        if (challenge.status === 'ended') {
            return NextResponse.json({ error: 'Challenge has already ended' }, { status: 400 });
        }

        // 2. Check if user already joined
        const existingJoin = await UserChallenge.findOne({
            userId: session.user.id,
            challengeId: challengeId
        });

        if (existingJoin) {
            return NextResponse.json(
                { message: 'You have already joined this challenge', alreadyJoined: true },
                { status: 200 }
            );
        }

        // 3. Create join record
        const ip = request.headers.get('x-forwarded-for') || '0.0.0.0';
        
        const joinRecord = await UserChallenge.create({
            userId: session.user.id,
            challengeId: challengeId,
            rulesAccepted: true,
            nonRefundableAccepted: true,
            agreementTimestamp: new Date(),
            agreementIp: ip,
            status: 'active'
        });

        // 4. Increment participant count
        await Challenge.findByIdAndUpdate(challengeId, {
            $inc: { participants: 1 }
        });

        return NextResponse.json({
            message: 'Joined successfully',
            joinRecord
        });
    } catch (error: any) {
        console.error('Join challenge error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to join challenge' },
            { status: 500 }
        );
    }
}

// GET /api/challenges/[id]/join - Check join status
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const challengeId = params.id;
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ isJoined: false });
        }

        await connectDB();

        const joinRecord = await UserChallenge.findOne({
            userId: session.user.id,
            challengeId: challengeId
        });

        return NextResponse.json({
            isJoined: !!joinRecord,
            joinRecord: joinRecord || null
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
