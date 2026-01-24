import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubmission extends Document {
    challengeId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    votes: number;
    status: 'pending' | 'approved' | 'rejected';
    isWinner: boolean;
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const SubmissionSchema: Schema<ISubmission> = new Schema(
    {
        challengeId: {
            type: Schema.Types.ObjectId,
            ref: 'Challenge',
            required: [true, 'Challenge ID is required'],
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters'],
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
            default: '',
        },
        mediaUrl: {
            type: String,
            required: [true, 'Media URL is required'],
        },
        mediaType: {
            type: String,
            enum: ['image', 'video'],
            required: [true, 'Media type is required'],
        },
        votes: {
            type: Number,
            default: 0,
            min: [0, 'Votes cannot be negative'],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        isWinner: {
            type: Boolean,
            default: false,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for efficient queries
SubmissionSchema.index({ challengeId: 1, votes: -1 }); // Get top submissions by votes
SubmissionSchema.index({ userId: 1, createdAt: -1 }); // Get user's submissions
SubmissionSchema.index({ challengeId: 1, userId: 1 }, { unique: true }); // One submission per user per challenge
SubmissionSchema.index({ status: 1 });
SubmissionSchema.index({ isWinner: 1 });

const Submission: Model<ISubmission> =
    mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);

export default Submission;
