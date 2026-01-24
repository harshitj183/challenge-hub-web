import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: {
            hasMongo: !!process.env.MONGODB_URI,
            hasNextAuth: !!process.env.NEXTAUTH_SECRET
        }
    });
}
