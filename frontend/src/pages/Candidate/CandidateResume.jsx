import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Plus,
    ArrowLeft,
    Sparkles,
    Download,
    Settings
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const CandidateResume = () => {
    const navigate = useNavigate();

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
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Resume Builder</h1>
                        <p className="mt-1 text-gray-500 font-medium italic">Craft a professional profile that stands out to recruiters.</p>
                    </div>
                    <button
                        className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-black transition-all shadow-md hover:shadow-lg active:scale-95 font-bold"
                    >
                        <Plus size={20} />
                        Create New Resume
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Placeholder for "Current Resume" */}
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-8 flex flex-col items-center justify-center text-center group hover:border-blue-200 transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileText size={24} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Import from PDF</h3>
                    <p className="text-xs text-gray-400 leading-relaxed px-4">Already have a resume? Import it and we'll extract your skills automatically.</p>
                </div>

                {/* AI Suggestions Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px]" />
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="text-blue-200" size={24} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">AI Powered Insights</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Your profile is 65% complete</h2>
                    <p className="text-blue-100 mb-8 max-w-md leading-relaxed">Add your latest project achievements and technical certifications to increase your profile visibility by 3x.</p>
                    <div className="flex gap-3">
                        <button className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all text-sm">
                            Optimize Profile
                        </button>
                        <button className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all text-sm border border-white/10">
                            View Samples
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-12 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-gray-900">Manage Resumes</h3>
                    <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Download size={18} /></button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Settings size={18} /></button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                <FileText size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Main_Resume_2026.pdf</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active • Last updated 12h ago</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">View</span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CandidateResume;
