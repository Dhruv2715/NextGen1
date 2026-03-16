const Availability = require("../models/Availability");

// GET availability for an interviewer
exports.getAvailability = async (req, res) => {
  try {
    const doc = await Availability.findOne({ interviewer: req.params.interviewerId });
    res.json(doc || { weeklySlots: [], blockedDates: [] });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT upsert availability for logged-in interviewer
exports.saveAvailability = async (req, res) => {
  try {
    const { weeklySlots, blockedDates } = req.body;
    const doc = await Availability.findOneAndUpdate(
      { interviewer: req.user._id },
      { weeklySlots, blockedDates },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET open time slots for a specific date
exports.getOpenSlots = async (req, res) => {
  try {
    const { interviewerId, date } = req.query;
    const doc = await Availability.findOne({ interviewer: interviewerId });
    if (!doc) return res.json({ slots: [] });

    // Check if date is blocked
    if (doc.blockedDates.includes(date)) return res.json({ slots: [] });

    const dayOfWeek = new Date(date).getDay();
    const daySlots = doc.weeklySlots.filter((s) => s.dayOfWeek === dayOfWeek);
    res.json({ slots: daySlots });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
