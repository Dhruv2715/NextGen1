import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap,
    ArrowLeft,
    Plus,
    Search,
    Trash2,
    PlayCircle,
    BookOpen,
    Brain,
    Code2,
    Server,
    Database,
    Users,
    BarChart3,
    Pin,
    Clock,
    Sparkles,
    Target,
    TrendingUp,
    Lightbulb,
    MessageSquare,
    CheckCircle2,
    X,
    ChevronRight,
    Layers,
    AlertCircle,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../constants/apiPaths';
import toast from 'react-hot-toast';
import CreateSessionForm from '../Preparation/CreateSessionForm';
import SpinnerLoader from '../Preparation/Loader/SpinnerLoader';

/* ═══════════════════════════════════════════════════════════════════════════════
   QUICK-START TOPIC DATA
   ═══════════════════════════════════════════════════════════════════════════════ */

const QUICK_START_TOPICS = [
    {
        id: 'frontend',
        title: 'Frontend',
        subtitle: 'React, JavaScript, CSS',
        icon: Code2,
        color: '#3b82f6',
        bgGradient: 'from-blue-500 to-cyan-500',
        role: 'Frontend Developer',
        topics: 'React, JavaScript, CSS, HTML, DOM, Browser APIs',
    },
    {
        id: 'backend',
        title: 'Backend',
        subtitle: 'Node.js, Express, APIs',
        icon: Server,
        color: '#10b981',
        bgGradient: 'from-emerald-500 to-teal-500',
        role: 'Backend Developer',
        topics: 'Node.js, Express, REST APIs, Authentication, Middleware',
    },
    {
        id: 'dsa',
        title: 'DSA',
        subtitle: 'Arrays, Trees, Graphs',
        icon: Brain,
        color: '#8b5cf6',
        bgGradient: 'from-violet-500 to-purple-500',
        role: 'Software Engineer',
        topics: 'Arrays, Linked Lists, Trees, Graphs, Dynamic Programming, Sorting',
    },
    {
        id: 'system-design',
        title: 'System Design',
        subtitle: 'Architecture, Scalability',
        icon: Layers,
        color: '#f59e0b',
        bgGradient: 'from-amber-500 to-orange-500',
        role: 'Senior Software Engineer',
        topics: 'System Design, Scalability, Load Balancing, Caching, Microservices, Database Design',
    },
    {
        id: 'database',
        title: 'Database',
        subtitle: 'SQL, MongoDB, Redis',
        icon: Database,
        color: '#ef4444',
        bgGradient: 'from-red-500 to-rose-500',
        role: 'Database Engineer',
        topics: 'SQL, MongoDB, Redis, Indexing, Normalization, Transactions',
    },
    {
        id: 'behavioral',
        title: 'Behavioral',
        subtitle: 'STAR Method, Leadership',
        icon: Users,
        color: '#ec4899',
        bgGradient: 'from-pink-500 to-fuchsia-500',
        role: 'Software Engineer',
        topics: 'Behavioral Questions, STAR Method, Leadership, Teamwork, Conflict Resolution',
    },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   PREPARATION TIPS
   ═══════════════════════════════════════════════════════════════════════════════ */

const TIPS = [
    {
        icon: Target,
        title: 'Practice Daily',
        description: 'Consistency beats intensity. Solve 2-3 questions daily rather than cramming.',
        color: '#3b82f6',
    },
    {
        icon: BookOpen,
        title: 'Focus on Fundamentals',
        description: 'Master core concepts before advanced topics. Strong basics = confident answers.',
        color: '#10b981',
    },
    {
        icon: MessageSquare,
        title: 'Mock with Peers',
        description: 'Practice explaining out loud. Communication matters as much as problem-solving.',
        color: '#8b5cf6',
    },
    {
        icon: TrendingUp,
        title: 'Review Mistakes',
        description: 'Track wrong answers and revisit them weekly. Mistakes are your best teachers.',
        color: '#f59e0b',
    },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

const CandidatePreparation = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    // State
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'oldest'
    const [quickStartLoading, setQuickStartLoading] = useState(null); // topic id
    const [deleteConfirm, setDeleteConfirm] = useState(null); // session id

    // Fetch sessions
    const fetchSessions = async () => {
        try {
            setIsLoading(true);
            const res = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
            setSessions(res.data || []);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    // Stats
    const totalSessions = sessions.length;
    const totalQuestions = sessions.reduce((sum, s) => sum + (s.questions?.length || 0), 0);
    const pinnedQuestions = sessions.reduce(
        (sum, s) => sum + (s.questions?.filter((q) => q.isPinned)?.length || 0),
        0
    );

    // Quick-start handler
    const handleQuickStart = async (topic) => {
        setQuickStartLoading(topic.id);
        try {
            // Generate questions via AI
            const aiRes = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTIONS, {
                role: topic.role,
                experience: '2',
                topicsToFocus: topic.topics,
                numberOfQuestions: 10,
            });

            // Backend returns { questions: [...] }
            const generatedQuestions = aiRes.data?.questions || aiRes.data || [];

            if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
                throw new Error('No questions generated from AI');
            }

            // Create session
            const res = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
                role: topic.role,
                experience: '2',
                topicsToFocus: topic.topics,
                description: `Quick-start ${topic.title} preparation session`,
                questions: generatedQuestions,
            });

            if (res.data?.session?._id) {
                toast.success(`${topic.title} session created!`);
                navigate(`/interview-prep/${res.data.session._id}`);
            } else if (res.data?._id) {
                // Some backends return session directly
                toast.success(`${topic.title} session created!`);
                navigate(`/interview-prep/${res.data._id}`);
            } else {
                throw new Error('Session ID not returned from server');
            }
        } catch (err) {
            console.error('Quick start error:', err?.response?.data || err.message);
            toast.error('Failed to create session. Please try again.');
        } finally {
            setQuickStartLoading(null);
        }
    };

    // Delete session
    const handleDeleteSession = async (sessionId) => {
        try {
            await axiosInstance.delete(API_PATHS.SESSION.DELETE(sessionId));
            toast.success('Session deleted');
            setSessions((prev) => prev.filter((s) => s._id !== sessionId));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Delete error:', err);
            toast.error('Failed to delete session');
        }
    };

    // Filter & sort sessions
    const filteredSessions = sessions
        .filter((s) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                s.role?.toLowerCase().includes(q) ||
                s.topicsToFocus?.toLowerCase().includes(q) ||
                s.description?.toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

    return (
        <DashboardLayout>
            {/* ─── Header ────────────────────────────────────────────────── */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/candidate/dashboard')}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4 font-medium text-sm"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            <Zap size={28} className="text-yellow-500" />
                            Interview Preparation
                        </h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400 font-medium text-xs sm:text-sm">
                            Practice smarter with AI-generated questions tailored to your target role.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl hover:bg-black dark:hover:bg-gray-100 transition-all shadow-md hover:shadow-lg active:scale-95 font-bold text-sm"
                    >
                        <Plus size={18} /> Create Custom Session
                    </button>
                </div>
            </div>

            {/* ─── Stats Bar ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Practice Sessions', value: totalSessions, icon: BookOpen, color: 'blue' },
                    { label: 'Questions Practiced', value: totalQuestions, icon: Brain, color: 'emerald' },
                    { label: 'Pinned Questions', value: pinnedQuestions, icon: Pin, color: 'violet' },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-all"
                    >
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 flex-shrink-0`}
                        >
                            <stat.icon size={22} />
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</div>
                            <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ─── Quick Start ───────────────────────────────────────────── */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles size={18} className="text-yellow-500" />
                            Quick Start
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">One-click sessions for popular topics</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {QUICK_START_TOPICS.map((topic) => (
                        <button
                            key={topic.id}
                            onClick={() => handleQuickStart(topic)}
                            disabled={quickStartLoading !== null}
                            className={`group relative bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-3 sm:p-4 text-left hover:shadow-lg hover:border-gray-200 dark:hover:border-white/20 transition-all active:scale-95 disabled:opacity-50 overflow-hidden`}
                        >
                            {/* Gradient overlay on hover */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${topic.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                            />
                            <div className="relative">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                                    style={{ backgroundColor: `${topic.color}15`, color: topic.color }}
                                >
                                    {quickStartLoading === topic.id ? (
                                        <SpinnerLoader size={18} />
                                    ) : (
                                        <topic.icon size={20} />
                                    )}
                                </div>
                                <div className="font-bold text-sm text-gray-900 dark:text-white">{topic.title}</div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{topic.subtitle}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── My Sessions ───────────────────────────────────────────── */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock size={18} className="text-gray-400" />
                        My Sessions
                        {totalSessions > 0 && (
                            <span className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                {totalSessions}
                            </span>
                        )}
                    </h2>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 sm:flex-none">
                            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search sessions…"
                                className="pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all w-full sm:w-52"
                            />
                        </div>
                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-semibold"
                        >
                            <option value="recent">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>

                {/* Session List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <SpinnerLoader size={30} />
                    </div>
                ) : filteredSessions.length === 0 ? (
                    // Empty state
                    <div className="bg-white dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen size={28} className="text-gray-400" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                            {searchQuery ? 'No matching sessions' : 'No practice sessions yet'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            {searchQuery
                                ? 'Try a different search term or create a new session.'
                                : 'Start your interview prep journey by creating your first practice session or try a quick start topic above.'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95"
                            >
                                <Plus size={16} /> Create Your First Session
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredSessions.map((session) => (
                            <div
                                key={session._id}
                                className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md hover:border-gray-200 dark:hover:border-white/20 transition-all group"
                            >
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                                        {session.role?.charAt(0)?.toUpperCase() || 'S'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                                            {session.role || 'Untitled Session'}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                                <BarChart3 size={10} />
                                                {session.questions?.length || 0} questions
                                            </span>
                                            {session.experience && (
                                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {session.experience} yrs exp
                                                </span>
                                            )}
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                                {new Date(session.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        {session.topicsToFocus && (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {session.topicsToFocus
                                                    .split(',')
                                                    .slice(0, 4)
                                                    .map((topic, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[9px] font-bold rounded-full"
                                                        >
                                                            {topic.trim()}
                                                        </span>
                                                    ))}
                                                {session.topicsToFocus.split(',').length > 4 && (
                                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-500 text-[9px] font-bold rounded-full">
                                                        +{session.topicsToFocus.split(',').length - 4} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {deleteConfirm === session._id ? (
                                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-xl">
                                            <span className="text-xs font-bold text-red-600 dark:text-red-400">Delete?</span>
                                            <button
                                                onClick={() => handleDeleteSession(session._id)}
                                                className="text-xs font-bold text-red-600 hover:text-red-700 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-lg transition-colors"
                                            >
                                                Yes
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="text-xs font-bold text-gray-600 hover:text-gray-700 px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-lg transition-colors"
                                            >
                                                No
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setDeleteConfirm(session._id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete session"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/interview-prep/${session._id}`)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95"
                                            >
                                                <PlayCircle size={14} /> Resume
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── Preparation Tips ──────────────────────────────────────── */}
            <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <Lightbulb size={18} className="text-yellow-500" />
                    Preparation Tips
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {TIPS.map((tip, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-5 hover:shadow-md transition-all"
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                                style={{ backgroundColor: `${tip.color}15`, color: tip.color }}
                            >
                                <tip.icon size={20} />
                            </div>
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{tip.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tip.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Create Session Modal ───────────────────────────────────── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowCreateModal(false)}
                    />
                    <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all z-10"
                        >
                            <X size={18} />
                        </button>
                        <CreateSessionForm />
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CandidatePreparation;
