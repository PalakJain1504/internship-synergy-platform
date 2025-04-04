import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import FilterSection from '@/components/FilterSection';
import Table from '@/components/Table';
import FormCreator from '@/components/FormCreator';
import FormLinkDialog from '@/components/FormLinkDialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, FileUp, FileText } from 'lucide-react';
import { generateSampleProjects, filterProjects, exportTableToPDF } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Filter, ProjectData } from '@/lib/types';
import UploadModal from '@/components/UploadModal';

const ProjectPortal = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFormCreatorOpen, setIsFormCreatorOpen] = useState(false);
  const [isFormLinkDialogOpen, setIsFormLinkDialogOpen] = useState(false);
  const [formDetails, setFormDetails] = useState({ title: '', url: '', embedCode: '' });
  const [allProjects, setAllProjects] = useState<ProjectData[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectData[]>([]);
  const [currentFilters, setCurrentFilters] = useState<Filter>({
    year: '',
    semester: '',
    session: '',
    facultyCoordinator: '',
    program: '',
  });
  const [pageSize, setPageSize] = useState(50);
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }

    const sampleData = generateSampleProjects(70);
    
    const withSessionData = sampleData.map(item => ({
      ...item,
      session: Math.random() > 0.5 ? '2024-2025' : '2023-2024',
      program: ['BTech CSE', 'BTech CSE (FSD)', 'BTech CSE (UI/UX)', 'BTech AI/ML', 'BSc CS', 'BSc DS', 'BSc Cyber', 'BCA', 'BCA (AI/DS)'][Math.floor(Math.random() * 9)]
    }));
    
    const sessions = new Set<string>();
    const programs = new Set<string>();
    
    withSessionData.forEach(item => {
      if (item.session) sessions.add(item.session);
      if (item.program) programs.add(item.program);
    });
    
    setAvailableSessions(Array.from(sessions));
    setAvailablePrograms(Array.from(programs));
    setAllProjects(withSessionData);
    setFilteredProjects(withSessionData);
    
    setTimeout(() => setIsLoaded(true), 500);
  }, [isAuthenticated, navigate]);

  const handleFilterChange = (filters: Filter) => {
    setCurrentFilters(filters);
    
    const filtered = filterProjects(allProjects, filters);
    setFilteredProjects(filtered);
  };

  const handleDataChange = (newData: ProjectData[]) => {
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
    
    const sessions = new Set<string>(availableSessions);
    const programs = new Set<string>(availablePrograms);
    
    newData.forEach(item => {
      if (item.session && !sessions.has(item.session)) {
        sessions.add(item.session);
      }
      if (item.program && !programs.has(item.program)) {
        programs.add(item.program);
      }
    });
    
    setAvailableSessions(Array.from(sessions));
    setAvailablePrograms(Array.from(programs));
    setAllProjects(updatedAllProjects);
  };

  const handleUpload = (entries: ProjectData[], metadata: Filter) => {
    const sessions = new Set<string>(availableSessions);
    const programs = new Set<string>(availablePrograms);
    
    entries.forEach(item => {
      if (item.session && !sessions.has(item.session)) {
        sessions.add(item.session);
      }
      if (item.program && !programs.has(item.program)) {
        programs.add(item.program);
      }
    });
    
    setAvailableSessions(Array.from(sessions));
    setAvailablePrograms(Array.from(programs));
    
    const updatedProjects = [...allProjects];
    let newEntries = 0;
    
    entries.forEach(entry => {
      const existingIndex = updatedProjects.findIndex(
        item => item.rollNo === entry.rollNo && item.groupNo === entry.groupNo
      );
      
      if (existingIndex >= 0) {
        updatedProjects[existingIndex] = {
          ...updatedProjects[existingIndex],
          ...entry,
          id: updatedProjects[existingIndex].id
        };
      } else {
        updatedProjects.push(entry);
        newEntries++;
      }
    });
    
    setAllProjects(updatedProjects);
    setCurrentFilters(metadata);
    
    if (newEntries > 0) {
      toast.success(`Added ${newEntries} new entries`);
    } else {
      toast.success(`Updated ${entries.length} existing entries`);
    }
    
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

  const handleFormCreated = (formSettings: any, formUrl: string, embedCode: string) => {
    setFormDetails({
      title: formSettings.title,
      url: formUrl,
      embedCode
    });

    setIsFormLinkDialogOpen(true);
    
    console.log('Form created:', { formSettings, formUrl, embedCode });
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
                onClick={() => setIsFormCreatorOpen(true)}
                className="bg-white text-gray-700 border-gray-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                Create Form
              </Button>
              
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
            <FilterSection 
              onFilterChange={handleFilterChange}
              availableSessions={availableSessions}
              availablePrograms={availablePrograms}
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
        onUpload={(entries, metadata) => handleUpload(entries as ProjectData[], metadata)}
      />

      <FormCreator
        isOpen={isFormCreatorOpen}
        onClose={() => setIsFormCreatorOpen(false)}
        portalType="project"
        onFormCreated={handleFormCreated}
      />
      
      <FormLinkDialog
        isOpen={isFormLinkDialogOpen}
        onClose={() => setIsFormLinkDialogOpen(false)}
        formTitle={formDetails.title}
        formUrl={formDetails.url}
        embedCode={formDetails.embedCode}
      />
    </div>
  );
};

export default ProjectPortal;
