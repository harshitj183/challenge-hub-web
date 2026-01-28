# Vercel User Login Fix - Environment Variables

## Problem
User login is not working on Vercel (only admin login works). This is because of missing/incorrect environment variables on Vercel.

## Solution
You need to add the following environment variables in your Vercel project settings:

### Steps to Fix:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `photobox-web`

2. **Navigate to Settings → Environment Variables**

3. **Add/Update these variables:**

```
MONGODB_URI=mongodb+srv://harshitj183_db_user:lJ9OP0iGbZPS9zbk@cluster0.5th1wdm.mongodb.net/challengesuite?appName=Cluster0

NEXTAUTH_URL=https://photobox-web-lime.vercel.app

NEXTAUTH_SECRET=7c20a8d46a84f3f2d1e2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4

CLOUDINARY_CLOUD_NAME=harshit-jaiswal

CLOUDINARY_API_KEY=187997141965157

CLOUDINARY_API_SECRET=Tq5V7HOEF2iMUSYnM5BkJ4Zs4F4

NODE_ENV=production
```

4. **Important Notes:**
   - Make sure `NEXTAUTH_URL` is set to your production URL: `https://photobox-web-lime.vercel.app`
   - All variables should be added for **Production**, **Preview**, and **Development** environments
   - After adding variables, Vercel will automatically redeploy

5. **Verify the Fix:**
   - Wait for automatic redeployment (2-3 minutes)
   - Try logging in with a regular user account
   - Check browser console for any errors

## Why This Happens

- NextAuth requires `NEXTAUTH_URL` to be set correctly for session management
- On Vercel, it needs to match your production domain
- Without it, cookies and sessions don't work properly for regular users
- Admin might work because of different session handling or cached credentials

## Alternative Quick Fix (If above doesn't work)

If the environment variables are already set correctly, the issue might be with cookie settings. In that case, we need to modify the `authOptions.ts` file to handle Vercel's production environment better.

Let me know if you need help with that!
