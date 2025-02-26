import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import Button from './Button';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

const SummaryModal: React.FC<SummaryModalProps> = ({
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
            <title>LinkedIn Summary Preview</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 40px auto;
                padding: 0 20px;
                background-color: #f9fafb;
              }
              .content {
                background-color: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              p { margin-bottom: 1rem; }
              ul { 
                list-style-type: disc;
                margin-left: 1.5rem;
                margin-bottom: 1rem;
              }
              li { margin-bottom: 0.5rem; }
            </style>
          </head>
          <body>
            <div class="content">
              ${content.replace(/\n/g, '<br>')}
            </div>
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
          <h2 className="text-lg sm:text-xl font-semibold">Generated Summary</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg overflow-auto max-h-[60vh] sm:max-h-[400px] linkedin-preview mb-4">
          <div className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap" 
               style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}>
            {content}
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
                <span>Copy Text</span>
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

export default SummaryModal;
