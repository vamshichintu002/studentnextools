import React, { useState } from 'react';
import Button from '../components/ui/Button';
import { useApiKey } from '../lib/ApiKeyContext';
import { Loader2, FileText, Download, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as pdfjs from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import { generatePDF } from '../utils/pdfGenerator';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SimpleLoadingModal from '../components/ui/SimpleLoadingModal';
import ApiKeyModal from '../components/ui/ApiKeyModal';

// Configure PDF.js worker to use the local worker file in the public directory
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface AnalysisResult {
  content: string;
  score: number;
}

const LinkedInAnalyzer = () => {
  const { geminiKey } = useApiKey();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [parsingProgress, setParsingProgress] = useState<string>('');
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setAnalysisResult(null);
      } else {
        // toast({
        //   title: "Invalid File Type",
        //   description: "Please upload a PDF file.",
        //   variant: "destructive"
        // });
      }
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      setParsingProgress('Starting PDF extraction...');
      console.log('Starting PDF extraction...');
      const arrayBuffer = await file.arrayBuffer();
      console.log('File loaded as ArrayBuffer, size:', arrayBuffer.byteLength);
      
      try {
        // Primary method: Load the PDF document using getDocument
        setParsingProgress('Reading PDF document (method 1)...');
        console.log('Loading PDF document (primary method)...');
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        console.log('PDF loaded successfully. Pages:', pdf.numPages);
        
        let fullText = '';

        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
          setParsingProgress(`Reading page ${i}/${pdf.numPages} (method 1)...`);
          console.log(`Processing page ${i}/${pdf.numPages}...`);
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }

        console.log('Text extraction complete. Text length:', fullText.length);
        
        if (fullText.trim().length > 0) {
          setParsingProgress('PDF text extracted successfully!');
          return fullText;
        }
        
        console.warn('Primary extraction method yielded empty text, trying fallback method...');
        throw new Error('Empty text from primary method');
      } catch (primaryError) {
        console.warn('Primary PDF extraction method failed:', primaryError);
        console.log('Trying fallback method...');
        
        try {
          // Fallback method 1: Use a different approach with renderText
          setParsingProgress('Trying alternative method (method 2)...');
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          
          for (let i = 1; i <= pdf.numPages; i++) {
            setParsingProgress(`Reading page ${i}/${pdf.numPages} (method 2)...`);
            console.log(`Processing page ${i}/${pdf.numPages} (fallback method)...`);
            const page = await pdf.getPage(i);
            
            // Get viewport and prepare canvas
            const viewport = page.getViewport({ scale: 1.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Render page to canvas
            await page.render({
              canvasContext: context!,
              viewport: viewport
            }).promise;
            
            // Get text using getTextContent again but with a different approach
            const textContent = await page.getTextContent();
            let lastY = -1;
            let pageText = '';
            
            for (const item of textContent.items as any[]) {
              if (lastY !== item.transform[5] && lastY !== -1) {
                pageText += '\n';
              }
              pageText += item.str + ' ';
              lastY = item.transform[5];
            }
            
            fullText += pageText + '\n\n';
          }
          
          console.log('Fallback text extraction complete. Text length:', fullText.length);
          
          if (fullText.trim().length > 0) {
            setParsingProgress('PDF text extracted successfully with method 2!');
            return fullText;
          }
          
          throw new Error('Second method also failed to extract text');
        } catch (secondError) {
          console.warn('Second PDF extraction method failed:', secondError);
          console.log('Trying third fallback method...');
          
          try {
            // Fallback method 2: Try a simpler approach
            setParsingProgress('Trying final extraction method (method 3)...');
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
              setParsingProgress(`Reading page ${i}/${pdf.numPages} (method 3)...`);
              console.log(`Processing page ${i}/${pdf.numPages} (third method)...`);
              
              try {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                
                // Simplest approach - just concatenate all strings
                const strings = textContent.items.map((item: any) => item.str || '');
                const pageText = strings.join(' ');
                
                fullText += pageText + '\n\n';
              } catch (pageError) {
                console.warn(`Error extracting text from page ${i}:`, pageError);
                fullText += `[Error extracting text from page ${i}]\n\n`;
              }
            }
            
            if (fullText.trim().length > 0) {
              setParsingProgress('PDF text extracted successfully with method 3!');
              return fullText;
            }
            
            throw new Error('All standard PDF extraction methods failed');
          } catch (thirdError) {
            console.warn('Third PDF extraction method failed:', thirdError);
            console.log('Trying LinkedIn-specific extraction method...');
            
            // LinkedIn-specific method: This approach is tailored for LinkedIn PDFs
            setParsingProgress('Trying LinkedIn-specific extraction method...');
            try {
              const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
              let linkedInProfile: Record<string, string> = {};
              let currentSection = '';
              let fullText = '';
              
              // First pass: Extract all text and try to identify sections
              for (let i = 1; i <= pdf.numPages; i++) {
                setParsingProgress(`Analyzing LinkedIn page ${i}/${pdf.numPages}...`);
                
                try {
                  const page = await pdf.getPage(i);
                  const textContent = await page.getTextContent();
                  const items = textContent.items as any[];
                  
                  // Sort items by their vertical position (y-coordinate) and then by horizontal position (x-coordinate)
                  // This helps to read the text in a more natural order
                  items.sort((a, b) => {
                    // Get y-coordinate (transform[5])
                    const yDiff = a.transform[5] - b.transform[5];
                    if (Math.abs(yDiff) > 5) { // If items are on different lines
                      return b.transform[5] - a.transform[5]; // Sort by y-coordinate (top to bottom)
                    }
                    // If items are on the same line, sort by x-coordinate (left to right)
                    return a.transform[4] - b.transform[4];
                  });
                  
                  // Process items to identify sections and content
                  for (const item of items) {
                    const text = item.str.trim();
                    if (!text) continue;
                    
                    // Check if this is a section header (usually bold and larger font)
                    const fontSize = item.height || 0;
                    const isBold = item.fontName && item.fontName.toLowerCase().includes('bold');
                    
                    if ((fontSize > 10 || isBold) && text.length < 50) {
                      // This looks like a section header
                      if (
                        text === 'Contact' || 
                        text === 'Summary' || 
                        text === 'Experience' || 
                        text === 'Education' ||
                        text === 'Skills' ||
                        text === 'Certifications' ||
                        text === 'Languages' ||
                        text === 'Projects' ||
                        text === 'Honors & Awards' ||
                        text === 'Recommendations' ||
                        text === 'Top Skills' ||
                        text === 'Accomplishments'
                      ) {
                        currentSection = text;
                        linkedInProfile[currentSection] = '';
                      }
                    } else if (currentSection) {
                      // Add content to the current section
                      linkedInProfile[currentSection] += text + ' ';
                    } else {
                      // This might be profile name or title
                      if (text.length > 3 && !linkedInProfile['ProfileName']) {
                        linkedInProfile['ProfileName'] = text;
                      } else if (text.length > 10 && !linkedInProfile['Title']) {
                        linkedInProfile['Title'] = text;
                      }
                    }
                    
                    // Add all text to fullText as a backup
                    fullText += text + ' ';
                  }
                } catch (pageError) {
                  console.warn(`Error processing LinkedIn page ${i}:`, pageError);
                }
              }
              
              // Format the LinkedIn profile data into a structured text
              let structuredText = '';
              
              if (linkedInProfile['ProfileName']) {
                structuredText += `Name: ${linkedInProfile['ProfileName']}\n\n`;
              }
              
              if (linkedInProfile['Title']) {
                structuredText += `Title: ${linkedInProfile['Title']}\n\n`;
              }
              
              // Add each section
              for (const [section, content] of Object.entries(linkedInProfile)) {
                if (section !== 'ProfileName' && section !== 'Title' && content.trim()) {
                  structuredText += `${section}:\n${content.trim()}\n\n`;
                }
              }
              
              // If we couldn't extract structured data, use the full text
              if (structuredText.trim().length < 100 && fullText.trim().length > 100) {
                console.log('Using unstructured LinkedIn text as fallback');
                structuredText = fullText;
              }
              
              if (structuredText.trim().length > 0) {
                setParsingProgress('LinkedIn profile extracted successfully!');
                return structuredText;
              }
              
              throw new Error('LinkedIn-specific extraction failed');
            } catch (linkedInError) {
              console.warn('LinkedIn-specific extraction failed:', linkedInError);
              
              // Last resort: Try to extract ANY text from the PDF
              setParsingProgress('Attempting last resort extraction...');
              const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
              let allText = '';
              
              for (let i = 1; i <= pdf.numPages; i++) {
                try {
                  const page = await pdf.getPage(i);
                  
                  // Try to get ANY text content
                  try {
                    const textContent = await page.getTextContent();
                    // Extract ANY string property from ANY object
                    const extractStrings = (obj: any): string => {
                      if (!obj) return '';
                      if (typeof obj === 'string') return obj;
                      if (Array.isArray(obj)) {
                        return obj.map(item => extractStrings(item)).join(' ');
                      }
                      if (typeof obj === 'object') {
                        return Object.values(obj).map(val => extractStrings(val)).join(' ');
                      }
                      return '';
                    };
                    
                    allText += extractStrings(textContent) + '\n';
                  } catch (e) {
                    console.warn('Failed to extract text content:', e);
                  }
                  
                  // Try to render the page and analyze it
                  try {
                    const viewport = page.getViewport({ scale: 1.5 }); // Higher scale for better text recognition
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    await page.render({
                      canvasContext: context!,
                      viewport: viewport
                    }).promise;
                    
                    // Extract any text from the page's operators
                    const operatorList = await page.getOperatorList();
                    const extractTextFromOperators = (ops: any): string => {
                      if (!ops || !ops.fnArray) return '';
                      let text = '';
                      for (let j = 0; j < ops.fnArray.length; j++) {
                        const fn = ops.fnArray[j];
                        const args = ops.argsArray[j];
                        if (fn === 3 && args && args[0]) { // ShowText operator
                          text += args[0] + ' ';
                        }
                      }
                      return text;
                    };
                    
                    allText += extractTextFromOperators(operatorList) + '\n';
                  } catch (e) {
                    console.warn('Failed to render page:', e);
                  }
                } catch (pageError) {
                  console.warn(`Error in last resort extraction for page ${i}:`, pageError);
                }
              }
              
              // Clean up the text - remove duplicate spaces, weird characters, etc.
              allText = allText
                .replace(/\s+/g, ' ')
                .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable ASCII characters
                .trim();
              
              if (allText.length > 100) {
                setParsingProgress('Text extracted using last resort method!');
                return allText;
              }
              
              throw new Error('All PDF extraction methods failed');
            }
          }
        }
      }
    } catch (error) {
      setParsingProgress('');
      console.error('Error extracting text from PDF:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
      } else {
        throw new Error('Failed to extract text from PDF: Unknown error');
      }
    }
  };

  const generateAnalysisPrompt = (resumeText: string) => {
    return `Analyze the following LinkedIn resume and provide a comprehensive evaluation based on the metrics below. Format your response in markdown.

RESUME CONTENT:
${resumeText}

ANALYSIS METRICS:
1. Relevance of Skills (Score out of 20):
   - Evaluate if the skills align with current industry demands
   - Check for both technical and soft skills
   - Assess the balance between specialized and transferable skills

2. Work Experience (Score out of 25):
   - Evaluate the depth and breadth of work experience
   - Assess job titles, companies, and tenure
   - Look for career progression and relevant industry experience

3. Achievements and Quantifiable Results (Score out of 20):
   - Identify specific achievements with quantifiable results
   - Evaluate impact statements (e.g., "Increased sales by 25%")
   - Check for problem-solving examples and outcomes

4. Education and Certifications (Score out of 15):
   - Assess educational background relevance
   - Evaluate certifications and their industry value
   - Check for continuing education and professional development

5. Consistency and Accuracy (Score out of 10):
   - Check for consistent formatting and information
   - Evaluate for any gaps or inconsistencies
   - Assess overall professional presentation

6. ATS Compatibility (Score out of 10):
   - Evaluate keyword optimization
   - Check for standard section headings
   - Assess overall structure for ATS readability

OVERALL SCORE: Calculate a total score out of 100 based on the above metrics.

STRENGTHS: List 3-5 key strengths of the resume.

AREAS FOR IMPROVEMENT: Provide 3-5 specific, actionable recommendations to improve the resume, Include before-and-after examples to illustrate the improvements effectively.


FINAL VERDICT: Give a concise 2-3 sentence summary of the resume's effectiveness.

Format your response with clear headings, bullet points, and a professional tone. Include the numerical scores for each section and the overall score.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowLoadingModal(true);
    await handleAnalyzeResume();
  };

  const handleAnalyzeResume = async () => {
    if (!file || !geminiKey) {
      setShowLoadingModal(false);
      if (!geminiKey) {
        setShowApiKeyModal(true);
      } else {
        // toast({
        //   title: "Error",
        //   description: "Please upload a PDF file first.",
        //   variant: "destructive"
        // });
      }
      return;
    }

    setIsLoading(true);
    
    try {
      const text = await extractTextFromPDF(file);
      
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = generateAnalysisPrompt(text);
      
      // Add a timeout for the API call
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Analysis request timed out')), 60000)
      );
      
      const resultPromise = model.generateContent(prompt);
      const result = await Promise.race([resultPromise, timeoutPromise]) as any;
      
      console.log('Received response from Gemini API');
      const analysisText = result.response.text();
      
      // Extract score from analysis (assuming it's in the format "OVERALL SCORE: XX/100")
      const scoreMatch = analysisText.match(/OVERALL SCORE:?\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
      
      console.log('Analysis complete, score:', score);
      setParsingProgress('');
      
      setAnalysisResult({
        content: analysisText,
        score: score
      });
      
      // toast({
      //   title: "Analysis Complete",
      //   description: "Resume has been analyzed successfully.",
      // });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setParsingProgress('');
      let errorMessage = 'Failed to analyze the resume. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('text extraction') || error.message.includes('PDF')) {
          errorMessage = 'Failed to extract text from the PDF. Please try a different PDF file.';
        } else if (error.message.includes('too short')) {
          errorMessage = 'The PDF contains too little text to analyze. Please try a different file.';
        } else if (error.message.includes('timed out')) {
          errorMessage = 'The analysis request timed out. Please try again with a smaller PDF file.';
        }
      }
      
      // toast({
      //   title: "Analysis Failed",
      //   description: errorMessage,
      //   variant: "destructive"
      // });
    } finally {
      setIsLoading(false);
      setShowLoadingModal(false);
    }
  };

  const handleCopyAnalysis = async () => {
    if (!analysisResult) return;
    
    try {
      await navigator.clipboard.writeText(analysisResult.content);
      setIsCopied(true);
      
      // toast({
      //   title: "Copied!",
      //   description: "Analysis has been copied to clipboard.",
      // });
      
      // Reset copy icon after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Error copying analysis:', error);
      // toast({
      //   title: "Error",
      //   description: "Failed to copy analysis. Please try again.",
      //   variant: "destructive"
      // });
    }
  };

  const handleDownloadPDF = async () => {
    if (!analysisResult) return;
    
    try {
      const pdfBlob = await generatePDF({
        title: 'LinkedIn Resume Analysis',
        description: `Analysis for ${file?.name || 'uploaded resume'}`,
        content: analysisResult.content
      });
      
      saveAs(pdfBlob, 'resume-analysis.pdf');
      
      // toast({
      //   title: "Success",
      //   description: "Analysis PDF has been downloaded.",
      // });
    } catch (error) {
      console.error('Error generating PDF:', error);
      // toast({
      //   title: "Error",
      //   description: "Failed to generate PDF. Please try again.",
      //   variant: "destructive"
      // });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SimpleLoadingModal 
        isOpen={showLoadingModal}
        message="Analyzing your resume... This may take a few moments."
      />

      <ApiKeyModal 
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">LinkedIn Resume Analyzer</h1>
          <p className="text-gray-600">Get professional insights and improvement suggestions for your LinkedIn resume</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <form onSubmit={handleSubmit}>
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
              <p className="mt-2 text-xs text-gray-500">
                Upload your LinkedIn profile as a PDF. You can download it from LinkedIn by going to your profile, clicking on "More" and selecting "Save to PDF".
              </p>
            </div>
            
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2"
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Analyze Resume</span>
                </>
              )}
            </Button>
            
            {isLoading && parsingProgress && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
                <p className="text-sm text-gray-600 text-center">{parsingProgress}</p>
              </div>
            )}
          </form>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex gap-4 mb-4">
              <Button
                onClick={handleCopyAnalysis}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {isCopied ? 'Copied!' : 'Copy Analysis'}
              </Button>
              
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>

            {/* Score Display */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Overall Resume Score</h2>
                <div className="flex items-center">
                  <div className={`text-2xl font-bold ${
                    analysisResult.score >= 80 ? 'text-green-600' :
                    analysisResult.score >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {analysisResult.score}/100
                  </div>
                </div>
              </div>
              
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    analysisResult.score >= 80 ? 'bg-green-600' :
                    analysisResult.score >= 60 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${analysisResult.score}%` }}
                ></div>
              </div>
              
              <p className="mt-2 text-sm text-gray-600">
                {analysisResult.score >= 80 ? 'Excellent! Your resume is well-optimized.' :
                 analysisResult.score >= 60 ? 'Good resume with some areas for improvement.' :
                 'Your resume needs significant improvements.'}
              </p>
            </div>

            {/* Analysis Content */}
            <div className="relative">
              {/* Background pages effect */}
              <div className="absolute -bottom-2 -right-2 w-full h-full bg-gray-100 rounded-lg transform rotate-1" />
              <div className="absolute -bottom-1 -right-1 w-full h-full bg-gray-50 rounded-lg transform rotate-0.5" />
              
              {/* Main content page */}
              <div 
                className="relative bg-white rounded-lg p-8 overflow-auto max-h-[600px]"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mb-3 text-gray-800" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mb-2 text-gray-700" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-4 text-gray-600 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 text-gray-600" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 text-gray-600" {...props} />,
                      li: ({ node, children, ...props }) => {
                        const text = String(children);
                        if (text.startsWith('Before:')) {
                          return <li className="text-red-600 mb-1" {...props}>{children}</li>;
                        }
                        if (text.startsWith('After:')) {
                          return <li className="text-green-600 mb-1" {...props}>{children}</li>;
                        }
                        return <li className="mb-1" {...props}>{children}</li>;
                      },
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
                      strong: ({ node, ...props }) => {
                        const text = props.children[0];
                        if (typeof text === 'string' && text.includes('Before:')) {
                          return <strong className="text-red-600" {...props} />;
                        }
                        if (typeof text === 'string' && text.includes('After:')) {
                          return <strong className="text-green-600" {...props} />;
                        }
                        return <strong className="text-gray-800" {...props} />;
                      },
                    }}
                  >
                    {analysisResult.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedInAnalyzer;