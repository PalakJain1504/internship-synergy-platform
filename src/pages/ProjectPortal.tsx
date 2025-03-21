
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import FilterSection from '@/components/FilterSection';
import Table, { ProjectEntry } from '@/components/Table';
import FileUpload from '@/components/FileUpload';
import UploadModal from '@/components/UploadModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, Upload, FileUp } from 'lucide-react';
import { generateSampleProjects, filterProjects, exportTableToPDF } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Filter } from '@/lib/types';

const ProjectPortal = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [allProjects, setAllProjects] = useState<ProjectEntry[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectEntry[]>([]);
  const [currentFilters, setCurrentFilters] = useState<Filter>({
    year: '',
    semester: '',
    course: '',
    facultyCoordinator: '',
  });
  const [pageSize, setPageSize] = useState(50);
  const [driveConnected, setDriveConnected] = useState(false);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login');
    }

    // Generate sample data
    const sampleData = generateSampleProjects(30).map(p => ({ ...p } as ProjectEntry));
    setAllProjects(sampleData);
    setFilteredProjects(sampleData);
    
    // Simulate loading
    setTimeout(() => setIsLoaded(true), 500);
  }, [isAuthenticated, navigate]);

  const handleFilterChange = (filters: Filter) => {
    setCurrentFilters(filters);
    
    // Apply filters to projects - modify the filterProjects function to handle the new "all-xxx" values
    const filtered = filterProjects(allProjects, filters);
    setFilteredProjects(filtered);
  };

  const handleDataChange = (newData: ProjectEntry[]) => {
    setFilteredProjects(newData);
    
    // Update the all projects list with the changes
    const updatedAllProjects = allProjects.map(project => {
      const updatedProject = newData.find(p => p.id === project.id);
      return updatedProject || project;
    });
    
    // Add any new projects that weren't in the original list
    newData.forEach(project => {
      if (!updatedAllProjects.some(p => p.id === project.id)) {
        updatedAllProjects.push(project);
      }
    });
    
    setAllProjects(updatedAllProjects);
  };

  const handleUpload = (entries: ProjectEntry[], metadata: Filter) => {
    // Update filters to match the uploaded data
    setCurrentFilters(metadata);
    
    // Add new entries to the data
    const updatedProjects = [...allProjects, ...entries];
    setAllProjects(updatedProjects);
    
    // Apply current filters to updated data
    const filtered = filterProjects(updatedProjects, metadata);
    setFilteredProjects(filtered);
  };

  const handleExportPDF = () => {
    exportTableToPDF(
      filteredProjects,
      currentFilters,
      'Project Portal - Data Export'
    );
    toast.success('PDF exported successfully');
  };

  const handleDriveConnect = (driveLink: string) => {
    console.log('Connected to Google Drive:', driveLink);
    setDriveConnected(true);
    toast.success('Successfully connected to Google Drive');
  };

  if (!isAuthenticated || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-brand-blue/20 mb-4" />
          <div className="h-2 w-24 bg-brand-blue/20 rounded-full" />
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Progress Port" />
      
      <main className="page-container">
        <motion.div
          className="w-full max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Project Portal</h1>
              <p className="text-gray-500 text-sm">
                Manage and track student projects
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              <Button
                variant="outline"
                onClick={handleExportPDF}
                className="bg-white text-gray-700 border-gray-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-white text-gray-700 border-gray-200"
              >
                <FileUp className="h-4 w-4 mr-2" />
                Upload Excel
              </Button>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="mb-6">
            <FilterSection onFilterChange={handleFilterChange} />
          </motion.div>
          
          <motion.div variants={itemVariants} className="mb-6">
            <FileUpload onUploadComplete={handleDriveConnect} />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Table
              data={filteredProjects}
              onDataChange={handleDataChange}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          </motion.div>
        </motion.div>
      </main>
      
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default ProjectPortal;
