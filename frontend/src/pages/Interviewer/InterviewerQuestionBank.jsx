import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Book, Plus, Search, Trash2, Star, Tag, Filter, ChevronDown,
  BookOpen, Code2, Users, HelpCircle, X, Check, Lightbulb,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'technical', 'behavioral', 'situational'];
const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];

const categoryIcon = { technical: Code2, behavioral: Users, situational: HelpCircle };
const diffColor = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };

const StarRating = ({ value, onRate }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} onClick={() => onRate && onRate(s)} className="focus:outline-none">
        <Star size={14} fill={s <= value ? '#f59e0b' : 'none'} color={s <= value ? '#f59e0b' : '#9ca3af'} />
      </button>
    ))}
  </div>
);

const InterviewerQuestionBank = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [questions, setQuestions] = useState([]);
  const [myQuestions, setMyQuestions] = useState([]);
  const [tab, setTab] = useState('community'); // 'community' | 'mine'
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterDiff, setFilterDiff] = useState('all');
  const [form, setForm] = useState({ question: '', category: 'technical', role: '', difficulty: 'medium', hint: '', tags: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCat !== 'all') params.category = filterCat;
      if (filterDiff !== 'all') params.difficulty = filterDiff;
      const [comm, mine] = await Promise.all([
        axiosInstance.get('/api/question-bank', { params }),
        axiosInstance.get('/api/question-bank/my'),
      ]);
      setQuestions(comm.data || []);
      setMyQuestions(mine.data || []);
    } catch { toast.error('Failed to load questions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuestions(); }, [filterCat, filterDiff]);

  const handleAdd = async () => {
    if (!form.question.trim() || !form.category) return toast.error('Question and category are required');
    setSubmitting(true);
    try {
      await axiosInstance.post('/api/question-bank', {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      toast.success('Question added!');
      setShowAddModal(false);
      setForm({ question: '', category: 'technical', role: '', difficulty: 'medium', hint: '', tags: '' });
      fetchQuestions();
    } catch { toast.error('Failed to add question'); }
    finally { setSubmitting(false); }
  };

  const handleRate = async (id, score) => {
    try {
      await axiosInstance.put(`/api/question-bank/${id}/rate`, { score });
      fetchQuestions();
    } catch { toast.error('Failed to rate'); }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/question-bank/${id}`);
      toast.success('Deleted');
      fetchQuestions();
    } catch { toast.error('Failed to delete'); }
  };

  const displayed = (tab === 'community' ? questions : myQuestions).filter(q => {
    if (!search) return true;
    return q.question.toLowerCase().includes(search.toLowerCase()) ||
      (q.role || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Book size={24} className="text-blue-500" /> Question Bank
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Shared interview question library — rate, reuse, and build templates</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={16} /> Add Question
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[{ id: 'community', label: 'Community Templates' }, { id: 'mine', label: 'My Questions' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
          >{t.label}</button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..."
            className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-medium">
          {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-medium">
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d === 'all' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
        </select>
      </div>

      {/* Question Cards */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No questions found</p>
          <p className="text-sm">Try different filters or add the first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(q => {
            const Icon = categoryIcon[q.category] || HelpCircle;
            return (
              <div key={q._id} className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-5 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${diffColor[q.difficulty] || '#6b7280'}15`, color: diffColor[q.difficulty] || '#6b7280' }}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">{q.question}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${diffColor[q.difficulty]}15`, color: diffColor[q.difficulty] }}>
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full capitalize">{q.category}</span>
                        {q.role && <span className="text-[10px] text-gray-400">{q.role}</span>}
                        {q.tags?.slice(0, 3).map(t => (
                          <span key={t} className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                      {q.hint && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg">
                          <Lightbulb size={12} className="mt-0.5 flex-shrink-0" />
                          <span>{q.hint}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StarRating value={q.avgRating || 0} onRate={(s) => handleRate(q._id, s)} />
                    <span className="text-[10px] text-gray-400">{q.ratings?.length || 0} ratings · {q.timesUsed} uses</span>
                    {tab === 'mine' && (
                      <button onClick={() => handleDelete(q._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"><X size={18} /></button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Plus size={18} className="text-blue-500" /> Add Question</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Question *</label>
                <textarea value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  rows={3} placeholder="Enter the interview question..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                    <option value="technical">Technical</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="situational">Situational</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Difficulty</label>
                  <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Role</label>
                <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. Frontend Developer"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Hint (optional)</label>
                <input value={form.hint} onChange={e => setForm(f => ({ ...f, hint: e.target.value }))} placeholder="Hint for the interviewer..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="React, Hooks, State"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
              </div>
              <button onClick={handleAdd} disabled={submitting || !form.question.trim()}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={16} /> Add to Bank</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InterviewerQuestionBank;
