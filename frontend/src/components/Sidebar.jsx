import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import {
    LayoutDashboard,
    Briefcase,
    UserCircle,
    Settings,
    BarChart3,
    ClipboardList,
    FileText,
    Plus,
    Zap,
    HelpCircle,
    ShieldCheck,
    PlayCircle,
    TrendingUp,
    Book,
    GitCompare,
    CalendarDays,
    MapPin
} from 'lucide-react';


const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    if (!user) return null;

    const interviewerLinks = [
        { title: 'Dashboard', path: '/interviewer/dashboard', icon: <LayoutDashboard size={18} /> },
        { title: 'My Jobs', path: '/interviewer/jobs', icon: <Briefcase size={18} /> },
        { title: 'Question Bank', path: '/interviewer/question-bank', icon: <Book size={18} />, isNew: true },
        { title: 'Comparison', path: '/interviewer/comparison', icon: <GitCompare size={18} />, isNew: true },
        { title: 'Locations Map', path: '/interviewer/map', icon: <MapPin size={18} />, isNew: true },
        { title: 'Analytics', path: '/interviewer/analytics', icon: <BarChart3 size={18} /> },
        { title: 'Availability', path: '/interviewer/availability', icon: <CalendarDays size={18} />, isNew: true },
        { title: 'Settings', path: '/settings', icon: <Settings size={18} /> },
    ];

    const candidateLinks = [
        { title: 'Find Jobs', path: '/candidate/dashboard', icon: <Briefcase size={18} /> },
        { title: 'Applications', path: '/candidate/applications', icon: <ClipboardList size={18} /> },
        { title: 'Practice Mode', path: '/candidate/mock-interview', icon: <PlayCircle size={18} />, isNew: true },
        { title: 'Resume Builder', path: '/candidate/resume', icon: <FileText size={18} />, isNew: true },
        { title: 'Skill Gap', path: '/candidate/skill-gap', icon: <TrendingUp size={18} />, isNew: true },
        { title: 'Locations Map', path: '/candidate/map', icon: <MapPin size={18} />, isNew: true },
        { title: 'Analytics', path: '/candidate/analytics', icon: <BarChart3 size={18} />, isNew: true },
        { title: 'Preparation', path: '/candidate/preparation', icon: <Zap size={18} /> },
        { title: 'Settings', path: '/settings', icon: <Settings size={18} /> },
    ];

    const links = user.role === 'interviewer' ? interviewerLinks : candidateLinks;

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`w-64 bg-white dark:bg-[#030303] border-r border-gray-200 dark:border-white/10 h-[calc(100vh-64px)] fixed left-0 top-16 flex flex-col transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}`}>
                <div className="flex-1 py-6 px-4 overflow-y-auto custom-scrollbar">

                    {/* Quick Actions Section */}
                    <div className="mb-8">
                        <p className="px-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">Quick Actions</p>
                        <button
                            onClick={() => {
                                navigate(user.role === 'interviewer' ? '/interviewer/jobs' : '/candidate/dashboard');
                                onClose && onClose();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 group"
                        >
                        <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                            <Plus size={16} strokeWidth={3} />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-tight">
                            {user.role === 'interviewer' ? 'Post New Job' : 'Explore Jobs'}
                        </span>
                    </button>
                </div>

                {/* Main Navigation */}
                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">Navigation</p>
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={() => onClose && onClose()}
                            className={({ isActive }) =>
                                `flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition-all group ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                }`
                            }
                        >
                            <div className="flex items-center gap-3">
                                <span className="transition-transform group-hover:scale-110 duration-200">{link.icon}</span>
                                {link.title}
                            </div>
                            {link.isNew && (
                                <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md animate-pulse">NEW</span>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* Support Section */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                    <p className="px-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">Support</p>
                    <NavLink
                        to="/support"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${isActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                            }`
                        }
                    >
                        <HelpCircle size={18} />
                        Help Center
                    </NavLink>
                </div>
            </div>

            {/* User Profile Card */}
            <div className="p-4 border-t border-gray-200 dark:border-white/10">
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck size={48} className="text-blue-600" />
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-inner overflow-hidden">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#0f0f0f] rounded-full"></div>
                        </div>
                        <div className="overflow-hidden">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                <p className="text-sm font-black text-gray-900 dark:text-white truncate">{user.name}</p>
                                <div className="bg-blue-600 text-[8px] text-white px-1 py-0.5 rounded font-black tracking-tighter uppercase">PRO</div>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tight truncate">{user.role}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg justify-center uppercase tracking-widest">
                        <ShieldCheck size={12} />
                        Verified Account
                    </div>
                </div>
            </div>
        </aside>
        </>
    );
};

export default Sidebar;
