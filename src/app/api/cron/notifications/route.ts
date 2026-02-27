import { NextResponse } from 'next/server';
import webPush from 'web-push';
import dbConnect from '@/lib/db/mongodb';
import Challenge from '@/lib/db/models/Challenge';
import PushSubscription from '@/lib/db/models/PushSubscription';

// VAPID keys setup
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@photobox.com';

if (publicVapidKey && privateVapidKey) {
    webPush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
}

export async function GET(req: Request) {
    // In production, you would authenticate this route with a secret token
    // Example: if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) ...

    try {
        await dbConnect();
        if (!publicVapidKey || !privateVapidKey) {
            return NextResponse.json({ message: 'VAPID keys not configured.' }, { status: 500 });
        }

        const now = new Date();
        // Just as an example, fetch all active challenges that have a deadline in the next 1 hour
        // We'll broaden the sample for demonstration.
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        const upcomingChallenges = await Challenge.find({
            status: { $in: ['active', 'upcoming'] },
            deadlineTime: { $gte: now, $lte: oneHourFromNow }
        }).populate('createdBy', 'name');

        if (upcomingChallenges.length === 0) {
            return NextResponse.json({ message: 'No challenges require notifications right now.' });
        }

        // Ideally, we fetch users who "joined" or "saved/interested" these challenges.
        // For demonstration, we'll fetch all push subscriptions (broadcasting to everyone).
        // In a real app, query by `userId: { $in: challenge.interestedUsers }`.
        const subscriptions = await PushSubscription.find({});
        let sentCount = 0;

        for (const challenge of upcomingChallenges) {
            const creator = challenge.createdBy as any;
            const payload = JSON.stringify({
                title: `Challenge Ends Soon! ⏳`,
                body: `${challenge.title} by ${creator?.name || 'Creator'} is ending in less than an hour! Submit your entry now.`,
                url: `/challenges/${challenge._id}`,
                icon: challenge.image || '/icons/icon-192x192.png'
            });

            const sendPromises = subscriptions.map((sub) => {
                const pushSub = {
                    endpoint: sub.endpoint,
                    keys: sub.keys
                };
                return webPush.sendNotification(pushSub, payload).catch(err => {
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        console.log('Subscription has expired or is no longer valid: ', err);
                        return PushSubscription.findByIdAndDelete(sub._id);
                    }
                    console.error('Push notification error:', err);
                });
            });

            await Promise.all(sendPromises);
            sentCount += subscriptions.length;
        }

        return NextResponse.json({ message: `Successfully sent ${sentCount} notifications for ${upcomingChallenges.length} challenges.` });
    } catch (error) {
        console.error('Error in cron notifications:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
