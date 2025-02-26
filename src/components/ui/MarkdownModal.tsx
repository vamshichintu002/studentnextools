import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import Button from './Button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

const MarkdownModal: React.FC<MarkdownModalProps> = ({
  isOpen,
  onClose,
  content
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handlePreviewInNewTab = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>GitHub Profile README Preview</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
            <style>
              body {
                background-color: #ffffff;
                margin: 0;
                padding: 16px;
                color: #24292e;
              }
              .markdown-body {
                box-sizing: border-box;
                min-width: 200px;
                max-width: 980px;
                margin: 0 auto;
                padding: 45px;
                border: 1px solid #e1e4e8;
                border-radius: 6px;
              }
              @media (max-width: 767px) {
                .markdown-body {
                  padding: 15px;
                }
              }
            </style>
          </head>
          <body>
            <div class="markdown-body">
              <div id="content"></div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
            <script>
              marked.setOptions({
                breaks: true,
                gfm: true
              });
              document.getElementById('content').innerHTML = marked.parse(${JSON.stringify(content)});
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Generated Profile README</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg overflow-auto max-h-[60vh] sm:max-h-[400px] markdown-preview mb-4">
          <div className="prose prose-sm sm:prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <Button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1 sm:gap-2 text-sm py-1.5 px-3 sm:py-2 sm:px-4 w-full sm:w-auto"
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Copy Markdown</span>
              </>
            )}
          </Button>
          <Button
            onClick={handlePreviewInNewTab}
            className="flex items-center justify-center gap-1 sm:gap-2 text-sm py-1.5 px-3 sm:py-2 sm:px-4 w-full sm:w-auto"
          >
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Preview in New Tab</span>
            <span className="sm:hidden">Preview</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarkdownModal;
