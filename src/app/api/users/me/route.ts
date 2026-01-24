import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Follow from '@/lib/db/models/Follow';
import Submission from '@/lib/db/models/Submission';
import { authOptions } from '@/lib/auth/authOptions';
import { updateProfileSchema } from '@/lib/utils/validation';

// GET /api/users/me - Get current user profile
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findById(session.user.id).select('-password').lean();
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch additional stats
        const [followersCount, followingCount, submissionData] = await Promise.all([
            Follow.countDocuments({ followingId: session.user.id }),
            Follow.countDocuments({ followerId: session.user.id }),
            Submission.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(session.user.id) } },
                { $group: { _id: null, totalLikes: { $sum: '$votes' }, count: { $sum: 1 } } }
            ])
        ]);

        const stats = {
            ...user.stats,
            followers: followersCount,
            following: followingCount,
            totalLikes: submissionData[0]?.totalLikes || 0,
            submissions: submissionData[0]?.count || 0,
        };

        return NextResponse.json({
            user: {
                ...user,
                stats
            }
        });
    } catch (error: any) {
        console.error('Get user profile error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch user profile' },
            { status: 500 }
        );
    }
}

// PUT /api/users/me - Update current user profile
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = updateProfileSchema.parse(body);

        await connectDB();

        const user = await User.findByIdAndUpdate(
            session.user.id,
            { $set: validatedData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            user,
        });
    } catch (error: any) {
        console.error('Update profile error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to update profile' },
            { status: 500 }
        );
    }
}
