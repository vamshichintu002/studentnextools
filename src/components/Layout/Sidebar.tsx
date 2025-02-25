import React from 'react';
import { Menu, Home, FileText, Linkedin, Github, BookOpen, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Project DOC Maker', icon: FileText, path: '/doc-maker' },
    { name: 'LinkedIn Analyzer', icon: Linkedin, path: '/linkedin-analyzer' },
    { name: 'LinkedIn Summary', icon: Linkedin, path: '/linkedin-summary' },
    { name: 'GitHub Profile', icon: Github, path: '/github-profile' },
    { name: 'Notes Writer', icon: BookOpen, path: '/notes-writer' },
  ];

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="flex items-center justify-between gap-2 p-4">
        <div className="flex items-center gap-2">
          <Menu className="w-6 h-6" />
          <h1 className="text-xl font-bold">Student Nest</h1>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center gap-3 px-2 py-3 rounded-lg mb-1 transition-colors ${
              location.pathname === item.path
                ? 'bg-gray-100 text-black'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;