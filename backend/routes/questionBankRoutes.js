const express = require("express");
const router = express.Router();
const {
  getQuestions,
  getMyQuestions,
  createQuestion,
  rateQuestion,
  markUsed,
  deleteQuestion,
} = require("../controllers/questionBankController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/", protect, getQuestions);
router.get("/my", protect, getMyQuestions);
router.post("/", protect, createQuestion);
router.put("/:id/rate", protect, rateQuestion);
router.put("/:id/used", protect, markUsed);
router.delete("/:id", protect, deleteQuestion);

module.exports = router;
