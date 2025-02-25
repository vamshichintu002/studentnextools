import React from 'react';
import { Menu, Home, FileText, Linkedin, Github, BookOpen, X, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import ProfileMenu from '../ui/ProfileMenu';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, setIsLoginModalOpen, setPendingPath, pendingPath } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Project DOC Maker', icon: FileText, path: '/doc-maker' },
    { name: 'LinkedIn Analyzer', icon: Linkedin, path: '/linkedin-analyzer' },
    { name: 'LinkedIn Summary', icon: Linkedin, path: '/linkedin-summary' },
    { name: 'GitHub Profile', icon: Github, path: '/github-profile' },
    { name: 'Notes Writer', icon: BookOpen, path: '/notes-writer' },
  ];

  const handleNavClick = (path: string) => {
    if (!user && path !== '/') {
      setIsLoginModalOpen(true);
      setPendingPath(path);
    } else {
      navigate(path);
      onClose?.();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white border-l border-gray-200">
        <div className="flex items-center justify-between gap-2 p-8">
          <div className="flex items-center justify-center flex-1">
            <img src="/assets/STUDENTNESTLOGO.png" alt="Student Nest" className="h-16 w-auto" />
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="px-4 space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
            {user && (
              <li>
                <button
                  onClick={() => handleNavClick('/profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/profile'
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>
              </li>
            )}
          </ul>
        </nav>

        {user && (
          <div className="p-4 border-t">
            <div className="px-4 py-2">
              <div className="text-sm font-medium">{user.email}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;