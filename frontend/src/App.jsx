import React from "react";
import { Analytics } from "@vercel/analytics/react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/Home/LandingPage.jsx";
import UserProvider from "./context/userContext.jsx";
import SpinnerLoader from "./pages/Preparation/Loader/SpinnerLoader.jsx";
import ResumeViewPage from "./pages/Resume/ResumeViewPage.jsx";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
          color: "white",
          fontFamily: "system-ui",
          padding: "20px"
        }}>
          <div style={{ textAlign: "center", maxWidth: "500px" }}>
            <h2>Something went wrong</h2>
            <p style={{ marginBottom: "20px" }}>
              There was an error loading this page. Please try refreshing.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 24px",
                backgroundColor: "#ffffffff",
                color: "black",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import Dashboard from "./pages/Home/Dashboard.jsx";
import InterviewPrep from "./pages/Preparation/InterviewPrep.jsx";
import Record from "./pages/Interview/HRInterview/Record.jsx";
import Admin from "./pages/Admin/admin.jsx";
import SessionInterview from "./pages/Interview/SessionInterview/SessionInterview.jsx";
import LiveInterview from "./pages/Interview/LiveInterview/index.jsx";
import CandidateDashboard from "./pages/Candidate/Dashboard.jsx";
import CandidateApplications from "./pages/Candidate/CandidateApplications.jsx";
import CandidateResume from "./pages/Candidate/CandidateResume.jsx";
import CandidatePreparation from "./pages/Candidate/CandidatePreparation.jsx";
import MobileCameraPage from "./pages/Candidate/MobileCameraPage.jsx";
import InterviewRoom from "./pages/Candidate/InterviewRoom.jsx";
import MockInterview from "./pages/Candidate/MockInterview.jsx";
import SkillGapAnalyzer from "./pages/Candidate/SkillGapAnalyzer.jsx";
import CandidateAnalytics from "./pages/Candidate/CandidateAnalytics.jsx";
import InterviewerDashboard from "./pages/Interviewer/Dashboard.jsx";
import InterviewerJobs from "./pages/Interviewer/InterviewerJobs.jsx";
import InterviewerAnalytics from "./pages/Interviewer/InterviewerAnalytics.jsx";
import ReviewInterview from "./pages/Interviewer/ReviewInterview.jsx";
import InterviewerQuestionBank from "./pages/Interviewer/InterviewerQuestionBank.jsx";
import CandidateComparison from "./pages/Interviewer/CandidateComparison.jsx";
import AIShortlist from "./pages/Interviewer/AIShortlist.jsx";
import AvailabilityCalendar from "./pages/Interviewer/AvailabilityCalendar.jsx";
import Settings from "./pages/Home/Settings.jsx";
import LocationMap from "./pages/Home/LocationMap.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import { ThemeProvider } from "./context/ThemeContext.jsx";

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <Router>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<LandingPage />} />

                {/* Legacy routes (for backward compatibility) */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/interview-prep/:sessionId" element={<InterviewPrep />} />
                <Route path="/interview/hr/record" element={<Record />} />
                <Route path="/interview/session-interview" element={<SessionInterview />} />
                <Route path="/interview-prep/record" element={<Record />} />
                <Route path="/resume-view" element={<ResumeViewPage />} />
                <Route path="/interview-prep/session-interview" element={<SessionInterview />} />
                <Route path="/interview/live" element={<LiveInterview />} />

                {/* New NextGen Routes */}
                <Route
                  path="/candidate/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <CandidateDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/applications"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <CandidateApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/resume"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <CandidateResume />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/preparation"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <CandidatePreparation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/mock-interview"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <MockInterview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/skill-gap"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <SkillGapAnalyzer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <CandidateAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/map"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <LocationMap />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mobile-camera/:interviewId"
                  element={<MobileCameraPage />}
                />
                <Route
                  path="/interview-room/:interviewId"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <InterviewRoom />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviewer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['interviewer', 'admin', 'hiring_manager', 'recruiter']}>
                      <InterviewerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviewer/jobs"
                  element={
                    <ProtectedRoute allowedRoles={['interviewer', 'admin', 'hiring_manager', 'recruiter']}>
                      <InterviewerJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviewer/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['interviewer', 'admin', 'hiring_manager', 'recruiter']}>
                      <InterviewerAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviewer/review/:interviewId"
                  element={
                    <ProtectedRoute allowedRoles={['interviewer', 'admin', 'hiring_manager', 'recruiter']}>
                      <ReviewInterview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviewer/question-bank"
                  element={
                    <ProtectedRoute allowedRoles={['interviewer', 'admin', 'hiring_manager', 'recruiter']}>
                      <InterviewerQuestionBank />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviewer/comparison"
                  element={
                    <ProtectedRoute allowedRoles={['interviewer', 'admin', 'hiring_manager', 'recruiter']}>
                      <CandidateComparison />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviewer/shortlist/:jobId"
                  element={
                    <ProtectedRoute allowedRoles={['interviewer', 'admin', 'hiring_manager', 'recruiter']}>
                      <AIShortlist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviewer/availability"
                  element={
                    <ProtectedRoute allowedRoles={['interviewer', 'admin', 'hiring_manager', 'recruiter']}>
                      <AvailabilityCalendar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviewer/map"
                  element={
                    <ProtectedRoute allowedRoles={['interviewer', 'admin', 'hiring_manager', 'recruiter']}>
                      <LocationMap />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute allowedRoles={['candidate', 'interviewer', 'admin', 'hiring_manager', 'recruiter']}>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </ErrorBoundary>

            <Toaster
              toastOptions={{
                className: "",
                style: {
                  fontSize: "13px",
                },
              }}
            />
          </Router>
          <Analytics />
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
