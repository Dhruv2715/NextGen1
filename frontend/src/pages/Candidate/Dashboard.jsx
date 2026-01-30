import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { BeatLoader } from 'react-spinners';
import {
  Briefcase,
  PlayCircle,
  Star,
  Search,
  ArrowRight,
  ClipboardList,
  Target,
  FileText
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const CandidateDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, interviewsRes] = await Promise.all([
        axiosInstance.get('/api/jobs'),
        axiosInstance.get('/api/interviews')
      ]);
      setJobs(jobsRes.data);
      setInterviews(interviewsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      const response = await axiosInstance.post('/api/interviews', {
        job_id: jobId,
      });
      navigate(`/interview-room/${response.data.id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply. Please try again.');
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.required_skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    totalApplications: interviews.length,
    completed: interviews.filter(i => i.status === 'completed').length,
    availableJobs: jobs.length
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <BeatLoader color="#3b82f6" size={10} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Candidate Dashboard</h1>
          <p className="mt-1 text-gray-500 font-medium italic">Your next career move starts here.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          <div className="px-4 py-2 text-center border-r border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Applications</p>
            <p className="text-xl font-black text-blue-600 leading-none">{stats.totalApplications}</p>
          </div>
          <div className="px-4 py-2 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Completed</p>
            <p className="text-xl font-black text-green-600 leading-none">{stats.completed}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed: Find Jobs */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative group shadow-xl shadow-blue-500/5 rounded-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by role, skill, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-700"
            />
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Available Positions</h2>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{filteredJobs.length} matches found</span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-16 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No positions match your current filters. Try broadening your search!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => {
                const existingApp = interviews.find(i => i.job_id?._id === job.id || i.job_id === job.id);
                const isCompleted = existingApp?.status === 'completed';

                return (
                  <div key={job.id} className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                        <Briefcase size={22} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Global Talent</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed flex-grow">
                      {job.description || "No description provided."}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {job.required_skills?.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-tighter rounded-lg border border-gray-100">
                          {s}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleApply(job.id)}
                      className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl transition-all font-bold text-sm ${isCompleted
                        ? 'bg-green-50 text-green-700 border-2 border-green-100'
                        : existingApp
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                        } active:scale-95`}
                    >
                      <PlayCircle size={18} />
                      {isCompleted ? 'View Performance' : existingApp ? 'Resume Interview' : 'Apply & Start'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Activity Feed */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
              Quick Access
            </h3>

            <div className="space-y-4">
              <Link to="/candidate/applications" className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <ClipboardList size={18} className="text-gray-400 group-hover:text-blue-600" />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">My Applications</span>
                </div>
                <ArrowRight size={14} className="text-gray-300" />
              </Link>
              <Link to="/candidate/resume" className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-gray-400 group-hover:text-blue-600" />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">Resume Builder</span>
                </div>
                <ArrowRight size={14} className="text-gray-300" />
              </Link>
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <Star size={18} className="text-gray-400 group-hover:text-blue-600" />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">Skill Badges</span>
                </div>
                <ArrowRight size={14} className="text-gray-300" />
              </button>
            </div>

            <div className="mt-10 p-6 bg-gradient-to-br from-gray-900 to-slate-800 rounded-3xl text-white shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-blue-400">Next Step</p>
              <h4 className="text-lg font-bold mb-2">Practice Mode</h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">Brush up on your algorithms before the real assessment.</p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/10">
                Enter Arena
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboard;
