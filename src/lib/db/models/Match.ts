import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatch extends Document {
    challengeId: mongoose.Types.ObjectId;
    round: number; // 1, 2, 3...
    matchIndex: number; // Index of the match within the round
    division?: string; // 'A', 'B', 'C', 'D', 'E', 'F' for 6 divisions
    participants: mongoose.Types.ObjectId[]; // Array of 2 player IDs
    scores: number[]; // Array of 2 scores
    winner?: mongoose.Types.ObjectId;
    status: 'pending' | 'active' | 'completed';
    scheduledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MatchSchema: Schema<IMatch> = new Schema(
    {
        challengeId: {
            type: Schema.Types.ObjectId,
            ref: 'Challenge',
            required: [true, 'Challenge ID is required'],
            index: true,
        },
        round: {
            type: Number,
            required: [true, 'Round number is required'],
            default: 1,
        },
        matchIndex: {
            type: Number,
            required: [true, 'Match index is required'],
            default: 0,
        },
        division: {
            type: String,
            default: 'A',
        },
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
        scores: [
            {
                type: Number,
                default: 0,
            }
        ],
        winner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'completed'],
            default: 'pending',
            index: true,
        },
        scheduledAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
MatchSchema.index({ challengeId: 1, round: 1, division: 1, matchIndex: 1 });
MatchSchema.index({ challengeId: 1, status: 1 });

const Match: Model<IMatch> =
    mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);

export default Match;
