import mongoose, { Schema, Document, Model } from 'mongoose';

// Update interface
export interface IChallenge extends Document {
    title: string;
    description: string;
    category: string;
    customCategory?: string;
    image: string; // Cover image
    videoUrl?: string; // Challenge video
    badge: 'Prize' | 'Normal';
    status: 'active' | 'upcoming' | 'ended';
    startDate: Date;
    endDate: Date;

    challengeType: '1v1' | 'group' | 'tournament';
    teamSize?: number;
    deadlineTime: Date;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    trailerUrl?: string;
    rulesPdfUrl?: string; // New field for detailed rules

    // Payment & Prizes
    isFree: boolean;
    entryFee?: number;
    prizeType: 'money' | 'digital' | 'physical' | 'NONE';
    prizeDetails?: string;
    prizeStatus?: 'pending_approval' | 'approved';
    prizePool: number; // Accumulated prize money
    organizerCommission: number; // percentage (e.g., 15)

    // Promotion
    isPromoted: boolean;
    promotionLevel?: number;

    // Restrictions
    isPrivate: boolean;
    requiresSubscription: boolean;
    restrictions?: string;
    ageRestriction?: number;

    // Location & Type
    locationType: 'online' | 'in-person';
    locationDetails?: string;

    // Scoring & Timers
    scoringType?: 'best_of_1' | 'best_of_3' | 'best_of_5' | 'best_of_7' | 'points';
    hasTimer: boolean;
    timerDurationMinutes?: number;
    timeLimitUploads?: boolean;

    // Tournaments & Live Events
    tournamentDetails?: {
        divisions: 2 | 4 | 6;
    };
    twoStepCompetition?: boolean;
    liveEventDetails?: {
        insuranceUploaded: boolean;
        venueAgreementUploaded: boolean;
        securityPlanUploaded: boolean;
    };

    // Sponsorship
    sponsorship?: {
        sponsorId: mongoose.Types.ObjectId;
        roiPercentage: number;
        creatorPercentage: number;
        status: 'pending' | 'approved_by_creator' | 'approved_by_sponsor' | 'active';
    };

    participants: number;
    maxParticipants?: number;
    rules: string[];
    createdBy: mongoose.Types.ObjectId;
    interestedUsers: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const ChallengeSchema: Schema<IChallenge> = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [5, 'Title must be at least 5 characters'],
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            minlength: [10, 'Description must be at least 10 characters'],
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['Fitness', 'Creative', 'Gaming', 'Learning', 'Lifestyle', 'Other'],
        },
        customCategory: {
            type: String,
            default: '',
        },
        challengeType: {
            type: String,
            enum: ['1v1', 'group', 'tournament'],
            default: '1v1',
        },
        teamSize: {
            type: Number,
            default: 2,
        },
        mediaUrl: {
            type: String,
            default: '',
        },
        mediaType: {
            type: String,
            enum: ['image', 'video'],
            default: 'image',
        },
        trailerUrl: {
            type: String,
            default: '',
        },
        rulesPdfUrl: {
            type: String,
            default: '',
        },
        badge: {
            type: String,
            enum: ['Prize', 'Normal'],
            default: 'Normal',
        },
        status: {
            type: String,
            enum: ['active', 'upcoming', 'ended'],
            default: 'upcoming',
        },
        deadlineTime: {
            type: Date,
            required: [true, 'Deadline date is required'],
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },

        // Payment & Prizes
        isFree: {
            type: Boolean,
            default: true,
        },
        entryFee: {
            type: Number,
            default: 0,
        },
        prizeType: {
            type: String,
            enum: ['money', 'digital', 'physical', 'NONE'],
            default: 'NONE',
        },
        prizeDetails: {
            type: String,
            default: '',
        },
        prizeStatus: {
            type: String,
            enum: ['pending_approval', 'approved'],
            required: function (this: IChallenge) {
                return this.prizeType === 'physical';
            }
        },
        prizePool: {
            type: Number,
            default: 0,
        },
        organizerCommission: {
            type: Number,
            default: 15, // 15% default
        },

        // Promotion
        isPromoted: {
            type: Boolean,
            default: false,
        },
        promotionLevel: {
            type: Number,
            default: 0,
        },

        // Restrictions
        isPrivate: {
            type: Boolean,
            default: false,
        },
        requiresSubscription: {
            type: Boolean,
            default: false,
        },
        restrictions: {
            type: String,
            default: '',
        },
        ageRestriction: {
            type: Number,
            default: 0, // 0 means no restriction
        },

        locationType: {
            type: String,
            enum: ['online', 'in-person'],
            default: 'online',
        },
        locationDetails: {
            type: String,
            default: '',
        },

        // Scoring & Timers
        scoringType: {
            type: String,
            enum: ['best_of_1', 'best_of_3', 'best_of_5', 'best_of_7', 'points'],
        },
        hasTimer: {
            type: Boolean,
            default: false,
        },
        timerDurationMinutes: {
            type: Number,
        },
        timeLimitUploads: {
            type: Boolean,
            default: false,
        },
        twoStepCompetition: {
            type: Boolean,
            default: false,
        },

        // Tournaments & Live Events
        tournamentDetails: {
            divisions: {
                type: Number,
                enum: [2, 4, 6],
            },
        },
        liveEventDetails: {
            insuranceUploaded: { type: Boolean, default: false },
            venueAgreementUploaded: { type: Boolean, default: false },
            securityPlanUploaded: { type: Boolean, default: false },
        },

        // Sponsorship
        sponsorship: {
            sponsorId: { type: Schema.Types.ObjectId, ref: 'User' },
            roiPercentage: { type: Number, min: 0, max: 100 },
            creatorPercentage: { type: Number, min: 0, max: 100 },
            status: {
                type: String,
                enum: ['pending', 'approved_by_creator', 'approved_by_sponsor', 'active']
            },
        },

        participants: {

            type: Number,
            default: 0,
        },
        maxParticipants: {
            type: Number,
            default: null,
        },
        rules: {
            type: [String],
            default: [],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        interestedUsers: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
ChallengeSchema.index({ status: 1, startDate: -1 });
ChallengeSchema.index({ category: 1 });
ChallengeSchema.index({ badge: 1 });
ChallengeSchema.index({ type: 1 });
ChallengeSchema.index({ isPromoted: -1 });
ChallengeSchema.index({ 'location.address': 1 });

const Challenge: Model<IChallenge> =
    mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', ChallengeSchema);

export default Challenge;
