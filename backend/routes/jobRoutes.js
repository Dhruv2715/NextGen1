const express = require("express");
const {
  createJob,
  getAllJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobInterviews,
} = require("../controllers/jobController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", protect, createJob);
router.get("/", getAllJobs);
router.get("/my-jobs", protect, getMyJobs);
router.get("/:id", getJobById);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);
router.get("/:id/interviews", protect, getJobInterviews);

module.exports = router;
