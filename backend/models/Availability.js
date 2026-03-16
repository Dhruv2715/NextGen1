const mongoose = require("mongoose");

const AvailabilitySchema = new mongoose.Schema(
  {
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    weeklySlots: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6 }, // 0=Sun, 6=Sat
        startTime: { type: String }, // "09:00"
        endTime: { type: String },   // "17:00"
      },
    ],
    blockedDates: [{ type: String }], // "YYYY-MM-DD"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Availability", AvailabilitySchema);
