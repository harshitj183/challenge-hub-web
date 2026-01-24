import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Submission from '@/lib/db/models/Submission';
import User from '@/lib/db/models/User';

export async function GET() {
    try {
        await connectDB();
        const submissions = await Submission.find({}).populate('userId', 'email name').lean();
        const users = await User.find({}).lean();

        return NextResponse.json({
            submissions: submissions.map(s => ({
                id: s._id,
                title: s.title,
                userId: s.userId?._id,
                userEmail: (s.userId as any)?.email,
                userName: (s.userId as any)?.name
            })),
            users: users.map(u => ({
                id: u._id,
                email: u.email,
                name: u.name,
                username: u.username,
                stats: u.stats
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
