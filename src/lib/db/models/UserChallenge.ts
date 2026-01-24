import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserChallenge extends Document {
    userId: mongoose.Types.ObjectId;
    challengeId: mongoose.Types.ObjectId;
    progress: number;
    status: 'active' | 'completed' | 'abandoned';
    joinedAt: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserChallengeSchema: Schema<IUserChallenge> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        challengeId: {
            type: Schema.Types.ObjectId,
            ref: 'Challenge',
            required: [true, 'Challenge ID is required'],
            index: true,
        },
        progress: {
            type: Number,
            default: 0,
            min: [0, 'Progress cannot be negative'],
            max: [100, 'Progress cannot exceed 100'],
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'abandoned'],
            default: 'active',
            index: true,
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes
UserChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true }); // One entry per user per challenge
UserChallengeSchema.index({ userId: 1, status: 1 }); // Get user's active/completed challenges
UserChallengeSchema.index({ challengeId: 1, status: 1 }); // Get challenge participants

const UserChallenge: Model<IUserChallenge> =
    mongoose.models.UserChallenge || mongoose.model<IUserChallenge>('UserChallenge', UserChallengeSchema);

export default UserChallenge;
