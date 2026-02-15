
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import dbConnect from '@/lib/db/mongodb';
import PushSubscription from '@/lib/db/models/PushSubscription';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { endpoint, keys, userAgent } = await req.json();

        if (!endpoint || !keys || !keys.auth || !keys.p256dh) {
            return NextResponse.json({ message: 'Invalid subscription data' }, { status: 400 });
        }

        await dbConnect();

        // Update if exists (maybe keys updated), or insert new.
        // We assume one endpoint is unique per device.
        const subscription = await PushSubscription.findOneAndUpdate(
            { endpoint },
            {
                userId: session.user.id,
                endpoint,
                keys,
                userAgent: userAgent || 'Unknown'
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ message: 'Subscription successful', subscription }, { status: 201 });
    } catch (error) {
        console.error('Error in Push Subscribe:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
