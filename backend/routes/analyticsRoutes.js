const express = require("express");
const { getInterviewerAnalytics, getCandidateProgress } = require("../controllers/analyticsController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/interviewer", protect, getInterviewerAnalytics);
router.get("/candidate", protect, getCandidateProgress);

module.exports = router;
