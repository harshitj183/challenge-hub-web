
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/mongodb';
import { authOptions } from '@/lib/auth/authOptions';
import mongoose from 'mongoose';

// Ensure connection before using mongoose.connection
async function ensureConnection() {
    await connectDB();
}

// Helper to check admin
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        throw new Error('Unauthorized');
    }
}

export async function GET(request: NextRequest) {
    try {
        await checkAdmin();
        await ensureConnection();

        const { searchParams } = new URL(request.url);
        const collectionName = searchParams.get('collection');
        const countOnly = searchParams.get('count');

        // 1. List Collections
        if (!collectionName) {
            if (!mongoose.connection.db) throw new Error('Database not connected');
            const collections = await mongoose.connection.db.listCollections().toArray();
            const stats = await Promise.all(collections.map(async (c) => {
                const count = await mongoose.connection.db?.collection(c.name).countDocuments();
                return { name: c.name, count };
            }));

            return NextResponse.json({ collections: stats });
        }

        // 2. List Documents provided a collection
        if (!mongoose.connection.db) throw new Error('Database not connected');
        const collection = mongoose.connection.db.collection(collectionName);

        if (countOnly) {
            const count = await collection.countDocuments();
            return NextResponse.json({ count });
        }

        const limit = parseInt(searchParams.get('limit') || '50');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        const documents = await collection.find({})
            .skip(skip)
            .limit(limit)
            .toArray();

        // Convert ObjectId to string for JSON serialization
        // const safeDocs = JSON.parse(JSON.stringify(documents));

        return NextResponse.json({
            documents,
            page,
            limit
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Database error' },
            { status: error.message === 'Unauthorized' ? 401 : 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        await checkAdmin();
        await ensureConnection();

        const body = await request.json();
        const { collection: collectionName, id, data } = body;

        if (!collectionName || !id || !data) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        if (!mongoose.connection.db) throw new Error('Database not connected');
        const collection = mongoose.connection.db.collection(collectionName);

        // Try to create an ObjectId, otherwise assume string ID
        let queryId;
        try {
            queryId = new mongoose.Types.ObjectId(id);
        } catch (e) {
            queryId = id;
        }

        // Removing _id from data to prevent immutable field error
        const { _id, ...updateData } = data;

        const result = await collection.updateOne(
            { _id: queryId } as any,
            { $set: updateData }
        );

        return NextResponse.json({ success: true, result });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Update failed' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await checkAdmin();
        await ensureConnection();

        const { searchParams } = new URL(request.url);
        const collectionName = searchParams.get('collection');
        const id = searchParams.get('id');

        if (!collectionName || !id) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        if (!mongoose.connection.db) throw new Error('Database not connected');
        const collection = mongoose.connection.db.collection(collectionName);

        let queryId;
        try {
            queryId = new mongoose.Types.ObjectId(id);
        } catch (e) {
            queryId = id;
        }

        const result = await collection.deleteOne({ _id: queryId } as any);

        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Delete failed' },
            { status: 500 }
        );
    }
}
