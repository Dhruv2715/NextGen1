import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Modal from "../Preparation/Components/Modal.jsx";
import { UserContext } from "../../context/userContext.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import Login from "../Auth/Login.jsx";
import SignUp from "../Auth/SignUp.jsx";
import HeroBrainImg from "../../assets/hero_3d_brain.png";
import FeatureInterviewImg from "../../assets/feature_interview_3d.png";
import AnalyticsDashboardImg from "../../assets/analytics_dashboard_3d.png";
import "./LandingPage.css";

/* ───── icon helpers (inline SVG to avoid extra deps) ───── */
const Icon = ({ children, bg }) => (
  <div className="lp-feature-icon" style={{ background: bg || 'rgba(99,102,241,0.12)' }}>{children}</div>
);

const CANDIDATE_FEATURES = [
  { icon: "🤖", title: "AI Mock Interviews", desc: "Practice with our AI interviewer that adapts to your skill level, provides real-time feedback, and simulates actual company interview patterns.", bg: "rgba(99,102,241,0.12)" },
  { icon: "📄", title: "Smart Resume Builder", desc: "AI-powered resume analysis with ATS scoring, keyword optimization, and personalized improvement suggestions.", bg: "rgba(6,182,212,0.12)" },
  { icon: "📊", title: "Skill Gap Analyzer", desc: "Identify your strengths and weaknesses with detailed skill mapping, personalized learning paths, and progress tracking.", bg: "rgba(168,85,247,0.12)" },
  { icon: "🎯", title: "Interview Preparation", desc: "Access curated question banks, coding challenges, and behavioral interview scenarios tailored to your target roles.", bg: "rgba(34,211,238,0.12)" },
  { icon: "📈", title: "Performance Analytics", desc: "Track your interview performance over time with detailed metrics, confidence scores, and improvement recommendations.", bg: "rgba(249,115,22,0.12)" },
  { icon: "💼", title: "Job Applications", desc: "Browse and apply to jobs directly, track application status, and receive AI-matched job recommendations.", bg: "rgba(236,72,153,0.12)" },
];

const INTERVIEWER_FEATURES = [
  { icon: "📋", title: "Question Bank & Templates", desc: "Access pre-built interview templates, create custom question banks, and standardize your interview process.", bg: "rgba(99,102,241,0.12)" },
  { icon: "⚡", title: "AI-Powered Shortlisting", desc: "Automatically screen and rank candidates based on skills, experience, and interview performance using AI.", bg: "rgba(6,182,212,0.12)" },
  { icon: "📊", title: "Collaborative Scorecard", desc: "Real-time scoring during interviews with multi-reviewer support and consensus-building tools.", bg: "rgba(168,85,247,0.12)" },
  { icon: "🔍", title: "Candidate Comparison", desc: "Side-by-side candidate comparison matrix with skill radar charts and data-driven shortlisting.", bg: "rgba(34,211,238,0.12)" },
  { icon: "🛡️", title: "Proctoring & Anti-Cheat", desc: "Advanced monitoring with tab-switch detection, face tracking, and behavioral analysis for fair assessments.", bg: "rgba(249,115,22,0.12)" },
  { icon: "📅", title: "Calendar & Scheduling", desc: "Sync availability, auto-schedule interviews, and manage your interview pipeline effortlessly.", bg: "rgba(236,72,153,0.12)" },
];

const DEFAULT_STATS = [
  { key: "users", label: "Active Users", fallback: 0 },
  { key: "interviews", label: "Interviews Conducted", fallback: 0 },
  { key: "jobs", label: "Jobs Posted", fallback: 0 },
  { key: "applications", label: "Applications Submitted", fallback: 0 },
];

// Testimonials removed

const MARQUEE_ITEMS = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Uber", "Flipkart", "Infosys", "TCS", "Wipro", "Adobe", "Salesforce", "LinkedIn"];

