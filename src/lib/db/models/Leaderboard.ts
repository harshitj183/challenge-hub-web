import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaderboard extends Document {
    userId: mongoose.Types.ObjectId;
    challengeId?: mongoose.Types.ObjectId;
    points: number;
    wins: number;
    rank: number;
    updatedAt: Date;
    createdAt: Date;
}

const LeaderboardSchema: Schema<ILeaderboard> = new Schema(
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
            default: null,
            index: true,
        },
        points: {
            type: Number,
            required: [true, 'Points are required'],
            default: 0,
            min: [0, 'Points cannot be negative'],
        },
        wins: {
            type: Number,
            default: 0,
            min: [0, 'Wins cannot be negative'],
        },
        rank: {
            type: Number,
            default: 0,
            min: [0, 'Rank cannot be negative'],
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for efficient leaderboard queries
LeaderboardSchema.index({ points: -1, wins: -1 }); // Global leaderboard sorted by points
LeaderboardSchema.index({ challengeId: 1, points: -1 }); // Challenge-specific leaderboard
LeaderboardSchema.index({ userId: 1, challengeId: 1 }, { unique: true }); // One entry per user per challenge

const Leaderboard: Model<ILeaderboard> =
    mongoose.models.Leaderboard || mongoose.model<ILeaderboard>('Leaderboard', LeaderboardSchema);

export default Leaderboard;
