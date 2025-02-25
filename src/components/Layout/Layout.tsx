import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar and overlay */}
      <div className={`lg:hidden ${isSidebarOpen ? 'visible' : 'invisible'} transition-all duration-500`}>
        {/* Overlay */}
        <div 
          className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-500 ease-in-out ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />
        {/* Sidebar */}
        <div 
          className={`fixed inset-y-0 right-0 w-64 z-50 transform transition-all duration-500 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile header */}
        <div className="sticky top-0 lg:hidden flex items-center justify-between p-4 bg-white border-b z-30">
          <h1 className="text-xl font-bold">Student Nest</h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;