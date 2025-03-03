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
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'ai'; content: string; isStreaming?: boolean }>>([]);

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

      <div className="flex h-screen bg-gray-50">
        {/* Collapsible Sidebar */}
        <div 
          className={`${
            isSidebarExpanded ? 'w-[280px]' : 'w-[60px]'
          } bg-white border-r shadow-sm p-3 flex flex-col transition-all duration-300`}
        >
          {/* Toggle Button */}
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="mb-4 p-2 hover:bg-gray-100 rounded-lg transition-colors self-end"
          >
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </button>

          {/* New Chat Button */}
          <Button
            onClick={() => setShowUrlModal(true)}
            className={`${
              isSidebarExpanded ? 'w-full' : 'w-10 px-0'
            } bg-blue-600 hover:bg-blue-700 text-white mb-4 gap-2 h-10 flex items-center justify-center transition-all duration-300`}
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
                className={`w-full flex items-center gap-2 px-3 py-3 text-sm rounded-lg hover:bg-gray-100 text-gray-700 mb-1 transition-colors ${
                  isSidebarExpanded ? '' : 'justify-center'
                }`}
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
              <div className="flex items-center gap-4 mb-8">
                <Globe className="h-16 w-16 text-blue-600" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  WebsiteGPT
                </h1>
              </div>
              <p className="text-gray-600 text-center max-w-xl mb-12 text-lg">
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
              <div className="flex-1 overflow-y-auto">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`py-6 ${
                      message.type === 'user' ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <div className="max-w-3xl mx-auto px-6">
                      <div className="flex items-start gap-4 group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white border border-gray-200 text-blue-600'
                        }`}>
                          {message.type === 'user' ? 'U' : 'AI'}
                        </div>
                        <div className="flex-1">
                          {message.type === 'user' ? (
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </p>
                          ) : (
                            <div className="prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:mt-1 prose-p:mb-1 prose-ul:mt-1 prose-ul:mb-1 prose-li:mt-0.5 prose-li:mb-0.5 prose-pre:bg-gray-100 prose-pre:p-3 prose-pre:rounded-lg">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed" {...props} />,
                                  a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-disc pl-4" {...props} />,
                                  ol: ({node, ...props}) => <ol className="list-decimal pl-4" {...props} />,
                                  li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
                                  h1: ({node, ...props}) => <h1 className="text-xl font-bold text-gray-900" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-lg font-bold text-gray-900" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-base font-bold text-gray-900" {...props} />,
                                  code: ({node, ...props}) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm" {...props} />,
                                  pre: ({node, ...props}) => <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto" {...props} />
                                }}
                              >
                                {message.content + (message.isStreaming ? '▋' : '')}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                        {!message.isStreaming && (
                          <Button 
                            variant="secondary"
                            onClick={() => copyToClipboard(message.content)}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-100"
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
              <div className="border-t bg-white p-6">
                <div className="max-w-3xl mx-auto">
                  <PlaceholdersAndVanishInput
                    placeholders={placeholders}
                    onChange={(e) => setQuery(e.target.value)}
                    onSubmit={handleSubmit}
                  />
                  <p className="text-xs text-center mt-3 text-gray-500">
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