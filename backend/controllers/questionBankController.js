const QuestionBank = require("../models/QuestionBank");

// GET all questions (filterable by category, role, difficulty)
exports.getQuestions = async (req, res) => {
  try {
    const { category, role, difficulty } = req.query;
    const filter = { isPublic: true };
    if (category) filter.category = category;
    if (role) filter.role = new RegExp(role, "i");
    if (difficulty) filter.difficulty = difficulty;

    const questions = await QuestionBank.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET my questions only
exports.getMyQuestions = async (req, res) => {
  try {
    const questions = await QuestionBank.find({ createdBy: req.user._id })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST create a question
exports.createQuestion = async (req, res) => {
  try {
    const { question, category, role, difficulty, hint, tags, isPublic } = req.body;
    const doc = await QuestionBank.create({
      question,
      category,
      role,
      difficulty,
      hint,
      tags,
      isPublic,
      createdBy: req.user._id,
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT rate a question
exports.rateQuestion = async (req, res) => {
  try {
    const { score } = req.body;
    const doc = await QuestionBank.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    const existing = doc.ratings.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (existing) {
      existing.score = score;
    } else {
      doc.ratings.push({ user: req.user._id, score });
    }
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT increment timesUsed
exports.markUsed = async (req, res) => {
  try {
    const doc = await QuestionBank.findByIdAndUpdate(
      req.params.id,
      { $inc: { timesUsed: 1 } },
      { new: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE a question (own only)
exports.deleteQuestion = async (req, res) => {
  try {
    const doc = await QuestionBank.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (doc.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await doc.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
