import React, { useState } from 'react';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';

const NotesWriter = () => {
  const [formData, setFormData] = useState({
    title: '',
    syllabus: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Notes Writer</h1>
      <p className="text-gray-600 mb-8">Organize your study notes efficiently</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm">
        <Input
          label="Title of Unit"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter the unit title"
          required
        />
        <TextArea
          label="Unit Syllabus"
          value={formData.syllabus}
          onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
          placeholder="Enter the complete syllabus for this unit"
          rows={10}
          required
        />
        <Button type="submit" isFullWidth>
          Generate Notes Structure
        </Button>
      </form>
    </div>
  );
};

export default NotesWriter;