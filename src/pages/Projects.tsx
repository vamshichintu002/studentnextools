import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../components/ui/use-toast';
import { Download, Plus, Trash } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  resourceUrl?: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    videoUrl: '',
    resourceUrl: ''
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = true; // Make everyone an admin for now
  
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
      
      // If no projects exist, use default projects
      if (projectsList.length === 0) {
        setProjects([
          {
            id: 'default1',
            title: 'Introduction to Data Structures',
            description: 'Learn the fundamentals of data structures with practical examples',
            videoUrl: 'https://www.youtube.com/watch?v=BZ5Tfq8jBMw',
            resourceUrl: 'https://example.com/resources/data-structures.pdf'
          },
          {
            id: 'default2',
            title: 'Advanced Python Programming',
            description: 'Master advanced Python concepts and techniques',
            videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
            resourceUrl: ''
          }
        ]);
      } else {
        setProjects(projectsList);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive'
      });
      
      // Use default projects on error
      setProjects([
        {
          id: 'default1',
          title: 'Introduction to Data Structures',
          description: 'Learn the fundamentals of data structures with practical examples',
          videoUrl: 'https://www.youtube.com/watch?v=BZ5Tfq8jBMw',
          resourceUrl: 'https://example.com/resources/data-structures.pdf'
        },
        {
          id: 'default2',
          title: 'Advanced Python Programming',
          description: 'Master advanced Python concepts and techniques',
          videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
          resourceUrl: ''
        }
      ]);
    }
  };
  
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate YouTube URL
    if (!isValidYoutubeUrl(newProject.videoUrl)) {
      toast({
        title: 'Invalid YouTube URL',
        description: 'Please enter a valid YouTube video URL',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await addDoc(collection(db, 'projects'), {
        title: newProject.title,
        description: newProject.description,
        videoUrl: newProject.videoUrl,
        resourceUrl: newProject.resourceUrl || null
      });
      
      setNewProject({
        title: '',
        description: '',
        videoUrl: '',
        resourceUrl: ''
      });
      
      setShowAddForm(false);
      fetchProjects();
      
      toast({
        title: 'Success',
        description: 'Project added successfully!'
      });
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: 'Error',
        description: 'Failed to add project',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await deleteDoc(doc(db, 'projects', id));
      fetchProjects();
      
      toast({
        title: 'Success',
        description: 'Project deleted successfully!'
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive'
      });
    }
  };
  
  const isValidYoutubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
  };
  
  const getYoutubeEmbedUrl = (url: string) => {
    let videoId = '';
    
    // Extract video ID from various YouTube URL formats
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    return `https://www.youtube.com/embed/${videoId}`;
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        {isAdmin && (
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {showAddForm ? 'Cancel' : 'Add Project'}
          </Button>
        )}
      </div>
      
      {/* Add Project Form */}
      {showAddForm && isAdmin && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Project</h2>
          <form onSubmit={handleAddProject} className="space-y-4">
            <Input
              label="Project Title"
              value={newProject.title}
              onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              placeholder="Enter project title"
              required
            />
            
            <TextArea
              label="Description"
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              placeholder="Enter project description"
              rows={3}
              required
            />
            
            <Input
              label="YouTube Video URL"
              value={newProject.videoUrl}
              onChange={(e) => setNewProject({...newProject, videoUrl: e.target.value})}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
            
            <Input
              label="Resource URL (Optional)"
              value={newProject.resourceUrl}
              onChange={(e) => setNewProject({...newProject, resourceUrl: e.target.value})}
              placeholder="https://example.com/resources.zip"
            />
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? 'Adding...' : 'Add Project'}
              </Button>
            </div>
          </form>
        </div>
      )}
      
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
                
                <div className="flex justify-between items-center">
                  {project.resourceUrl && (
                    <Button
                      variant="secondary"
                      onClick={() => window.open(project.resourceUrl, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Resources
                    </Button>
                  )}
                  
                  {isAdmin && (
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteProject(project.id)}
                      className="flex items-center gap-2"
                    >
                      <Trash className="h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </div>
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
  );
};

export default Projects;
