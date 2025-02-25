import React, { useState } from 'react';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';

const GitHubProfile = () => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    programmingSkills: '',
    frontendSkills: '',
    backendSkills: '',
    databaseSkills: '',
    softwareSkills: '',
    work: '',
    projects: '',
    githubLink: '',
    leetcodeLink: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">GitHub Profile Maker</h1>
      <p className="text-gray-600 mb-8">Create an impressive GitHub profile README</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm">
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Hi 👋, I'm John Doe"
          required
        />
        <Input
          label="Subtitle"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          placeholder="e.g., A passionate full-stack developer from Canada"
          required
        />
        
        <div className="border-t border-gray-200 my-6 pt-6">
          <h2 className="text-lg font-semibold mb-4">Skills</h2>
          <TextArea
            label="Programming Languages"
            value={formData.programmingSkills}
            onChange={(e) => setFormData({ ...formData, programmingSkills: e.target.value })}
            placeholder="e.g., Python, JavaScript, Java"
            rows={2}
            required
          />
          <TextArea
            label="Frontend Skills"
            value={formData.frontendSkills}
            onChange={(e) => setFormData({ ...formData, frontendSkills: e.target.value })}
            placeholder="e.g., React, Vue.js, CSS"
            rows={2}
            required
          />
          <TextArea
            label="Backend Skills"
            value={formData.backendSkills}
            onChange={(e) => setFormData({ ...formData, backendSkills: e.target.value })}
            placeholder="e.g., Node.js, Django, Express"
            rows={2}
            required
          />
          <TextArea
            label="Database Skills"
            value={formData.databaseSkills}
            onChange={(e) => setFormData({ ...formData, databaseSkills: e.target.value })}
            placeholder="e.g., PostgreSQL, MongoDB, Redis"
            rows={2}
            required
          />
          <TextArea
            label="Software & Tools"
            value={formData.softwareSkills}
            onChange={(e) => setFormData({ ...formData, softwareSkills: e.target.value })}
            placeholder="e.g., Git, Docker, AWS"
            rows={2}
            required
          />
        </div>

        <div className="border-t border-gray-200 my-6 pt-6">
          <h2 className="text-lg font-semibold mb-4">Experience & Projects</h2>
          <TextArea
            label="Work Experience"
            value={formData.work}
            onChange={(e) => setFormData({ ...formData, work: e.target.value })}
            placeholder="List your work experience"
            rows={4}
            required
          />
          <TextArea
            label="Projects"
            value={formData.projects}
            onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
            placeholder="List your notable projects"
            rows={4}
            required
          />
        </div>

        <div className="border-t border-gray-200 my-6 pt-6">
          <h2 className="text-lg font-semibold mb-4">Social Links</h2>
          <Input
            label="GitHub Profile URL"
            value={formData.githubLink}
            onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
            placeholder="https://github.com/username"
            type="url"
            required
          />
          <Input
            label="LeetCode Profile URL"
            value={formData.leetcodeLink}
            onChange={(e) => setFormData({ ...formData, leetcodeLink: e.target.value })}
            placeholder="https://leetcode.com/username"
            type="url"
            required
          />
        </div>

        <Button type="submit" isFullWidth>
          Generate Profile README
        </Button>
      </form>
    </div>
  );
};

export default GitHubProfile;