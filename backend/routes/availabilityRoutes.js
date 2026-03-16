const express = require("express");
const router = express.Router();
const {
  getAvailability,
  saveAvailability,
  getOpenSlots,
} = require("../controllers/availabilityController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/slots", protect, getOpenSlots);
router.get("/:interviewerId", protect, getAvailability);
router.put("/", protect, saveAvailability);

module.exports = router;
