import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Challenge from '@/lib/db/models/Challenge';
import Submission from '@/lib/db/models/Submission';
import Vote from '@/lib/db/models/Vote';
import Leaderboard from '@/lib/db/models/Leaderboard';
import { hashPassword } from '@/lib/utils/password';

export async function GET() {
    try {
        await connectDB();

        // Safety check to prevent accidental production wipe
        // Only allow in development or if specific header/query param is present
        if (process.env.NODE_ENV === 'production') {
            // return NextResponse.json({ error: 'Seeding disabled in production' }, { status: 403 });
            // Uncomment above in real prod. For now allow it.
        }

        console.log('🌱 Starting Database Seed...');

        // 1. Clear existing data
        await User.deleteMany({});
        await Challenge.deleteMany({});
        await Submission.deleteMany({});
        await Vote.deleteMany({});
        await Leaderboard.deleteMany({});

        // 2. Create Users
        const password = await hashPassword('password123');

        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@example.com',
                username: 'admin',
                password,
                role: 'admin',
                avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff',
            },
            {
                name: 'Sarah Creator',
                email: 'sarah@example.com',
                username: 'sarahcreator',
                password,
                role: 'creator',
                avatar: 'https://ui-avatars.com/api/?name=Sarah+Creator&background=ec4899&color=fff',
            },
            {
                name: 'John Doe',
                email: 'john@example.com',
                username: 'johndoe',
                password,
                role: 'user',
                avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=10b981&color=fff',
                stats: { totalPoints: 1200 },
            },
            {
                name: 'Emily Smith',
                email: 'emily@example.com',
                username: 'emilysmith',
                password,
                role: 'user',
                avatar: 'https://ui-avatars.com/api/?name=Emily+Smith&background=f59e0b&color=fff',
                stats: { totalPoints: 850 },
            },
            {
                name: 'Mike Johnson',
                email: 'mike@example.com',
                username: 'mikejohnson',
                password,
                role: 'user',
                avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=3b82f6&color=fff',
                stats: { totalPoints: 400 },
            }
        ]);

        const [admin, creator, user1, user2, user3] = users;

        // 3. Create Challenges
        const challenges = await (Challenge as any).create([
            {
                title: 'Urban Photography',
                description: 'Capture the essence of city life in a single frame. Look for unique angles, lighting, and moments.',
                category: 'Creative',
                difficulty: 'Medium',
                createdBy: creator._id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: 'active',
                image: 'https://picsum.photos/id/122/800/600',
                badge: 'Prize',
                prize: { amount: 500, currency: 'USD' },
                participants: 142,
            },
            {
                title: 'Morning Yoga Routine',
                description: 'Show us your morning flow! Create a 1-minute video of your wake-up yoga sequence.',
                category: 'Fitness',
                difficulty: 'Easy',
                createdBy: creator._id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                status: 'active',
                image: 'https://picsum.photos/id/145/800/600',
                badge: 'Normal',
                participants: 245,
            },
            {
                title: 'Healthy Breakfast Bowl',
                description: 'Share your most nutritious and delicious breakfast creation.',
                category: 'Lifestyle',
                difficulty: 'Easy',
                createdBy: creator._id,
                startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                status: 'ended',
                image: 'https://picsum.photos/id/225/800/600',
                badge: 'Normal',
                participants: 389,
            },
            {
                title: 'Concept Art: Future City',
                description: 'Design a futuristic city landscape using digital art tools.',
                category: 'Creative',
                difficulty: 'Hard',
                createdBy: creator._id,
                startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                status: 'upcoming',
                image: 'https://picsum.photos/id/134/800/600',
                badge: 'Prize',
                prize: { amount: 1000, currency: 'USD' },
                participants: 56,
            },
            {
                title: 'Sunset Photography Challenge',
                description: 'Capture the perfect golden hour moment. Show us your best sunset photography skills.',
                category: 'Creative',
                difficulty: 'Medium',
                createdBy: creator._id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                status: 'active',
                image: 'https://picsum.photos/id/146/800/600',
                badge: 'Normal',
                participants: 178,
            },
            {
                title: '30-Day Fitness Transformation',
                description: 'Document your 30-day fitness journey with weekly progress photos and workout videos.',
                category: 'Fitness',
                difficulty: 'Hard',
                createdBy: creator._id,
                startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
                status: 'upcoming',
                image: 'https://picsum.photos/id/147/800/600',
                badge: 'Prize',
                prize: { amount: 750, currency: 'USD' },
                participants: 92,
            },
            {
                title: 'Minimalist Home Decor',
                description: 'Share your minimalist interior design ideas. Less is more!',
                category: 'Lifestyle',
                difficulty: 'Easy',
                createdBy: creator._id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                status: 'active',
                image: 'https://picsum.photos/id/148/800/600',
                badge: 'Normal',
                participants: 203,
            },
            {
                title: 'Pet Portrait Photography',
                description: 'Capture the personality of your furry friends in stunning portraits.',
                category: 'Creative',
                difficulty: 'Medium',
                createdBy: creator._id,
                startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                status: 'ended',
                image: 'https://picsum.photos/id/149/800/600',
                badge: 'Prize',
                prize: { amount: 300, currency: 'USD' },
                participants: 456,
            },
            {
                title: 'Vegan Recipe Challenge',
                description: 'Create and share your most delicious plant-based recipe.',
                category: 'Lifestyle',
                difficulty: 'Easy',
                createdBy: creator._id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
                status: 'active',
                image: 'https://picsum.photos/id/150/800/600',
                badge: 'Normal',
                participants: 312,
            },
            {
                title: 'Abstract Digital Art',
                description: 'Push the boundaries of digital creativity with abstract compositions.',
                category: 'Creative',
                difficulty: 'Hard',
                createdBy: creator._id,
                startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
                status: 'upcoming',
                image: 'https://picsum.photos/id/151/800/600',
                badge: 'Prize',
                prize: { amount: 1200, currency: 'USD' },
                participants: 34,
            },
            {
                title: 'Home Workout Routine',
                description: 'Share your favorite no-equipment home workout routine.',
                category: 'Fitness',
                difficulty: 'Easy',
                createdBy: creator._id,
                startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                status: 'ended',
                image: 'https://picsum.photos/id/152/800/600',
                badge: 'Normal',
                participants: 521,
            },
            {
                title: 'Street Food Photography',
                description: 'Capture the vibrant world of street food culture.',
                category: 'Creative',
                difficulty: 'Medium',
                createdBy: creator._id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                status: 'active',
                image: 'https://picsum.photos/id/153/800/600',
                badge: 'Normal',
                participants: 267,
            },
            {
                title: 'Sustainable Living Tips',
                description: 'Share your best eco-friendly lifestyle hacks and sustainable living tips.',
                category: 'Lifestyle',
                difficulty: 'Easy',
                createdBy: creator._id,
                startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
                status: 'upcoming',
                image: 'https://picsum.photos/id/154/800/600',
                badge: 'Normal',
                participants: 78,
            },
            {
                title: 'Macro Photography Challenge',
                description: 'Explore the tiny world around us with stunning macro photography.',
                category: 'Creative',
                difficulty: 'Hard',
                createdBy: creator._id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
                status: 'active',
                image: 'https://picsum.photos/id/155/800/600',
                badge: 'Prize',
                prize: { amount: 600, currency: 'USD' },
                participants: 189,
            },
            {
                title: 'Dance Challenge',
                description: 'Show off your best dance moves! Any style, any music.',
                category: 'Fitness',
                difficulty: 'Medium',
                createdBy: creator._id,
                startDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                status: 'ended',
                image: 'https://picsum.photos/id/156/800/600',
                badge: 'Prize',
                prize: { amount: 400, currency: 'USD' },
                participants: 634,
            },
            {
                title: 'Coffee Art Challenge',
                description: 'Create beautiful latte art designs and share your coffee creations.',
                category: 'Lifestyle',
                difficulty: 'Medium',
                createdBy: creator._id,
                startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),
                status: 'upcoming',
                image: 'https://picsum.photos/id/157/800/600',
                badge: 'Normal',
                participants: 45,
            },
        ]);

        const [photoChallenge, yogaChallenge, foodChallenge, artChallenge, sunsetChallenge, fitnessChallenge, homeDecorChallenge, petChallenge, veganChallenge, abstractChallenge, homeWorkoutChallenge, streetFoodChallenge, sustainableChallenge, macroChallenge, danceChallenge, coffeeChallenge] = challenges;

        // 4. Create Submissions (including winners for ended challenges)
        const submissions = await (Submission as any).create([
            // Active challenge submissions
            {
                userId: user1._id,
                challengeId: photoChallenge._id,
                title: 'Neon Nights',
                description: 'Shot in downtown Tokyo.',
                mediaUrl: 'https://picsum.photos/id/160/800/600',
                mediaType: 'image',
                status: 'approved',
                votes: 245,
            },
            {
                userId: user2._id,
                challengeId: photoChallenge._id,
                title: 'Subway Silence',
                description: 'Empty station at 3AM.',
                mediaUrl: 'https://picsum.photos/id/161/800/600',
                mediaType: 'image',
                status: 'approved',
                votes: 189,
            },
            {
                userId: user3._id,
                challengeId: photoChallenge._id,
                title: 'Skyscraper Reflection',
                description: 'Looking up.',
                mediaUrl: 'https://picsum.photos/id/162/800/600',
                mediaType: 'image',
                status: 'approved',
                votes: 312,
            },

            // Ended challenge: Healthy Breakfast Bowl - WINNER
            {
                userId: user1._id,
                challengeId: foodChallenge._id,
                title: 'Rainbow Smoothie Bowl',
                description: 'Packed with fruits and superfoods!',
                mediaUrl: 'https://picsum.photos/id/163/800/600',
                mediaType: 'image',
                status: 'approved',
                votes: 567,
                isWinner: true,
            },
            {
                userId: user2._id,
                challengeId: foodChallenge._id,
                title: 'Avocado Toast Delight',
                description: 'Classic breakfast with a twist.',
                mediaUrl: 'https://picsum.photos/id/164/800/600',
                mediaType: 'image',
                status: 'approved',
                votes: 423,
            },

            // Ended challenge: Pet Portrait Photography - WINNER
            {
                userId: user3._id,
                challengeId: petChallenge._id,
                title: 'Golden Retriever Smile',
                description: 'My best friend looking majestic!',
                mediaUrl: 'https://picsum.photos/id/165/800/600',
                mediaType: 'image',
                status: 'approved',
                votes: 892,
                isWinner: true,
            },
            {
                userId: user1._id,
                challengeId: petChallenge._id,
                title: 'Cat in Sunlight',
                description: 'Peaceful afternoon nap.',
                mediaUrl: 'https://picsum.photos/id/166/800/600',
                mediaType: 'image',
                status: 'approved',
                votes: 678,
            },

            // Ended challenge: Home Workout Routine - WINNER
            {
                userId: user2._id,
                challengeId: homeWorkoutChallenge._id,
                title: '20-Minute HIIT Session',
                description: 'No equipment needed, maximum results!',
                mediaUrl: 'https://picsum.photos/id/167/800/600',
                mediaType: 'image',
                status: 'approved',
                votes: 734,
                isWinner: true,
            },
            {
                userId: user3._id,
                challengeId: homeWorkoutChallenge._id,
                title: 'Yoga Flow Sequence',
                description: 'Morning stretches for flexibility.',
                mediaUrl: 'https://picsum.photos/id/168/800/600',
                mediaType: 'image',
                status: 'approved',
                votes: 521,
            },

            // Ended challenge: Dance Challenge - WINNER
            {
                userId: user1._id,
                challengeId: danceChallenge._id,
                title: 'Hip Hop Freestyle',
                description: 'Street dance energy!',
                mediaUrl: 'https://picsum.photos/id/169/800/600',
                mediaType: 'image',
                status: 'approved',
                votes: 1245,
                isWinner: true,
            },
            {
                userId: user2._id,
                challengeId: danceChallenge._id,
                title: 'Contemporary Dance',
                description: 'Expressing emotions through movement.',
                mediaUrl: 'https://picsum.photos/id/170/800/600',
                mediaType: 'image',
                status: 'approved',
                votes: 987,
            },
        ]);

        // 5. Create Leaderboard Entries
        await (Leaderboard as any).create([
            {
                userId: user1._id,
                points: 1200,
                wins: 1,
                rank: 1,
            },
            {
                userId: user2._id,
                points: 850,
                wins: 0,
                rank: 2,
            },
            {
                userId: user3._id,
                points: 400,
                wins: 0,
                rank: 3,
            }
        ]);

        return NextResponse.json({
            message: 'Database Seeded Successfully! 🌱',
            summary: {
                users: users.length,
                challenges: challenges.length,
                submissions: submissions.length,
            }
        });

    } catch (error: any) {
        console.error('Seed Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
