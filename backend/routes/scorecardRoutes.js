const express = require("express");
const router = express.Router();
const { submitScorecard, getScorecards } = require("../controllers/scorecardController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/", protect, submitScorecard);
router.get("/:interviewId", protect, getScorecards);

module.exports = router;
