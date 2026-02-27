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
    avatar: z.string().optional(),
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
    category: z.enum(['Fitness', 'Creative', 'Gaming', 'Learning', 'Lifestyle', 'Other']),
    challengeType: z.enum(['1v1', 'group', 'tournament']).default('1v1'),
    teamSize: z.number().min(2).max(10).optional(),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    deadlineTime: z.string().or(z.date()),

    mediaUrl: z.string().url('Invalid media URL').optional().or(z.literal('')),
    trailerUrl: z.string().url('Invalid trailer URL').optional().or(z.literal('')),
    mediaType: z.enum(['image', 'video']).default('image'),

    prizeType: z.enum(['money', 'digital', 'physical', 'NONE']).default('NONE'),
    prizeDetails: z.string().optional(),

    locationType: z.enum(['online', 'in-person']).default('online'),
    locationDetails: z.string().optional(),

    isPrivate: z.boolean().default(false),
    requiresSubscription: z.boolean().default(false),
    entryFee: z.number().min(0).optional(),
    restrictions: z.string().optional(),

    scoringType: z.enum(['best_of_3', 'best_of_5', 'best_of_7', 'points']).optional(),
    hasTimer: z.boolean().default(false),
    timerDurationMinutes: z.number().min(1).optional(),

    tournamentDetails: z.object({
        divisions: z.union([z.literal(2), z.literal(4), z.literal(6)])
    }).optional(),

    sponsorship: z.object({
        roiPercentage: z.number().min(0).max(100),
        creatorPercentage: z.number().min(0).max(100),
        status: z.enum(['pending', 'approved_by_creator', 'approved_by_sponsor', 'active'])
    }).optional(),

    // Legacy/System Fields
    badge: z.enum(['Prize', 'Normal']).default('Normal'),
    status: z.enum(['active', 'upcoming', 'ended']).default('upcoming'),
    isFree: z.boolean().default(true),
    prizePool: z.number().min(0).default(0),
    isPromoted: z.boolean().default(false),
    promotionLevel: z.number().default(0),
    ageRestriction: z.number().min(0).default(0),
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
    plan: z.enum(['observer', 'creator', 'competitor', 'executive_host', 'chief_producer', 'brand_partner', 'enterprise_sponsor']),
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
