import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVote extends Document {
    submissionId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    votedAt: Date;
    createdAt: Date;
}

const VoteSchema: Schema<IVote> = new Schema(
    {
        submissionId: {
            type: Schema.Types.ObjectId,
            ref: 'Submission',
            required: [true, 'Submission ID is required'],
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        votedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure one vote per user per submission
VoteSchema.index({ submissionId: 1, userId: 1 }, { unique: true });

// Index for counting votes per submission
VoteSchema.index({ submissionId: 1, votedAt: -1 });

const Vote: Model<IVote> = mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);

export default Vote;
