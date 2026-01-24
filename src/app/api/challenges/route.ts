import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import Challenge from '@/lib/db/models/Challenge';
import { authOptions } from '@/lib/auth/authOptions';
import { createChallengeSchema } from '@/lib/utils/validation';

// GET /api/challenges - Get all challenges with filters
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const badge = searchParams.get('badge');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Build query
        const query: any = {};

        if (status) query.status = status;
        if (category) query.category = category;
        if (badge) query.badge = badge;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const challenges = await Challenge.find(query)
            .populate('createdBy', 'name email avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Challenge.countDocuments(query);

        return NextResponse.json({
            challenges,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error('Get challenges error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch challenges' },
            { status: 500 }
        );
    }
}

// POST /api/challenges - Create new challenge (Admin/Creator only)
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin or creator
        if (session.user.role !== 'admin' && session.user.role !== 'creator') {
            return NextResponse.json(
                { error: 'Only admins and creators can create challenges' },
                { status: 403 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validatedData = createChallengeSchema.parse(body);

        await connectDB();

        // Create challenge
        const challenge = await Challenge.create({
            ...validatedData,
            createdBy: session.user.id,
            participants: 0,
            status: 'upcoming',
        });

        // Populate creator info
        await challenge.populate('createdBy', 'name email avatar');

        return NextResponse.json(
            {
                message: 'Challenge created successfully',
                challenge,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create challenge error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to create challenge' },
            { status: 500 }
        );
    }
}
