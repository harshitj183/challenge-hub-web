import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { hashPassword } from '@/lib/utils/password';

export async function GET() {
    try {
        await connectDB();

        // Check if user exists
        const existing = await User.findOne({ email: 'john@example.com' }).select('+password');

        if (existing) {
            // If exists, maybe password is wrong? Reset it.
            const newHash = await hashPassword('password123');
            existing.password = newHash;
            await existing.save();

            return NextResponse.json({
                status: 'User exists - Password RESET to password123',
                id: existing._id,
                role: existing.role
            });
        }

        // Create user if missing
        console.log('Creating John Doe...');
        const password = await hashPassword('password123');
        const newUser = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password,
            role: 'user',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe',
            stats: { totalPoints: 1200 }
        });

        return NextResponse.json({ status: 'Created John Doe', id: newUser._id });
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
