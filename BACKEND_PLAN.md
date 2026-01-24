# Backend Development Plan - Challenge Suite

## 🎯 **BACKEND ARCHITECTURE**

### **Technology Stack:**
- **Runtime:** Node.js (Next.js API Routes)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** NextAuth.js v5 (JWT + Session)
- **File Storage:** Cloudinary (images/videos)
- **Payment Gateway:** Stripe
- **Email Service:** Nodemailer / SendGrid
- **Validation:** Zod
- **Security:** bcrypt, helmet, rate-limiting

---

## 📁 **PROJECT STRUCTURE**

```
photobox_web/
├── src/
│   ├── app/
│   │   └── api/                    # API Routes
│   │       ├── auth/              # Authentication
│   │       │   ├── [...nextauth]/
│   │       │   ├── register/
│   │       │   └── logout/
│   │       ├── challenges/        # Challenge CRUD
│   │       │   ├── route.ts
│   │       │   ├── [id]/
│   │       │   └── join/
│   │       ├── submissions/       # Challenge submissions
│   │       ├── leaderboards/      # Rankings
│   │       ├── users/             # User management
│   │       ├── subscriptions/     # Payment & plans
│   │       ├── admin/             # Admin operations
│   │       └── upload/            # File uploads
│   ├── lib/
│   │   ├── db/                    # Database
│   │   │   ├── mongodb.ts
│   │   │   └── models/
│   │   │       ├── User.ts
│   │   │       ├── Challenge.ts
│   │   │       ├── Submission.ts
│   │   │       ├── Leaderboard.ts
│   │   │       └── Subscription.ts
│   │   ├── auth/                  # Auth config
│   │   │   └── authOptions.ts
│   │   ├── utils/                 # Utilities
│   │   │   ├── validation.ts
│   │   │   ├── cloudinary.ts
│   │   │   └── stripe.ts
│   │   └── middleware/            # Middleware
│   │       ├── auth.ts
│   │       └── rateLimit.ts
│   └── types/                     # TypeScript types
│       └── index.ts
├── .env.local                     # Environment variables
└── package.json
```

---

## 🗄️ **DATABASE MODELS**

### **1. User Model**
```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique),
  password: string (hashed),
  avatar?: string,
  role: 'user' | 'admin' | 'creator',
  isPremium: boolean,
  premiumExpiry?: Date,
  stats: {
    totalPoints: number,
    badgesCollected: number,
    challengesEntered: number,
    challengesWon: number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### **2. Challenge Model**
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  category: string,
  image: string,
  badge: 'Prize' | 'Normal',
  status: 'active' | 'upcoming' | 'ended',
  startDate: Date,
  endDate: Date,
  prize?: {
    amount: number,
    description: string
  },
  participants: number,
  maxParticipants?: number,
  rules: string[],
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### **3. Submission Model**
```typescript
{
  _id: ObjectId,
  challengeId: ObjectId (ref: Challenge),
  userId: ObjectId (ref: User),
  title: string,
  description?: string,
  mediaUrl: string,
  mediaType: 'image' | 'video',
  votes: number,
  status: 'pending' | 'approved' | 'rejected',
  isWinner: boolean,
  submittedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **4. Vote Model**
```typescript
{
  _id: ObjectId,
  submissionId: ObjectId (ref: Submission),
  userId: ObjectId (ref: User),
  votedAt: Date
}
```

### **5. Leaderboard Model**
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  challengeId?: ObjectId (ref: Challenge),
  points: number,
  wins: number,
  rank: number,
  updatedAt: Date
}
```

### **6. Subscription Model**
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  plan: 'bronze' | 'silver' | 'gold' | 'platinum' | 'creator',
  price: number,
  status: 'active' | 'cancelled' | 'expired',
  stripeSubscriptionId: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 **API ENDPOINTS**

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (NextAuth)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile

### **Challenges**
- `GET /api/challenges` - List all challenges (with filters)
- `GET /api/challenges/[id]` - Get challenge details
- `POST /api/challenges` - Create challenge (Admin/Creator)
- `PUT /api/challenges/[id]` - Update challenge (Admin/Creator)
- `DELETE /api/challenges/[id]` - Delete challenge (Admin)
- `POST /api/challenges/[id]/join` - Join challenge

### **Submissions**
- `GET /api/submissions` - List submissions (by challenge)
- `GET /api/submissions/[id]` - Get submission details
- `POST /api/submissions` - Create submission
- `PUT /api/submissions/[id]` - Update submission
- `DELETE /api/submissions/[id]` - Delete submission
- `POST /api/submissions/[id]/vote` - Vote for submission

### **Leaderboards**
- `GET /api/leaderboards` - Global leaderboard
- `GET /api/leaderboards/[challengeId]` - Challenge leaderboard

### **Users**
- `GET /api/users/[id]` - Get user profile
- `PUT /api/users/[id]` - Update user
- `GET /api/users/[id]/challenges` - User's challenges
- `GET /api/users/[id]/submissions` - User's submissions

### **Subscriptions**
- `GET /api/subscriptions/plans` - Get pricing plans
- `POST /api/subscriptions/subscribe` - Subscribe to plan
- `POST /api/subscriptions/cancel` - Cancel subscription
- `GET /api/subscriptions/status` - Get subscription status

### **Admin**
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/[id]` - Update user (role, status)
- `GET /api/admin/challenges` - Manage challenges
- `POST /api/admin/challenges/[id]/declare-winner` - Declare winner

### **Upload**
- `POST /api/upload/image` - Upload image to Cloudinary
- `POST /api/upload/video` - Upload video to Cloudinary

---

## 🔧 **ENVIRONMENT VARIABLES**

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/challengesuite

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 📝 **IMPLEMENTATION PHASES**

### **Phase 1: Setup & Authentication (Day 1-2)**
1. ✅ Install dependencies
2. ✅ Setup MongoDB connection
3. ✅ Create User model
4. ✅ Setup NextAuth.js
5. ✅ Implement registration/login
6. ✅ Add JWT authentication

### **Phase 2: Core Features (Day 3-5)**
7. ✅ Create Challenge model & API
8. ✅ Create Submission model & API
9. ✅ Implement file upload (Cloudinary)
10. ✅ Create Leaderboard logic
11. ✅ Add voting system

### **Phase 3: User Features (Day 6-7)**
12. ✅ User profile management
13. ✅ My Challenges functionality
14. ✅ Submission management
15. ✅ Notifications

### **Phase 4: Payment & Subscriptions (Day 8-9)**
16. ✅ Setup Stripe
17. ✅ Create Subscription model
18. ✅ Implement payment flow
19. ✅ Add webhook handlers

### **Phase 5: Admin Panel (Day 10-11)**
20. ✅ Admin authentication
21. ✅ Challenge management
22. ✅ User management
23. ✅ Analytics & stats

### **Phase 6: Testing & Deployment (Day 12-14)**
24. ✅ API testing
25. ✅ Security hardening
26. ✅ Performance optimization
27. ✅ Deployment to Vercel

---

## 🚀 **NEXT STEPS**

1. **Install Dependencies**
2. **Setup MongoDB**
3. **Create Database Models**
4. **Implement Authentication**
5. **Build API Routes**

---

**Ready to start implementation!** 🎯
