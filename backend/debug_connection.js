const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;
console.log("Testing connection to:", uri);

if (!uri) {
    console.error("No MONGO_URI found!");
    process.exit(1);
}

console.log("Attempting mongoose.connect...");
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log("SUCCESS: Connected to MongoDB!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("CONNECTION FAILED:");
        console.error(err);
        process.exit(1);
    });
