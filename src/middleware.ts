import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: '/auth/login',
        },
    }
);

// Protected routes - require authentication
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/feed/:path*',
        '/challenges/:path*',
        '/my-challenges/:path*',
        '/leaderboards/:path*',
        '/winners/:path*',
        '/profile/:path*',
        '/subscriptions/:path*',
    ],
};




