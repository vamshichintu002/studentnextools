import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useApiKey } from '../lib/ApiKeyContext';
import { useToast } from '../components/ui/use-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generatePDF } from '../utils/pdfGenerator';
import { generateWordDocument } from '../utils/wordGenerator';
import { saveAs } from 'file-saver';
import { Loader2, Copy, Download, Check } from 'lucide-react';
import LoadingModal from '../components/ui/LoadingModal';
import ApiKeyModal from '../components/ui/ApiKeyModal';

interface FormData {
  unitTitle: string;
  topics: string;
}

interface TopicContent {
  topic: string;
  content: string;
}

export default function NotesWriter() {
  const { geminiKey } = useApiKey();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    unitTitle: '',
    topics: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [topicContents, setTopicContents] = useState<TopicContent[]>([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const generateTopicPrompt = (topic: string, context: { unitTitle: string }) => {
    return `Generate comprehensive study notes for the topic "${topic}" within the unit "${context.unitTitle}".
Use markdown formatting for better readability and structure.

Please provide detailed, well-structured content that includes:
1. A brief overview of the topic
2. Key concepts and principles
3. Examples and illustrations where applicable
4. Important points to remember
5. Common misconceptions or challenges
6. Practice questions or exercises (if relevant)

Format the content using markdown with:
1. Clear headings using ### for sub-topics
2. Bullet points and numbered lists where appropriate
3. **Bold** and *italic* text for emphasis
4. Code blocks with proper syntax highlighting (if needed)
5. Tables where relevant
6. > Blockquotes for important notes or definitions

Structure your response with these sections:
### Overview
[Brief overview of the topic]

### Key Concepts
[Explanation of main concepts]

### Examples
[Practical examples]

### Important Points
[Key takeaways]

If applicable, also include:
### Common Misconceptions
### Practice Questions

DO NOT include a heading for the topic itself, as I will add it separately.
Start directly with the content.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKey) {
      setShowApiKeyModal(true);
      return;
    }

    if (!formData.unitTitle || !formData.topics) {
      toast({
        title: "Missing Information",
        description: "Please enter both unit title and topics.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setShowLoadingModal(true);
    setCopied(false);
    setTopicContents([]);
    setCompletedSections([]);
    setGeneratedContent(''); // Clear existing content
    
    // Split topics and clean them
    const topics = formData.topics.split(',').map(topic => topic.trim()).filter(Boolean);
    let allContent = [`# ${formData.unitTitle}\n`]; // Start with the title
    const newTopicContents: TopicContent[] = [];
    
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
      
      // Process each topic sequentially
      for (const topic of topics) {
        setCurrentSection(topic);
        const prompt = generateTopicPrompt(topic, { unitTitle: formData.unitTitle });
        
        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const content = response.text();
          
          // Add topic heading and content to our array
          allContent.push(`\n\n## ${topic}\n\n${content}`);
          
          // Store the topic content for the preview
          newTopicContents.push({ topic, content });
          
          // Update states
          setCompletedSections(prev => [...prev, topic]);
        } catch (error) {
          console.error('Error generating notes:', error);
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
              description: "Failed to generate notes. Please try again.",
              variant: "destructive"
            });
          }
        }
      }
      
      // Update the generated content and topic contents
      setGeneratedContent(allContent.join(''));
      setTopicContents(newTopicContents);
      
      toast({
        title: "Success",
        description: "Notes have been generated successfully!"
      });
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
      setCurrentSection(null);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const pdfBlob = await generatePDF({
        title: formData.unitTitle,
        description: `Study Notes - ${formData.topics}`,
        content: generatedContent
      });
      saveAs(pdfBlob, `${formData.unitTitle.replace(/\s+/g, '_')}_notes.pdf`);
      
      toast({
        title: "Success",
        description: "PDF has been downloaded successfully!"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadWord = async () => {
    try {
      const blob = await generateWordDocument({
        title: formData.unitTitle,
        description: `Study Notes - ${formData.topics}`,
        content: generatedContent,
        sections: topicContents.map(tc => ({ title: tc.topic, content: tc.content }))
      });
      saveAs(blob, `${formData.unitTitle.replace(/\s+/g, '_')}_notes.docx`);
      
      toast({
        title: "Success",
        description: "Word document has been downloaded successfully!"
      });
    } catch (error) {
      console.error('Error generating Word document:', error);
      toast({
        title: "Error",
        description: "Failed to generate Word document. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Study Notes Generator</h1>
      
      <LoadingModal
        isOpen={showLoadingModal}
        sections={formData.topics.split(',').map(topic => topic.trim())}
        currentSection={currentSection}
        completedSections={completedSections}
      />
      
      <ApiKeyModal 
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />
      
      {/* Input Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              label="Unit Title"
              value={formData.unitTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, unitTitle: e.target.value }))}
              placeholder="e.g., Data Structures and Algorithms"
            />
          </div>
          
          <div className="space-y-2">
            <TextArea
              label="Topics (comma-separated)"
              value={formData.topics}
              onChange={(e) => setFormData(prev => ({ ...prev, topics: e.target.value }))}
              placeholder="e.g., Arrays, Linked Lists, Binary Trees"
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Notes...</span>
              </>
            ) : (
              'Generate Notes'
            )}
          </Button>
        </form>
      </div>

      {/* Preview and Actions */}
      {generatedContent && !isLoading && (
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex gap-4 mb-4">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(generatedContent);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                toast({
                  title: "Success",
                  description: "Content copied to clipboard!"
                });
              }}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Copy Text
            </Button>
            
            <Button
              onClick={handleDownloadWord}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Word
            </Button>

            <Button
              onClick={handleDownloadPDF}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>

          {/* Preview */}
          <div className="overflow-auto max-h-[600px] pr-6 py-4">
            {/* Unit Title */}
            <div className="relative mb-12">
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
                  <div className="text-center mb-8 pb-4 border-b">
                    <h1 className="text-3xl font-bold">{formData.unitTitle}</h1>
                    <p className="text-gray-600 mt-2">Study Notes</p>
                  </div>
                  <p className="text-gray-600 text-center">
                    These notes cover the following topics: {formData.topics}
                  </p>
                </div>
                
                {/* Page number */}
                <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                  Cover Page
                </div>
              </div>
            </div>

            {/* Topic Sections */}
            {topicContents.map((topicContent, index) => (
              <div 
                key={index} 
                className="relative mb-12"
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
                      {`## ${topicContent.topic}\n\n${topicContent.content}`}
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
    </div>
  );
}