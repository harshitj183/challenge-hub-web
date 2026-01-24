import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import Comment from '@/lib/db/models/Comment';
import { authOptions } from '@/lib/auth/authOptions';

// GET /api/comments?submissionId=xxx - Get comments for a submission
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const submissionId = searchParams.get('submissionId');

        if (!submissionId) {
            return NextResponse.json(
                { error: 'Submission ID is required' },
                { status: 400 }
            );
        }

        const rawComments = await Comment.find({ submissionId })
            .populate('userId', 'name username avatar')
            .sort({ createdAt: -1 })
            .lean();

        // Filter out comments from deleted users
        const comments = rawComments.filter((c: any) => c.userId !== null);

        return NextResponse.json({ comments });
    } catch (error: any) {
        console.error('Get comments error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { submissionId, content } = body;

        if (!submissionId || !content) {
            return NextResponse.json(
                { error: 'Submission ID and content are required' },
                { status: 400 }
            );
        }

        await connectDB();

        const comment = await Comment.create({
            submissionId,
            userId: session.user.id,
            content: content.trim(),
        });

        await comment.populate('userId', 'name username avatar');

        return NextResponse.json(
            {
                message: 'Comment added successfully',
                comment,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create comment error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create comment' },
            { status: 500 }
        );
    }
}

// DELETE /api/comments - Delete a comment
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const commentId = searchParams.get('id');

        if (!commentId) {
            return NextResponse.json(
                { error: 'Comment ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return NextResponse.json(
                { error: 'Comment not found' },
                { status: 404 }
            );
        }

        // Only allow deletion if user owns the comment
        if (comment.userId.toString() !== session.user.id) {
            return NextResponse.json(
                { error: 'You can only delete your own comments' },
                { status: 403 }
            );
        }

        await Comment.findByIdAndDelete(commentId);

        return NextResponse.json({
            message: 'Comment deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete comment error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete comment' },
            { status: 500 }
        );
    }
}
