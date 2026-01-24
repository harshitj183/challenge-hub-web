import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import Challenge from '@/lib/db/models/Challenge';
import { authOptions } from '@/lib/auth/authOptions';

// GET /api/challenges/[id] - Get single challenge
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const challengeId = params.id;

        console.log('Fetching challenge with ID:', challengeId);

        await connectDB();

        const challenge = await Challenge.findById(challengeId)
            .populate('createdBy', 'name email avatar')
            .lean();

        if (!challenge) {
            console.log('Challenge not found for ID:', challengeId);
            return NextResponse.json(
                { error: 'Challenge not found' },
                { status: 404 }
            );
        }

        console.log('Challenge found:', challenge.title);
        return NextResponse.json({ challenge });
    } catch (error: any) {
        console.error('Get challenge error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch challenge' },
            { status: 500 }
        );
    }
}

// PUT /api/challenges/[id] - Update challenge (Admin/Creator only)
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Find challenge
        const challenge = await Challenge.findById(params.id);
        if (!challenge) {
            return NextResponse.json(
                { error: 'Challenge not found' },
                { status: 404 }
            );
        }

        // Check permissions
        const isOwner = challenge.createdBy.toString() === session.user.id;
        const isAdmin = session.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { error: 'You do not have permission to update this challenge' },
                { status: 403 }
            );
        }

        // Update challenge
        const body = await request.json();
        const updatedChallenge = await Challenge.findByIdAndUpdate(
            params.id,
            { $set: body },
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email avatar');

        return NextResponse.json({
            message: 'Challenge updated successfully',
            challenge: updatedChallenge,
        });
    } catch (error: any) {
        console.error('Update challenge error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update challenge' },
            { status: 500 }
        );
    }
}

// DELETE /api/challenges/[id] - Delete challenge (Admin only)
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Only admins can delete challenges' },
                { status: 403 }
            );
        }

        await connectDB();

        const challenge = await Challenge.findByIdAndDelete(params.id);
        if (!challenge) {
            return NextResponse.json(
                { error: 'Challenge not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Challenge deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete challenge error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete challenge' },
            { status: 500 }
        );
    }
}