function LandingPage() {
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeRole, setActiveRole] = useState("candidate");
  const [cursorPos, setCursorPos] = useState({ x: -500, y: -500 });
  const [platformStats, setPlatformStats] = useState({ users: 0, interviews: 0, jobs: 0, applications: 0 });
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  // Scroll tracking
  const { scrollYProgress } = useScroll();
  const heroImgY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const heroImgRotateX = useTransform(scrollYProgress, [0, 0.15], [8, 0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch real platform stats
  useEffect(() => {
    axiosInstance.get("/api/public/stats")
      .then(res => setPlatformStats(res.data))
      .catch(() => {});
  }, []);

  // Cursor glow
  const handleMouseMove = useCallback((e) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  }, []);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".lp-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeRole]);

  // Animated counter
  function AnimatedCounter({ target, suffix = "" }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const num = parseInt(target.replace(/[^0-9]/g, ""));
    useEffect(() => {
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          let start = 0;
          const step = Math.ceil(num / 60);
          const interval = setInterval(() => {
            start += step;
            if (start >= num) { setCount(num); clearInterval(interval); }
            else setCount(start);
          }, 25);
          obs.disconnect();
        }
      }, { threshold: 0.3 });
      if (ref.current) obs.observe(ref.current);
      return () => obs.disconnect();
    }, [num]);
    const formatted = count >= 1000 ? (count / 1000).toFixed(count >= 10000 ? 0 : 0) + ",000" : count;
    return <span ref={ref}>{target.includes(",") ? formatted : count}{suffix}{target.includes("+") ? "+" : ""}{target.includes("%") ? "%" : ""}</span>;
  }

  function handleCTA() {
    if (!user) { setIsLoading(true); setOpenAuthModal(true); }
    else {
      user.role === "interviewer" ? navigate("/interviewer/dashboard") : navigate("/candidate/dashboard");
    }
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  // Generate particles
  const particles = Array.from({ length: 40 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    animationDuration: `${8 + Math.random() * 12}s`,
    animationDelay: `${Math.random() * 10}s`,
    width: `${1 + Math.random() * 2}px`,
    height: `${1 + Math.random() * 2}px`,
    opacity: 0.2 + Math.random() * 0.4,
  }));

  const currentFeatures = activeRole === "candidate" ? CANDIDATE_FEATURES : INTERVIEWER_FEATURES;

  return (
    <div className="lp-wrapper" ref={wrapperRef} onMouseMove={handleMouseMove}>
      {/* Cursor Glow */}
      <div className="lp-cursor-glow" style={{ left: cursorPos.x, top: cursorPos.y }} />

      {/* Particles */}
      <div className="lp-particles">
        {particles.map((p, i) => (
          <div key={i} className="lp-particle" style={p} />
        ))}
      </div>

      {/* ─── Navbar ─── */}
      <nav className={`lp-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="lp-logo">NextGen</div>
        <ul className="lp-nav-links">
          <li><a onClick={() => scrollToSection("features")}>Features</a></li>
          <li><a onClick={() => scrollToSection("how-it-works")}>How It Works</a></li>
          <li><a onClick={() => scrollToSection("stats")}>Stats</a></li>
        </ul>
        {user ? (
          <button className="lp-nav-cta" onClick={() => user.role === "interviewer" ? navigate("/interviewer/dashboard") : navigate("/candidate/dashboard")}>
            Dashboard →
          </button>
        ) : (
          <button className="lp-nav-cta" onClick={handleCTA}>Get Started</button>
        )}
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="lp-hero">
        <div className="lp-hero-grid" />
        <div className="lp-hero-content">
          <h1 className="lp-hero-title">
            Ace Every Interview with{" "}
            <span className="lp-hero-title-gradient">AI-Powered</span> Intelligence
          </h1>
          <p className="lp-hero-subtitle">
            The next-generation platform that transforms how candidates prepare and
            interviewers hire — powered by advanced AI, real-time analytics, and immersive simulations.
          </p>
          <div className="lp-hero-buttons">
            <button className="lp-btn-primary" onClick={handleCTA}>
              {user ? "Go to Dashboard →" : "Start Free Trial →"}
            </button>
            <button className="lp-btn-secondary" onClick={() => scrollToSection("how-it-works")}>
              See How It Works
            </button>
          </div>
        </div>

        {/* 3D Hero Visual */}
        <motion.div className="lp-hero-visual" style={{ y: heroImgY }}>
          <div className="lp-hero-img-wrapper">
            <div className="lp-hero-img-glow" />
            <motion.img
              src={HeroBrainImg}
              alt="NextGen AI Platform"
              className="lp-hero-img"
              style={{ rotateX: heroImgRotateX }}
            />
            {/* Floating Cards */}
            <div className="lp-floating-card" style={{ top: "35%", right: "-10%" }}>
              <span style={{ fontSize: "1.2rem" }}>⚡</span>
              <div><div style={{ fontWeight: 700 }}>Real-time</div><div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Feedback Loop</div></div>
            </div>
            <div className="lp-floating-card" style={{ bottom: "10%", left: "-5%" }}>
              <span style={{ fontSize: "1.2rem" }}>🔒</span>
              <div><div style={{ fontWeight: 700 }}>Enterprise</div><div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Grade Security</div></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Marquee / Trusted By ─── */}
      <div className="lp-marquee-wrapper">
        <div className="lp-marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="lp-marquee-item">✦ {item}</span>
          ))}
        </div>
      </div>

      {/* ─── Stats ─── */}
      <section id="stats" className="lp-stats">
        {DEFAULT_STATS.map((s, i) => {
          const rawValue = platformStats[s.key] || s.fallback;
          const displayValue = rawValue.toString() + (rawValue > 0 ? "+" : "");
          return (
            <div key={i} className="lp-stat">
              <div className="lp-stat-number"><AnimatedCounter target={displayValue} /></div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          );
        })}
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="lp-section">
        <div className="lp-reveal">
          <div className="lp-section-label">Features</div>
          <h2 className="lp-section-title">Everything You Need to Succeed</h2>
          <p className="lp-section-desc">
            A comprehensive toolkit for both candidates and interviewers, powered by cutting-edge AI technology.
          </p>
        </div>
        <div className="lp-role-tabs lp-reveal">
          <button className={`lp-role-tab ${activeRole === "candidate" ? "active" : ""}`} onClick={() => setActiveRole("candidate")}>For Candidates</button>
          <button className={`lp-role-tab ${activeRole === "interviewer" ? "active" : ""}`} onClick={() => setActiveRole("interviewer")}>For Interviewers</button>
        </div>
        <div className="lp-features-grid">
          {currentFeatures.map((f, i) => (
            <motion.div
              key={`${activeRole}-${i}`}
              className="lp-feature-card lp-reveal"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Icon bg={f.bg}><span style={{ fontSize: "1.5rem" }}>{f.icon}</span></Icon>
              <div className="lp-feature-title">{f.title}</div>
              <div className="lp-feature-desc">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="lp-section">
        <div className="lp-reveal">
          <div className="lp-section-label">How It Works</div>
          <h2 className="lp-section-title">Get Started in 3 Simple Steps</h2>
          <p className="lp-section-desc">From sign-up to your dream job — our AI guides you every step of the way.</p>
        </div>
        <div className="lp-showcase">
          <div className="lp-showcase-row lp-reveal">
            <div className="lp-showcase-img">
              <img src={HeroBrainImg} alt="AI Analysis" />
            </div>
            <div className="lp-showcase-text">
              <div className="lp-showcase-step">1</div>
              <div className="lp-showcase-title">Create Your Profile & Set Goals</div>
              <div className="lp-showcase-desc">Sign up, upload your resume, and tell us your target roles. Our AI instantly analyzes your skills and creates a personalized preparation roadmap.</div>
            </div>
          </div>
          <div className="lp-showcase-row reverse lp-reveal">
            <div className="lp-showcase-img">
              <img src={FeatureInterviewImg} alt="Mock Interviews" />
            </div>
            <div className="lp-showcase-text">
              <div className="lp-showcase-step">2</div>
              <div className="lp-showcase-title">Practice with AI Mock Interviews</div>
              <div className="lp-showcase-desc">Engage in realistic interview simulations. Get real-time feedback on your answers, body language analysis, and communication skills — all powered by advanced AI.</div>
            </div>
          </div>
          <div className="lp-showcase-row lp-reveal">
            <div className="lp-showcase-img">
              <img src={AnalyticsDashboardImg} alt="Analytics Dashboard" />
            </div>
            <div className="lp-showcase-text">
              <div className="lp-showcase-step">3</div>
              <div className="lp-showcase-title">Track, Improve & Get Hired</div>
              <div className="lp-showcase-desc">Monitor your progress with detailed analytics, close skill gaps with targeted practice, and apply to AI-matched positions with confidence.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials section removed as requested ─── */}

      {/* ─── CTA ─── */}
      <section className="lp-cta-section">
        <div className="lp-cta-box lp-reveal">
          <h2 className="lp-section-title" style={{ marginBottom: "1rem" }}>Ready to Transform Your Interview Experience?</h2>
          <p className="lp-section-desc" style={{ marginBottom: "2rem" }}>Join thousands of professionals who are already using NextGen to land their dream jobs and hire the best talent.</p>
          <button className="lp-btn-primary" onClick={handleCTA} style={{ fontSize: "1.1rem", padding: "1rem 3rem" }}>
            {user ? "Go to Dashboard →" : "Get Started for Free →"}
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div>
            <div className="lp-logo" style={{ marginBottom: "0.5rem" }}>NextGen</div>
            <div className="lp-footer-copy">© 2026 NextGen. All rights reserved.</div>
          </div>
          <ul className="lp-footer-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>
      </footer>

      {/* ─── Auth Modal ─── */}
      <Modal isOpen={openAuthModal} onClose={() => { setOpenAuthModal(false); setCurrentPage("login"); setIsLoading(false); }} hideHeader isDark isLoading={isLoading}>
        <div>
          {currentPage === "login" && <Login setCurrentPage={setCurrentPage} onClose={() => setOpenAuthModal(false)} onLoadingComplete={() => setIsLoading(false)} />}
          {currentPage === "signup" && <SignUp setCurrentPage={setCurrentPage} onClose={() => setOpenAuthModal(false)} onLoadingComplete={() => setIsLoading(false)} />}
        </div>
      </Modal>
    </div>
  );
}

export default LandingPage;
