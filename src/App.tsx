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
import Projects from './pages/Projects';
import Profile from './pages/Profile';
import LoginModal from './components/ui/LoginModal';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/ProtectedRoute';

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
          <Route
            path="/doc-maker"
            element={
              <ProtectedRoute>
                <DocMaker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/linkedin-analyzer"
            element={
              <ProtectedRoute>
                <LinkedInAnalyzer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/linkedin-summary"
            element={
              <ProtectedRoute>
                <LinkedInSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/github-profile"
            element={
              <ProtectedRoute>
                <GitHubProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes-writer"
            element={
              <ProtectedRoute>
                <NotesWriter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
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