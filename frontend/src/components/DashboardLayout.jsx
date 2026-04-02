import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ProfileModal from './ProfileModal';

const DashboardLayout = ({ children }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-[#0f0f0f] overflow-x-hidden">
            <Navbar 
                onProfileClick={() => setIsProfileOpen(true)} 
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <div className="flex pt-16 w-full max-w-full">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                <main className="flex-1 md:ml-64 p-3 md:p-8 min-h-[calc(100vh-64px)] overflow-x-hidden overflow-y-auto w-full max-w-full">
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
