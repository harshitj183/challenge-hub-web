import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFollow extends Document {
    followerId: mongoose.Types.ObjectId; // User who is following
    followingId: mongoose.Types.ObjectId; // User being followed
    createdAt: Date;
}

const FollowSchema: Schema<IFollow> = new Schema(
    {
        followerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        followingId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate follows and speed up queries
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
FollowSchema.index({ followingId: 1 }); // For getting followers

const Follow: Model<IFollow> = mongoose.models.Follow || mongoose.model<IFollow>('Follow', FollowSchema);

export default Follow;
