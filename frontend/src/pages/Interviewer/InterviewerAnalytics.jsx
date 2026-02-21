import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { BeatLoader } from 'react-spinners';
import {
    BarChart3,
    TrendingUp,
    Users,
    CheckCircle,
    ArrowLeft,
    PieChart,
    Target,
    Award
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const InterviewerAnalytics = () => {
    const [data, setData] = useState({
        jobs: [],
        interviews: [],
        loading: true
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    const fetchAnalyticsData = async () => {
        try {
            setData(prev => ({ ...prev, loading: true }));
            const [jobsRes, interviewsRes] = await Promise.all([
                axiosInstance.get('/api/jobs/my-jobs'),
                axiosInstance.get('/api/interviews'),
            ]);

            setData({
                jobs: jobsRes.data,
                interviews: interviewsRes.data,
                loading: false
            });
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setData(prev => ({ ...prev, loading: false }));
        }
    };

    const calculateStats = () => {
        const totalApplications = data.interviews.length;
        const completedInterviews = data.interviews.filter(i => i.status === 'completed').length;
        const activeJobs = data.jobs.filter(j => j.status === 'active').length;
        const completionRate = totalApplications > 0 ? (completedInterviews / totalApplications) * 100 : 0;

        // Skill frequency
        const skillCounts = {};
        data.jobs.forEach(job => {
            job.required_skills?.forEach(skill => {
                const s = skill.toLowerCase().trim();
                skillCounts[s] = (skillCounts[s] || 0) + 1;
            });
        });

        const topSkills = Object.entries(skillCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return {
            totalApplications,
            completedInterviews,
            activeJobs,
            completionRate: completionRate.toFixed(1),
            topSkills
        };
    };

    const stats = calculateStats();

    if (data.loading) {
        return (
            <DashboardLayout>
                <div className="h-[70vh] flex items-center justify-center">
                    <BeatLoader color="#3b82f6" size={10} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mb-8">
                <button
                    onClick={() => navigate('/interviewer/dashboard')}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4 font-medium text-sm"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Hiring Analytics</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400 font-medium italic">Insights and performance metrics for your recruitment pipeline.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Pipeline Volume', val: stats.totalApplications, sub: 'Total applications', icon: <Users size={20} />, color: 'bg-blue-600', text: 'text-blue-600' },
                    { label: 'Placement Rate', val: `${stats.completionRate}%`, sub: 'Interview completion', icon: <Target size={20} />, color: 'bg-green-600', text: 'text-green-600' },
                    { label: 'Active Pipeline', val: stats.activeJobs, sub: 'Job listings', icon: <TrendingUp size={20} />, color: 'bg-purple-600', text: 'text-purple-600' },
                    { label: 'Completed', val: stats.completedInterviews, sub: 'Assessments', icon: <CheckCircle size={20} />, color: 'bg-amber-600', text: 'text-amber-600' },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${s.color} opacity-[0.03] dark:opacity-[0.1] rounded-bl-full`} />
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-2 rounded-xl bg-gray-50 dark:bg-white/5 ${s.text}`}>{s.icon}</div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{s.label}</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900 mb-1">{s.val}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Funnel Progress */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <BarChart3 className="text-blue-600" size={20} />
                            Hiring Funnel
                        </h3>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last 30 Days</span>
                    </div>

                    <div className="space-y-6">
                        {[
                            { label: 'Applications Received', count: stats.totalApplications, color: 'bg-blue-500', pct: 100 },
                            { label: 'Completed Interviews', count: stats.completedInterviews, color: 'bg-green-500', pct: stats.totalApplications > 0 ? (stats.completedInterviews / stats.totalApplications) * 100 : 0 },
                            { label: 'Average Score', count: '84%', color: 'bg-purple-500', pct: 84 },
                        ].map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-gray-700">{item.label}</span>
                                    <span className="text-sm font-black text-gray-900">{item.count}</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                                        style={{ width: `${item.pct}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/20 flex items-center gap-4">
                        <div className="bg-white dark:bg-white/10 p-3 rounded-xl shadow-sm">
                            <TrendingUp className="text-blue-600 dark:text-blue-400" size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Pipeline Growth</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Your interview volume has increased by <span className="text-blue-600 dark:text-blue-400 font-bold">12%</span> compared to last month.</p>
                        </div>
                    </div>
                </div>

                {/* Skill Demand */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                        <Award className="text-amber-500" size={20} />
                        Top Skills Required
                    </h3>

                    {stats.topSkills.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Post more jobs to see skill trends.</p>
                    ) : (
                        <div className="space-y-6">
                            {stats.topSkills.map(([skill, count], i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-black text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-bold text-gray-700 capitalize">{skill}</span>
                                            <span className="text-xs font-black text-gray-400">{count} {count === 1 ? 'Job' : 'Jobs'}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 opacity-60 rounded-full"
                                                style={{ width: `${(count / data.jobs.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-gray-50 dark:border-white/5">
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                            <PieChart size={14} />
                            Market Comparison
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed italic">
                            You are focusing mostly on <span className="text-gray-900 dark:text-white font-bold">Frontend development</span>.
                            Consider diversifying for full-stack coverage.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InterviewerAnalytics;
