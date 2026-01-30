const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    profileImageUrl: { type: String, default: null },
    resumeLink: { type: String, default: null },
    initials: { type: String },
    role: { type: String, enum: ['candidate', 'interviewer'], default: 'candidate' } // Added role field
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } } // Map timestamps to match pg conventions slightly or just standard createdAt
);

module.exports = mongoose.model("User", UserSchema);
