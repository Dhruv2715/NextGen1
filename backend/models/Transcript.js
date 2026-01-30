const mongoose = require("mongoose");

const TranscriptSchema = new mongoose.Schema(
    {
        interview_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
        text_content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    {
        timestamps: false // We just need the timestamp field above
    }
);

module.exports = mongoose.model("Transcript", TranscriptSchema);
