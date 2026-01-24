import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscription extends Document {
    userId: mongoose.Types.ObjectId;
    plan: 'bronze' | 'silver' | 'gold' | 'platinum' | 'creator';
    price: number;
    status: 'active' | 'cancelled' | 'expired' | 'past_due';
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema: Schema<ISubscription> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            unique: true,
            index: true,
        },
        plan: {
            type: String,
            enum: ['bronze', 'silver', 'gold', 'platinum', 'creator'],
            required: [true, 'Plan is required'],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        status: {
            type: String,
            enum: ['active', 'cancelled', 'expired', 'past_due'],
            default: 'active',
            index: true,
        },
        stripeSubscriptionId: {
            type: String,
            default: null,
            sparse: true,
            unique: true,
        },
        stripeCustomerId: {
            type: String,
            default: null,
        },
        currentPeriodStart: {
            type: Date,
            required: [true, 'Current period start is required'],
        },
        currentPeriodEnd: {
            type: Date,
            required: [true, 'Current period end is required'],
        },
        cancelAtPeriodEnd: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
SubscriptionSchema.index({ status: 1, currentPeriodEnd: 1 }); // Find expiring subscriptions
SubscriptionSchema.index({ plan: 1 });
SubscriptionSchema.index({ stripeCustomerId: 1 });

const Subscription: Model<ISubscription> =
    mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

export default Subscription;
