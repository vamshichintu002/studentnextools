import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ApiKeyProvider } from './lib/ApiKeyContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import DocMaker from './pages/DocMaker';
import LinkedInAnalyzer from './pages/LinkedInAnalyzer';
import LinkedInSummary from './pages/LinkedInSummary';
import GitHubProfile from './pages/GitHubProfile';
import NotesWriter from './pages/NotesWriter';
import Profile from './pages/Profile';
import LoginModal from './components/ui/LoginModal';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <ApiKeyProvider>
        <Router>
          <AppContent />
          <Toaster />
        </Router>
      </ApiKeyProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { isLoginModalOpen, setIsLoginModalOpen, pendingPath, setPendingPath } = useAuth();
  
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/doc-maker" element={<DocMaker />} />
          <Route path="/linkedin-analyzer" element={<LinkedInAnalyzer />} />
          <Route path="/linkedin-summary" element={<LinkedInSummary />} />
          <Route path="/github-profile" element={<GitHubProfile />} />
          <Route path="/notes-writer" element={<NotesWriter />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setPendingPath(null);
        }}
        onSuccess={() => {
          if (pendingPath) {
            window.location.href = pendingPath;
          }
        }}
      />
    </>
  );
}

export default App;