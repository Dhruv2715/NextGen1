const User = require("../models/User");
const Job = require("../models/Job");
const Interview = require("../models/Interview");
const Application = require("../models/Application");

// @desc    Get global platform stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getGlobalStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalJobs = await Job.countDocuments();
        const totalInterviews = await Interview.countDocuments();
        const totalApplications = await Application.countDocuments();

        const interviewsByStatus = await Interview.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            users: totalUsers,
            jobs: totalJobs,
            interviews: totalInterviews,
            applications: totalApplications,
            interviewBreakdown: interviewsByStatus
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getGlobalStats, getAllUsers };
