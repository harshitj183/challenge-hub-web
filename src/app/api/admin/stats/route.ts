import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Challenge from '@/lib/db/models/Challenge';
import Submission from '@/lib/db/models/Submission';
import { authOptions } from '@/lib/auth/authOptions';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);


        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const [totalChallenges, totalUsers, totalSubmissions] = await Promise.all([
            Challenge.countDocuments(),
            User.countDocuments(),
            Submission.countDocuments(),
        ]);

        // Get active challenges count
        const activeChallenges = await Challenge.countDocuments({ status: 'active' });

        // Get recent challenges (last 5)
        const recentChallenges = await Challenge.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('createdBy', 'name')
            .select('title status participants startDate endDate')
            .lean();


        const topLeaders = await User.find()
            .sort({ 'stats.totalPoints': -1 })
            .limit(3)
            .select('name stats.totalPoints stats.challengesWon')
            .lean();

        // Get recent submissions for activity feed
        const recentSubmissions = await Submission.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name')
            .populate('challengeId', 'title')
            .select('userId challengeId status createdAt')
            .lean();

        // Calculate trends (simplified - comparing with last week)
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [newChallengesThisWeek, newUsersThisWeek, newSubmissionsThisWeek] = await Promise.all([
            Challenge.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
            User.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
            Submission.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
        ]);

        return NextResponse.json({
            stats: {
                totalChallenges,
                totalUsers,
                totalSubmissions,
                activeChallenges,
                trends: {
                    challenges: newChallengesThisWeek,
                    users: newUsersThisWeek,
                    submissions: newSubmissionsThisWeek,
                }
            },
            recentChallenges: recentChallenges.map(c => ({
                id: c._id.toString(),
                name: c.title,
                status: c.status,
                participants: c.participants || 0,
                duration: calculateDuration(c.startDate, c.endDate),
            })),
            topLeaders: topLeaders.map((user, idx) => ({
                rank: idx + 1,
                name: user.name,
                points: user.stats?.totalPoints || 0,
                challenges: user.stats?.challengesWon || 0,
            })),
            recentActivity: recentSubmissions.map(sub => ({
                user: (sub.userId as any)?.name || 'Unknown',
                action: `submitted to ${(sub.challengeId as any)?.title || 'a challenge'}`,
                time: getRelativeTime(sub.createdAt),
            })),
        });

    } catch (error: any) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch admin stats' },
            { status: 500 }
        );
    }
}

function calculateDuration(start: Date, end: Date): string {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
    return `${days} days`;
}

function getRelativeTime(date: Date): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}
