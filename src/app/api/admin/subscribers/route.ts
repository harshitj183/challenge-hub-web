import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Subscription from '@/lib/db/models/Subscription';
import { authOptions } from '@/lib/auth/authOptions';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Fetch subscriptions with user details
        const subscriptions = await Subscription.find()
            .populate('userId', 'name email username avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Subscription.countDocuments();

        return NextResponse.json({
            subscriptions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error('Admin subscribers error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch subscribers' },
            { status: 500 }
        );
    }
}
