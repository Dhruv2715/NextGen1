const express = require("express");
const router = express.Router();
const {
    applyToJob,
    getInterviewerApplications,
    updateApplicationStatus,
    getMyApplications
} = require("../controllers/applicationController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/apply", protect, applyToJob);
router.get("/interviewer", protect, getInterviewerApplications);
router.put("/:id/status", protect, updateApplicationStatus);
router.get("/my-applications", protect, getMyApplications);

module.exports = router;
