import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { BeatLoader } from 'react-spinners';
import {
    Plus,
    Trash2,
    Briefcase,
    Search,
    Users,
    CheckCircle,
    XCircle,
    Edit,
    ArrowLeft,
    FileText
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const InterviewerJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newJob, setNewJob] = useState({
        title: '',
        description: '',
        required_skills: '',
    });
    const [editingJob, setEditingJob] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const navigate = useNavigate();

    const [applicants, setApplicants] = useState([]);
    const [viewingApplicantsJob, setViewingApplicantsJob] = useState(null);
    const [updatingAppId, setUpdatingAppId] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/api/jobs/my-jobs');
            setJobs(res.data);
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicants = async () => {
        try {
            const res = await axiosInstance.get('/api/applications/interviewer');
            setApplicants(res.data);
        } catch (err) {
            console.error('Error fetching applicants:', err);
        }
    };

    const handleUpdateStatus = async (appId, status) => {
        try {
            setUpdatingAppId(appId);
            await axiosInstance.put(`/api/applications/${appId}/status`, { status });
            await fetchApplicants();
            alert(`Application ${status} successfully!`);
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setUpdatingAppId(null);
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            const skills = newJob.required_skills
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            await axiosInstance.post('/api/jobs', {
                title: newJob.title,
                description: newJob.description,
                required_skills: skills,
            });

            setShowCreateForm(false);
            setNewJob({ title: '', description: '', required_skills: '' });
            fetchJobs();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create job');
        }
    };

    const handleUpdateJob = async (e) => {
        e.preventDefault();
        try {
            const skills = editingJob.required_skills_str
                ? editingJob.required_skills_str.split(',').map(s => s.trim()).filter(s => s.length > 0)
                : editingJob.required_skills;

            await axiosInstance.put(`/api/jobs/${editingJob.id}`, {
                title: editingJob.title,
                description: editingJob.description,
                required_skills: skills,
                status: editingJob.status
            });

            setEditingJob(null);
            fetchJobs();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update job');
        }
    };

    const handleToggleStatus = async (job) => {
        try {
            const newStatus = job.status === 'active' ? 'inactive' : 'active';
            await axiosInstance.put(`/api/jobs/${job.id}`, {
                status: newStatus
            });
            fetchJobs();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            await axiosInstance.delete(`/api/jobs/${jobId}`);
            fetchJobs();
        } catch (err) {
            alert('Failed to delete job');
        }
    };

    const handleEditClick = (job) => {
        setEditingJob({
            ...job,
            required_skills_str: job.required_skills.join(', ')
        });
        setShowCreateForm(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.required_skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

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
            {/* Applicant Review Modal */}
            {viewingApplicantsJob && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-200">
                        <div className="p-8 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Applicants: {viewingApplicantsJob.title}</h2>
                                <p className="text-blue-300 text-sm mt-1 tracking-wide font-medium">Review and manage candidate assessments</p>
                            </div>
                            <button
                                onClick={() => setViewingApplicantsJob(null)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gray-50/50">
                            {applicants.filter(a => (a.job_id?._id || a.job_id) === viewingApplicantsJob.id).length === 0 ? (
                                <div className="py-20 text-center">
                                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-bold">No applications yet for this position.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {applicants.filter(a => (a.job_id?._id || a.job_id) === viewingApplicantsJob.id).map(app => (
                                        <div key={app.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-blue-200 transition-all">
                                            <div className="flex gap-4 items-start flex-1">
                                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg">
                                                    {app.candidate?.name?.[0] || 'C'}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-gray-900 truncate">{app.candidate?.name}</h4>
                                                    <p className="text-xs text-gray-400 font-medium mb-2">{app.candidate?.email}</p>
                                                    <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 border border-gray-100 italic">
                                                        "{app.bio || 'No bio provided.'}"
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-2 md:mt-0">
                                                <a
                                                    href={app.resume_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg"
                                                >
                                                    <FileText size={14} /> View Resume
                                                </a>

                                                {app.status === 'pending' ? (
                                                    <div className="flex gap-2 w-full">
                                                        <button
                                                            disabled={updatingAppId === app.id}
                                                            onClick={() => handleUpdateStatus(app.id, 'approved')}
                                                            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            disabled={updatingAppId === app.id}
                                                            onClick={() => handleUpdateStatus(app.id, 'rejected')}
                                                            className="flex-1 py-2 px-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 hover:bg-red-100 transition-all active:scale-95"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border ${app.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/interviewer/dashboard')}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4 font-medium text-sm"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Job Listings</h1>
                        <p className="mt-1 text-gray-500 font-medium">Create and manage your technical job postings</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowCreateForm(!showCreateForm);
                            setEditingJob(null);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95 font-bold"
                    >
                        <Plus size={20} />
                        Post New Job
                    </button>
                </div>
            </div>

            <div className="mb-8 flex flex-col sm:flex-row items-stretch gap-4">
                <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by job title or skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm font-medium text-gray-600"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                </select>
            </div>

            {(showCreateForm || editingJob) && (
                <div className="mb-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in slide-in-from-top duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            {editingJob ? 'Update Job Posting' : 'Create New Job Posting'}
                        </h2>
                        <button
                            onClick={() => { setShowCreateForm(false); setEditingJob(null); }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <XCircle size={20} className="text-gray-400" />
                        </button>
                    </div>
                    <form onSubmit={editingJob ? handleUpdateJob : handleCreateJob} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Job Title</label>
                                <input
                                    type="text"
                                    required
                                    value={editingJob ? editingJob.title : newJob.title}
                                    onChange={(e) => editingJob
                                        ? setEditingJob({ ...editingJob, title: e.target.value })
                                        : setNewJob({ ...newJob, title: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                    placeholder="e.g. Senior Frontend Engineer"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Required Skills (comma separated)</label>
                                <input
                                    type="text"
                                    value={editingJob ? editingJob.required_skills_str : newJob.required_skills}
                                    onChange={(e) => editingJob
                                        ? setEditingJob({ ...editingJob, required_skills_str: e.target.value })
                                        : setNewJob({ ...newJob, required_skills: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                    placeholder="React, Tailwind, Node.js"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Job Description</label>
                            <textarea
                                required
                                value={editingJob ? editingJob.description : newJob.description}
                                onChange={(e) => editingJob
                                    ? setEditingJob({ ...editingJob, description: e.target.value })
                                    : setNewJob({ ...newJob, description: e.target.value })
                                }
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none min-h-[120px]"
                                placeholder="Describe the role and key requirements..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => { setShowCreateForm(false); setEditingJob(null); }}
                                className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md font-bold"
                            >
                                {editingJob ? 'Save Changes' : 'Publish Job'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {filteredJobs.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase size={32} className="text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h2>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        {searchQuery ? "No listings match your current search criteria." : "You haven't posted any jobs yet. Start by posting your first job listing!"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => (
                        <div key={job.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full overflow-hidden relative">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-2xl transition-colors ${job.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        <Briefcase size={22} />
                                    </div>
                                    <button
                                        onClick={() => handleToggleStatus(job)}
                                        className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg transition-all border ${job.status === 'active'
                                            ? 'bg-green-50 text-green-700 border-green-100'
                                            : 'bg-gray-50 text-gray-500 border-gray-200'
                                            }`}
                                    >
                                        {job.status}
                                    </button>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEditClick(job)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                        title="Edit Job"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteJob(job.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        title="Delete Job"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3
                                onClick={async () => {
                                    await fetchApplicants();
                                    setViewingApplicantsJob(job);
                                }}
                                className="text-xl font-bold text-gray-900 mb-2 truncate hover:text-blue-600 transition-colors cursor-pointer"
                                title="Click to review applicants"
                            >
                                {job.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed flex-grow">
                                {job.description}
                            </p>

                            <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                                <button
                                    onClick={async () => {
                                        await fetchApplicants();
                                        setViewingApplicantsJob(job);
                                    }}
                                    className="flex flex-col hover:opacity-70 transition-opacity text-left"
                                >
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Applicants</span>
                                    <div className="flex items-center gap-2 pt-1 font-bold">
                                        <span className="text-blue-700 font-black text-xl leading-none">{job.applicant_count || 0}</span>
                                        <Users size={16} className="text-blue-300" />
                                        <span className="text-[9px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded ml-1">Review</span>
                                    </div>
                                </button>
                                <div className="w-px h-10 bg-gray-200" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Posted On</span>
                                    <span className="text-gray-900 font-bold text-sm pt-1">
                                        {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {job.required_skills?.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-white text-gray-600 text-[10px] font-black uppercase rounded-lg border border-gray-200 shadow-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <button
                                onClick={async () => {
                                    await fetchApplicants();
                                    setViewingApplicantsJob(job);
                                }}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Users size={18} />
                                Review Applicants
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default InterviewerJobs;
