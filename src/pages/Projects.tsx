import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Button from '../components/ui/Button';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../components/ui/use-toast';
import { Download, ExternalLink } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  resourceUrl?: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchProjects();
  }, []);
  
  const fetchProjects = async () => {
    try {
      const projectsCollection = collection(db, 'projects');
      const projectSnapshot = await getDocs(projectsCollection);
      const projectsList = projectSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      setProjects(projectsList);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1];
    return `https://www.youtube.com/embed/${videoId}`;
  };
  
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
        
        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-video w-full">
                  <iframe
                    src={getYoutubeEmbedUrl(project.videoUrl)}
                    title={project.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
                
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  
                  {project.resourceUrl && (
                    <div className="flex justify-end">
                      <Button
                        variant="secondary"
                        onClick={() => window.open(project.resourceUrl, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Resources
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No projects available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
