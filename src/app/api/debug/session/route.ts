import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

// GET /api/debug/session - Check current session
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        return NextResponse.json({
            authenticated: !!session,
            session: session ? {
                user: {
                    id: session.user?.id,
                    email: session.user?.email,
                    name: session.user?.name,
                    role: session.user?.role,
                },
            } : null,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
