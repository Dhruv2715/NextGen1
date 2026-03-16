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

        // 2. Application stats by status (legacy)
        const appStats = await Application.aggregate([
            { $match: { job_id: { $in: jobIds } } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 3. Application funnel stats by NEW stage
        const funnelStats = await Application.aggregate([
            { $match: { job_id: { $in: jobIds } } },
            {
                $group: {
                    _id: "$stage",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Calculate offer rate
        const totalApps = await Application.countDocuments({ job_id: { $in: jobIds } });
        const offerApps = await Application.countDocuments({ job_id: { $in: jobIds }, stage: 'Offer' });
        const offerRate = totalApps > 0 ? ((offerApps / totalApps) * 100).toFixed(1) : 0;

        // 4. Interview stats (average scores)
        const interviewStats = await Interview.aggregate([
            { $match: { job_id: { $in: jobIds }, status: 'completed' } },
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: "$score" },
                    totalCompleted: { $sum: 1 },
                    avgTimeCompleted: { $avg: { $subtract: ["$completed_at", "$created_at"] } } 
                }
            }
        ]);

        let avgTimeToCompleteDays = 0;
        if (interviewStats[0] && interviewStats[0].avgTimeCompleted) {
            avgTimeToCompleteDays = (interviewStats[0].avgTimeCompleted / (1000 * 60 * 60 * 24)).toFixed(1);
        }

        res.status(200).json({
            jobsCount: jobs.length,
            applications: appStats,
            funnel: funnelStats,
            offerRate,
            avgTimeToCompleteDays,
            totalApplications: totalApps,
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
        
        // 1. Get all applications with job titles
        const applications = await Application.find({ candidate_id: userId })
            .populate('job', 'title')
            .sort({ updated_at: -1 });

        // 2. Get scores trend from completed interviews
        const interviews = await Interview.find({ 
            candidate_id: userId, 
            status: 'completed' 
        })
        .sort({ completed_at: 1 })
        .populate('job_id', 'title');

        const scoresTrend = interviews.map(i => ({
            date: i.completed_at,
            score: i.score,
            jobTitle: i.job_id?.title || 'Unknown'
        }));

        // 3. Funnel aggregation for this candidate
        const funnel = await Application.aggregate([
            { $match: { candidate_id: req.user._id } },
            {
                $group: {
                    _id: "$stage",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            applications,
            scoresTrend,
            funnel
        });
    } catch (error) {
        console.error("Candidate Progress Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getInterviewerAnalytics, getCandidateProgress };
