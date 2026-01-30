import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import DashboardLayout from '../../components/DashboardLayout';
import {
    User,
    Lock,
    Trash2,
    Save,
    AlertCircle,
    CheckCircle2,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user, setUser, clearUser } = useContext(UserContext);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    // Profile Form State
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
    });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axiosInstance.put('/api/auth/profile', { name: profileData.name });
            setUser({ ...user, ...res.data });
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (passwordData.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        try {
            setLoading(true);
            await axiosInstance.put('/api/auth/profile', { password: passwordData.newPassword });
            setPasswordData({ newPassword: '', confirmPassword: '' });
            toast.success('Password changed successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('WARNING: THIS IS PERMANENT. Are you sure you want to delete your account? All your data will be cleared.')) {
            return;
        }

        try {
            setLoading(true);
            await axiosInstance.delete('/api/auth/profile');
            toast.success('Account deleted. We\'re sorry to see you go.');
            clearUser();
            window.location.href = '/';
        } catch (err) {
            toast.error('Failed to delete account');
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'General Information', icon: <User size={18} /> },
        { id: 'security', label: 'Login & Security', icon: <Lock size={18} /> },
        { id: 'danger', label: 'Account Controls', icon: <AlertCircle size={18} /> },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
                    <p className="mt-1 text-gray-500">Manage your personal information, security, and account preferences</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Navigation Tabs */}
                    <div className="w-full lg:w-64 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'text-gray-600 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {tab.icon}
                                    {tab.label}
                                </div>
                                <ChevronRight size={16} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 min-h-[400px]">

                            {activeTab === 'profile' && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 font-bold text-2xl">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
                                            <p className="text-sm text-gray-500 font-medium">Update your profile representation</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Full Display Name</label>
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                readOnly
                                                className="w-full px-5 py-3.5 bg-gray-100 border border-transparent rounded-2xl text-gray-500 cursor-not-allowed outline-none font-medium"
                                            />
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider ml-1">Email cannot be changed manually for security</p>
                                        </div>

                                        <div className="pt-4 border-t border-gray-50 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
                                            >
                                                <Save size={18} />
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center gap-4 mb-8 text-indigo-600">
                                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center font-bold text-2xl">
                                            <Lock size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Password & Access</h2>
                                            <p className="text-sm text-gray-400 font-medium">Keep your account secure from unauthorized access</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                                required
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-gray-50 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
                                            >
                                                <Lock size={18} />
                                                Update Password
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'danger' && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center gap-4 mb-8 text-red-600">
                                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center font-bold text-2xl">
                                            <AlertCircle size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Advanced Controls</h2>
                                            <p className="text-sm text-red-400 font-medium">Higher-impact actions for your account</p>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100 mb-8 flex items-start gap-4">
                                        <Trash2 className="text-red-500 mt-1" size={20} />
                                        <div>
                                            <h4 className="text-red-800 font-bold mb-1">Delete Workspace Data</h4>
                                            <p className="text-sm text-red-700/80 leading-relaxed">
                                                Deleting your account is irreversible. All of your job listings, interview recordings,
                                                and AI evaluations will be permanently purged from our database.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 flex justify-start">
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={loading}
                                            className="group flex items-center gap-3 bg-white text-red-600 border-2 border-red-100 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            <Trash2 size={18} className="transition-transform group-hover:rotate-12" />
                                            Permanently Delete Account
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
