# 🧪 Backend Testing Guide

## 📋 **HOW TO TEST BACKEND FUNCTIONALITY**

---

## 🛠️ **PREREQUISITES:**

### **1. Setup Environment Variables**

Create `.env.local` file in root directory:

```env
# Database (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/challengesuite

# NextAuth (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters-long

# Cloudinary (Optional for file upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Generate NEXTAUTH_SECRET:**
```bash
# Run in terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **2. Start Development Server**

```bash
npm run dev
```

Server will run at: `http://localhost:3000`

---

## 🧪 **TESTING METHODS:**

### **Method 1: Using Browser (Easiest)**

Open browser and navigate to API endpoints directly.

### **Method 2: Using Postman/Insomnia**

Professional API testing tools with GUI.

### **Method 3: Using cURL (Command Line)**

Terminal-based testing.

### **Method 4: Using Thunder Client (VS Code Extension)**

Test APIs directly in VS Code.

---

## 📝 **STEP-BY-STEP TESTING:**

### **TEST 1: User Registration** ✅

**Endpoint:** `POST http://localhost:3000/api/auth/register`

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Using Postman:**
1. Method: POST
2. URL: `http://localhost:3000/api/auth/register`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "65f1234567890abcdef12345",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user",
    "isPremium": false
  }
}
```

---

### **TEST 2: User Login** ✅

**Endpoint:** `POST http://localhost:3000/api/auth/signin`

**Using Browser:**
1. Go to: `http://localhost:3000/api/auth/signin`
2. Enter email and password
3. Click Sign In

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected:** Session cookie set, redirect to homepage

---

### **TEST 3: Get Current Session** ✅

**Endpoint:** `GET http://localhost:3000/api/auth/session`

**Using Browser:**
Navigate to: `http://localhost:3000/api/auth/session`

**Expected Response (if logged in):**
```json
{
  "user": {
    "id": "65f1234567890abcdef12345",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user",
    "isPremium": false
  },
  "expires": "2026-02-18T..."
}
```

**Expected Response (if not logged in):**
```json
{}
```

---

### **TEST 4: Create Challenge** ✅

**Endpoint:** `POST http://localhost:3000/api/challenges`

**Note:** Must be logged in as admin or creator

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/challenges \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "title": "30-Day Fitness Challenge",
    "description": "Get fit in 30 days with daily workouts",
    "category": "Fitness",
    "image": "https://example.com/fitness.jpg",
    "badge": "Prize",
    "startDate": "2026-02-01",
    "endDate": "2026-03-01",
    "prize": {
      "amount": 1000,
      "description": "Cash prize for winner"
    },
    "rules": ["Daily workout required", "Submit progress photos"]
  }'
```

**Expected Response:**
```json
{
  "message": "Challenge created successfully",
  "challenge": {
    "_id": "65f...",
    "title": "30-Day Fitness Challenge",
    "status": "upcoming",
    ...
  }
}
```

---

### **TEST 5: Get All Challenges** ✅

**Endpoint:** `GET http://localhost:3000/api/challenges`

**Using Browser:**
Navigate to: `http://localhost:3000/api/challenges`

**With Filters:**
```
http://localhost:3000/api/challenges?status=active
http://localhost:3000/api/challenges?category=Fitness
http://localhost:3000/api/challenges?badge=Prize
http://localhost:3000/api/challenges?search=fitness
http://localhost:3000/api/challenges?page=1&limit=10
```

**Expected Response:**
```json
{
  "challenges": [
    {
      "_id": "65f...",
      "title": "30-Day Fitness Challenge",
      "description": "...",
      "category": "Fitness",
      "badge": "Prize",
      "status": "active",
      "participants": 0,
      "createdBy": {
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

---

### **TEST 6: Create Submission** ✅

**Endpoint:** `POST http://localhost:3000/api/submissions`

**Note:** Must be logged in

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "challengeId": "65f1234567890abcdef12345",
    "title": "My 30-Day Progress",
    "description": "Final results after 30 days",
    "mediaUrl": "https://example.com/progress.jpg",
    "mediaType": "image"
  }'
```

**Expected Response:**
```json
{
  "message": "Submission created successfully",
  "submission": {
    "_id": "65f...",
    "title": "My 30-Day Progress",
    "votes": 0,
    "status": "pending",
    ...
  }
}
```

---

### **TEST 7: Vote on Submission** ✅

**Endpoint:** `POST http://localhost:3000/api/votes`

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/votes \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "submissionId": "65f1234567890abcdef12345"
  }'
```

**Expected Response (First vote):**
```json
{
  "message": "Vote added successfully",
  "action": "added"
}
```

**Expected Response (Second vote - toggle):**
```json
{
  "message": "Vote removed successfully",
  "action": "removed"
}
```

---

### **TEST 8: Get Leaderboard** ✅

**Endpoint:** `GET http://localhost:3000/api/leaderboards`

**Using Browser:**
```
http://localhost:3000/api/leaderboards
http://localhost:3000/api/leaderboards?challengeId=65f...
```

