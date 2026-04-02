import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import { Home, LogOut, Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ onProfileClick, onToggleSidebar }) => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUser();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-[#030303] border-b border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 shadow-sm fixed top-0 w-full z-50 h-16 transition-colors">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center gap-3 sm:gap-6">
            <button 
                onClick={onToggleSidebar}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors"
                aria-label="Toggle Sidebar"
            >
                <Menu size={24} />
            </button>
            <Link to={user.role === 'interviewer' ? '/interviewer/dashboard' : '/candidate/dashboard'} className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white group-hover:bg-blue-700 transition-colors">
                <Home size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">NextGen</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div
              onClick={onProfileClick}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded-xl transition-all duration-200 active:scale-95 group"
            >
              <div className="relative">
                {user.profileImageUrl && user.profileImageUrl.startsWith('http') ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.name}
                    className="w-9 h-9 rounded-full border border-gray-100 shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight group-hover:text-blue-600 transition-colors">{user.name || 'User'}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold font-display">{user.role}</p>
              </div>
            </div>

            <ThemeToggle />

            <div className="w-px h-8 bg-gray-200" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 active:scale-95"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
