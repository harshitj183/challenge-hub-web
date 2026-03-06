import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import Submission from '@/lib/db/models/Submission';
import { authOptions } from '@/lib/auth/authOptions';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const submission = await Submission.findByIdAndUpdate(
            params.id,
            { status: 'approved' },
            { new: true }
        );

        if (!submission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Submission approved successfully',
            submission,
        });
    } catch (error: any) {
        console.error('Admin approve submission error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to approve submission' },
            { status: 500 }
        );
    }
}
