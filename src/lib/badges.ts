import User from '@/lib/db/models/User';
import Vote from '@/lib/db/models/Vote';
import Submission from '@/lib/db/models/Submission';

export const BADGES = {
    FIRST_SUBMISSION: {
        id: 'first-submission',
        name: 'First Submission',
        description: 'Submitted your first entry',
        image: 'first-submission.png',
    },
    TOP_VOTER: {
        id: 'top-voter',
        name: 'Top Voter',
        description: 'Voted on 50 submissions',
        image: 'top-voter.png',
    },
    CHALLENGE_MASTER: {
        id: 'challenge-master',
        name: 'Challenge Master',
        description: 'Completed 10 challenges',
        image: 'challenge-master.png',
    },
    STREAK_KEEPER: {
        id: 'streak-keeper',
        name: 'Streak Keeper',
        description: 'Maintained a 7-day streak',
        image: 'streak-keeper.png',
    },
    CREATIVE_GENIUS: {
        id: 'creative-genius',
        name: 'Creative Genius',
        description: 'Received 100 votes on a submission',
        image: 'creative-genius.png',
    },
    COMMUNITY_HERO: {
        id: 'community-hero',
        name: 'Community Hero',
        description: 'Helped 25 users',
        image: 'community-hero.png',
    },
};

export async function checkAndAwardBadges(userId: string) {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const earnedBadgeIds = new Set(user.badges.map((b: any) => b.id));
        const newBadges = [];

        // Check First Submission
        if (!earnedBadgeIds.has(BADGES.FIRST_SUBMISSION.id)) {
            // Assuming this function is called after a submission
            // We could check actual submission count here if needed
            // For now, let's assume if they have challengesEntered > 0 (or we just query submissions)
            if (user.stats.challengesEntered > 0) {
                newBadges.push(BADGES.FIRST_SUBMISSION);
            }
        }

        // Check Challenge Master
        if (!earnedBadgeIds.has(BADGES.CHALLENGE_MASTER.id)) {
            if (user.stats.challengesEntered >= 10) {
                newBadges.push(BADGES.CHALLENGE_MASTER);
            }
        }

        // Check Top Voter
        if (!earnedBadgeIds.has(BADGES.TOP_VOTER.id)) {
            const voteCount = await Vote.countDocuments({ userId });
            if (voteCount >= 50) {
                newBadges.push(BADGES.TOP_VOTER);
            }
        }

        // Check Creative Genius
        if (!earnedBadgeIds.has(BADGES.CREATIVE_GENIUS.id)) {
            const popularSubmission = await Submission.findOne({ userId, votes: { $gte: 100 } });
            if (popularSubmission) {
                newBadges.push(BADGES.CREATIVE_GENIUS);
            }
        }

        if (newBadges.length > 0) {
            await User.findByIdAndUpdate(userId, {
                $push: {
                    badges: {
                        $each: newBadges.map(badge => ({
                            ...badge,
                            dateEarned: new Date(),
                        }))
                    }
                },
                $inc: { 'stats.badgesCollected': newBadges.length }
            });
            console.log(`Awarded ${newBadges.length} new badges to user ${userId}`);
        }
    } catch (error) {
        console.error('Error checking badges:', error);
    }
}
