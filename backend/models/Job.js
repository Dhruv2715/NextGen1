const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        required_skills: { type: [String], default: [] },
        interviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual populate to mimic the left joins we had in SQL
JobSchema.virtual('interviewer', {
    ref: 'User',
    localField: 'interviewer_id',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model("Job", JobSchema);
