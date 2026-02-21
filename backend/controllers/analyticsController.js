const Job = require("../models/Job");
const Application = require("../models/Application");
const Interview = require("../models/Interview");

// @desc    Get interviewer-specific analytics
// @route   GET /api/analytics/interviewer
// @access  Private (Interviewer)
const getInterviewerAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get all jobs by this interviewer
        const jobs = await Job.find({ interviewer_id: userId });
        const jobIds = jobs.map(j => j._id);

        // 2. Application stats
        const appStats = await Application.aggregate([
            { $match: { job_id: { $in: jobIds } } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 3. Interview stats (average scores)
        const interviewStats = await Interview.aggregate([
            { $match: { job_id: { $in: jobIds }, status: 'completed' } },
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: "$score" },
                    totalCompleted: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            jobsCount: jobs.length,
            applications: appStats,
            interviews: interviewStats[0] || { avgScore: 0, totalCompleted: 0 }
        });
    } catch (error) {
        console.error("Interviewer Analytics Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get candidate-specific progress
// @route   GET /api/analytics/candidate
// @access  Private (Candidate)
const getCandidateProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const applications = await Application.find({ candidate_id: userId })
            .populate('job', 'title')
            .sort({ updated_at: -1 });

        res.status(200).json(applications);
    } catch (error) {
        console.error("Candidate Progress Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getInterviewerAnalytics, getCandidateProgress };
