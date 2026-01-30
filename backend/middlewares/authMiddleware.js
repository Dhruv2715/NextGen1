const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes
const protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (token && token.startsWith("Bearer")) {
            token = token.split(" ")[1]; // Extract token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Mongoose findById
            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            // Mongoose document references
            req.user = {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                profileImageUrl: user.profileImageUrl, // Mongoose schema likely uses camelCase
            };
            next();
        } else {
            res.status(401).json({ message: "Not authorized, no token" });
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ message: "Token failed", error: error.message });
    }
};

module.exports = { protect };
