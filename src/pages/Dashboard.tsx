import React from 'react';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../lib/AuthContext';
import { 
  FileText, 
  Linkedin, 
  MessageSquare, 
  Github, 
  BookOpen,
  Globe,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const tools = [
    {
      title: 'Project DOC Writer',
      description: 'Create professional project documentation easily',
      path: '/doc-maker',
      icon: FileText,
    },
    {
      title: 'LinkedIn Profile Analyzer',
      description: 'Get insights from your LinkedIn profile',
      path: '/linkedin-analyzer',
      icon: Linkedin,
    },
    {
      title: 'LinkedIn Summary Generator',
      description: 'Generate compelling LinkedIn summaries',
      path: '/linkedin-summary',
      icon: MessageSquare,
    },
    {
      title: 'GitHub Profile Maker',
      description: 'Create an impressive GitHub profile',
      path: '/github-profile',
      icon: Github,
    },
    {
      title: 'Notes Writer',
      description: 'Organize your study notes efficiently',
      path: '/notes-writer',
      icon: BookOpen,
    },
    {
      title: 'Website GPT',
      description: 'Ask questions about any website using AI',
      path: '/website-gpt',
      icon: Globe,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Welcome to StudentNest</h1>
      
      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <DashboardCard
            key={tool.path}
            title={tool.title}
            description={tool.description}
            path={tool.path}
            icon={tool.icon}
            requiresAuth={tool.path !== '/'}
          />
        ))}
      </div>

      {/* Tutorial Video Section */}
      <div className="mt-12 p-6 bg-white rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">How to Get Started with Student Nest</h2>
        <p className="text-gray-600 mb-6">
          Watch this quick tutorial to learn how to get your Gemini API key and start using our AI-powered tools.
        </p>
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/BZ5Tfq8jBMw"
            title="How to Get Gemini API Key Tutorial"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;