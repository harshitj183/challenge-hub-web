import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { comparePassword } from '@/lib/utils/password';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                console.log("🔐 Authorize called for:", credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.log("❌ Missing credentials");
                    throw new Error('Email and password are required');
                }

                try {
                    console.log("🔐 Connecting to DB...");
                    await connectDB();
                    console.log("✅ DB Connected");

                    // Find user by email and include password field
                    const user = await User.findOne({ email: credentials.email }).select('+password');
                    console.log("👤 User lookup result:", user ? user._id : "NOT FOUND");

                    if (!user) {
                        console.log("❌ User not found");
                        throw new Error('Invalid email or password');
                    }

                    // Verify password
                    console.log("🔐 Verifying password...");
                    const isPasswordValid = await comparePassword(credentials.password, user.password);
                    console.log("🔑 Password valid?", isPasswordValid);

                    if (!isPasswordValid) {
                        console.log("❌ Password mismatch");
                        throw new Error('Invalid email or password');
                    }

                    console.log("✅ Login Successful, returning user:", user.email);

                    // Return user object (without password)
                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        isPremium: user.isPremium,
                        avatar: user.avatar,
                    };
                } catch (error: any) {
                    console.error("🔥 Authorize Error:", error);
                    throw new Error(error.message || 'Authentication failed');
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.isPremium = user.isPremium;
                token.avatar = user.avatar;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.isPremium = token.isPremium as boolean;
                session.user.avatar = token.avatar as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: '7c20a8d46a84f3f2d1e2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4', // Hardcoded for verification
    debug: true,
    // Only override cookies in development/preview to handle the tunnel/localhost mismatch.
    // In production (Vercel), let NextAuth handle it automatically.
    ...(process.env.NODE_ENV !== 'production' && {
        cookies: {
            sessionToken: {
                name: `next-auth.session-token`,
                options: {
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                    secure: false, // Force non-secure in dev if using a tunnel that looks like http internally
                },
            },
        },
    }),
};
