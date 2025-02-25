import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import DocMaker from './pages/DocMaker';
import LinkedInAnalyzer from './pages/LinkedInAnalyzer';
import LinkedInSummary from './pages/LinkedInSummary';
import GitHubProfile from './pages/GitHubProfile';
import NotesWriter from './pages/NotesWriter';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/doc-maker" element={<DocMaker />} />
          <Route path="/linkedin-analyzer" element={<LinkedInAnalyzer />} />
          <Route path="/linkedin-summary" element={<LinkedInSummary />} />
          <Route path="/github-profile" element={<GitHubProfile />} />
          <Route path="/notes-writer" element={<NotesWriter />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;