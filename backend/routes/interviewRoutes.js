const express = require("express");
const {
  createInterview,
  getMyInterviews,
  getInterviewById,
  updateInterview,
  submitInterview,
  getInterviewTranscripts,
} = require("../controllers/interviewController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", protect, createInterview);
router.get("/", protect, getMyInterviews);
router.get("/:id", protect, getInterviewById);
router.put("/:id", protect, updateInterview);
router.post("/:id/submit", protect, submitInterview);
router.get("/:id/transcripts", protect, getInterviewTranscripts);

module.exports = router;
