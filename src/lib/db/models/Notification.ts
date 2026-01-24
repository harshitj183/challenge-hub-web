import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'challenge' | 'submission' | 'vote' | 'winner' | 'subscription' | 'system';
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        type: {
            type: String,
            enum: ['challenge', 'submission', 'vote', 'winner', 'subscription', 'system'],
            required: [true, 'Type is required'],
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
            maxlength: [500, 'Message cannot exceed 500 characters'],
        },
        link: {
            type: String,
            default: null,
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 }); // Get unread notifications
NotificationSchema.index({ userId: 1, createdAt: -1 }); // Get all user notifications

const Notification: Model<INotification> =
    mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
