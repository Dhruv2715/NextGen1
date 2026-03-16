const express = require("express");
const router = express.Router();
const {
    applyToJob,
    getInterviewerApplications,
    updateApplicationStatus,
    updateApplicationStage,
    getMyApplications,
    respondToOffer,
    updateOfferDetails
} = require("../controllers/applicationController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/apply", protect, applyToJob);
router.get("/interviewer", protect, getInterviewerApplications);
router.put("/:id/status", protect, updateApplicationStatus);
router.put("/:id/stage", protect, updateApplicationStage);
router.get("/my-applications", protect, getMyApplications);
router.put("/:id/offer-response", protect, respondToOffer);
router.put("/:id/offer-details", protect, updateOfferDetails);

module.exports = router;
