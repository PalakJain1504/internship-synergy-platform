
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
import { Download, Upload, FileUp, DatabaseIcon, InfoIcon } from 'lucide-react';
import { generateSampleProjects, filterProjects, exportTableToPDF } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Filter } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const [showDemoAlert, setShowDemoAlert] = useState(true);

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
    
    // Apply filters to projects
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
    // Clear demo data if requested
    const updatedProjects = showDemoAlert ? [...allProjects, ...entries] : entries;
    
    if (!showDemoAlert) {
      toast.success('Demo data cleared. Only uploaded data will be shown.');
    }
    
    setAllProjects(updatedProjects);
    setCurrentFilters(metadata);
    
    // Apply current filters to updated data
    const filtered = filterProjects(updatedProjects, metadata);
    setFilteredProjects(filtered);
    
    setShowDemoAlert(false);
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

  const clearDemoData = () => {
    setAllProjects([]);
    setFilteredProjects([]);
    setShowDemoAlert(false);
    toast.success('Demo data cleared. System ready for fresh data upload.');
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
              
              {showDemoAlert && (
                <Button
                  variant="outline"
                  onClick={clearDemoData}
                  className="bg-white text-red-600 border-red-200"
                >
                  Clear Demo Data
                </Button>
              )}
            </div>
          </motion.div>
          
          {showDemoAlert && (
            <motion.div variants={itemVariants} className="mb-6">
              <Alert className="bg-blue-50 border-blue-200">
                <InfoIcon className="h-4 w-4 text-blue-500" />
                <AlertTitle>Demo Mode Active</AlertTitle>
                <AlertDescription className="text-sm">
                  <p>Currently showing demo data. This application is running in frontend-only mode with data stored in memory.</p>
                  <p className="mt-1"><strong>Database:</strong> None (in-memory state storage only)</p>
                  <p><strong>Platform:</strong> Frontend-only React application</p>
                  <p><strong>ORM:</strong> None (simulated data storage)</p>
                  <p className="mt-2 text-blue-600">To implement with a real database, you would need to add a backend service with MongoDB, MySQL, or a similar database.</p>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          
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
