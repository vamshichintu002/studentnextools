import React, { useState, useRef, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

interface ProfileMenuProps {
  onLogout: () => void;
}

const ProfileMenu = ({ onLogout }: ProfileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full hover:bg-gray-50 p-2 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {user.displayName?.[0] || user.email?.[0] || '?'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
