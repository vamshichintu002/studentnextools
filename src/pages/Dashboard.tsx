import React from 'react';
import { FileText, Linkedin, Github, BookOpen } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

const Dashboard = () => {
  const tools = [
    {
      title: 'Project DOC Maker',
      description: 'Create professional project documentation easily',
      icon: FileText,
      path: '/doc-maker',
    },
    {
      title: 'LinkedIn Profile Analyzer',
      description: 'Get insights from your LinkedIn profile',
      icon: Linkedin,
      path: '/linkedin-analyzer',
    },
    {
      title: 'LinkedIn Summary Generator',
      description: 'Generate compelling LinkedIn summaries',
      icon: Linkedin,
      path: '/linkedin-summary',
    },
    {
      title: 'GitHub Profile Maker',
      description: 'Create an impressive GitHub profile',
      icon: Github,
      path: '/github-profile',
    },
    {
      title: 'Notes Writer',
      description: 'Organize your study notes efficiently',
      icon: BookOpen,
      path: '/notes-writer',
    },
  ];

  return (
    <div className="p-3">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Welcome to Student Nest</h1>
      <p className="text-gray-600 mb-3">Select a tool to get started</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {tools.map((tool) => (
          <DashboardCard key={tool.path} {...tool} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;