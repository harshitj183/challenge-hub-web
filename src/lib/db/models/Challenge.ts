import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChallenge extends Document {
    title: string;
    description: string;
    category: string;
    image: string;
    badge: 'Prize' | 'Normal';
    status: 'active' | 'upcoming' | 'ended';
    startDate: Date;
    endDate: Date;
    prize?: {
        amount: number;
        description: string;
    };
    participants: number;
    maxParticipants?: number;
    rules: string[];
    createdBy: mongoose.Types.ObjectId;
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
        prize: {
            amount: {
                type: Number,
                default: 0,
            },
            description: {
                type: String,
                default: '',
            },
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
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
ChallengeSchema.index({ status: 1, startDate: -1 });
ChallengeSchema.index({ category: 1 });
ChallengeSchema.index({ badge: 1 });
ChallengeSchema.index({ createdBy: 1 });

const Challenge: Model<IChallenge> =
    mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', ChallengeSchema);

export default Challenge;
