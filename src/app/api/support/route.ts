import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import SupportTicket from '@/lib/db/models/SupportTicket';

// POST /api/support - Submit a new support ticket (public, authenticated users)
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const body = await request.json();

        const { subject, message, category, priority, userName, userEmail } = body;

        if (!subject || !message) {
            return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
        }

        // Get count to generate unique ticket ID
        const count = await SupportTicket.countDocuments();
        const ticketId = `T-${String(1001 + count).padStart(4, '0')}`;

        const ticket = await SupportTicket.create({
            ticketId,
            userId: session?.user?.id || undefined,
            userName: session?.user?.name || userName || 'Anonymous',
            userEmail: session?.user?.email || userEmail || 'unknown@example.com',
            subject: subject.trim(),
            message: message.trim(),
            category: category || 'other',
            priority: priority || 'medium',
            status: 'open',
        });

        return NextResponse.json({
            success: true,
            message: 'Support ticket submitted successfully! We will respond soon.',
            ticketId: ticket.ticketId,
        });
    } catch (error: any) {
        console.error('Create support ticket error:', error);
        return NextResponse.json({ error: error.message || 'Failed to submit ticket' }, { status: 500 });
    }
}

// GET /api/support - User can view their own tickets
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Please login to view your tickets' }, { status: 401 });
        }

        await connectDB();

        const tickets = await SupportTicket.find({
            $or: [
                { userId: session.user.id },
                { userEmail: session.user.email },
            ]
        })
            .select('ticketId subject status priority category createdAt replies')
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        return NextResponse.json({ tickets });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
