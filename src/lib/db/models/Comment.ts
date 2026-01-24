import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
    submissionId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema(
    {
        submissionId: {
            type: Schema.Types.ObjectId,
            ref: 'Submission',
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: [true, 'Comment content is required'],
            trim: true,
            minlength: [1, 'Comment must be at least 1 character'],
            maxlength: [500, 'Comment cannot exceed 500 characters'],
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
CommentSchema.index({ submissionId: 1, createdAt: -1 });

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
