const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://harshitj183_db_user:lJ9OP0iGbZPS9zbk@cluster0.5th1wdm.mongodb.net/challengesuite?appName=Cluster0';

// Minimal User Schema matching the real one partially
const UserSchema = new mongoose.Schema({
    email: String,
    password: { type: String, select: false },
    name: String
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function testAuth() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected.");

        const email = 'admin@example.com';
        const rawPassword = 'password123';

        console.log(`Finding user ${email}...`);
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.error("User NOT FOUND");
            return;
        }
        console.log("User found:", user.name, user.email);
        console.log("Hashed Password (Prefix):", user.password.substring(0, 10) + "...");

        console.log("Comparing 'password123'...");
        const isValid = await bcrypt.compare(rawPassword, user.password);
        console.log("Is Valid?", isValid);

        if (isValid) console.log("✅ AUTH LOGIC SUCCESS");
        else console.log("❌ AUTH LOGIC FAILED - Password Mismatch");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}

testAuth();
