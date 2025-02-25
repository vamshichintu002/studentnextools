import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useApiKey } from '../lib/ApiKeyContext';
import { saveApiKey } from '../lib/apiKeyService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { LogOut, Key, User, Mail, Eye, EyeOff, Edit2 } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const { geminiKey, setGeminiKey } = useApiKey();
  const [apiKey, setApiKey] = useState(geminiKey || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveApiKey = async () => {
    if (!user) return;
    
    setSaving(true);
    setError('');
    
    try {
      const success = await saveApiKey(user.uid, apiKey);
      if (success) {
        setGeminiKey(apiKey);
        setIsEditing(false);
        setShowApiKey(false);
      } else {
        setError('Failed to save API key. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setApiKey(geminiKey || '');
    setIsEditing(false);
    setError('');
    setShowApiKey(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      {/* Account Details Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <User className="w-5 h-5" />
          Account Details
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{user?.email}</span>
          </div>
          <Button
            onClick={handleLogout}
            type="button"
            className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* API Key Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Gemini API Key
        </h2>
        <div className="space-y-4">
          <div className="relative">
            {isEditing ? (
              <>
                <Input
                  label="API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter your Gemini API key"
                />
                <button
                  type="button"
                  onClick={toggleApiKeyVisibility}
                  className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Current API Key
                  </label>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-gray-500 hover:text-blue-500 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Edit API Key"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative">
                  <Input
                    value={geminiKey || ''}
                    type={showApiKey ? "text" : "password"}
                    disabled
                    placeholder="No API key set"
                  />
                  {geminiKey && (
                    <button
                      type="button"
                      onClick={toggleApiKeyVisibility}
                      className="absolute right-3 top-[50%] transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          {isEditing && (
            <div className="flex gap-4">
              <Button
                onClick={handleSaveApiKey}
                disabled={isSaving || !apiKey || apiKey === geminiKey}
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? 'Saving...' : 'Save API Key'}
              </Button>
              <Button
                onClick={handleCancelEdit}
                type="button"
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
