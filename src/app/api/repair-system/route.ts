import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Submission from '@/lib/db/models/Submission';
import Follow from '@/lib/db/models/Follow';
import Leaderboard from '@/lib/db/models/Leaderboard';
import { checkAndAwardBadges } from '@/lib/badges';

export async function GET() {
    try {
        await connectDB();

        const users = await User.find({});
        const results = [];

        for (const user of users) {
            // Count actual submissions
            const submissionCount = await Submission.countDocuments({ userId: user._id });
            const totalLikesRes = await Submission.aggregate([
                { $match: { userId: user._id } },
                { $group: { _id: null, totalLikes: { $sum: '$votes' } } }
            ]);
            const totalLikes = totalLikesRes[0]?.totalLikes || 0;

            // Update stats
            const totalPoints = (submissionCount * 50) + (totalLikes * 10);
            user.stats.challengesEntered = submissionCount;
            user.stats.totalPoints = totalPoints;

            // Update Global Leaderboard
            await Leaderboard.findOneAndUpdate(
                { userId: user._id, challengeId: null },
                { points: totalPoints },
                { upsert: true }
            );

            // Fix missing username
            if (!user.username) {
                user.username = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                // Ensure uniqueness (simple version)
                const existing = await User.findOne({ username: user.username, _id: { $ne: user._id } });
                if (existing) {
                    user.username = user.username + Math.floor(Math.random() * 1000);
                }
            }

            await user.save();

            // Re-check badges
            await checkAndAwardBadges(user._id.toString());

            results.push({
                email: user.email,
                username: user.username,
                stats: user.stats,
                badgesAwarded: user.badges.length
            });
        }

        return NextResponse.json({
            message: 'Repair completed',
            results
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
