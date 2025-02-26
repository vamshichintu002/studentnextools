import React from 'react';
import { Loader2 } from 'lucide-react';

interface SimpleLoadingModalProps {
  isOpen: boolean;
  message: string;
}

const SimpleLoadingModal: React.FC<SimpleLoadingModalProps> = ({
  isOpen,
  message
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-700 text-center">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoadingModal;
