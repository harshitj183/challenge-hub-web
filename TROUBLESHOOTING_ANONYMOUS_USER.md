# Fix for Anonymous User in Submissions

## Problem
Submissions showing "Anonymous User" instead of actual user profile.

## Root Cause
The `userId` field in existing submissions is `null` or not populated.

## Solution

### Step 1: Clear Old Submissions
Visit: `http://localhost:3000/api/seed`

This will reseed the database with fresh data.

### Step 2: Make Sure You're Logged In
1. Go to `/auth/login`
2. Login with: `john@example.com` / `password123`
3. Verify you're logged in (check top-right corner)

### Step 3: Check Your Profile
1. Go to `/profile`
2. Make sure your name is set (e.g., "John Doe")
3. Upload an avatar if you haven't
4. Click "Save Changes"

### Step 4: Submit to a Challenge
1. Go to `/challenges`
2. Click on any **ACTIVE** challenge (not upcoming or ended)
3. Click "Upload Submission 📤"
4. Fill in:
   - Title: "My Test Submission"
   - Description: "Testing user profile display"
   - Upload any image
5. Click "Submit Entry"
6. Wait for success message

### Step 5: Verify It Works
1. The page should refresh automatically
2. Scroll down to "Community Submissions"
3. Your submission should now show:
   - ✅ Your actual name (not "Anonymous User")
   - ✅ Your profile avatar
   - ✅ Vote count

## If Still Showing Anonymous:

### Check Browser Console (F12)
1. Open DevTools (F12)
2. Go to Console tab
3. Look for: `Fetched submissions: [...]`
4. Expand the array
5. Check if `userId` is `null` or has data

### Check Terminal
Look for these logs:
```
GET Submissions - Query: {...}
GET Submissions - Found: X
First submission userId: {...}
```

If `userId` is `null`, the problem is in the database save.

## Quick Database Fix

If the issue persists, run this in MongoDB:

```javascript
// Delete all submissions (they'll be recreated)
db.submissions.deleteMany({})
```

Then reseed: `http://localhost:3000/api/seed`

## Alternative: Use Seed Data

The seed data already has submissions with proper user data.
Just use one of the seeded users:
- `john@example.com` / `password123`
- `emily@example.com` / `password123`

These users already have submissions in the database that show correctly.

## Still Not Working?

The issue might be that your specific submission was created before the fixes.

**Solution**: 
1. Delete your old submission from database
2. Submit a NEW entry
3. The new submission will have proper user data

**Or simply**:
1. Use a different user account (john@example.com)
2. Submit as that user
3. It should work correctly
