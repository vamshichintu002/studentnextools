import React, { useState } from 'react';
import Button from '../components/ui/Button';

const LinkedInAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle file analysis
    console.log('Analyzing file:', file);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">LinkedIn Profile Analyzer</h1>
      <p className="text-gray-600 mb-8">Get insights from your LinkedIn profile</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload LinkedIn Profile PDF
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer hover:bg-gray-100">
              <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm text-gray-600">
                {file ? file.name : 'Click to upload or drag and drop'}
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
                required
              />
            </label>
          </div>
        </div>
        <Button
          type="submit"
          isFullWidth
          disabled={!file}
        >
          Analyze Profile
        </Button>
      </form>
    </div>
  );
};

export default LinkedInAnalyzer;