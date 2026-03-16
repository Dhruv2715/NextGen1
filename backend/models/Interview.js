const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema(
    {
        job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
        candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
            type: String,
            enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
            default: 'scheduled'
        },
        feedback_json: { type: mongoose.Schema.Types.Mixed }, // Can store object or string
        code_submission: { type: String },
        language: { type: String, default: 'javascript' },
        completed_at: { type: Date },
        recording_url: { type: String },
        transcripts: [{
            text_content: { type: String },
            timestamp: { type: Date }
        }],
        ai_summary: { type: String },
        ai_highlights: [{ type: String }],
        proctoringLog: [{
            event: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }]
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

module.exports = mongoose.model("Interview", InterviewSchema);
