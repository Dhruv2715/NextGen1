import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ProfileModal from './ProfileModal';

const DashboardLayout = ({ children }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <div className="min-h-screen transition-colors duration-300">
            <Navbar onProfileClick={() => setIsProfileOpen(true)} />

            <div className="flex pt-16">
                <Sidebar />

                <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-[calc(100vh-64px)] overflow-y-auto">
                    {children}
                </main>
            </div>

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </div>
    );
};

export default DashboardLayout;
