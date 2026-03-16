import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompare, Users, TrendingUp, CheckCircle2, XCircle, AlertCircle, ChevronLeft } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const getRatingColor = (score) => {
  if (score >= 8) return '#10b981';
  if (score >= 6) return '#f59e0b';
  return '#ef4444';
};

const RecoBadge = ({ reco }) => {
  const colors = { 'Strong Hire': '#10b981', 'Hire': '#3b82f6', 'Maybe': '#f59e0b', 'No Hire': '#ef4444' };
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${colors[reco] || '#6b7280'}20`, color: colors[reco] || '#6b7280' }}>
      {reco || 'N/A'}
    </span>
  );
};

const CandidateComparison = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [selected, setSelected] = useState([]);
  const [scorecards, setScorecards] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/interviews').then(res => {
      const completed = (res.data || []).filter(i => i.status === 'completed' || i.status === 'submitted');
      setInterviews(completed);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleSelect = async (id) => {
    if (selected.includes(id)) {
      setSelected(s => s.filter(i => i !== id));
    } else {
      if (selected.length >= 5) return toast.error('Max 5 candidates for comparison');
      setSelected(s => [...s, id]);
      if (!scorecards[id]) {
        try {
          const res = await axiosInstance.get(`/api/scorecards/${id}`);
          setScorecards(s => ({ ...s, [id]: res.data || [] }));
        } catch { setScorecards(s => ({ ...s, [id]: [] })); }
      }
    }
  };

  const selectedInterviews = interviews.filter(i => selected.includes(i._id));

  const avgScore = (interviewId) => {
    const cards = scorecards[interviewId] || [];
    if (!cards.length) return null;
    const sum = cards.reduce((a, c) => a + (c.overallScore || 0), 0);
    return Math.round(sum / cards.length * 10) / 10;
  };

  const topReco = (interviewId) => {
    const cards = scorecards[interviewId] || [];
    if (!cards.length) return null;
    const order = ['Strong Hire', 'Hire', 'Maybe', 'No Hire'];
    const recos = cards.map(c => c.recommendation).sort((a, b) => order.indexOf(a) - order.indexOf(b));
    return recos[0];
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <button onClick={() => navigate('/interviewer/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm font-medium mb-4 transition-colors">
          <ChevronLeft size={16} /> Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <GitCompare size={24} className="text-violet-500" /> Candidate Comparison Matrix
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Select up to 5 completed interviews to compare side-by-side</p>
      </div>

      {/* Interview Selector */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-5 mb-6">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Users size={15} /> Select Candidates ({selected.length}/5)
        </h2>
        {loading ? (
          <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : interviews.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No completed interviews found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto">
            {interviews.map(i => (
              <button key={i._id} onClick={() => toggleSelect(i._id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selected.includes(i._id) ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20' : 'border-gray-200 dark:border-white/10 hover:border-gray-300'}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${selected.includes(i._id) ? 'bg-violet-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                  {(i.candidate_name || i.candidate?.name || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{i.candidate_name || i.candidate?.name || 'Candidate'}</div>
                  <div className="text-[10px] text-gray-400 truncate">{i.job?.title || 'Interview'}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {selectedInterviews.length >= 2 ? (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10">
                  <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Metric</th>
                  {selectedInterviews.map(i => (
                    <th key={i._id} className="p-4 text-center min-w-[150px]">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center">
                          {(i.candidate_name || i.candidate?.name || '?')[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-xs text-gray-900 dark:text-white">{i.candidate_name || i.candidate?.name || 'Candidate'}</span>
                        <span className="text-[10px] text-gray-400">{i.job?.title || ''}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {/* Overall Score */}
                <tr className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="p-4 text-xs font-bold text-gray-600 dark:text-gray-400">Overall Score</td>
                  {selectedInterviews.map(i => {
                    const score = avgScore(i._id);
                    return (
                      <td key={i._id} className="p-4 text-center">
                        {score !== null ? (
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-extrabold" style={{ color: getRatingColor(score) }}>{score}</span>
                            <span className="text-[10px] text-gray-400">/ 10</span>
                          </div>
                        ) : <span className="text-gray-400 text-xs">No scorecard</span>}
                      </td>
                    );
                  })}
                </tr>
                {/* Recommendation */}
                <tr className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="p-4 text-xs font-bold text-gray-600 dark:text-gray-400">Recommendation</td>
                  {selectedInterviews.map(i => (
                    <td key={i._id} className="p-4 text-center">
                      <RecoBadge reco={topReco(i._id)} />
                    </td>
                  ))}
                </tr>
                {/* Scorecards Count */}
                <tr className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="p-4 text-xs font-bold text-gray-600 dark:text-gray-400">Evaluators</td>
                  {selectedInterviews.map(i => (
                    <td key={i._id} className="p-4 text-center">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{(scorecards[i._id] || []).length}</span>
                      <span className="text-[10px] text-gray-400 block">scorecards</span>
                    </td>
                  ))}
                </tr>
                {/* Status */}
                <tr className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="p-4 text-xs font-bold text-gray-600 dark:text-gray-400">Status</td>
                  {selectedInterviews.map(i => (
                    <td key={i._id} className="p-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 dark:bg-green-900/20 text-green-600 capitalize">{i.status}</span>
                    </td>
                  ))}
                </tr>
                {/* Actions */}
                <tr>
                  <td className="p-4 text-xs font-bold text-gray-600 dark:text-gray-400">Action</td>
                  {selectedInterviews.map(i => (
                    <td key={i._id} className="p-4 text-center">
                      <div className="flex flex-col gap-1.5">
                        <button onClick={() => navigate(`/interviewer/review/${i._id}`)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all">
                          View Review
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedInterviews.length === 1 ? (
        <div className="text-center text-sm text-gray-400 py-8">Select at least one more candidate to compare</div>
      ) : (
        <div className="text-center text-sm text-gray-400 py-8 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
          <GitCompare size={36} className="mx-auto mb-2 opacity-30" />
          Select 2 or more candidates above to see the comparison matrix
        </div>
      )}
    </DashboardLayout>
  );
};

export default CandidateComparison;
