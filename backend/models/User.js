const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    profileImageUrl: { type: String, default: null },
    resumeLink: { type: String, default: null },
    initials: { type: String },
    role: { type: String, enum: ['admin', 'hiring_manager', 'recruiter', 'interviewer', 'candidate'], default: 'candidate' },
    language: { type: String, enum: ['en', 'es', 'fr', 'de', 'hi'], default: 'en' },
    location: {
      address: { type: String, default: null },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    notificationPreferences: {
      emailReminders: { type: Boolean, default: true },
      jobAlerts: { type: Boolean, default: true }
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model("User", UserSchema);
