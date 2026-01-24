import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

// GET /api/migrate-usernames - Add usernames to existing users
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Find all users without usernames
        const users = await User.find({ username: { $exists: false } });

        console.log(`Found ${users.length} users without usernames`);

        const updates = [];

        for (const user of users) {
            // Generate username from email (part before @)
            const emailUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');

            try {
                // Update user with username
                await User.findByIdAndUpdate(user._id, { username: emailUsername });
                updates.push({ email: user.email, username: emailUsername });
                console.log(`Updated ${user.email} with username: ${emailUsername}`);
            } catch (error: any) {
                console.error(`Failed to update ${user.email}:`, error.message);
            }
        }

        return NextResponse.json({
            message: 'Migration completed',
            updated: updates.length,
            users: updates
        });
    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { error: error.message || 'Migration failed' },
            { status: 500 }
        );
    }
}
