import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { BeatLoader } from 'react-spinners';
import {
    ClipboardList,
    PlayCircle,
    CheckCircle,
    Clock,
    ArrowLeft,
    FileText,
    Search
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const CandidateApplications = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/api/interviews');
            setInterviews(res.data);
        } catch (err) {
            console.error('Error fetching applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleResume = (interviewId) => {
        navigate(`/interview-room/${interviewId}`);
    };

    const filteredApplications = interviews.filter(app =>
        app.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <div className="mb-8">
                <button
                    onClick={() => navigate('/candidate/dashboard')}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4 font-medium text-sm"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Applications</h1>
                        <p className="mt-1 text-gray-500 font-medium italic">Track the status of your technical assessments.</p>
                    </div>
                </div>
            </div>

            <div className="mb-8 relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Filter by job title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
            </div>

            {filteredApplications.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 text-center">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ClipboardList size={32} className="text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No applications found</h2>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        {searchQuery ? "No results match your filter." : "You haven't applied to any jobs yet. Browse the dashboard to find opportunities!"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredApplications.map((app) => (
                        <div key={app.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-2xl ${app.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    <FileText size={22} />
                                </div>
                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border shadow-sm ${app.status === 'completed'
                                        ? 'bg-green-50 text-green-700 border-green-100'
                                        : 'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                    {app.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                                {app.job_title}
                            </h3>

                            <div className="flex items-center gap-4 py-4 mb-6 border-b border-gray-50">
                                <div className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                    <Clock size={14} />
                                    Applied {new Date(app.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="mt-auto">
                                {app.status === 'completed' ? (
                                    <div className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gray-50 text-gray-500 text-sm font-bold border border-gray-100">
                                        <CheckCircle size={18} />
                                        Assessment Completed
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleResume(app.id)}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-100 active:scale-95"
                                    >
                                        <PlayCircle size={18} />
                                        Resume Assessment
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default CandidateApplications;
