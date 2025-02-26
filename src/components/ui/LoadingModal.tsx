import React from 'react';
import { Check, Loader2 } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
  sections?: string[];
  currentSection: string | null;
  completedSections: string[];
}

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  sections = [],
  currentSection,
  completedSections,
}) => {
  if (!isOpen) return null;

  // Calculate progress percentage
  const progress = sections.length > 0 ? (completedSections.length / sections.length) * 100 : 0;

  // Get the last completed section
  const lastCompletedSection = completedSections[completedSections.length - 1];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-6">Generating Documentation</h3>
        
        {/* Last Completed Section */}
        {lastCompletedSection && (
          <div className="mb-4 flex items-center justify-between p-3 bg-green-50 rounded-lg text-green-700">
            <span className="text-sm font-medium">{lastCompletedSection}</span>
            <Check className="w-5 h-5 text-green-500" />
          </div>
        )}

        {/* Current Section */}
        {currentSection && (
          <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg text-blue-700">
            <span className="text-sm font-medium">Generating: {currentSection}</span>
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Progress Bar Container */}
        <div className="mt-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{completedSections.length} of {sections.length} sections completed</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
