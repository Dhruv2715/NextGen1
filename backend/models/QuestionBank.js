const mongoose = require("mongoose");

const QuestionBankSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["behavioral", "technical", "situational"],
      required: true,
    },
    role: { type: String, default: "General" },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    hint: { type: String, default: "" },
    tags: { type: [String], default: [] },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        score: { type: Number, min: 1, max: 5 },
      },
    ],
    timesUsed: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: compute average rating
QuestionBankSchema.virtual("avgRating").get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.score, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10;
});

QuestionBankSchema.set("toJSON", { virtuals: true });
QuestionBankSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("QuestionBank", QuestionBankSchema);
