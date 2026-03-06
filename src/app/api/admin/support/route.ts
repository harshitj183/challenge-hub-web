import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Mock support tickets since there is no Support model yet
        const tickets = [
            {
                id: 'T-1001',
                user: 'John Doe',
                subject: 'Payment Issue',
                status: 'open',
                priority: 'high',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
            },
            {
                id: 'T-1002',
                user: 'Sarah Smith',
                subject: 'Cannot upload images',
                status: 'in-progress',
                priority: 'medium',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                id: 'T-1003',
                user: 'Mike Wilson',
                subject: 'Badge not awarded',
                status: 'closed',
                priority: 'low',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
            },
            {
                id: 'T-1004',
                user: 'Elena Gilbert',
                subject: 'Account verification',
                status: 'open',
                priority: 'medium',
                createdAt: new Date(Date.now() - 259200000).toISOString(),
            }
        ];

        return NextResponse.json({ tickets });
    } catch (error: any) {
        console.error('Admin support error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch support tickets' },
            { status: 500 }
        );
    }
}
