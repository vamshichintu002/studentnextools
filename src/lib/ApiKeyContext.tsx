import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getApiKey } from './apiKeyService';
import { useToast } from '../components/ui/use-toast';

interface ApiKeyContextType {
  geminiKey: string | null;
  setGeminiKey: (key: string | null) => void;
  isLoading: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | null>(null);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [geminiKey, setGeminiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApiKey = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const key = await getApiKey(user.uid);
          setGeminiKey(key);
          if (key) {
            toast({
              title: "API Key Loaded",
              description: "Your Gemini API key has been loaded successfully.",
              duration: 3000,
            });
          }
        } catch (error) {
          console.error('Error loading API key:', error);
          toast({
            title: "Error Loading API Key",
            description: "Failed to load your API key. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setGeminiKey(null);
        setIsLoading(false);
      }
    };

    loadApiKey();
  }, [user, toast]);

  return (
    <ApiKeyContext.Provider value={{ geminiKey, setGeminiKey, isLoading }}>
      {isLoading ? (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Loading API Key...</p>
          </div>
        </div>
      ) : null}
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};
