
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import User from '../src/lib/db/models/User';
import { hashPassword, comparePassword } from '../src/lib/utils/password';

// Load env manully since we don't have dotenv
const envPath = path.resolve(process.cwd(), '.env.local');
console.log("Loading env from:", envPath);

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim(); // Handle values with =
            if (key && value && !key.startsWith('#')) {
                process.env[key] = value.replace(/^"(.*)"$/, '$1'); // Remove quotes if present
            }
        }
    });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env.local");
    process.exit(1);
}

async function checkUser() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI as string);
        console.log("Connected to DB");

        const email = "john@example.com";
        const passwordToCheck = "password123";

        console.log(`Checking user: ${email}`);
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log(`User ${email} NOT FOUND.`);
            console.log("Creating user...");
            const hashedPassword = await hashPassword(passwordToCheck);
            await User.create({
                name: 'John Doe',
                email: email,
                username: 'johndoe',
                password: hashedPassword,
                role: 'user',
                isPremium: false,
                stats: {
                    totalPoints: 0,
                    badgesCollected: 0,
                    challengesEntered: 0,
                    challengesWon: 0
                },
                badges: []
            });
            console.log("User created with password: " + passwordToCheck);
        } else {
            console.log(`User ${email} found.`);
            // console.log("Stored hash:", user.password);

            const isMatch = await comparePassword(passwordToCheck, user.password);
            console.log(`Password '${passwordToCheck}' match? ${isMatch}`);

            if (!isMatch) {
                console.log("Updating password to match...");
                const newHash = await hashPassword(passwordToCheck);
                user.password = newHash;
                await user.save();
                console.log("Password updated successfully.");
            } else {
                console.log("Password is correct.");
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkUser();
