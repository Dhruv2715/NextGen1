const express = require("express");
const { getGlobalStats, getAllUsers } = require("../controllers/adminController");
const { protect } = require("../middlewares/authMiddleware");

// Middleware to restrict access to Admins only
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Authorized for admins only" });
    }
};

const router = express.Router();

router.get("/stats", protect, adminOnly, getGlobalStats);
router.get("/users", protect, adminOnly, getAllUsers);

module.exports = router;
