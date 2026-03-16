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
        stage: { 
            type: String, 
            enum: ['Applied', 'Screened', 'Technical', 'HR', 'Offer'], 
            default: 'Applied' 
        },
        rejection_date: { type: Date, default: null },
        ai_score: { type: Number, default: 0 },
        ai_analysis: { type: String, default: '' },
        is_screened: { type: Boolean, default: false },
        offer_details: {
            compensation: { type: Number },
            currency: { type: String, default: 'USD' },
            deadline: { type: Date },
            candidate_decision: { 
                type: String, 
                enum: ['pending', 'accepted', 'declined'], 
                default: 'pending' 
            }
        },
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
