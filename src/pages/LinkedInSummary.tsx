import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';
import { useAuth } from '../lib/AuthContext';
import { useApiKey } from '../lib/ApiKeyContext';
import SimpleLoadingModal from '../components/ui/SimpleLoadingModal';
import SummaryModal from '../components/ui/SummaryModal';
import ApiKeyModal from '../components/ui/ApiKeyModal';
import { useToast } from '../components/ui/use-toast';
import { useSessionStorage } from '../lib/useSessionStorage';

const LinkedInSummary = () => {
  const { user } = useAuth();
  const { geminiKey } = useApiKey();
  const { toast } = useToast();

  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Use sessionStorage for form data
  const [formData, setFormData] = useSessionStorage('linkedin-summary-form', {
    name: '',
    jobTitle: '',
    industry: '',
    experience: '',
    skills: '',
    careerGoals: '',
    achievements: ''
  });

  // Use sessionStorage for generated content
  const [generatedSummary, setGeneratedSummary] = useSessionStorage<string>('linkedin-summary-generated', '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePrompt = (data: typeof formData) => {
    return `Write a LinkedIn summary with these details:

Name: ${data.name}
Current Role: ${data.jobTitle}
Industry: ${data.industry}
Experience: ${data.experience}
Skills: ${data.skills}
Career Goals: ${data.careerGoals}
Achievements: ${data.achievements}

Requirements:
1. Start directly with the summary content - no introductions or explanations
2. Write in first person
3. Make it engaging and professional
4. Include achievements and skills naturally in the text
5. Keep it under 2000 characters
6. Use proper paragraphing and bullet points where appropriate
7. Do not add any hashtags at the end
8. Do not include any meta text or explanations about the summary`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsLoading(true);
    setShowLoadingModal(true);
    setError('');

    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
      const prompt = generatePrompt(formData);
      
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        setGeneratedSummary(text);
        setShowSummaryModal(true);
      } catch (error) {
        console.error('Error generating summary:', error);
        if (error.message?.includes('API key')) {
          toast({
            title: "Invalid API Key",
            description: "Please check your Gemini API key and try again.",
            variant: "destructive"
          });
          setShowApiKeyModal(true);
        } else {
          toast({
            title: "Generation Failed",
            description: "Failed to generate summary. Please try again.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setShowLoadingModal(false);
    }
  };

  const fillTestData = () => {
    setFormData({
      name: "Alex Thompson",
      jobTitle: "Senior Software Engineer",
      industry: "Technology & Software Development",
      experience: "8+ years of experience in full-stack development, leading teams of 5-10 developers, and delivering enterprise-scale applications. Specialized in cloud architecture and microservices. Previously worked at Microsoft and two successful startups.",
      skills: "Full-stack development (React, Node.js, Python), Cloud Architecture (AWS, Azure), Team Leadership, Agile Project Management, System Design, Performance Optimization",
      careerGoals: "Seeking to transition into a Technical Architecture role where I can leverage my development experience to design scalable systems and mentor junior developers.",
      achievements: "- Led the development of a microservices platform that reduced deployment time by 70%\n- Awarded 'Innovation Champion 2024' at current company\n- Published 3 technical articles on Medium with 50k+ views"
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SimpleLoadingModal 
        isOpen={showLoadingModal}
        message="Generating your LinkedIn summary... This may take a few moments."
      />

      <SummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        content={generatedSummary}
      />

      <ApiKeyModal 
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">LinkedIn Summary Generator</h1>
          <p className="text-gray-600">Create a compelling LinkedIn summary using AI</p>
        </div>
        <Button
          onClick={fillTestData}
          type="button"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800"
        >
          Fill Test Data
        </Button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm mb-8">
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
        <Button 
          type="submit" 
          isFullWidth
          disabled={isLoading}
        >
          Generate Summary
        </Button>
      </form>

      {error && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="text-red-500">{error}</div>
        </div>
      )}
    </div>
  );
};

export default LinkedInSummary;