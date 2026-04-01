import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('interviewer_dashboard.welcome')}!</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400 font-medium italic">{t('interviewer_dashboard.overview')}</p>
        </div>
        <div className="flex gap-4">
          <select 
            className="bg-gray-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 hover:border-indigo-300 outline-none transition-colors"
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            value={i18n.language}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
          <Link
            to="/interviewer/jobs"
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-400 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-lg shadow-indigo-200/50 hover:shadow-indigo-500/30 font-bold"
          >
            <Plus size={20} />
            {t('interviewer_dashboard.new_job')}
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Jobs', val: jobsCount.total, icon: <Briefcase className="text-blue-600 dark:text-blue-400" />, bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: t('interviewer_dashboard.active_jobs'), val: jobsCount.active, icon: <CheckCircle className="text-green-600 dark:text-green-400" />, bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: t('interviewer_dashboard.total_applications'), val: interviews.length, icon: <Users className="text-purple-600 dark:text-purple-400" />, bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.08)] hover:-translate-y-1 flex items-center gap-5 transition-all duration-300">
            <div className={`p-4 rounded-2xl ${s.bg}`}>{s.icon}</div>
            <div>
              <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">{s.label}</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white leading-none pt-1">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-8">
          {/* Quick Actions / Getting Started */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-[0_8px_30px_rgb(99,102,241,0.15)] border border-indigo-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 blur-[100px]" />
            <h2 className="text-2xl font-bold mb-4 font-['Space_Grotesk'] tracking-tight">Ready to find talent?</h2>
            <p className="text-indigo-100/80 mb-8 max-w-md font-medium">Manage your technical assessments and review candidate performance across all your active job listings.</p>
            <Link
              to="/interviewer/jobs"
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg hover:shadow-white/20"
            >
              Manage Job Listings
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Applications</h2>
            <Link to="/interviewer/jobs" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
              View all jobs
              <ArrowRight size={14} />
            </Link>
          </div>

          {interviews.length === 0 ? (
            <div className="bg-white dark:bg-white/5 rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/10 p-16 text-center">
              <div className="bg-gray-50 dark:bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={32} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No applications yet. Your candidates' activity will show up here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviews.slice(0, 4).map((interview) => (
                <div key={interview.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/10 p-5 hover:border-indigo-200 dark:hover:border-indigo-500/50 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.08)] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 truncate">
                        {interview.job_title}
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {interview.candidate_name || 'Anonymous Cand.'}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border shadow-sm ${interview.status === 'completed'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-500/20'
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20'
                      }`}>
                      {interview.status}
                    </span>
                  </div>

                  {interview.status === 'completed' ? (
                    <button
                      onClick={() => handleReviewInterview(interview.id)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest py-3 rounded-xl hover:bg-black dark:hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-gray-200 dark:shadow-none"
                    >
                      <Eye size={14} className="text-blue-400 dark:text-blue-600" />
                      View Report
                    </button>
                  ) : (
                    <div className="w-full text-center py-2.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5">
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
          <div className="bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 p-6 shadow-sm transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 dark:bg-blue-400 rounded-full" />
              Latest Updates
            </h3>

            {interviews.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No recent activity detected.</p>
            ) : (
              <div className="space-y-6">
                {interviews.slice(0, 5).map((interview, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer" onClick={() => interview.status === 'completed' && handleReviewInterview(interview.id)}>
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${interview.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        }`}>
                        {interview.candidate_name ? interview.candidate_name.charAt(0) : 'A'}
                      </div>
                      {i !== interviews.slice(0, 5).length - 1 && (
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-px h-6 bg-gray-100 dark:bg-white/5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {interview.candidate_name || 'Anonymous'} applied
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                        for {interview.job_title}
                      </p>
                      <p className="text-[10px] text-blue-500 dark:text-blue-400 font-bold mt-1 uppercase tracking-tighter">
                        {new Date(interview.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[50px] rounded-full" />
            <h4 className="font-bold mb-2 font-['Space_Grotesk'] tracking-tight">Need Help?</h4>
            <p className="text-white/90 text-xs leading-relaxed mb-4 font-medium">Check our guides on how to create the best technical assessments for your team.</p>
            <button className="w-full py-2.5 bg-white text-indigo-600 hover:scale-105 rounded-xl text-xs font-bold transition-all shadow-md">
              View Tutorials
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewerDashboard;
