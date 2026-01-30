const Interview = require("../models/Interview");
const Transcript = require("../models/Transcript");
const Job = require("../models/Job");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Helper to format interview for frontend compatibility
const formatInterview = (interview) => {
  if (!interview) return null;
  const i = interview.toObject ? interview.toObject() : interview;

  // Flatten job details if populated
  const job = i.job_id || {};
  const candidate = i.candidate_id || {};
  // Attempt to resolve interviewer from job if populated
  const interviewer = job.interviewer_id || {}; // deeply populated in some calls?

  return {
    ...i,
    id: i._id,
    job_title: job.title,
    job_description: job.description,
    candidate_name: candidate.name,
    candidate_email: candidate.email,
    interviewer_name: i.interviewer_name || (typeof job.interviewer_id === 'object' ? job.interviewer_id.name : undefined) // handling dependent on population depth
  };
};

// @desc    Create a new interview (Apply to job)
// @route   POST /api/interviews
// @access  Private (Candidate)
const createInterview = async (req, res) => {
  try {
    const { job_id } = req.body;
    const candidate_id = req.user.id;

    if (!job_id) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    // Check if job exists
    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if interview already exists for this candidate and job
    const existingInterview = await Interview.findOne({ job_id, candidate_id });
    if (existingInterview) {
      // If already exists, just return it (Resume flow)
      return res.status(200).json(formatInterview(existingInterview));
    }

    const interview = await Interview.create({
      job_id,
      candidate_id,
      status: 'scheduled',
    });

    // Populate for consistent return
    const populatedInterview = await Interview.findById(interview._id)
      .populate({
        path: 'job_id',
        populate: { path: 'interviewer_id', select: 'name email' }
      })
      .populate('candidate_id', 'name email');

    res.status(201).json(formatInterview(populatedInterview));
  } catch (error) {
    console.error("Create interview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all interviews for current user
// @route   GET /api/interviews
// @access  Private
const getMyInterviews = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'candidate') {
      query = { candidate_id: req.user.id };
    } else {
      // For interviewer, find jobs they own first, then interviews for those jobs
      // Or find interviews where job.interviewer_id matches.
      // Mongoose doesn't support deep query on filter easily in one go without aggregate.
      // Easier: Find all jobs by interviewer, then find interviews for those jobs.
      const jobs = await Job.find({ interviewer_id: req.user.id });
      const jobIds = jobs.map(j => j._id);
      query = { job_id: { $in: jobIds } };
    }

    const interviews = await Interview.find(query)
      .sort({ created_at: -1 })
      .populate({
        path: 'job_id',
        populate: { path: 'interviewer_id', select: 'name email' }
      })
      .populate('candidate_id', 'name email');

    res.status(200).json(interviews.map(formatInterview));
  } catch (error) {
    console.error("Get my interviews error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get interview by ID
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate({
        path: 'job_id',
        populate: { path: 'interviewer_id', select: 'name email' }
      })
      .populate('candidate_id', 'name email');

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Check authorization safely
    const candidateId = interview.candidate_id?._id?.toString() || interview.candidate_id?.toString();
    const interviewerId = interview.job_id?.interviewer_id?._id?.toString() || interview.job_id?.interviewer_id?.toString();
    const userId = req.user.id.toString();

    if (req.user.role === 'candidate' && candidateId !== userId) {
      return res.status(403).json({ message: "Not authorized to view this interview" });
    }

    if (req.user.role === 'interviewer' && interviewerId !== userId) {
      return res.status(403).json({ message: "Not authorized to view this interview" });
    }

    res.status(200).json(formatInterview(interview));
  } catch (error) {
    console.error("Get interview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update interview
// @route   PUT /api/interviews/:id
// @access  Private
const updateInterview = async (req, res) => {
  try {
    let interview = await Interview.findById(req.params.id).populate('job_id');
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Authorization checks
    if (req.user.role === 'candidate') {
      if (interview.candidate_id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this interview" });
      }
    } else {
      // Interviewers can update interviews for their jobs
      // Assuming job_id is populated from findById check above? Yes.
      // Wait, Mongoose findById returns doc. field access works if populated or not (if ObjectId).
      // But we need to check interviewer ownership.
      // We populated job_id above.

      const job = interview.job_id;
      // Check if job exists (it should)
      if (job && job.interviewer_id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this interview" });
      }
    }

    interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate({
        path: 'job_id',
        populate: { path: 'interviewer_id', select: 'name email' }
      })
      .populate('candidate_id', 'name email');

    res.status(200).json(formatInterview(interview));
  } catch (error) {
    console.error("Update interview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Submit interview (code and transcript)
// @route   POST /api/interviews/:id/submit
// @access  Private (Candidate)
const submitInterview = async (req, res) => {
  try {
    const { code_submission, transcripts } = req.body;
    const interview = await Interview.findById(req.params.id).populate('job_id');

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.candidate_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to submit this interview" });
    }

    // Get job details for analysis
    const job = interview.job_id;

    // Save transcripts if provided
    let fullTranscript = '';
    if (Array.isArray(transcripts) && transcripts.length > 0) {
      // Delete existing transcripts
      await Transcript.deleteMany({ interview_id: interview._id });
      // Create new transcripts
      const transcriptData = transcripts.map(t => ({
        interview_id: interview._id,
        text_content: t.text_content || t.text,
        timestamp: t.timestamp || new Date(),
      }));
      await Transcript.insertMany(transcriptData);
      fullTranscript = transcripts.map(t => t.text_content || t.text).join(' ');
    }

    // Perform AI Analysis
    let feedbackJson = null;
    let score = null;

    try {
      const analysisPrompt = `You are an AI technical interview evaluator. Analyze a candidate's interview performance.

Job Role: ${job.title}
Required Skills: ${Array.isArray(job.required_skills) ? job.required_skills.join(', ') : ''}

Candidate's Code Submission:
\`\`\`
${code_submission || 'No code submitted'}
\`\`\`

Candidate's Spoken Response (Transcript):
${fullTranscript || 'No transcript available'}

Please provide a comprehensive evaluation:
1. Score the candidate out of 10 (consider code quality, explanation clarity, problem-solving approach)
2. Provide detailed feedback
3. List strengths
4. List areas for improvement
5. Overall assessment

Return ONLY a valid JSON object in this format:
{
  "score": 7,
  "feedback": "Overall assessment of the candidate's performance",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement area 1", "Improvement area 2"],
  "codeAnalysis": "Analysis of the code submission",
  "communicationAnalysis": "Analysis of the spoken response"
}

Important: Return ONLY the JSON, no additional text or markdown formatting.`;

      const result = await model.generateContent(analysisPrompt);
      const response = await result.response;
      const rawText = response.text();

      // Robust JSON extraction
      const extractJSON = (text) => {
        try {
          const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const start = Math.min(
            cleaned.indexOf('{') === -1 ? Infinity : cleaned.indexOf('{'),
            cleaned.indexOf('[') === -1 ? Infinity : cleaned.indexOf('[')
          );
          const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));

          if (start !== Infinity && end !== -1 && end > start) {
            return JSON.parse(cleaned.substring(start, end + 1));
          }
          return JSON.parse(cleaned);
        } catch (e) {
          throw e;
        }
      };

      try {
        feedbackJson = extractJSON(rawText);
        score = feedbackJson.score || null;
      } catch (parseError) {
        console.error("Failed to parse AI analysis, raw text:", rawText);
        // Fallback: create basic feedback
        feedbackJson = {
          score: 5,
          feedback: "Analysis pending - please review manually",
          strengths: [],
          improvements: [],
        };
      }
    } catch (aiError) {
      console.error("AI analysis error:", aiError);
      // Continue without AI analysis if it fails
    }

    // Update interview with code, status, and analysis
    const updatedInterview = await Interview.findByIdAndUpdate(req.params.id, {
      code_submission: code_submission || '',
      status: 'completed',
      score: score,
      feedback_json: feedbackJson,
      completed_at: new Date()
    }, { new: true });

    res.status(200).json(formatInterview(updatedInterview));
  } catch (error) {
    console.error("Submit interview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get transcripts for an interview
// @route   GET /api/interviews/:id/transcripts
// @access  Private
const getInterviewTranscripts = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate('job_id');
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Check authorization
    if (req.user.role === 'candidate' && interview.candidate_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (req.user.role === 'interviewer') {
      const job = interview.job_id;
      if (job.interviewer_id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    const transcripts = await Transcript.find({ interview_id: req.params.id }).sort({ timestamp: 1 });
    res.status(200).json(transcripts);
  } catch (error) {
    console.error("Get transcripts error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createInterview,
  getMyInterviews,
  getInterviewById,
  updateInterview,
  submitInterview,
  getInterviewTranscripts,
};
