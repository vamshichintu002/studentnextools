import React, { useState } from 'react';
import { ExternalLink, Copy, Globe, Plus, MessageSquare } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/use-toast';
import { useApiKey } from '../lib/ApiKeyContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SimpleLoadingModal from '../components/ui/SimpleLoadingModal';
import ApiKeyModal from '../components/ui/ApiKeyModal';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { PlaceholdersAndVanishInput } from '../components/ui/placeholders-and-vanish-input';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// URL Input Modal Component
const URLInputModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (url: string) => void }) => {
  const [inputUrl, setInputUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(inputUrl);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="h-8 w-8 text-blue-600" />
                  <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                    WebsiteGPT
                  </Dialog.Title>
                </div>

                <Dialog.Description className="text-gray-600 mb-6">
                  Enter the URL of the website you'd like to chat about. I'll help you understand its content and answer your questions.
                </Dialog.Description>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    id="website-url"
                    type="url"
                    placeholder="https://example.com"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full"
                    label="Website URL"
                    required
                  />
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!inputUrl}
                    >
                      Start Chat
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

interface Message {
  type: 'user' | 'ai';
  content: string;
  isStreaming?: boolean;
}

const WebsiteGPT = () => {
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { toast } = useToast();
  const { geminiKey } = useApiKey();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);

  const placeholders = [
    "What is this website about?",
    "What are the main features?",
    "Tell me about the pricing",
    "How can I contact support?",
    "What technologies are used?",
  ];

  const handleUrlSubmit = (submittedUrl: string) => {
    setUrl(submittedUrl);
    setShowUrlModal(false);
  };

  const generatePrompt = (websiteContent: string, userQuery: string) => {
    return `You are a helpful AI assistant that answers questions about website content.
    
Task: Based on the provided website content, answer the following question: "${userQuery}"

Website Content:
${websiteContent}

Instructions:
1. Answer only based on the information available in the website content
2. If the information is not available in the content, say so
3. Keep the answer clear and concise
4. Format the response using Markdown for better readability
5. Use bullet points, headings, and emphasis where appropriate
6. Use proper markdown syntax for:
   - Lists (using * or -)
   - Headers (using #)
   - Emphasis (using * or _)
   - Code blocks (using \`\`\`)
   - Quotes (using >)

Question: ${userQuery}

Answer (in markdown format):`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!geminiKey) {
      setShowApiKeyModal(true);
      return;
    }

    if (!query) {
      toast({
        title: "Error",
        description: "Please enter your question",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Add user message immediately
    setMessages(prev => [...prev, { type: 'user', content: query }]);
    // Add AI message with streaming state
    setMessages(prev => [...prev, { type: 'ai', content: '', isStreaming: true }]);

    try {
      // First, get website content using Jina.ai
      const jinaResponse = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
        method: 'GET',
      });
      
      if (!jinaResponse.ok) {
        throw new Error('Failed to fetch website content');
      }

      const websiteContent = await jinaResponse.text();

      if (!websiteContent || websiteContent.trim().length === 0) {
        throw new Error('No content found on the website');
      }

      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Prepare the prompt
      const prompt = generatePrompt(websiteContent, query);

      try {
        const result = await model.generateContentStream(prompt);
        let streamedText = '';

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          streamedText += chunkText;
          // Update the last message (AI response) with accumulated text
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.type === 'ai') {
              lastMessage.content = streamedText;
            }
            return newMessages;
          });
        }

        // After streaming is complete, update the message to remove streaming state
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.type === 'ai') {
            lastMessage.isStreaming = false;
          }
          return newMessages;
        });

        setQuery(''); // Clear input after successful response
      } catch (error: unknown) {
        console.error('Error generating response:', error);
        if (error instanceof Error && error.message?.includes('API key')) {
          toast({
            title: "Invalid API Key",
            description: "Please check your Gemini API key and try again.",
            variant: "destructive"
          });
          setShowApiKeyModal(true);
        } else {
          toast({
            title: "Generation Failed",
            description: "Failed to generate response. Please try again.",
            variant: "destructive"
          });
        }
        // Remove the streaming message on error
        setMessages(prev => prev.slice(0, -1));
      }
    } catch (error: unknown) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Error",
        description: errorMessage === 'No content found on the website' 
          ? "Could not extract content from the website. Please try a different URL."
          : "Failed to process your request. Please try again.",
        variant: "destructive"
      });
      // Remove the streaming message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Success",
        description: "Message copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      {/* Modals */}
      <URLInputModal 
        isOpen={showUrlModal} 
        onClose={() => setShowUrlModal(false)}
        onSubmit={handleUrlSubmit}
      />

      <SimpleLoadingModal 
        isOpen={showLoadingModal}
        message="Processing your request... This may take a few moments."
      />

      <ApiKeyModal 
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />

      {/* Mobile Menu Button - Only visible on small screens */}
      <button
        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
        className="fixed top-4 left-4 z-30 md:hidden bg-white p-2 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
      >
        <MessageSquare className="h-5 w-5 text-gray-600" />
      </button>

      <div className="flex h-screen bg-gray-50 relative">
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarExpanded && (
          <div 
            className="fixed inset-0 bg-black/20 z-20 md:hidden"
            onClick={() => setIsSidebarExpanded(false)}
          />
        )}

        {/* Collapsible Sidebar */}
        <div 
          className={`
            fixed md:relative z-30 h-full
            ${isSidebarExpanded ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            ${isSidebarExpanded ? 'w-[280px]' : 'w-[60px]'}
            bg-white border-r shadow-sm p-3 flex flex-col
            transition-all duration-300
          `}
        >
          {/* Toggle Button - Only visible on desktop */}
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="hidden md:block mb-4 p-2 hover:bg-gray-100 rounded-lg transition-colors self-end"
          >
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </button>

          {/* New Chat Button */}
          <Button
            onClick={() => setShowUrlModal(true)}
            className={`
              ${isSidebarExpanded ? 'w-full' : 'w-10 px-0'}
              bg-black hover:bg-gray-900 text-white mb-4 gap-2 h-10
              flex items-center justify-center transition-all duration-300
            `}
            title="New Website"
          >
            <Plus className="h-4 w-4" />
            {isSidebarExpanded && <span>New Website</span>}
          </Button>

          {/* Website History */}
          <div className="flex-1 overflow-y-auto">
            {url && (
              <button
                onClick={() => {}}
                className={`
                  w-full flex items-center gap-2 px-3 py-3 text-sm rounded-lg
                  hover:bg-gray-100 text-gray-700 mb-1 transition-colors
                  ${isSidebarExpanded ? '' : 'justify-center'}
                `}
                title={url}
              >
                <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
                {isSidebarExpanded && <span className="truncate">{url}</span>}
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative bg-white">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center px-4">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-8 text-center">
                <Globe className="h-12 w-12 md:h-16 md:w-16 text-black" />
                <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 bg-[length:200%_auto] animate-shine bg-clip-text text-transparent">
                  WebsiteGPT
                </h1>
              </div>
              <p className="text-gray-800 text-center max-w-xl mb-8 md:mb-12 text-base md:text-lg px-4">
                Ask questions about any website and get instant answers powered by AI
              </p>
              <div className="w-full max-w-2xl px-4">
                <PlaceholdersAndVanishInput
                  placeholders={placeholders}
                  onChange={(e) => setQuery(e.target.value)}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto pt-16 md:pt-0 px-4 md:px-6">
                {messages.map((message: Message, index) => (
                  <div 
                    key={index} 
                    className={`py-2 md:py-3 flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className={`flex items-start gap-3 md:gap-4 group max-w-[85%] md:max-w-[75%] ${
                      message.type === 'user' ? 'flex-row-reverse' : ''
                    }`}>
                      <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-black text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {message.type === 'user' ? 'U' : 'AI'}
                      </div>
                      <div className={`relative rounded-2xl px-4 py-2 md:px-5 md:py-3 ${
                        message.type === 'user' 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {message.type === 'user' ? (
                          <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                            {message.content}
                          </p>
                        ) : (
                          <div className={`prose prose-sm md:prose-base max-w-none ${
                            message.type === 'user' 
                              ? 'prose-invert' 
                              : 'prose-headings:text-gray-900 prose-a:text-blue-600'
                          }`}>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({children, ...props}) => <p className="leading-relaxed text-sm md:text-base m-0" {...props}>{children}</p>,
                                a: ({children, ...props}) => <a className="underline hover:no-underline" {...props}>{children}</a>,
                                ul: ({children, ...props}) => <ul className="list-disc pl-4 my-2" {...props}>{children}</ul>,
                                ol: ({children, ...props}) => <ol className="list-decimal pl-4 my-2" {...props}>{children}</ol>,
                                li: ({children, ...props}) => <li className="my-0.5" {...props}>{children}</li>,
                                h1: ({children, ...props}) => <h1 className="text-lg md:text-xl font-bold mt-4 mb-2 first:mt-0" {...props}>{children}</h1>,
                                h2: ({children, ...props}) => <h2 className="text-base md:text-lg font-bold mt-3 mb-2 first:mt-0" {...props}>{children}</h2>,
                                h3: ({children, ...props}) => <h3 className="text-sm md:text-base font-bold mt-3 mb-1 first:mt-0" {...props}>{children}</h3>,
                                code: ({children, className, ...props}) => {
                                  const isInline = !className;
                                  return isInline ? (
                                    <code className="bg-gray-200/50 px-1.5 py-0.5 rounded text-xs md:text-sm" {...props}>{children}</code>
                                  ) : (
                                    <code className="block bg-gray-200/50 p-2 md:p-3 rounded-lg overflow-x-auto text-sm my-2" {...props}>{children}</code>
                                  );
                                }
                              }}
                            >
                              {message.content + (message.isStreaming ? '▋' : '')}
                            </ReactMarkdown>
                          </div>
                        )}
                        {!message.isStreaming && message.type === 'ai' && (
                          <Button 
                            variant="secondary"
                            onClick={() => copyToClipboard(message.content)}
                            className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="border-t bg-white p-4 md:p-6">
                <div className="max-w-3xl mx-auto">
                  <PlaceholdersAndVanishInput
                    placeholders={placeholders}
                    onChange={(e) => setQuery(e.target.value)}
                    onSubmit={handleSubmit}
                  />
                  <p className="text-xs text-center mt-2 md:mt-3 text-gray-500">
                    WebsiteGPT can make mistakes. Consider checking important information.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default WebsiteGPT; 