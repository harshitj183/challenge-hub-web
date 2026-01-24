import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { BADGES } from '@/lib/badges';

export async function GET() {
    try {
        await connectDB();

        const user = await User.findOne({ email: 'john@example.com' });
        if (!user) {
            return NextResponse.json({ error: 'User John Doe not found' }, { status: 404 });
        }

        // Manually award First Submission Badge
        const badge = BADGES.FIRST_SUBMISSION;

        // Check if already has it
        const hasBadge = user.badges.some((b: any) => b.id === badge.id);

        if (!hasBadge) {
            user.badges.push({
                ...badge,
                dateEarned: new Date()
            });
            user.stats.totalPoints += 50; // Bonus points
            user.stats.badgesCollected += 1;
            await user.save();
            return NextResponse.json({ message: '🏆 Badge Awarded: First Submission!', user: user.name });
        } else {
            return NextResponse.json({ message: 'User already has this badge.', badges: user.badges });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
