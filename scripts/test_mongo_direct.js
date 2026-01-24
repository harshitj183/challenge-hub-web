const mongoose = require('mongoose');

// Define connection string
const uri = "mongodb+srv://harshitj183_db_user:lJ9OP0iGbZPS9zbk@cluster0.5th1wdm.mongodb.net/challengesuite?appName=Cluster0";

console.log("🔄 Testing Direct MongoDB Connection...");
console.log(`   URI: ${uri.replace(/:([^:@]+)@/, ':****@')}`); // Log URI with hidden password

// Set connection options
const options = {
    serverSelectionTimeoutMS: 8000, // Timeout after 8 seconds
    connectTimeoutMS: 10000,
    family: 4 // Force IPv4
};

async function testConnection() {
    try {
        await mongoose.connect(uri, options);
        console.log("✅ SUCCESS: Connected to MongoDB successfully!");
        console.log("   The credentials are correct and the network allows access.");

        // Try to access the database to ensure we have read/write permissions
        const connection = mongoose.connection;
        console.log(`   Database Name: ${connection.name}`);
        console.log(`   Host: ${connection.host}`);

        await mongoose.disconnect();
        console.log("   Disconnected cleanly.");
        process.exit(0);
    } catch (err) {
        console.log("\n❌ ERROR: Could not connect to MongoDB");
        console.log("----------------------------------------");
        console.log(err.message);
        console.log("----------------------------------------");

        if (err.message.includes("bad auth")) {
            console.log("👉 DIAGNOSIS: Incorrect Username or Password.");
        } else if (err.message.includes("cluster") && err.message.includes("does not exist")) {
            console.log("👉 DIAGNOSIS: Cluster address might be wrong.");
        } else if (err.name === 'MongooseServerSelectionError') {
            console.log("👉 DIAGNOSIS: Network Issue or IP Not Whitelisted.");
            console.log("   Please check MongoDB Atlas > Network Access.");
            console.log("   Ensure your current IP or '0.0.0.0/0' is allowed.");
        }

        process.exit(1);
    }
}

testConnection();
