import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import { Challenge, Match, UserChallenge } from '@/lib/db/models';
import { authOptions } from '@/lib/auth/authOptions';
import mongoose from 'mongoose';

// GET /api/challenges/[id]/bracket - Get the tournament bracket
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const challengeId = params.id;

        await connectDB();

        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        const matches = await Match.find({ challengeId })
            .populate('participants', 'name avatar')
            .populate('winner', 'name avatar')
            .sort({ round: 1, division: 1 })
            .lean();

        return NextResponse.json({ matches });
    } catch (error: any) {
        console.error('Fetch bracket error:', error);
        return NextResponse.json({ error: 'Failed to fetch bracket' }, { status: 500 });
    }
}

// POST /api/challenges/[id]/bracket - Generate the tournament bracket
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

        await connectDB();

        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        // Check permissions: Admin or Creator
        if (session.user.role !== 'admin' && challenge.createdBy.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if bracket already exists
        const existingMatches = await Match.countDocuments({ challengeId });
        if (existingMatches > 0) {
            return NextResponse.json({ error: 'Bracket already exists' }, { status: 400 });
        }

        // Get participants
        const userChallenges = await UserChallenge.find({ challengeId, status: 'active' });
        const participants = userChallenges.map(uc => uc.userId);

        if (participants.length < 2) {
            return NextResponse.json({ error: 'At least 2 participants are required' }, { status: 400 });
        }

        // Shuffle participants
        for (let i = participants.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [participants[i], participants[j]] = [participants[j], participants[i]];
        }

        const divisionsCount = challenge.tournamentDetails?.divisions || 2;
        const divisionNames = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, divisionsCount);
        
        const matchesToCreate = [];

        // Distribute participants into divisions and create Round 1 matches
        const participantsPerDivision = Math.ceil(participants.length / divisionsCount);
        
        for (let d = 0; d < divisionsCount; d++) {
            const divisionParticipants = participants.slice(d * participantsPerDivision, (d + 1) * participantsPerDivision);
            const divisionName = divisionNames[d];
            let matchIdx = 0;

            for (let i = 0; i < divisionParticipants.length; i += 2) {
                const matchParticipants = [divisionParticipants[i]];
                if (divisionParticipants[i + 1]) {
                    matchParticipants.push(divisionParticipants[i + 1]);
                }

                matchesToCreate.push({
                    challengeId,
                    round: 1,
                    matchIndex: matchIdx++,
                    division: divisionName,
                    participants: matchParticipants,
                    status: matchParticipants.length === 2 ? 'active' : 'completed',
                    winner: matchParticipants.length === 1 ? matchParticipants[0] : undefined,
                    scores: matchParticipants.length === 2 ? [0, 0] : [0],
                });
            }
        }

        await Match.insertMany(matchesToCreate);

        return NextResponse.json({ message: 'Bracket generated successfully' });
    } catch (error: any) {
        console.error('Generate bracket error:', error);
        return NextResponse.json({ error: 'Failed to generate bracket' }, { status: 500 });
    }
}

// PATCH /api/challenges/[id]/bracket - Update a match score and advance winner
export async function PATCH(
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

        const { matchId, scores, winnerId } = await request.json();

        await connectDB();

        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        // Check permissions: Admin or Creator
        if (session.user.role !== 'admin' && challenge.createdBy.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const match = await Match.findById(matchId);
        if (!match) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        // Update current match
        match.scores = scores;
        match.winner = new mongoose.Types.ObjectId(winnerId);
        match.status = 'completed';
        await match.save();

        // Advance to next round
        const nextRound = match.round + 1;
        const nextMatchIndex = Math.floor(match.matchIndex / 2);
        const isFirstInPair = match.matchIndex % 2 === 0;

        // Find or create the next match
        let nextMatch = await Match.findOne({
            challengeId,
            round: nextRound,
            division: match.division,
            matchIndex: nextMatchIndex,
        });

        if (!nextMatch) {
            // Create next match placeholder
            nextMatch = new Match({
                challengeId,
                round: nextRound,
                division: match.division,
                matchIndex: nextMatchIndex,
                participants: [],
                scores: [0, 0],
                status: 'pending',
            });
        }

        // Add winner to the next round match
        // If it's the first in pair (0, 2, 4...), they go to participants[0]
        // If it's second (1, 3, 5...), they go to participants[1]
        const participantIdx = isFirstInPair ? 0 : 1;
        
        // Ensure participants array is sized correctly
        if (nextMatch.participants.length <= participantIdx) {
            const newParticipants = [...nextMatch.participants];
            while (newParticipants.length <= participantIdx) {
                newParticipants.push(null as any);
            }
            newParticipants[participantIdx] = match.winner;
            nextMatch.participants = newParticipants;
        } else {
            nextMatch.participants[participantIdx] = match.winner;
        }

        // If both participants are present, set status to active
        const actualParticipants = nextMatch.participants.filter(p => p !== null);
        if (actualParticipants.length === 2) {
            nextMatch.status = 'active';
        }

        await nextMatch.save();

        return NextResponse.json({ message: 'Match updated and winner advanced' });
    } catch (error: any) {
        console.error('Update match error:', error);
        return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
    }
}
