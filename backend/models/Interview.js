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
        completed_at: { type: Date },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

module.exports = mongoose.model("Interview", InterviewSchema);
