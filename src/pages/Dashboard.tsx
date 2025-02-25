import React, { useState } from 'react';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../lib/AuthContext';
import { useApiKey } from '../lib/ApiKeyContext';
import { saveApiKey } from '../lib/apiKeyService';
import { 
  FileText, 
  Linkedin, 
  MessageSquare, 
  Github, 
  BookOpen,
  Edit2,
  Check,
  X
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { geminiKey, setGeminiKey } = useApiKey();
  const [apiKey, setApiKey] = useState(geminiKey || '');
  const [isSaving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSaveApiKey = async () => {
    if (!user) return;
    
    setSaving(true);
    setSaveMessage(null);
    
    try {
      const success = await saveApiKey(user.uid, apiKey);
      if (success) {
        setGeminiKey(apiKey);
        setIsEditing(false);
        setSaveMessage({ type: 'success', text: 'API key saved successfully!' });
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save API key. Please try again.' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setApiKey(geminiKey || '');
    setIsEditing(false);
    setSaveMessage(null);
  };

  const tools = [
    {
      title: 'Project DOC Maker',
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
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Welcome to Student Nest</h1>
      
      {/* API Key Input Section */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Key Input */}
          <div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                  Gemini API Key
                </label>
                {!isEditing && geminiKey && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-gray-500 hover:text-blue-500 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Edit API Key"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!isEditing && geminiKey}
                />
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveApiKey}
                      disabled={isSaving || !apiKey || apiKey === geminiKey}
                      className={`px-3 py-2 rounded-lg text-white font-medium transition-colors ${
                        isSaving || !apiKey || apiKey === geminiKey
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                      title="Save API Key"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-2 rounded-lg text-white font-medium bg-gray-500 hover:bg-gray-600 transition-colors"
                      title="Cancel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  !geminiKey && (
                    <button
                      onClick={handleSaveApiKey}
                      disabled={isSaving || !apiKey}
                      className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                        isSaving || !apiKey
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      {isSaving ? 'Saving...' : 'Save Key'}
                    </button>
                  )
                )}
              </div>
            </div>
            {saveMessage && (
              <p className={`mt-2 text-sm ${
                saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {saveMessage.text}
              </p>
            )}
          </div>

          {/* Tutorial Video */}
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

      <p className="text-gray-600 mb-8">Select a tool to get started</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <DashboardCard
            key={tool.path}
            title={tool.title}
            description={tool.description}
            path={tool.path}
            icon={tool.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;