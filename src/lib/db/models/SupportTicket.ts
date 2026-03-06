import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReply {
    message: string;
    isAdmin: boolean;
    authorName: string;
    createdAt: Date;
}

export interface ISupportTicket extends Document {
    ticketId: string;
    userId?: mongoose.Types.ObjectId;
    userName: string;
    userEmail: string;
    subject: string;
    message: string;
    category: 'payment' | 'technical' | 'account' | 'badge' | 'challenge' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    replies: IReply[];
    createdAt: Date;
    updatedAt: Date;
}

const ReplySchema = new Schema<IReply>({
    message: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    authorName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const SupportTicketSchema: Schema<ISupportTicket> = new Schema(
    {
        ticketId: {
            type: String,
            required: true,
            unique: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        userName: { type: String, required: true, trim: true },
        userEmail: { type: String, required: true, trim: true },
        subject: { type: String, required: true, trim: true, maxlength: 200 },
        message: { type: String, required: true, trim: true, maxlength: 2000 },
        category: {
            type: String,
            enum: ['payment', 'technical', 'account', 'badge', 'challenge', 'other'],
            default: 'other',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['open', 'in-progress', 'resolved', 'closed'],
            default: 'open',
        },
        replies: [ReplySchema],
    },
    { timestamps: true }
);

SupportTicketSchema.index({ status: 1, createdAt: -1 });
SupportTicketSchema.index({ userEmail: 1 });
SupportTicketSchema.index({ priority: 1 });

// Auto-generate ticketId before save
SupportTicketSchema.pre('save', async function (next) {
    if (!this.ticketId) {
        const count = await (mongoose.models.SupportTicket || mongoose.model('SupportTicket', SupportTicketSchema)).countDocuments();
        this.ticketId = `T-${String(1001 + count).padStart(4, '0')}`;
    }
    next();
});

const SupportTicket: Model<ISupportTicket> =
    mongoose.models.SupportTicket ||
    mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);

export default SupportTicket;
