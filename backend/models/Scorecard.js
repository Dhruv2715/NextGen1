const mongoose = require("mongoose");

const ScorecardSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },
    scoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    criteria: [
      {
        label: { type: String, required: true },
        score: { type: Number, min: 0, max: 10, default: 0 },
        maxScore: { type: Number, default: 10 },
        comment: { type: String, default: "" },
      },
    ],
    overallScore: { type: Number, min: 0, max: 10, default: 0 },
    recommendation: {
      type: String,
      enum: ["Strong Hire", "Hire", "Maybe", "No Hire"],
      default: "Maybe",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scorecard", ScorecardSchema);
