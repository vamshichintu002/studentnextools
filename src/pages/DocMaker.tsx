import React, { useState } from 'react';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';

const DocMaker = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sections: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Project DOC Maker</h1>
      <p className="text-gray-600 mb-8">Create professional documentation for your project</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm">
        <Input
          label="Project Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter your project title"
          required
        />
        <TextArea
          label="Project Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your project"
          rows={4}
          required
        />
        <TextArea
          label="Key Sections"
          value={formData.sections}
          onChange={(e) => setFormData({ ...formData, sections: e.target.value })}
          placeholder="Enter sections separated by commas (e.g., Introduction, Features, Installation)"
          rows={3}
          required
        />
        <Button type="submit" isFullWidth>
          Generate Documentation
        </Button>
      </form>
    </div>
  );
};

export default DocMaker;