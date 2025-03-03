import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useApiKey } from '../lib/ApiKeyContext';
import { useSessionStorage } from '../lib/useSessionStorage';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';
import { Loader2, FileText, ExternalLink, Check } from 'lucide-react';
import LoadingModal from '../components/ui/LoadingModal';
import ApiKeyModal from '../components/ui/ApiKeyModal';
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
  const [isLoading, setIsLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Use sessionStorage for form data
  const [formData, setFormData] = useSessionStorage<FormData>('docmaker-form', {
    title: '',
    description: '',
    sections: ''
  });
  
  // Use sessionStorage for generated content
  const [generatedSections, setGeneratedSections] = useSessionStorage<GeneratedSection[]>('docmaker-generated', []);

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
          // Use a type guard to safely access error properties
          let errorMessage = '';
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = String((error as { message: unknown }).message);
          } else {
            errorMessage = String(error);
          }
          
          if (errorMessage.includes('API key')) {
            toast({
              title: "Invalid API Key",
              description: "Please check your Gemini API key and try again.",
              variant: "destructive"
            });
            setShowApiKeyModal(true);
          } else {
            toast({
              title: "Generation Failed",
              description: "Failed to generate documentation. Please try again.",
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
      
      // Show success modal
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error generating documentation:', error);
      setShowLoadingModal(false);
    } finally {
      setIsLoading(false);
      setShowLoadingModal(false);
      setCurrentSection(null);
    }
  };

  const generateMarkdownContent = () => {
    return `<div class="branding">Generated by <a href="https://studentnest.in" target="_blank" class="branding-link">StudentNest.in</a></div>

# ${formData.title}

${formData.description}

## Table of Contents
${generatedSections.map((section, index) => `${index + 1}. [${section.title}](#${section.title.toLowerCase().replace(/\s+/g, '-')})`).join('\n')}

${generatedSections.map(section => section.content).join('\n\n---\n\n')}

<div class="footer-branding">Generated by <a href="https://studentnest.in" target="_blank" class="branding-link">StudentNest.in</a></div>`;
  };

  const handleCopyMarkdown = async () => {
    try {
      const markdownContent = generateMarkdownContent();
      await navigator.clipboard.writeText(markdownContent);
      
      toast({
        title: "Copied to clipboard",
        description: "Document content has been copied to clipboard.",
      });
    } catch (error) {
      console.error('Error copying markdown:', error);
    }
  };

  const loadSampleData = () => {
    setFormData(sampleData);
  };

  const sectionsList = formData.sections
    .split(',')
    .map(section => section.trim())
    .filter(section => section.length > 0);

  // Add a new function to open preview in a new tab
  const handlePreviewInNewTab = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>${formData.title || 'Documentation Preview'}</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
              body {
                background-color: #ffffff;
                margin: 0;
                padding: 0;
                color: #24292e;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                line-height: 1.6;
              }
              .branding {
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-bottom: 30px;
                font-style: italic;
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
              }
              .branding-link {
                color: #0366d6;
                text-decoration: none;
                transition: color 0.2s ease;
              }
              .branding-link:hover {
                color: #0056b3;
                text-decoration: underline;
              }
              .footer-branding {
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-top: 40px;
                padding-top: 10px;
                border-top: 1px solid #eee;
              }
              @page {
                margin: 1cm;
                @top-right {
                  content: "StudentNest.in";
                  font-size: 10px;
                  color: #666;
                }
                @bottom-center {
                  content: "Generated by StudentNest.in | Page " counter(page);
                  font-size: 10px;
                  color: #666;
                }
              }
              .control-bar {
                position: sticky;
                top: 0;
                background-color: #f6f8fa;
                border-bottom: 1px solid #e1e4e8;
                padding: 12px 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                z-index: 100;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
              }
              .instruction {
                font-size: 14px;
                color: #57606a;
                margin-right: 10px;
              }
              .buttons {
                display: flex;
                gap: 8px;
              }
              .btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                background-color: #ffffff;
                border: 1px solid #d1d5da;
                border-radius: 6px;
                padding: 6px 12px;
                font-size: 14px;
                font-weight: 500;
                color: #24292e;
                cursor: pointer;
                transition: all 0.2s;
              }
              .btn:hover {
                background-color: #f3f4f6;
              }
              .btn i {
                font-size: 14px;
              }
              .btn-success {
                background-color: #2ea44f;
                color: white;
                border-color: #2ea44f;
              }
              .btn-success:hover {
                background-color: #2c974b;
              }
              .markdown-body {
                box-sizing: border-box;
                min-width: 200px;
                max-width: 980px;
                margin: 0 auto;
                padding: 45px;
                padding-bottom: 100px;
                background-color: #ffffff;
                color: #24292e;
                border: 1px solid #e1e4e8;
                border-radius: 6px;
                margin-top: 20px;
                margin-bottom: 40px;
                position: relative;
              }
              .markdown-body::after {
                content: "Generated by StudentNest.in";
                position: absolute;
                bottom: 20px;
                left: 0;
                right: 0;
                text-align: center;
                font-size: 10px;
                color: #666;
                border-top: 1px solid #eee;
                padding-top: 10px;
                margin-top: 40px;
              }
              .markdown-body h1, 
              .markdown-body h2, 
              .markdown-body h3, 
              .markdown-body h4, 
              .markdown-body h5, 
              .markdown-body h6,
              .markdown-body p,
              .markdown-body li,
              .markdown-body a,
              .markdown-body code,
              .markdown-body blockquote {
                color: #24292e;
              }
              .markdown-body pre {
                background-color: #f6f8fa;
              }
              .markdown-body code {
                background-color: #f6f8fa;
                color: #24292e;
                word-wrap: break-word;
                white-space: pre-wrap;
              }
              .markdown-body table {
                border-collapse: collapse;
                display: block;
                width: 100%;
                overflow-x: auto;
              }
              .markdown-body table th,
              .markdown-body table td {
                border: 1px solid #e1e4e8;
                padding: 6px 13px;
              }
              .markdown-body table tr {
                background-color: #ffffff;
                border-top: 1px solid #e1e4e8;
              }
              .markdown-body table tr:nth-child(2n) {
                background-color: #f6f8fa;
              }
              .markdown-body img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 1rem auto;
              }
              .markdown-body blockquote {
                border-left: 4px solid #dfe2e5;
                padding: 0 1em;
                color: #6a737d;
              }
              @media (max-width: 767px) {
                .markdown-body {
                  padding: 20px;
                  margin: 10px;
                  border-radius: 4px;
                  font-size: 16px;
                  width: auto;
                }
                .markdown-body h1 {
                  font-size: 1.8rem;
                  word-break: break-word;
                }
                .markdown-body h2 {
                  font-size: 1.5rem;
                }
                .markdown-body h3 {
                  font-size: 1.3rem;
                }
                .markdown-body pre {
                  padding: 12px;
                  border-radius: 4px;
                }
                .control-bar {
                  padding: 10px;
                  flex-direction: column;
                  align-items: flex-start;
                }
                .instruction {
                  font-size: 13px;
                  margin-bottom: 10px;
                  width: 100%;
                }
                .buttons {
                  width: 100%;
                  justify-content: space-between;
                }
                .btn {
                  padding: 8px 12px;
                  font-size: 14px;
                  flex: 1;
                  justify-content: center;
                }
                .btn i {
                  margin-right: 4px;
                }
              }
              /* Override any dark mode settings */
              html, body {
                background-color: #ffffff !important;
                color: #24292e !important;
              }
              /* Hide control bar when printing */
              @media print {
                .control-bar {
                  display: none !important;
                }
                .markdown-body {
                  margin: 0;
                  padding: 20px;
                  border: none;
                }
                .markdown-body::after {
                  position: fixed;
                  bottom: 0;
                }
                body {
                  margin-bottom: 50px;
                }
                .branding {
                  margin-top: 20px;
                }
                .branding-link {
                  color: #0366d6;
                  text-decoration: underline;
                }
              }
            </style>
          </head>
          <body>
            <div class="control-bar">
              <div class="instruction">
                <i class="fas fa-info-circle"></i> Copy and paste this in Google Docs or Word to preserve formatting. Google Docs is recommended.
              </div>
              <div class="buttons">
                <button id="copyBtn" class="btn">
                  <i class="fas fa-copy"></i> Copy
                </button>
                <button id="printBtn" class="btn">
                  <i class="fas fa-download"></i> Download
                </button>
              </div>
            </div>
            <div class="markdown-body">
              <div id="content"></div>
            </div>
            <div class="page-footer">
              Visit us at: <a href="https://studentnest.in" target="_blank">studentnest.in</a>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
            <script>
              // Parse and render markdown
              marked.setOptions({
                breaks: true,
                gfm: true
              });
              const markdownContent = ${JSON.stringify(generateMarkdownContent())};
              document.getElementById('content').innerHTML = marked.parse(markdownContent);
              
              // Copy button functionality - copy the rendered HTML content
              document.getElementById('copyBtn').addEventListener('click', async () => {
                try {
                  // Get the rendered HTML content
                  const contentElement = document.querySelector('.markdown-body');
                  
                  // Create a range and selection
                  const range = document.createRange();
                  range.selectNode(contentElement);
                  
                  // Select the content
                  const selection = window.getSelection();
                  selection.removeAllRanges();
                  selection.addRange(range);
                  
                  // Execute copy command
                  document.execCommand('copy');
                  
                  // Clear selection
                  selection.removeAllRanges();
                  
                  // Update button to show success
                  const btn = document.getElementById('copyBtn');
                  btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                  btn.classList.add('btn-success');
                  setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    btn.classList.remove('btn-success');
                  }, 2000);
                } catch (err) {
                  console.error('Failed to copy content:', err);
                }
              });
              
              // Print button functionality (renamed to Download but keeps print functionality)
              document.getElementById('printBtn').addEventListener('click', () => {
                window.print();
              });
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  // Success Modal Component
  const SuccessModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    useEffect(() => {
      if (isOpen) {
        // Load and trigger confetti when modal opens
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
        script.async = true;
        script.onload = () => {
          const confetti = (window as any).confetti;
          
          // Initial burst of confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          
          // Followed by a cannon from both sides
          setTimeout(() => {
            confetti({
              particleCount: 50,
              angle: 60,
              spread: 55,
              origin: { x: 0 }
            });
            
            confetti({
              particleCount: 50,
              angle: 120,
              spread: 55,
              origin: { x: 1 }
            });
          }, 250);
        };
        document.body.appendChild(script);
        
        return () => {
          // Clean up script when modal closes
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        };
      }
    }, [isOpen]);
    
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Document Generated!</h2>
            <p className="text-gray-600 mb-6">
              Your document has been successfully generated with {generatedSections.length} sections.
            </p>
            <div className="flex flex-col w-full gap-3">
              <Button 
                onClick={() => {
                  handlePreviewInNewTab();
                  onClose();
                }}
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View/Download Document
              </Button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-sm mt-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Project DOC Writer</h1>
          <p className="text-gray-600">Create professional documentation for your project</p>
        </div>
        <Button
          onClick={loadSampleData}
          type="button"
          variant="secondary"
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

      {/* Modals */}
      <LoadingModal
        isOpen={showLoadingModal}
        currentSection={currentSection}
        completedSections={completedSections}
        sections={sectionsList}
      />

      <ApiKeyModal 
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
};

export default DocMaker;