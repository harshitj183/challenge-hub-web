import mongoose, { Schema, Document, Model } from 'mongoose';

// Update interface
export interface IChallenge extends Document {
    title: string;
    description: string;
    category: string;
    image: string; // Cover image
    videoUrl?: string; // Challenge video
    badge: 'Prize' | 'Normal';
    status: 'active' | 'upcoming' | 'ended';
    startDate: Date;
    endDate: Date;

    // Payment & Prizes
    isFree: boolean;
    entryFee?: number;
    prizeType: 'MONEY' | 'COINS' | 'NONE';
    prizePool: number; // Accumulated prize money
    organizerCommission: number; // percentage (e.g., 15)

    // Promotion
    isPromoted: boolean;
    promotionLevel?: number;

    // Restrictions
    ageRestriction?: number;

    // Location & Type
    type: 'VIRTUAL' | 'IN_PERSON';
    location?: {
        address: string;
        lat?: number;
        lng?: number;
        mapUrl?: string;
    };

    participants: number;
    maxParticipants?: number;
    rules: string[];
    createdBy: mongoose.Types.ObjectId;
    interestedUsers: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const ChallengeSchema: Schema<IChallenge> = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [5, 'Title must be at least 5 characters'],
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            minlength: [10, 'Description must be at least 10 characters'],
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['Fitness', 'Creative', 'Learning', 'Lifestyle', 'Other'],
        },
        image: {
            type: String,
            required: [true, 'Image is required'],
        },
        videoUrl: {
            type: String,
            default: '',
        },
        badge: {
            type: String,
            enum: ['Prize', 'Normal'],
            default: 'Normal',
        },
        status: {
            type: String,
            enum: ['active', 'upcoming', 'ended'],
            default: 'upcoming',
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },

        // Payment & Prizes
        isFree: {
            type: Boolean,
            default: true,
        },
        entryFee: {
            type: Number,
            default: 0,
        },
        prizeType: {
            type: String,
            enum: ['MONEY', 'COINS', 'NONE'],
            default: 'NONE',
        },
        prizePool: {
            type: Number,
            default: 0,
        },
        organizerCommission: {
            type: Number,
            default: 15, // 15% default
        },

        // Promotion
        isPromoted: {
            type: Boolean,
            default: false,
        },
        promotionLevel: {
            type: Number,
            default: 0,
        },

        // Restrictions
        ageRestriction: {
            type: Number,
            default: 0, // 0 means no restriction
        },

        // Location & Type
        type: {
            type: String,
            enum: ['VIRTUAL', 'IN_PERSON'],
            default: 'VIRTUAL',
        },
        location: {
            address: String,
            lat: Number,
            lng: Number,
            mapUrl: String,
        },

        participants: {

            type: Number,
            default: 0,
        },
        maxParticipants: {
            type: Number,
            default: null,
        },
        rules: {
            type: [String],
            default: [],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        interestedUsers: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
ChallengeSchema.index({ status: 1, startDate: -1 });
ChallengeSchema.index({ category: 1 });
ChallengeSchema.index({ badge: 1 });
ChallengeSchema.index({ type: 1 });
ChallengeSchema.index({ isPromoted: -1 });
ChallengeSchema.index({ 'location.address': 1 });

const Challenge: Model<IChallenge> =
    mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', ChallengeSchema);

export default Challenge;