**Expected Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": {
        "name": "Top User",
        "email": "top@example.com"
      },
      "points": 1500,
      "wins": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 10,
    "pages": 1
  }
}
```

---

### **TEST 9: Get User Profile** ✅

**Endpoint:** `GET http://localhost:3000/api/users/me`

**Note:** Must be logged in

**Using Browser:**
Navigate to: `http://localhost:3000/api/users/me`

**Expected Response:**
```json
{
  "user": {
    "_id": "65f...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user",
    "isPremium": false,
    "stats": {
      "totalPoints": 0,
      "badgesCollected": 0,
      "challengesEntered": 0,
      "challengesWon": 0
    }
  }
}
```

---

### **TEST 10: Upload File** ✅

**Endpoint:** `POST http://localhost:3000/api/upload`

**Note:** Requires Cloudinary credentials

**Using Postman:**
1. Method: POST
2. URL: `http://localhost:3000/api/upload`
3. Body: form-data
   - Key: `file` (type: File)
   - Key: `type` (type: Text, value: "image")
4. Select image file

**Expected Response:**
```json
{
  "message": "File uploaded successfully",
  "url": "https://res.cloudinary.com/...",
  "publicId": "challenge-suite/...",
  "width": 1200,
  "height": 800,
  "format": "jpg"
}
```

---

## 🔍 **QUICK TESTING CHECKLIST:**

### **✅ Basic Tests:**
- [ ] Server is running (`npm run dev`)
- [ ] Can access `http://localhost:3000`
- [ ] MongoDB is connected (check console logs)
- [ ] Environment variables are set

### **✅ Authentication:**
- [ ] Register new user
- [ ] Login with credentials
- [ ] Get session
- [ ] Logout

### **✅ Challenges:**
- [ ] List all challenges
- [ ] Filter challenges
- [ ] Create challenge (admin)
- [ ] Get single challenge
- [ ] Update challenge
- [ ] Delete challenge

### **✅ Submissions:**
- [ ] Create submission
- [ ] List submissions
- [ ] Prevent duplicate submission

### **✅ Voting:**
- [ ] Vote on submission
- [ ] Remove vote (toggle)
- [ ] Check vote count

### **✅ Leaderboard:**
- [ ] Get global leaderboard
- [ ] Get challenge leaderboard

### **✅ User:**
- [ ] Get profile
- [ ] Update profile

### **✅ Upload:**
- [ ] Upload image
- [ ] Upload video

---

## 🐛 **COMMON ERRORS & SOLUTIONS:**

### **Error: "MONGODB_URI not defined"**
**Solution:** Add MongoDB URI to `.env.local`

### **Error: "Unauthorized"**
**Solution:** Login first to get session cookie

### **Error: "Validation failed"**
**Solution:** Check request body matches schema

### **Error: "Challenge not found"**
**Solution:** Use valid challenge ID from database

### **Error: "User already exists"**
**Solution:** Use different email or login instead

### **Error: "Cloudinary not configured"**
**Solution:** Add Cloudinary credentials to `.env.local`

---

## 📊 **MONITORING LOGS:**

### **Check Server Logs:**
Look at terminal where `npm run dev` is running:

```
✅ MongoDB Connected Successfully
✅ Ready on http://localhost:3000
✅ Compiled /api/auth/register in 234ms
```

### **Check for Errors:**
```
❌ Registration error: ...
❌ MongoDB connection failed: ...
```

---

## 🎯 **RECOMMENDED TESTING TOOLS:**

### **1. Thunder Client (VS Code Extension)**
- Install in VS Code
- Test APIs directly in editor
- Save requests
- Easy to use

### **2. Postman**
- Professional API testing
- Collections & environments
- Automated testing
- Team collaboration

### **3. Insomnia**
- Clean interface
- GraphQL support
- Environment variables
- Free & open source

### **4. Browser DevTools**
- Network tab
- See all requests
- Check responses
- Debug cookies

---

## 📝 **TESTING SCRIPT (Copy-Paste Ready):**

Save as `test-backend.sh`:

```bash
#!/bin/bash

# Base URL
BASE_URL="http://localhost:3000"

echo "🧪 Testing Backend APIs..."

# Test 1: Register
echo "\n1. Testing Registration..."
curl -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Test 2: Get Challenges
echo "\n\n2. Testing Get Challenges..."
curl $BASE_URL/api/challenges

# Test 3: Get Session
echo "\n\n3. Testing Get Session..."
curl $BASE_URL/api/auth/session

echo "\n\n✅ Tests Complete!"
```

Run with: `bash test-backend.sh`

---

## 🎉 **QUICK START:**

1. **Start Server:**
   ```bash
   npm run dev
   ```

2. **Open Browser:**
   ```
   http://localhost:3000/api/challenges
   ```

3. **See Response:**
   ```json
   { "challenges": [], "pagination": {...} }
   ```

4. **Success!** Backend is working! ✅

---

**Last Updated:** January 19, 2026, 1:19 PM
**Status:** Ready for Testing
