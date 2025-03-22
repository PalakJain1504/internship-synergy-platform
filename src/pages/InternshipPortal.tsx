import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import InternshipFilterSection from '@/components/InternshipFilterSection';
import InternshipTable from '@/components/InternshipTable';
import FileUpload from '@/components/FileUpload';
import UploadModal from '@/components/UploadModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, Upload, FileUp, InfoIcon } from 'lucide-react';
import { generateSampleInternships, filterInternships, exportInternshipTableToPDF } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Filter, InternshipEntry } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const InternshipPortal = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [allInternships, setAllInternships] = useState<InternshipEntry[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<InternshipEntry[]>([]);
  const [currentFilters, setCurrentFilters] = useState<Filter>({
    year: '',
    semester: '',
    course: '',
  });
  const [pageSize, setPageSize] = useState(50);
  const [driveConnected, setDriveConnected] = useState(false);
  const [showDemoAlert, setShowDemoAlert] = useState(true);
  const [dynamicColumns, setDynamicColumns] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }

    const sampleData = generateSampleInternships(40).map(p => ({ ...p } as InternshipEntry));
    
    const extraColumns = new Set<string>();
    sampleData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (!["id", "rollNo", "name", "program", "organization", "dates", "noc", "offerLetter", "pop", "year", "semester", "course"].includes(key)) {
          extraColumns.add(key);
        }
      });
    });
    
    setDynamicColumns(Array.from(extraColumns));
    setAllInternships(sampleData);
    setFilteredInternships(sampleData);
    
    setTimeout(() => setIsLoaded(true), 500);
  }, [isAuthenticated, navigate]);

  const handleFilterChange = (filters: Filter) => {
    setCurrentFilters(filters);
    
    const filtered = filterInternships(allInternships, filters);
    setFilteredInternships(filtered);
  };

  const handleDataChange = (newData: InternshipEntry[]) => {
    setFilteredInternships(newData);
    
    const updatedAllInternships = allInternships.map(internship => {
      const updatedInternship = newData.find(p => p.id === internship.id);
      return updatedInternship || internship;
    });
    
    newData.forEach(internship => {
      if (!updatedAllInternships.some(p => p.id === internship.id)) {
        updatedAllInternships.push(internship);
      }
    });
    
    setAllInternships(updatedAllInternships);
  };

  const handleUpload = (entries: InternshipEntry[], metadata: Filter) => {
    const updatedInternships = showDemoAlert ? [...allInternships, ...entries] : entries;
    
    if (!showDemoAlert) {
      toast.success('Demo data cleared. Only uploaded data will be shown.');
    }
    
    setAllInternships(updatedInternships);
    setCurrentFilters(metadata);
    
    const filtered = filterInternships(updatedInternships, metadata);
    setFilteredInternships(filtered);
    
    setShowDemoAlert(false);
  };

  const handleExportPDF = () => {
    exportInternshipTableToPDF(
      filteredInternships,
      currentFilters,
      'Internship Portal - Data Export'
    );
    toast.success('PDF exported successfully');
  };

  const handleDriveConnect = (driveLink: string) => {
    console.log('Connected to Google Drive:', driveLink);
    setDriveConnected(true);
    toast.success('Successfully connected to Google Drive');
  };

  const clearDemoData = () => {
    setAllInternships([]);
    setFilteredInternships([]);
    setShowDemoAlert(false);
    toast.success('Demo data cleared. System ready for fresh data upload.');
  };

  const handleAddColumn = (columnName: string) => {
    if (!dynamicColumns.includes(columnName)) {
      setDynamicColumns([...dynamicColumns, columnName]);
      toast.success(`Added new column: ${columnName}`);
      
      const updatedInternships = allInternships.map(internship => ({
        ...internship,
        [columnName]: ''
      }));
      setAllInternships(updatedInternships);
      
      const updatedFiltered = filteredInternships.map(internship => ({
        ...internship,
        [columnName]: ''
      }));
      setFilteredInternships(updatedFiltered);
    }
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
          initial="hidden"
          animate="visible"
        >
          <motion.div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Internship Portal</h1>
              <p className="text-gray-500 text-sm">
                Manage and track student internships
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
            <motion.div className="mb-6">
              <Alert className="bg-blue-50 border-blue-200">
                <InfoIcon className="h-4 w-4 text-blue-500" />
                <AlertTitle>Demo Mode Active</AlertTitle>
                <AlertDescription className="text-sm">
                  <p>Currently showing demo data. This application is connected to Supabase for backend functionality.</p>
                  <p className="mt-1"><strong>Database:</strong> PostgreSQL (via Supabase)</p>
                  <p><strong>Platform:</strong> React application with Supabase backend</p>
                  <p><strong>ORM:</strong> Supabase client library (direct database access)</p>
                  <p className="mt-2 text-blue-600">Data is currently stored in-memory. In production, all data would be persisted in Supabase.</p>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          
          <motion.div className="mb-8">
            <InternshipFilterSection onFilterChange={handleFilterChange} />
          </motion.div>
          
          <motion.div className="mb-8">
            <FileUpload 
              onUploadComplete={handleDriveConnect} 
              portalType="internship"
              onAddColumn={handleAddColumn}
            />
          </motion.div>
          
          <motion.div>
            <div className="overflow-hidden border border-gray-200 rounded-lg bg-white">
              <div className="w-full overflow-x-auto">
                <InternshipTable
                  data={filteredInternships}
                  onDataChange={handleDataChange}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                  dynamicColumns={dynamicColumns}
                />
              </div>
            </div>
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

export default InternshipPortal;
