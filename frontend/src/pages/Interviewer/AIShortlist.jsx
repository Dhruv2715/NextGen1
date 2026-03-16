import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wand2, TrendingUp, User, ChevronLeft, CheckCircle2, AlertCircle, Loader2, Award } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const ScoreBar = ({ score }) => {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 mt-1">
      <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
    </div>
  );
};

const AIShortlist = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [ranked, setRanked] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appRes] = await Promise.all([
          axiosInstance.get(`/api/jobs/${jobId}`),
          axiosInstance.get('/api/applications', { params: { jobId } }),
        ]);
        setJob(jobRes.data);
        setApplications(appRes.data || []);
      } catch { toast.error('Failed to load job data'); }
      finally { setFetching(false); }
    };
    if (jobId) fetchData();
  }, [jobId]);

  const runShortlist = async () => {
    if (!applications.length) return toast.error('No applications to shortlist');
    setLoading(true);
    setRanked([]);
    try {
      const candidates = applications.map(a => ({
        name: a.applicant?.name || a.candidate_name || 'Candidate',
        skills: a.applicant?.skills || [],
        experience: a.experience || null,
        id: a._id,
      }));
      const res = await axiosInstance.post('/api/ai/shortlist-candidates', {
        jobTitle: job?.title,
        jobSkills: (job?.required_skills || []).join(', '),
        candidates,
      });
      setRanked(res.data.ranked || []);
      toast.success('AI shortlisting complete!');
    } catch { toast.error('Failed to run AI shortlisting'); }
    finally { setLoading(false); }
  };

  const medalColors = ['#f59e0b', '#9ca3af', '#b45309'];

  if (fetching) return <DashboardLayout><div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-blue-500" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <button onClick={() => navigate('/interviewer/jobs')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm font-medium mb-4 transition-colors">
          <ChevronLeft size={16} /> Back to Jobs
        </button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Wand2 size={24} className="text-purple-500" /> AI Candidate Shortlisting
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {job ? `${job.title} — ${applications.length} applicant${applications.length !== 1 ? 's' : ''}` : 'Loading...'}
            </p>
          </div>
          <button onClick={runShortlist} disabled={loading || !applications.length}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Analysing...</> : <><Wand2 size={16} /> Run AI Shortlist</>}
          </button>
        </div>
      </div>

      {/* Explanation banner */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle size={18} className="text-purple-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-purple-700 dark:text-purple-300">
          AI analyses each candidate's skills and experience against the job requirements, then ranks them by fit score (0-100). Click <strong>Run AI Shortlist</strong> to begin.
        </p>
      </div>

      {/* Results */}
      {ranked.length > 0 ? (
        <div className="space-y-3">
          {ranked.map((candidate, idx) => (
            <div key={idx} className={`bg-white dark:bg-white/5 rounded-2xl border p-5 transition-all hover:shadow-md ${idx === 0 ? 'border-amber-300 dark:border-amber-500/40' : 'border-gray-100 dark:border-white/10'}`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold ${idx < 3 ? 'text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}
                    style={idx < 3 ? { background: `linear-gradient(135deg, ${medalColors[idx]}, ${medalColors[idx]}bb)` } : {}}>
                    {idx < 3 ? <Award size={18} /> : idx + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">{candidate.name}</h3>
                      {candidate.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {candidate.skills.slice(0, 4).map(s => (
                            <span key={s} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-[9px] font-bold rounded-full">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-extrabold" style={{ color: candidate.matchScore >= 80 ? '#10b981' : candidate.matchScore >= 60 ? '#f59e0b' : '#ef4444' }}>
                        {candidate.matchScore}
                        <span className="text-sm font-normal text-gray-400">%</span>
                      </div>
                      <div className="text-[10px] text-gray-400">Match Score</div>
                    </div>
                  </div>
                  <ScoreBar score={candidate.matchScore} />
                  {candidate.reason && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{candidate.reason}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && applications.length > 0 ? (
        <div className="text-center py-16 bg-white dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10">
          <Wand2 size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-500">Click "Run AI Shortlist" to rank candidates</p>
        </div>
      ) : !loading && applications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10">
          <User size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-500">No applications received for this job yet</p>
        </div>
      ) : null}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-2/3" />
                </div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AIShortlist;
