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
    Search,
    XCircle
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const CandidateApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/api/applications/my-applications');
            setApplications(res.data);
        } catch (err) {
            console.error('Error fetching applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleResumeInterview = async (jobId) => {
        try {
            const res = await axiosInstance.post('/api/interviews', { job_id: jobId });
            navigate(`/interview-room/${res.data.id}`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to start interview.');
        }
    };

    const filteredApplications = applications.filter(app =>
        app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase())
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
                                <div className={`p-3 rounded-2xl ${app.status === 'approved' ? 'bg-green-50 text-green-600' :
                                    app.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                    <FileText size={22} />
                                </div>
                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border shadow-sm ${app.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                        app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                    {app.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                                {app.job?.title}
                            </h3>

                            <div className="space-y-3 py-4 mb-6 border-y border-gray-50 mt-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                    <Clock size={14} />
                                    Applied {new Date(app.created_at).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-500 italic line-clamp-2">
                                    "{app.bio || 'No bio provided'}"
                                </div>
                            </div>

                            <div className="mt-auto">
                                {app.status === 'approved' ? (
                                    <button
                                        onClick={() => handleResumeInterview(app.job_id)}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-100 active:scale-95"
                                    >
                                        <PlayCircle size={18} />
                                        Enter Interview Room
                                    </button>
                                ) : app.status === 'rejected' ? (
                                    <div className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100">
                                        <XCircle size={18} />
                                        Application Rejected
                                    </div>
                                ) : (
                                    <div className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gray-50 text-gray-500 text-sm font-bold border border-gray-100">
                                        <Clock size={18} />
                                        Waiting for Review
                                    </div>
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
