import React from 'react';
import { Link } from 'react-router-dom';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { RainbowButton } from './ui/rainbow-button';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
}

const DashboardCard = ({ title, description, icon: Icon, path }: DashboardCardProps) => {
  return (
    <div className="block p-3 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      <Link to={path} className="block">
        <RainbowButton className="w-full text-white hover:text-white">
          Launch Tool
        </RainbowButton>
      </Link>
    </div>
  );
};

export default DashboardCard;