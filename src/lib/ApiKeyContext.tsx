import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getApiKey } from './apiKeyService';

interface ApiKeyContextType {
  geminiKey: string | null;
  setGeminiKey: (key: string | null) => void;
  isLoading: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | null>(null);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [geminiKey, setGeminiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApiKey = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const key = await getApiKey(user.uid);
          setGeminiKey(key);
        } catch (error) {
          console.error('Error loading API key:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setGeminiKey(null);
        setIsLoading(false);
      }
    };

    loadApiKey();
  }, [user]);

  return (
    <ApiKeyContext.Provider value={{ geminiKey, setGeminiKey, isLoading }}>
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
