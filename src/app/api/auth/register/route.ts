import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { hashPassword } from '@/lib/utils/password';
import { registerSchema } from '@/lib/utils/validation';

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate input
        const validatedData = registerSchema.parse(body);

        // Connect to database
        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(validatedData.password);

        // Create new user
        const user = await User.create({
            name: validatedData.name,
            email: validatedData.email,
            password: hashedPassword,
            role: 'user',
            isPremium: false,
            stats: {
                totalPoints: 0,
                badgesCollected: 0,
                challengesEntered: 0,
                challengesWon: 0,
            },
        });

        // Return success response (without password)
        return NextResponse.json(
            {
                message: 'User registered successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isPremium: user.isPremium,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Registration error:', error);

        // Handle validation errors
        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        // Handle duplicate key error (MongoDB)
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Generic error
        return NextResponse.json(
            { error: error.message || 'Registration failed' },
            { status: 500 }
        );
    }
}
