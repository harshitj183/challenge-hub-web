import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    username?: string;
    password: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    facebook?: string;
    whatsapp?: string;
    telegram?: string;
    role: 'user' | 'admin' | 'creator';
    isPremium: boolean;
    premiumExpiry?: Date;
    stats: {
        totalPoints: number;
        badgesCollected: number;
        challengesEntered: number;
        challengesWon: number;
    };
    wallet: {
        coins: number;
        balance: number; // For cash/money
    };
    badges: {
        id: string;
        name: string;
        description: string;
        image: string;
        dateEarned: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        username: {
            type: String,
            unique: true,
            sparse: true, // Allows null values to be non-unique
            lowercase: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [30, 'Username cannot exceed 30 characters'],
            match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default
        },
        avatar: {
            type: String,
            default: null,
        },
        bio: {
            type: String,
            maxlength: [160, 'Bio cannot exceed 160 characters'],
            default: '',
        },
        location: {
            type: String,
            default: '',
        },
        website: {
            type: String,
            default: '',
        },
        instagram: {
            type: String,
            default: '',
        },
        tiktok: {
            type: String,
            default: '',
        },
        twitter: {
            type: String,
            default: '',
        },
        facebook: {
            type: String,
            default: '',
        },
        whatsapp: {
            type: String,
            default: '',
        },
        telegram: {
            type: String,
            default: '',
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'creator'],
            default: 'user',
        },
        isPremium: {
            type: Boolean,
            default: false,
        },
        premiumExpiry: {
            type: Date,
            default: null,
        },
        stats: {
            totalPoints: {
                type: Number,
                default: 0,
            },
            badgesCollected: {
                type: Number,
                default: 0,
            },
            challengesEntered: {
                type: Number,
                default: 0,
            },
            challengesWon: {
                type: Number,
                default: 0,
            },
        },
        wallet: {
            coins: {
                type: Number,
                default: 0,
            },
            balance: {
                type: Number,
                default: 0,
            },
        },
        badges: [{
            id: String,
            name: String,
            description: String,
            image: String,
            dateEarned: {
                type: Date,
                default: Date.now,
            }
        }],
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ username: 1 }, { sparse: true });

// During development, we need to handle HMR which might keep an old version of the model
if (process.env.NODE_ENV !== 'production') {
    delete mongoose.models.User;
}

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
