const Job = require("../models/Job");
const Interview = require("../models/Interview");
const User = require("../models/User");
const Application = require("../models/Application");
const { sendEmail } = require("../utils/emailService");

// Helper to format job response with flattened interviewer details for compatibility
const formatJob = (job) => {
  if (!job) return null;
  const j = job.toObject({ virtuals: true });
  return {
    ...j,
    id: j._id, // Ensure id is available
    interviewer_name: j.interviewer?.name,
    interviewer_email: j.interviewer?.email,
    applicant_count: j.applicant_count || 0,
  };
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Interviewer)
const createJob = async (req, res) => {
  try {
    const { title, description, required_skills } = req.body;
    const interviewer_id = req.user.id;

    if (!title) {
      return res.status(400).json({ message: "Job title is required" });
    }

    let job = await Job.create({
      title,
      description: description || '',
      required_skills: Array.isArray(required_skills) ? required_skills : [],
      interviewer_id,
    });

    // Populate for consistent return
    job = await job.populate('interviewer');

    // --- Send Notifications to Candidates ---
    try {
      const candidates = await User.find({ role: 'candidate' });
      const emailList = candidates.map(user => user.email).filter(email => email);

      if (emailList.length > 0) {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4285F4;">New Job Opportunity!</h2>
            <p>Hi there,</p>
            <p>A new job has been posted on <strong>NextGen</strong> that matches your profile:</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 5px solid #4285F4; margin: 20px 0;">
              <h3 style="margin-top: 0;">${title}</h3>
              <p>${description.substring(0, 150)}${description.length > 150 ? '...' : ''}</p>
              <p><strong>Required Skills:</strong> ${job.required_skills.join(', ') || 'N/A'}</p>
            </div>
            <p>Log in to your dashboard to apply now!</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #4285F4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Job</a>
          </div>
        `;

        // Send to each candidate (or use BCC for bulk)
        // For simplicity and to avoid spam filters, we loop for now, but BCC is better for scale
        for (const email of emailList) {
          await sendEmail({
            email,
            subject: `New Job Posted: ${title}`,
            html: emailContent
          });
        }
      }
    } catch (notificationError) {
      console.error("Failed to send notifications:", notificationError);
      // We don't return error here to ensure the job is still created successfully
    }

    res.status(201).json(formatJob(job));
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public (Optional Auth)
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: { $ne: 'inactive' } })
      .sort({ created_at: -1 })
      .populate('interviewer');

    let formattedJobs = jobs.map(formatJob);

    // If user is a candidate, attach their application status to each job
    if (req.user && req.user.role === 'candidate') {
      const applications = await Application.find({ candidate_id: req.user.id });

      formattedJobs = formattedJobs.map(job => {
        const app = applications.find(a => a.job_id.toString() === job.id.toString());
        return {
          ...job,
          application_status: app ? app.status : null,
          rejection_date: app ? app.rejection_date : null
        };
      });
    }

    res.status(200).json(formattedJobs);
  } catch (error) {
    console.error("Get all jobs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get jobs by interviewer
// @route   GET /api/jobs/my-jobs
// @access  Private (Interviewer)
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ interviewer_id: req.user.id })
      .sort({ created_at: -1 })
      .populate('interviewer');

    // Manually add applicant count for each job
    const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
      const count = await Interview.countDocuments({ job_id: job._id });
      const jobObj = job.toObject({ virtuals: true });
      return {
        ...formatJob(job),
        applicant_count: count
      };
    }));

    res.status(200).json(jobsWithCounts);
  } catch (error) {
    console.error("Get my jobs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public (Optional Auth)
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('interviewer');
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    let jobData = formatJob(job);

    if (req.user && req.user.role === 'candidate') {
      const app = await Application.findOne({
        job_id: req.params.id,
        candidate_id: req.user.id
      });
      jobData.application_status = app ? app.status : null;
      jobData.rejection_date = app ? app.rejection_date : null;
    }

    res.status(200).json(jobData);
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Interviewer - owner only)
const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.interviewer_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this job" });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('interviewer');
    res.status(200).json(formatJob(job));
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Interviewer - owner only)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.interviewer_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this job" });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get interviews for a job
// @route   GET /api/jobs/:id/interviews
// @access  Private (Interviewer - owner only)
const getJobInterviews = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.interviewer_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view these interviews" });
    }

    const interviews = await Interview.find({ job_id: req.params.id })
      .sort({ created_at: -1 })
      .populate('candidate_id', 'name email');

    // Format interviews to match expected output (flat structure for candidate info if needed)
    const formattedInterviews = interviews.map(i => {
      const obj = i.toObject();
      return {
        ...obj,
        id: obj._id,
        candidate_name: obj.candidate_id?.name,
        candidate_email: obj.candidate_id?.email
      };
    });

    res.status(200).json(formattedInterviews);
  } catch (error) {
    console.error("Get job interviews error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Generate AI technical questions for a job
// @route   POST /api/jobs/:id/generate-questions
// @access  Private (Interviewer)
const generateAIQuestions = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.interviewer_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { generateJobQuestions } = require("../utils/aiService");
    const questions = await generateJobQuestions(job.title, job.description, job.required_skills);

    job.ai_questions = questions;
    await job.save();

    res.status(200).json({ questions });
  } catch (error) {
    console.error("AI Question Generation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobInterviews,
  generateAIQuestions,
};
