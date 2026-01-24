import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Submission from '@/lib/db/models/Submission';
import Follow from '@/lib/db/models/Follow';
import mongoose from 'mongoose';

// GET /api/users/[username] - Get public user profile by username
export async function GET(
    request: NextRequest,
    context: any // Use any to avoid type issues with params promise
) {
    try {
        await connectDB();

        // Handle both async params (Next.js 15+) and sync params
        const params = await context.params;
        const rawUsername = params.username;

        if (!rawUsername) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const username = rawUsername.toLowerCase().replace('@', '');

        console.log('DEBUG: Params received:', params);
        console.log('DEBUG: searching for username:', username);

        // Find user by username
        let user = await User.findOne({
            $or: [
                { username: username },
                { email: username } // Fallback to email search
            ]
        })
            .select('name email username avatar points role bio location website instagram badges stats createdAt')
            .lean();

        // If not found by username/email, try by ID if it's a valid ObjectId
        if (!user && mongoose.Types.ObjectId.isValid(rawUsername)) {
            user = await User.findById(rawUsername)
                .select('name email username avatar points role bio location website instagram badges stats createdAt')
                .lean();
        }

        if (!user) {
            console.log('DEBUG: User not found in DB for:', username);
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        console.log('DEBUG: User found:', user.name);

        // Get user's submissions
        const submissions = await Submission.find({ userId: user._id, status: 'approved' })
            .populate('challengeId', 'title category')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        // Get followers/following counts
        const followersCount = await Follow.countDocuments({ followingId: user._id });
        const followingCount = await Follow.countDocuments({ followerId: user._id });

        return NextResponse.json({
            user: {
                ...user,
                username: user.username || user.email.split('@')[0], // Fallback if no username
                followersCount,
                followingCount,
            },
            submissions,
        });
    } catch (error: any) {
        console.error('Get user profile error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch user profile' },
            { status: 500 }
        );
    }
}
