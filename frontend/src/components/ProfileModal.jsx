import React, { useContext } from 'react';
import { UserContext } from '../context/userContext';
import { X, Mail, Shield, Calendar, User } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose }) => {
    const { user } = useContext(UserContext);

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                            {user.profileImageUrl && user.profileImageUrl.startsWith('http') ? (
                                <img
                                    src={user.profileImageUrl}
                                    alt={user.name}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl rounded-xl">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-16 pb-8 px-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                        <p className="text-blue-600 font-medium capitalize">{user.role}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email Address</p>
                                <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm">
                                <Shield size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Account Role</p>
                                <p className="text-sm font-semibold text-gray-900 capitalize">{user.role}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Member Since</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Jan 2026'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full mt-8 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-colors"
                    >
                        Close Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
