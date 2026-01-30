var mongoose = require('mongoose');
var { registerUser } = require('./controllers/authController');
var User = require('./models/User');

// Mock req and res
const req = {
    body: {
        name: "Ankit Aal",
        email: "ankitaal@gmail.com",
        password: "password123",
        role: "interviewer"
    }
};

const res = {
    status: function (code) {
        console.log(`Status: ${code}`);
        return this;
    },
    json: function (data) {
        console.log("Response:", data);
        return this;
    }
};

// Connect to DB and run register
require('dotenv').config();

console.log("Mongo URI:", process.env.MONGO_URI ? "Found" : "Not Found");
if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing in .env");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to DB, running test...");
        try {
            await User.deleteMany({ email: "ankitaal@gmail.com" }); // Cleanup first
            await registerUser(req, res);
        } catch (e) {
            console.error("Test failed:", e);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error("DB Connection Error:", err));
