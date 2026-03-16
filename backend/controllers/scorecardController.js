const Scorecard = require("../models/Scorecard");

// POST submit or update a scorecard
exports.submitScorecard = async (req, res) => {
  try {
    const { interviewId, criteria, overallScore, recommendation, notes } = req.body;
    let card = await Scorecard.findOne({
      interview: interviewId,
      scoredBy: req.user._id,
    });
    if (card) {
      card.criteria = criteria;
      card.overallScore = overallScore;
      card.recommendation = recommendation;
      card.notes = notes;
      await card.save();
    } else {
      card = await Scorecard.create({
        interview: interviewId,
        scoredBy: req.user._id,
        criteria,
        overallScore,
        recommendation,
        notes,
      });
    }
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET all scorecards for an interview
exports.getScorecards = async (req, res) => {
  try {
    const cards = await Scorecard.find({ interview: req.params.interviewId })
      .populate("scoredBy", "name email");
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
