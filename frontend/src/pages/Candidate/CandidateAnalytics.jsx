import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { BeatLoader } from 'react-spinners';
import {
    TrendingUp,
    LineChart as ChartIcon,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    Award,
    Clock,
    Filter,
    ArrowLeft,
    Layers
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';

const CandidateAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/api/analytics/candidate');
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
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

    // Process data for charts
    const chartData = stats?.scoresTrend?.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: item.score,
        job: item.jobTitle
    })) || [];

    const latestScore = chartData.length > 0 ? chartData[chartData.length - 1].score : 0;
    const prevScore = chartData.length > 1 ? chartData[chartData.length - 2].score : 0;
    const scoreDiff = latestScore - prevScore;

    const funnelStages = [
        { label: 'Applied', key: 'Applied', color: 'bg-gray-400' },
        { label: 'Screened', key: 'Screened', color: 'bg-blue-400' },
        { label: 'Technical', key: 'Technical', color: 'bg-purple-400' },
        { label: 'HR', key: 'HR', color: 'bg-amber-400' },
        { label: 'Offer', key: 'Offer', color: 'bg-green-500' }
    ];

    const getStageCount = (key) => {
        const stage = stats?.funnel?.find(f => f._id === key);
        return stage ? stage.count : 0;
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8 pb-10">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/candidate/dashboard')}
                            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4 font-medium text-sm"
                        >
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <TrendingUp className="text-blue-600" />
                            Performance Analytics
                        </h1>
                        <p className="mt-1 text-gray-500 font-medium italic">Track your growth and recruitment funnel progress.</p>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Latest Score</p>
                        <div className="flex items-end gap-3">
                            <p className="text-5xl font-black text-blue-600">{latestScore}<span className="text-xl text-blue-300">/10</span></p>
                            {scoreDiff !== 0 && (
                                <div className={`flex items-center gap-1 text-sm font-bold mb-1.5 ${scoreDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {scoreDiff > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                    {Math.abs(scoreDiff)}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Total Applications</p>
                        <p className="text-5xl font-black text-green-600">{stats?.applications?.length || 0}</p>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Interviews Completed</p>
                        <p className="text-5xl font-black text-purple-600">{stats?.scoresTrend?.length || 0}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Trend Chart */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <ChartIcon className="text-blue-500" size={20} />
                                    Performance Trend
                                </h3>
                                <p className="text-xs text-gray-400 font-medium">Your technical interview scores over time</p>
                            </div>
                        </div>
                        
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        domain={[0, 10]} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                                        dx={-10}
                                    />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                        cursor={{stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5'}}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="score" 
                                        stroke="#3b82f6" 
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#colorScore)" 
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Funnel View */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                        <div className="mb-10">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Layers className="text-indigo-500" size={20} />
                                Recruitment Funnel
                            </h3>
                            <p className="text-xs text-gray-400 font-medium">Current candidate placement across all applications</p>
                        </div>
                        
                        <div className="space-y-6">
                            {funnelStages.map((stage, idx) => {
                                const count = getStageCount(stage.key);
                                const total = stats?.applications?.length || 1;
                                const width = (count / total) * 100;

                                return (
                                    <div key={stage.key} className="relative">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-black uppercase tracking-widest text-gray-500">{stage.label}</span>
                                            <span className="text-sm font-black text-gray-900">{count}</span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                            <div 
                                                className={`h-full ${stage.color} rounded-full transition-all duration-1000 ease-out`}
                                                style={{ width: `${Math.max(width, 2)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                            <div className="flex items-start gap-3">
                                <Award className="text-blue-600 mt-0.5" size={20} />
                                <div>
                                    <h4 className="text-sm font-bold text-blue-900">Conversion Insight</h4>
                                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                        You have successfully reached the <strong>{funnelStages[funnelStages.length - 1].label}</strong> stage for <strong>{getStageCount('Offer')}</strong> applications. Keep monitoring your performance trend to identify areas for improvement.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance History Table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-gray-50">
                        <h3 className="text-lg font-bold text-gray-900">Detailed Interview History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Role</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Score</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats?.scoresTrend?.slice().reverse().map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-4 text-sm font-medium text-gray-600">
                                            {new Date(item.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-sm font-bold text-gray-900">{item.jobTitle}</span>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-black border ${
                                                item.score >= 8 ? 'bg-green-50 text-green-700 border-green-200' :
                                                item.score >= 5 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                                {item.score}/10
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <button 
                                                onClick={() => navigate(`/candidate/dashboard`)} 
                                                className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!stats?.scoresTrend || stats.scoresTrend.length === 0) && (
                            <div className="p-20 text-center">
                                <Clock size={40} className="text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-medium italic">No interview data available yet. Complete your first technical assessment!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CandidateAnalytics;
