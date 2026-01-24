import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFavorite extends Document {
    userId: mongoose.Types.ObjectId;
    submissionId: mongoose.Types.ObjectId;
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
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate favorites and speed up queries
FavoriteSchema.index({ userId: 1, submissionId: 1 }, { unique: true });

const Favorite: Model<IFavorite> = mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema);

export default Favorite;
