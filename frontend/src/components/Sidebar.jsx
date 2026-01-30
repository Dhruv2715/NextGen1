import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import {
    LayoutDashboard,
    Briefcase,
    UserCircle,
    Settings,
    BarChart3,
    ClipboardList,
    FileText
} from 'lucide-react';

const Sidebar = () => {
    const { user } = useContext(UserContext);

    if (!user) return null;

    const interviewerLinks = [
        { title: 'Dashboard', path: '/interviewer/dashboard', icon: <LayoutDashboard size={20} /> },
        { title: 'My Jobs', path: '/interviewer/jobs', icon: <Briefcase size={20} /> },
        { title: 'Analytics', path: '/interviewer/analytics', icon: <BarChart3 size={20} /> },
        { title: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    ];

    const candidateLinks = [
        { title: 'Find Jobs', path: '/candidate/dashboard', icon: <Briefcase size={20} /> },
        { title: 'Applications', path: '/candidate/applications', icon: <ClipboardList size={20} /> },
        { title: 'Resume Builder', path: '/candidate/resume', icon: <FileText size={20} /> },
        { title: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    ];

    const links = user.role === 'interviewer' ? interviewerLinks : candidateLinks;

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-64px)] fixed left-0 top-16 hidden md:flex flex-col">
            <div className="flex-1 py-6 px-4">
                <nav className="space-y-1">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            {link.icon}
                            {link.title}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">My Profile</p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
