const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
    {
        job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
        candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        resume_url: { type: String, required: true },
        bio: { type: String, default: '' },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        rejection_date: { type: Date, default: null },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtuals for populating related data
ApplicationSchema.virtual('job', {
    ref: 'Job',
    localField: 'job_id',
    foreignField: '_id',
    justOne: true
});

ApplicationSchema.virtual('candidate', {
    ref: 'User',
    localField: 'candidate_id',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model("Application", ApplicationSchema);
