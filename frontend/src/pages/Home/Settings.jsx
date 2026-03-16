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
    ChevronRight,
    Bell,
    ShieldCheck
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

    const [notificationData, setNotificationData] = useState({
        emailReminders: true,
        jobAlerts: true,
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
            });
            if (user.notificationPreferences) {
                setNotificationData({
                    emailReminders: user.notificationPreferences.emailReminders ?? true,
                    jobAlerts: user.notificationPreferences.jobAlerts ?? true,
                });
            }
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

    const handleUpdateNotifications = async (updatedPrefs) => {
        try {
            setLoading(true);
            const res = await axiosInstance.put('/api/auth/profile', { notificationPreferences: updatedPrefs });
            setUser({ ...user, notificationPreferences: res.data.notificationPreferences });
            setNotificationData(res.data.notificationPreferences);
            toast.success('Notification settings saved');
        } catch (err) {
            toast.error('Failed to update notifications');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'General Information', icon: <User size={18} /> },
        { id: 'security', label: 'Login & Security', icon: <Lock size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'danger', label: 'Account Controls', icon: <AlertCircle size={18} /> },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Account Settings</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400 font-medium">Manage your personal information, security, and account preferences</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Navigation Tabs */}
                    <div className="w-full lg:w-64 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-100 dark:hover:border-white/5'
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
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Details</h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Update your profile representation</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Full Display Name</label>
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                readOnly
                                                className="w-full px-5 py-3.5 bg-gray-100 dark:bg-white/5 border border-transparent rounded-2xl text-gray-500 dark:text-gray-400 cursor-not-allowed outline-none font-medium"
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
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-2xl">
                                            <ShieldCheck size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security & Privacy</h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Protect your account and credentials</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Current Password</label>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">New Password</label>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                                                required
                                            />
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

                            {activeTab === 'notifications' && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-2xl">
                                            <Bell size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Communication Preferences</h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Control how we contact you</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-blue-100 transition-all group">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Email Reminders</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Receive automated nudges for upcoming or pending assessments.</p>
                                            </div>
                                            <button 
                                                onClick={() => handleUpdateNotifications({ ...notificationData, emailReminders: !notificationData.emailReminders })}
                                                className={`w-14 h-8 rounded-full relative transition-colors ${notificationData.emailReminders ? 'bg-blue-600' : 'bg-gray-200 dark:bg-white/10'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${notificationData.emailReminders ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-blue-100 transition-all group">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Job Alerts</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when new jobs matching your profile are posted.</p>
                                            </div>
                                            <button 
                                                onClick={() => handleUpdateNotifications({ ...notificationData, jobAlerts: !notificationData.jobAlerts })}
                                                className={`w-14 h-8 rounded-full relative transition-colors ${notificationData.jobAlerts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-white/10'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${notificationData.jobAlerts ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'danger' && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-2xl">
                                            <Trash2 size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Controls</h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Manage your data and account status</p>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 mb-8 flex items-start gap-4">
                                        <Trash2 className="text-red-500 mt-1" size={20} />
                                        <div>
                                            <h4 className="text-red-800 dark:text-red-400 font-bold mb-1">Delete Workspace Data</h4>
                                            <p className="text-sm text-red-700/80 dark:text-red-400/60 leading-relaxed">
                                                Deleting your account is irreversible. All of your job listings, interview recordings,
                                                and AI evaluations will be permanently purged from our database.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex justify-start">
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={loading}
                                            className="group flex items-center gap-3 bg-white dark:bg-white/5 text-red-600 border-2 border-red-100 dark:border-red-900/20 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95 disabled:opacity-50"
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
