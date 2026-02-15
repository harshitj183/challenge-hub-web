
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import dbConnect from '@/lib/db/mongodb';
import PushSubscription from '@/lib/db/models/PushSubscription';
import webpush, { sendPushNotification } from '@/lib/push';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { title, body, url } = await req.json();

        if (!title || !body) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        await dbConnect();

        const subscriptions = await PushSubscription.find({ userId: session.user.id });

        const payload = JSON.stringify({
            title,
            body,
            url: url || '/feed',
            icon: '/icon-192x192.png',
        });

        const promises = subscriptions.map(sub =>
            webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: sub.keys
            }, payload)
                .catch(err => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Start async cleanup...
                        PushSubscription.deleteOne({ _id: sub._id }).exec();
                    }
                    console.error('Push error:', err);
                    return null;
                })
        );

        await Promise.all(promises);

        return NextResponse.json({ message: 'Sent notification(s)' }, { status: 200 });
    } catch (error) {
        console.error('Error sending push:', error);
        return NextResponse.json({ message: 'Failed to send' }, { status: 500 });
    }
}
