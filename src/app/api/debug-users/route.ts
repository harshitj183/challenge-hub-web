import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await connectDB();

        // Get raw collection data to see if field exists in DB even if not in Mongoose model
        if (!mongoose.connection.db) {
            throw new Error('Database connection not established');
        }
        const rawUsers = await mongoose.connection.db.collection('users').find({}).toArray();

        const mongooseUsers = await User.find({}).lean();

        return NextResponse.json({
            schema: Object.keys(User.schema.paths),
            mongooseUsers: mongooseUsers.map(u => ({ email: u.email, username: u.username, name: u.name })),
            rawUsers: rawUsers.map(u => ({ email: u.email, username: u.username, name: u.name }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
