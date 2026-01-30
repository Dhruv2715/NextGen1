import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { BeatLoader } from 'react-spinners';
import {
  Eye,
  Briefcase,
  Users,
  CheckCircle,
  Plus,
  ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const InterviewerDashboard = () => {
  const [jobsCount, setJobsCount] = useState({ total: 0, active: 0 });
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, interviewsRes] = await Promise.all([
        axiosInstance.get('/api/jobs/my-jobs'),
        axiosInstance.get('/api/interviews'),
      ]);

      setJobsCount({
        total: jobsRes.data.length,
        active: jobsRes.data.filter(j => j.status === 'active').length
      });
      setInterviews(interviewsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewInterview = (interviewId) => {
    navigate(`/interviewer/review/${interviewId}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <BeatLoader color="#3b82f6" size={10} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Interviewer Dashboard</h1>
          <p className="mt-1 text-gray-500 font-medium italic">Welcome back! Here's what's happening today.</p>
        </div>
        <Link
          to="/interviewer/jobs"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95 font-bold"
        >
          <Plus size={20} />
          Post New Job
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Jobs', val: jobsCount.total, icon: <Briefcase className="text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Active Listings', val: jobsCount.active, icon: <CheckCircle className="text-green-600" />, bg: 'bg-green-50' },
          { label: 'Total Applications', val: interviews.length, icon: <Users className="text-purple-600" />, bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className={`p-4 rounded-2xl ${s.bg}`}>{s.icon}</div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
              <p className="text-3xl font-black text-gray-900 leading-none pt-1">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-8">
          {/* Quick Actions / Getting Started */}
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px]" />
            <h2 className="text-2xl font-bold mb-4">Ready to find talent?</h2>
            <p className="text-gray-300 mb-8 max-w-md">Manage your technical assessments and review candidate performance across all your active job listings.</p>
            <Link
              to="/interviewer/jobs"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
            >
              Manage Job Listings
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
            <Link to="/interviewer/jobs" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all jobs
              <ArrowRight size={14} />
            </Link>
          </div>

          {interviews.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-16 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No applications yet. Your candidates' activity will show up here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviews.slice(0, 4).map((interview) => (
                <div key={interview.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all group flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 truncate">
                        {interview.job_title}
                      </p>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {interview.candidate_name || 'Anonymous Cand.'}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border shadow-sm ${interview.status === 'completed'
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                      {interview.status}
                    </span>
                  </div>

                  {interview.status === 'completed' ? (
                    <button
                      onClick={() => handleReviewInterview(interview.id)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
                    >
                      <Eye size={14} className="text-blue-400" />
                      View Report
                    </button>
                  ) : (
                    <div className="w-full text-center py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 rounded-xl border border-gray-100">
                      Interview in Progress
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar activity list / Secondary feed */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full" />
              Latest Updates
            </h3>

            {interviews.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No recent activity detected.</p>
            ) : (
              <div className="space-y-6">
                {interviews.slice(0, 5).map((interview, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer" onClick={() => interview.status === 'completed' && handleReviewInterview(interview.id)}>
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${interview.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                        {interview.candidate_name ? interview.candidate_name.charAt(0) : 'A'}
                      </div>
                      {i !== interviews.slice(0, 5).length - 1 && (
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-px h-6 bg-gray-100" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {interview.candidate_name || 'Anonymous'} applied
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        for {interview.job_title}
                      </p>
                      <p className="text-[10px] text-blue-500 font-bold mt-1 uppercase tracking-tighter">
                        {new Date(interview.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-100">
            <h4 className="font-bold mb-2">Need Help?</h4>
            <p className="text-blue-100 text-xs leading-relaxed mb-4">Check our guides on how to create the best technical assessments for your team.</p>
            <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/20">
              View Tutorials
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewerDashboard;
