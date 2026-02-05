import { z } from 'zod';

// User Registration Schema
export const registerSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters')
        .trim(),
    email: z
        .string()
        .email('Invalid email address')
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password cannot exceed 100 characters'),
});

// User Login Schema
export const loginSchema = z.object({
    email: z
        .string()
        .email('Invalid email address')
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(1, 'Password is required'),
});

// Update Profile Schema
export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters')
        .trim()
        .optional(),
    avatar: z
        .string()
        .url('Invalid avatar URL')
        .optional(),
    bio: z.string().max(160, 'Bio too long').optional(),
    location: z.string().max(50).optional(),
    website: z.union([z.string().url('Invalid URL'), z.literal('')]).optional(),
    instagram: z.string().max(30).optional(),
    tiktok: z.string().max(30).optional(),
    twitter: z.string().max(30).optional(),
    facebook: z.string().max(50).optional(),
    whatsapp: z.string().max(20).optional(),
    telegram: z.string().max(30).optional(),
});

// Challenge Creation Schema
export const createChallengeSchema = z.object({
    title: z
        .string()
        .min(5, 'Title must be at least 5 characters')
        .max(100, 'Title cannot exceed 100 characters')
        .trim(),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description cannot exceed 1000 characters')
        .trim(),
    category: z.enum(['Fitness', 'Creative', 'Learning', 'Lifestyle', 'Other']),
    image: z.string().url('Invalid image URL'),
    badge: z.enum(['Prize', 'Normal']).default('Normal'),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    prize: z
        .object({
            amount: z.number().min(0).optional(),
            description: z.string().optional(),
        })
        .optional(),
    maxParticipants: z.number().min(1).optional(),
    rules: z.array(z.string()).optional(),
});

// Submission Creation Schema
export const createSubmissionSchema = z.object({
    challengeId: z.string().min(1, 'Challenge ID is required'),
    title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title cannot exceed 100 characters')
        .trim(),
    description: z
        .string()
        .max(500, 'Description cannot exceed 500 characters')
        .trim()
        .optional(),
    mediaUrl: z.string().url('Invalid media URL'),
    mediaType: z.enum(['image', 'video']),
});

// Vote Schema
export const voteSchema = z.object({
    submissionId: z.string().min(1, 'Submission ID is required'),
});

// Subscription Schema
export const subscribeSchema = z.object({
    plan: z.enum(['bronze', 'silver', 'gold', 'platinum', 'creator']),
    paymentMethodId: z.string().min(1, 'Payment method is required'),
});

// Types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
