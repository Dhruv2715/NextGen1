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
    Award,
    Download
} from 'lucide-react';
import {
    BarChart as ReBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';

const InterviewerAnalytics = () => {
    const [data, setData] = useState({
        jobs: [],
        analytics: null,
        loading: true
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    const fetchAnalyticsData = async () => {
        try {
            setData(prev => ({ ...prev, loading: true }));
            const [jobsRes, analyticsRes] = await Promise.all([
                axiosInstance.get('/api/jobs/my-jobs'),
                axiosInstance.get('/api/analytics/interviewer'),
            ]);

            setData({
                jobs: jobsRes.data,
                analytics: analyticsRes.data,
                loading: false
            });
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setData(prev => ({ ...prev, loading: false }));
        }
    };

    const calculateStats = () => {
        if (!data.analytics) return null;
        const an = data.analytics;
        const totalApplications = an.totalApplications || 0;
        const completedInterviews = an.interviews?.totalCompleted || 0;
        const activeJobs = data.jobs.filter(j => j.status === 'active').length;
        const completionRate = totalApplications > 0 ? (completedInterviews / totalApplications) * 100 : 0;
        const offerRate = an.offerRate || 0;
        const avgTime = an.avgTimeToCompleteDays || 0;

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

        // Format funnel data for Recharts
        const stagesOrder = ['Applied', 'Screened', 'Technical', 'HR', 'Offer'];
        const funnelDataMap = {};
        (an.funnel || []).forEach(f => {
             funnelDataMap[f._id || 'Unknown'] = f.count;
        });
        
        const funnelData = stagesOrder.map(stage => ({
             name: stage,
             count: funnelDataMap[stage] || 0
        }));

        return {
            totalApplications,
            completedInterviews,
            activeJobs,
            completionRate: completionRate.toFixed(1),
            offerRate,
            avgTime,
            topSkills,
            funnelData
        };
    };

    const handleExportCSV = () => {
        if (!stats) return;
        const csvRows = [];
        csvRows.push(['Stage', 'Count']);
        stats.funnelData.forEach(d => {
            csvRows.push([d.name, d.count]);
        });
        csvRows.push([]);
        csvRows.push(['Metric', 'Value']);
        csvRows.push(['Total Applications', stats.totalApplications]);
        csvRows.push(['Completed Interviews', stats.completedInterviews]);
        csvRows.push(['Completion Rate (%)', stats.completionRate]);
        csvRows.push(['Offer Rate (%)', stats.offerRate]);
        csvRows.push(['Avg Time to Complete (Days)', stats.avgTime]);

        const csvString = csvRows.map(row => row.join(',')).join('\\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hiring_analytics.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
            <div className="mb-8 flex justify-between items-end">
                <div>
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
                <button 
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
                >
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Pipeline Volume', val: stats.totalApplications, sub: 'Total applications', icon: <Users size={20} />, color: 'bg-blue-600', text: 'text-blue-600' },
                    { label: 'Time-to-hire', val: `${stats.avgTime} d`, sub: 'Avg time to complete', icon: <Target size={20} />, color: 'bg-green-600', text: 'text-green-600' },
                    { label: 'Offer Rate', val: `${stats.offerRate}%`, sub: 'Offers extended', icon: <TrendingUp size={20} />, color: 'bg-purple-600', text: 'text-purple-600' },
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

                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart data={stats.funnelData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12, fontWeight: 700}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                <Tooltip 
                                    cursor={{fill: '#F3F4F6'}} 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                    {stats.funnelData.map((entry, index) => {
                                        const colors = ['#60A5FA', '#34D399', '#A78BFA', '#FBBF24', '#F472B6'];
                                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                    })}
                                </Bar>
                            </ReBarChart>
                        </ResponsiveContainer>
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
