import React from 'react';
import { ExternalLink } from 'lucide-react';
import { GooeyText } from '../components/ui/gooey-text-morphing';

const Projects = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSe_e_Lc1eXnngV4vedDYQVPdyZ49UdtVueSD6eUEOJmCBzyVw/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors w-full md:w-auto"
          >
            <span>Request Custom Project</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        
        {/* Coming Soon Section */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="relative w-full h-[200px] flex items-center justify-center">
            <GooeyText
              texts={[
                "Coming Soon",
                "Exciting Projects",
                "Stay Tuned",
                "Under Construction"
              ]}
              morphTime={1}
              cooldownTime={0.25}
              className="font-bold absolute"
              textClassName="transform -translate-x-1/2"
            />
          </div>
          <p className="text-gray-600 text-lg mt-8 text-center max-w-2xl px-4">
            We're working on bringing you amazing projects. Check back soon to explore our collection of educational resources and hands-on learning materials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Projects;
