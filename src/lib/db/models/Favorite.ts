import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFavorite extends Document {
    userId: mongoose.Types.ObjectId;
    submissionId?: mongoose.Types.ObjectId;
    challengeId?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const FavoriteSchema: Schema<IFavorite> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        submissionId: {
            type: Schema.Types.ObjectId,
            ref: 'Submission',
            required: false,
        },
        challengeId: {
            type: Schema.Types.ObjectId,
            ref: 'Challenge',
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate favorites and speed up queries
// Compound index to prevent duplicate favorites
FavoriteSchema.index({ userId: 1, submissionId: 1 }, { unique: true, partialFilterExpression: { submissionId: { $exists: true } } });
FavoriteSchema.index({ userId: 1, challengeId: 1 }, { unique: true, partialFilterExpression: { challengeId: { $exists: true } } });

const Favorite: Model<IFavorite> = mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema);

export default Favorite;
