require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes')
const questionRoutes = require('./routes/questionRoutes');
const jobRoutes = require('./routes/jobRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const questionBankRoutes = require('./routes/questionBankRoutes');
const scorecardRoutes = require('./routes/scorecardRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { protect } = require("./middlewares/authMiddleware");
const { generateInterviewQuestions, generateInterviewQuestion, generateConceptExplanation, analyzeTranscript, cleanupTranscript, generatePDFData, shortlistCandidates, startMockInterview, submitMockInterview, extractSkillGap } = require("./controllers/aiController");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://nextgen-app.vercel.app",
      "https://nextgen.vercel.app",
      /\.vercel\.app$/,
      /\.netlify\.app$/,
      /\.onrender\.com$/,
      /^http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}$/
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware to handle CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://nextgen-app.vercel.app",
      /\.vercel\.app$/,
      /\.netlify\.app$/,
      /\.onrender\.com$/,
      /^http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}$/
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Connect to databases
connectDB();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for easier development with external scripts/images
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use("/api/", limiter);

// Middleware
app.use(express.json()); // <-- This must be before your routes

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/question-bank', questionBankRoutes);
app.use('/api/scorecards', scorecardRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/upload', uploadRoutes);

app.post("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.post("/api/ai/generate-question", protect, generateInterviewQuestion);
app.post("/api/ai/generate-explanation", protect, generateConceptExplanation);
app.post("/api/ai/analyze-transcript", protect, analyzeTranscript);
app.post("/api/ai/cleanup-transcript", protect, cleanupTranscript);
app.post("/api/ai/generate-pdf-data", protect, generatePDFData);
app.post("/api/ai/shortlist-candidates", protect, shortlistCandidates);
app.post("/api/ai/mock-interview/start", protect, startMockInterview);
app.post("/api/ai/mock-interview/submit", protect, submitMockInterview);
app.post("/api/ai/skill-gap", protect, extractSkillGap);

// Initialize Notification Scheduler (Cron Jobs)
const { initNotificationScheduler } = require("./utils/notificationScheduler");
initNotificationScheduler();

// Public stats endpoint for landing page (no auth required)
app.get("/api/public/stats", async (req, res) => {
  try {
    const User = require("./models/User");
    const Interview = require("./models/Interview");
    const Job = require("./models/Job");
    const Application = require("./models/Application");

    const [users, interviews, jobs, applications] = await Promise.all([
      User.countDocuments(),
      Interview.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
    ]);

    res.json({ users, interviews, jobs, applications });
  } catch (error) {
    console.error("Public stats error:", error);
    res.json({ users: 0, interviews: 0, jobs: 0, applications: 0 });
  }
});

// Health check endpoint for debugging
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    mongoUri: process.env.MONGO_URI ? "SET" : "MISSING",
    port: process.env.PORT || 5000
  });
});

// Test endpoint for AI setup
app.get("/test-ai", async (req, res) => {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    res.json({
      status: "AI Setup OK",
      hasKey: !!process.env.GEMINI_API_KEY,
      keyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
      modelName: "gemini-1.5-flash"
    });
  } catch (error) {
    res.status(500).json({
      status: "AI Setup Failed",
      error: error.message,
      stack: error.stack
    });
  }
});

// Socket.io Connection Handler
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Chat Events
  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined chat room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  // Collaborative Coding Events
  socket.on("code_change", (data) => {
    // data = { room, code }
    socket.to(data.room).emit("code_update", data.code);
  });

  // Proctoring Events
  socket.on("proctoring_flag", (data) => {
    // data = { room, type, timestamp }
    socket.to(data.room).emit("receive_proctoring_flag", data);
  });

  // WebRTC Video Events
  socket.on("join-room", ({ room }) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined video room: ${room}`);
    // Notify others that a user joined (triggers initiator)
    socket.to(room).emit("user-joined", socket.id);
  });

  socket.on("signal", (payload) => {
    // payload = { room, signal }
    const { room, signal } = payload;
    // If it's an offer, send as 'other-user' to the other peer
    // If it's an answer or candidate, send as 'signal'
    if (signal.type === 'offer') {
      socket.to(room).emit('other-user', { signal, id: socket.id });
    } else {
      socket.to(room).emit('signal', { signal, id: socket.id });
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

// Verify database connection and schema before starting
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
