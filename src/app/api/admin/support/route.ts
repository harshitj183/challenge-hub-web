import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongodb';
import SupportTicket from '@/lib/db/models/SupportTicket';

// GET /api/admin/support - List all support tickets with filters
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const priority = searchParams.get('priority');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const query: any = {};
        if (status && status !== 'all') query.status = status;
        if (category && category !== 'all') query.category = category;
        if (priority && priority !== 'all') query.priority = priority;

        const skip = (page - 1) * limit;

        const [tickets, total] = await Promise.all([
            SupportTicket.find(query)
                .populate('userId', 'name email avatar username')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            SupportTicket.countDocuments(query),
        ]);

        // Stats summary
        const [openCount, inProgressCount, resolvedCount, closedCount] = await Promise.all([
            SupportTicket.countDocuments({ status: 'open' }),
            SupportTicket.countDocuments({ status: 'in-progress' }),
            SupportTicket.countDocuments({ status: 'resolved' }),
            SupportTicket.countDocuments({ status: 'closed' }),
        ]);

        return NextResponse.json({
            tickets,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            stats: { open: openCount, inProgress: inProgressCount, resolved: resolvedCount, closed: closedCount },
        });
    } catch (error: any) {
        console.error('Admin support GET error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch tickets' }, { status: 500 });
    }
}

// POST /api/admin/support - Seed initial mock tickets if DB is empty (dev helper)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const body = await request.json();

        // If action is 'seed', populate with demo data
        if (body.action === 'seed') {
            const existing = await SupportTicket.countDocuments();
            if (existing === 0) {
                const mockTickets = [
                    { ticketId: 'T-1001', userName: 'John Doe', userEmail: 'john@example.com', subject: 'Payment Issue', message: 'I was charged twice for my subscription. Please help resolve this immediately.', category: 'payment', priority: 'high', status: 'open' },
                    { ticketId: 'T-1002', userName: 'Sarah Smith', userEmail: 'sarah@example.com', subject: 'Cannot upload images', message: 'Whenever I try to upload my submission photo, it says "unsupported format" even though it is a JPG.', category: 'technical', priority: 'medium', status: 'in-progress' },
                    { ticketId: 'T-1003', userName: 'Mike Wilson', userEmail: 'mike@example.com', subject: 'Badge not awarded', message: 'I completed the Summer Challenge but did not receive the completion badge.', category: 'badge', priority: 'low', status: 'resolved', replies: [{ message: 'We have manually awarded your badge. Please refresh and check your profile.', isAdmin: true, authorName: 'Admin', createdAt: new Date() }] },
                    { ticketId: 'T-1004', userName: 'Elena Gilbert', userEmail: 'elena@example.com', subject: 'Account verification', message: 'My account is showing as unverified despite me clicking the verification link from my email.', category: 'account', priority: 'medium', status: 'open' },
                ];
                await SupportTicket.insertMany(mockTickets);
            }
            return NextResponse.json({ message: 'Seeded successfully' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
