import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu as MenuIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 flex items-center justify-between p-4 bg-white border-b border-gray-200 z-10">
        <h1 className="text-xl font-bold">Student Nest</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-white transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto border-r border-gray-200
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64
        `}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <main className={`
        flex-1 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'ml-64' : 'ml-0'}
        mt-[64px] lg:mt-0 lg:ml-0
      `}>
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;