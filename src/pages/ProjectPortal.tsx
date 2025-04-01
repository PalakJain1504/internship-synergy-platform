import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import FilterSection from '@/components/FilterSection';
import Table from '@/components/Table';
import FileUpload from '@/components/FileUpload';
import UploadModal from '@/components/UploadModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, FileUp } from 'lucide-react';
import { generateSampleProjects, filterProjects, exportTableToPDF } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Filter, ProjectEntry } from '@/lib/types';

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
    if (!isAuthenticated) {
      navigate('/login');
    }

    const sampleData = generateSampleProjects(70).map(p => ({ ...p } as ProjectEntry));
    setAllProjects(sampleData);
    setFilteredProjects(sampleData);
    
    setTimeout(() => setIsLoaded(true), 500);
  }, [isAuthenticated, navigate]);

  const handleFilterChange = (filters: Filter) => {
    setCurrentFilters(filters);
    
    const filtered = filterProjects(allProjects, filters) as ProjectEntry[];
    setFilteredProjects(filtered);
  };

  const handleDataChange = (newData: ProjectEntry[]) => {
    setFilteredProjects(newData);
    
    const updatedAllProjects = allProjects.map(project => {
      const updatedProject = newData.find(p => p.id === project.id);
      return updatedProject || project;
    });
    
    newData.forEach(project => {
      if (!updatedAllProjects.some(p => p.id === project.id)) {
        updatedAllProjects.push(project);
      }
    });
    
    setAllProjects(updatedAllProjects);
  };

  const handleUpload = (entries: ProjectEntry[], metadata: Filter) => {
    const updatedProjects = [...allProjects, ...entries];
    
    setAllProjects(updatedProjects);
    setCurrentFilters(metadata);
    
    const filtered = filterProjects(updatedProjects, metadata) as ProjectEntry[];
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

  const handleAddColumn = (columnName: string) => {
    toast.success(`Added new column: ${columnName}`);
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
          
          <motion.div variants={itemVariants} className="mb-8">
            <FilterSection onFilterChange={handleFilterChange} />
          </motion.div>
          
          <motion.div variants={itemVariants} className="mb-8">
            <FileUpload 
              onUploadComplete={handleDriveConnect} 
              portalType="project"
              onAddColumn={handleAddColumn}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <div className="overflow-hidden border border-gray-200 rounded-lg bg-white">
              <div className="w-full overflow-x-auto">
                <Table
                  data={filteredProjects}
                  onDataChange={handleDataChange}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
      
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={(entries, metadata) => handleUpload(entries as ProjectEntry[], metadata)}
      />
    </div>
  );
};

export default ProjectPortal;
