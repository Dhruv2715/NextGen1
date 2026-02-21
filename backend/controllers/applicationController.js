const Application = require("../models/Application");
const Job = require("../models/Job");
const sendEmail = require("../utils/emailService");

// @desc    Apply for a job
// @route   POST /api/applications/apply
// @access  Private (Candidate)
const applyToJob = async (req, res) => {
    try {
        const { job_id, resume_url, bio } = req.body;
        const candidate_id = req.user.id;

        if (!job_id || !resume_url) {
            return res.status(400).json({ message: "Job ID and Resume URL are required" });
        }

        // Check if job exists
        const job = await Job.findById(job_id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Check for existing application and 15-day cooldown
        const existingApp = await Application.findOne({ job_id, candidate_id }).sort({ created_at: -1 });

        if (existingApp) {
            if (existingApp.status === 'pending') {
                return res.status(400).json({ message: "You already have a pending application for this job" });
            }
            if (existingApp.status === 'approved') {
                return res.status(400).json({ message: "Your application for this job is already approved" });
            }
            if (existingApp.status === 'rejected') {
                const cooldownDays = 15;
                const cooldownMillis = cooldownDays * 24 * 60 * 60 * 1000;
                const timeSinceRejection = Date.now() - new Date(existingApp.rejection_date).getTime();

                if (timeSinceRejection < cooldownMillis) {
                    const daysRemaining = Math.ceil((cooldownMillis - timeSinceRejection) / (1000 * 60 * 60 * 24));
                    return res.status(403).json({
                        message: `You were recently rejected. You can re-apply in ${daysRemaining} days.`,
                        daysRemaining
                    });
                }
            }
        }

        // Create application
        const application = await Application.create({
            job_id,
            candidate_id,
            resume_url,
            bio: bio || '',
            status: 'pending'
        });

        res.status(201).json({ message: "Application submitted successfully", application });
    } catch (error) {
        console.error("Apply error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const { analyzeApplication } = require("../utils/aiService");

// @desc    Get all applications for an interviewer (for their jobs)
// @route   GET /api/applications/interviewer
// @access  Private (Interviewer)
const getInterviewerApplications = async (req, res) => {
    try {
        // Find jobs posted by this interviewer
        const jobs = await Job.find({ interviewer_id: req.user.id });
        const jobIds = jobs.map(job => job._id);

        const applications = await Application.find({ job_id: { $in: jobIds } })
            .sort({ created_at: -1 })
            .populate('job', 'title description required_skills')
            .populate('candidate', 'name email profileImageUrl');

        // Trigger AI screening for unscreened applications
        const screenedApps = await Promise.all(applications.map(async (app) => {
            if (!app.is_screened && app.job) {
                const analysis = await analyzeApplication(
                    app.bio,
                    app.resume_url,
                    app.job.required_skills || [],
                    app.job.description || ""
                );

                app.ai_score = analysis.score;
                app.ai_analysis = analysis.analysis;
                app.is_screened = true;
                await app.save();
            }
            return app;
        }));

        res.status(200).json(screenedApps);
    } catch (error) {
        console.error("Fetch applications error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update application status (Approve/Reject)
// @route   PUT /api/applications/:id/status
// @access  Private (Interviewer)
const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const application = await Application.findById(req.params.id)
            .populate('job', 'title')
            .populate('candidate', 'name email');

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Verify interviewer owns the job
        const job = await Job.findById(application.job_id);
        if (job.interviewer_id.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update this application" });
        }

        application.status = status;
        if (status === 'rejected') {
            application.rejection_date = new Date();
        }
        await application.save();

        // Send notification email
        try {
            const emailContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Application Update: ${job.title}</h2>
          <p>Hi ${application.candidate.name},</p>
          <p>Your application for the position of <strong>${job.title}</strong> has been <strong>${status}</strong>.</p>
          ${status === 'approved'
                    ? '<p>Congratulations! You can now log in to the portal and start your interview assessment.</p>'
                    : '<p>Unfortunately, the interviewer has decided not to proceed with your application at this time. You may re-apply for this position in 15 days.</p>'}
          <br/>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #4285F4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Portal</a>
        </div>
      `;

            await sendEmail({
                email: application.candidate.email,
                subject: `Update on your application for ${job.title}`,
                html: emailContent
            });
        } catch (emailErr) {
            console.error("Status notification email failed:", emailErr);
        }

        res.status(200).json({ message: `Application ${status} successfully`, application });
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get candidate's own applications
// @route   GET /api/applications/my-applications
// @access  Private (Candidate)
const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ candidate_id: req.user.id })
            .sort({ created_at: -1 })
            .populate('job', 'title description');

        res.status(200).json(applications);
    } catch (error) {
        console.error("Fetch my applications error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    applyToJob,
    getInterviewerApplications,
    updateApplicationStatus,
    getMyApplications
};
