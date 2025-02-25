import React, { useState } from 'react';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';

const LinkedInSummary = () => {
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    industry: '',
    experience: '',
    skills: '',
    careerGoals: '',
    achievements: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">LinkedIn Summary Generator</h1>
      <p className="text-gray-600 mb-8">Create a compelling LinkedIn summary</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter your full name"
          required
        />
        <Input
          label="Job Title / Student Status"
          value={formData.jobTitle}
          onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
          placeholder="e.g., Software Engineer or Computer Science Student"
          required
        />
        <Input
          label="Industry"
          value={formData.industry}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          placeholder="e.g., Technology, Education, Finance"
          required
        />
        <TextArea
          label="Experience"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          placeholder="Briefly describe your relevant experience"
          rows={3}
          required
        />
        <TextArea
          label="Skills"
          value={formData.skills}
          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          placeholder="List your key skills"
          rows={3}
          required
        />
        <TextArea
          label="Career Goals"
          value={formData.careerGoals}
          onChange={(e) => setFormData({ ...formData, careerGoals: e.target.value })}
          placeholder="What are your career aspirations?"
          rows={3}
          required
        />
        <TextArea
          label="Achievements (Optional)"
          value={formData.achievements}
          onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
          placeholder="List any notable achievements"
          rows={3}
        />
        <Button type="submit" isFullWidth>
          Generate Summary
        </Button>
      </form>
    </div>
  );
};

export default LinkedInSummary;