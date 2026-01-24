import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import Follow from '@/lib/db/models/Follow';
import User from '@/lib/db/models/User';
import { authOptions } from '@/lib/auth/authOptions';

// GET /api/follow?userId=xxx - Get followers/following
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const type = searchParams.get('type'); // 'followers' or 'following'

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        let data;
        if (type === 'followers') {
            // Get users who follow this user
            const rawData = await Follow.find({ followingId: userId })
                .populate('followerId', 'name username avatar email')
                .lean();
            data = rawData.filter((f: any) => f.followerId !== null);
        } else if (type === 'following') {
            // Get users this user follows
            const rawData = await Follow.find({ followerId: userId })
                .populate('followingId', 'name username avatar email')
                .lean();
            data = rawData.filter((f: any) => f.followingId !== null);
        } else {
            // Get counts
            const followersCount = await Follow.countDocuments({ followingId: userId });
            const followingCount = await Follow.countDocuments({ followerId: userId });

            return NextResponse.json({
                followersCount,
                followingCount,
            });
        }

        return NextResponse.json({ data });
    } catch (error: any) {
        console.error('Get follow error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch follow data' },
            { status: 500 }
        );
    }
}

// POST /api/follow - Follow/Unfollow a user
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId } = body; // User to follow/unfollow

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        if (userId === session.user.id) {
            return NextResponse.json(
                { error: 'You cannot follow yourself' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if already following
        const existing = await Follow.findOne({
            followerId: session.user.id,
            followingId: userId,
        });

        if (existing) {
            // Unfollow
            await Follow.findByIdAndDelete(existing._id);
            return NextResponse.json({
                message: 'Unfollowed successfully',
                action: 'unfollowed',
            });
        } else {
            // Follow
            await Follow.create({
                followerId: session.user.id,
                followingId: userId,
            });
            return NextResponse.json({
                message: 'Followed successfully',
                action: 'followed',
            }, { status: 201 });
        }
    } catch (error: any) {
        console.error('Follow error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to follow/unfollow' },
            { status: 500 }
        );
    }
}
