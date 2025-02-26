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

  const generateTopicPrompt = (topic: string, context: { unitTitle: string }) => {
    return `Generate comprehensive study notes for the topic "${topic}" within the unit "${context.unitTitle}".
Use markdown formatting for better readability and structure.

Please provide detailed, well-structured content that includes:
1. Clear explanation of key concepts
2. Examples and illustrations where applicable
3. Important points to remember
4. Common misconceptions or challenges
5. Practice questions or exercises (if relevant)

Format the content using markdown with:
1. Clear headings using ### for sub-topics (not ## as I will use that for the main topic)
2. Bullet points and numbered lists where appropriate
3. **Bold** and *italic* text for emphasis
4. Code blocks with proper syntax highlighting (if needed)
5. Tables where relevant
6. > Blockquotes for important notes or definitions

DO NOT include a heading for the topic itself, as I will add it separately.
Start directly with the content.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your Gemini API key in the profile settings.",
        variant: "destructive"
      });
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
    
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
      
      // Process each topic sequentially
      for (const topic of topics) {
        setCurrentSection(topic);
        const prompt = generateTopicPrompt(topic, { unitTitle: formData.unitTitle });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();
        
        // Add topic heading and content to our array
        allContent.push(`\n\n## ${topic}\n\n### Overview\n\n${content}`);
        
        // Update states
        setTopicContents(prev => [...prev, { topic, content }]);
        setCompletedSections(prev => [...prev, topic]);
        
        // Update the generated content in real-time
        setGeneratedContent(allContent.join(''));
      }
      
      toast({
        title: "Success",
        description: "Notes have been generated successfully!"
      });
    } catch (err) {
      console.error('Error generating notes:', err);
      toast({
        title: "Error",
        description: "Failed to generate notes. Please try again.",
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
      const blob = await generateWordDocument(generatedContent);
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
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Input Form */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow">
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
        </div>

        {/* Preview and Actions */}
        <div className="space-y-4">
          {generatedContent && !isLoading && (
            <>
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
              <div className="bg-white rounded-lg shadow-lg p-6 overflow-auto max-h-[600px]">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {generatedContent}
                  </ReactMarkdown>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}