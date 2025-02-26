import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useApiKey } from '../lib/ApiKeyContext';
import { useSessionStorage } from '../lib/useSessionStorage';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';
import { Loader2, FileText, Download, Copy, Check } from 'lucide-react';
import LoadingModal from '../components/ui/LoadingModal';
import ApiKeyModal from '../components/ui/ApiKeyModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateWordDocument } from '../utils/wordGenerator';
import { generatePDF } from '../utils/pdfGenerator';
import { saveAs } from 'file-saver';
import { useToast } from '../components/ui/use-toast';

interface FormData {
  title: string;
  description: string;
  sections: string;
}

interface GeneratedSection {
  title: string;
  content: string;
}

const sampleData: FormData = {
  title: "Personalized Learning Portal",
  description: "A web-based platform that recommends courses based on user interests and past learning history using AI algorithms.",
  sections: "Cover Page, Acknowledgment, Abstract, Introduction, Project Overview"
};

const DocMaker = () => {
  const { geminiKey } = useApiKey();
  const { toast } = useToast();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  // Use sessionStorage for form data
  const [formData, setFormData] = useSessionStorage<FormData>('docmaker-form', {
    title: '',
    description: '',
    sections: ''
  });
  
  // Use sessionStorage for generated content
  const [generatedSections, setGeneratedSections] = useSessionStorage<GeneratedSection[]>('docmaker-generated', []);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const generateSectionPrompt = (section: string, context: { title: string; description: string }) => {
    return `Generate comprehensive content for the "${section}" section of a project documentation.
Use markdown formatting for better readability and structure.

Project Context:
- Title: ${context.title}
- Description: ${context.description}

Please provide detailed, well-structured content for the "${section}" section. 
Format the content using markdown with:
1. Clear headings using ## and ###
2. Bullet points and numbered lists where appropriate
3. **Bold** and *italic* text for emphasis
4. Code blocks with proper syntax highlighting
5. Tables where relevant
6. > Blockquotes for important notes

The content should be:
1. Relevant to the project's context
2. Professional and clear
3. Well-organized with proper markdown hierarchy
4. Include specific examples where appropriate

Start with a level 1 heading for the section name:

# ${section}

[Rest of the content...]`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!geminiKey) {
      setShowApiKeyModal(true);
      return;
    }

    try {
      setIsLoading(true);
      setGeneratedSections([]);
      setCompletedSections([]);
      setCurrentSection(null);
      setShowLoadingModal(true);

      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

      // Split sections and clean them
      const sectionsList = formData.sections
        .split(',')
        .map(section => section.trim())
        .filter(section => section.length > 0);

      // Generate content for each section sequentially
      const generatedContent: GeneratedSection[] = [];
      for (const section of sectionsList) {
        // Set current section with a slight delay to show transition
        await new Promise(resolve => setTimeout(resolve, 500));
        setCurrentSection(section);
        
        const prompt = generateSectionPrompt(section, {
          title: formData.title,
          description: formData.description
        });

        try {
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          
          generatedContent.push({
            title: section,
            content: text
          });

          // Update completed sections with a slight delay
          await new Promise(resolve => setTimeout(resolve, 500));
          setCompletedSections(prev => [...prev, section]);
          
          // Update the UI as each section is generated
          setGeneratedSections([...generatedContent]);
        } catch (error) {
          console.error('Error generating section:', error);
          setShowLoadingModal(false);
          if (error.message?.includes('API key')) {
            toast({
              title: "Invalid API Key",
              description: "Please check your Gemini API key and try again.",
              variant: "destructive"
            });
            setShowApiKeyModal(true);
          } else {
            toast({
              title: "Error",
              description: "Failed to generate section. Please try again.",
              variant: "destructive"
            });
          }
          return;
        }
      }

      // Add final delay before closing modal
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentSection(null);
      setShowLoadingModal(false);

    } catch (error) {
      console.error('Error generating documentation:', error);
      setShowLoadingModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMarkdownContent = () => {
    return `# ${formData.title}\n\n${formData.description}\n\n## Table of Contents\n${
      generatedSections.map((section, index) => `${index + 1}. [${section.title}](#${section.title.toLowerCase().replace(/\s+/g, '-')})`).join('\n')
    }\n\n${
      generatedSections.map(section => section.content).join('\n\n---\n\n')
    }`;
  };

  const handleDownloadWord = async () => {
    try {
      // Generate full markdown content
      const markdownContent = generateMarkdownContent();
      
      // Convert markdown to Word
      await generateWordDocument({
        title: formData.title,
        description: formData.description,
        content: markdownContent,
        sections: generatedSections
      });
      
    } catch (error) {
      console.error('Error generating Word document:', error);
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const markdownContent = generateMarkdownContent();
      await navigator.clipboard.writeText(markdownContent);
      
      setIsCopied(true);

      // Reset copy icon after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Error copying markdown:', error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const pdfBlob = await generatePDF({
        title: formData.title || 'Documentation',
        description: formData.description || '',
        content: generateMarkdownContent()
      });
      saveAs(pdfBlob, `${formData.title || 'documentation'}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF document:', error);
    }
  };

  const loadSampleData = () => {
    setFormData(sampleData);
  };

  const sectionsList = formData.sections
    .split(',')
    .map(section => section.trim())
    .filter(section => section.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Project DOC Maker</h1>
          <p className="text-gray-600">Create professional documentation for your project</p>
        </div>
        <Button
          onClick={loadSampleData}
          type="button"
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Load Example
        </Button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm mb-8">
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
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Generating...' : 'Generate Documentation'}
        </Button>
      </form>

      {/* Generated Content Preview */}
      {generatedSections.length > 0 && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyMarkdown}
              className="flex items-center gap-2"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {isCopied ? 'Copied!' : 'Copy MD'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadWord}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Word
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadPDF}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>

          {/* Preview Content */}
          <div className="space-y-12 overflow-auto max-h-[800px] pr-6 py-4">
            {generatedSections.map((section, index) => (
              <div 
                key={index} 
                className="relative"
              >
                {/* Background pages effect */}
                <div className="absolute -bottom-2 -right-2 w-full h-full bg-gray-100 rounded-lg transform rotate-1" />
                <div className="absolute -bottom-1 -right-1 w-full h-full bg-gray-50 rounded-lg transform rotate-0.5" />
                
                {/* Main content page */}
                <div 
                  className="relative bg-white rounded-lg p-8"
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ node, ...props }) => (
                          <div className="text-center mb-8 pb-4 border-b">
                            <h1 className="text-3xl font-bold" {...props} />
                          </div>
                        ),
                        h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mb-4 text-gray-800" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mb-3 text-gray-700" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-4 text-gray-600 leading-relaxed" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 text-gray-600" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 text-gray-600" {...props} />,
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600" {...props} />
                        ),
                        code: ({ node, inline, ...props }) => (
                          inline ? 
                            <code className="bg-gray-100 rounded px-1 text-sm font-mono" {...props} /> :
                            <pre className="bg-gray-100 rounded-lg p-4 overflow-auto my-4">
                              <code className="text-sm font-mono" {...props} />
                            </pre>
                        ),
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-4 rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200" {...props} />
                          </div>
                        ),
                        th: ({ node, ...props }) => (
                          <th className="px-4 py-3 bg-gray-50 text-left text-sm font-medium text-gray-600" {...props} />
                        ),
                        td: ({ node, ...props }) => (
                          <td className="px-4 py-3 text-sm text-gray-500 border-t border-gray-200" {...props} />
                        ),
                      }}
                    >
                      {section.content}
                    </ReactMarkdown>
                  </div>

                  {/* Page number */}
                  <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                    Page {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <LoadingModal
        isOpen={showLoadingModal}
        onClose={() => setShowLoadingModal(false)}
        currentSection={currentSection}
        completedSections={completedSections}
        sections={sectionsList}
      />

      <ApiKeyModal 
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />
    </div>
  );
};

export default DocMaker;