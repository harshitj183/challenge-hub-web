import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import SupportTicket from '@/lib/db/models/SupportTicket';

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/support/[id] - Get a single ticket with full replies
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        const ticket = await SupportTicket.findOne({
            $or: [{ _id: id }, { ticketId: id }]
        })
            .populate('userId', 'name email avatar username')
            .lean();

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json({ ticket });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/admin/support/[id] - Update ticket status or priority
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;
        const body = await request.json();

        const updateFields: any = {};
        if (body.status) updateFields.status = body.status;
        if (body.priority) updateFields.priority = body.priority;

        const ticket = await SupportTicket.findOneAndUpdate(
            { $or: [{ _id: id }, { ticketId: id }] },
            { $set: updateFields },
            { new: true }
        );

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, ticket });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/admin/support/[id] - Add admin reply to a ticket
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;
        const body = await request.json();

        if (!body.message || !body.message.trim()) {
            return NextResponse.json({ error: 'Reply message is required' }, { status: 400 });
        }

        const reply = {
            message: body.message.trim(),
            isAdmin: true,
            authorName: session.user.name || 'Admin',
            createdAt: new Date(),
        };

        const ticket = await SupportTicket.findOneAndUpdate(
            { $or: [{ _id: id }, { ticketId: id }] },
            {
                $push: { replies: reply },
                $set: { status: 'in-progress' },  // Auto set in-progress when replied
            },
            { new: true }
        );

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, ticket, reply });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/admin/support/[id] - Delete a ticket
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        const ticket = await SupportTicket.findOneAndDelete({
            $or: [{ _id: id }, { ticketId: id }]
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Ticket deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
