
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
import { Download, FileUp } from 'lucide-react';
import { generateSampleInternships, filterInternships, exportInternshipTableToPDF } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Filter, InternshipEntry, InternshipData } from '@/lib/types';

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
    
    const filtered = filterInternships(allInternships as unknown as InternshipData[], filters) as unknown as InternshipEntry[];
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
    const updatedInternships = [...allInternships, ...entries];
    
    setAllInternships(updatedInternships);
    setCurrentFilters(metadata);
    
    const filtered = filterInternships(updatedInternships as unknown as InternshipData[], metadata) as unknown as InternshipEntry[];
    setFilteredInternships(filtered);
  };

  const handleExportPDF = () => {
    exportInternshipTableToPDF(
      filteredInternships as unknown as InternshipData[],
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
            </div>
          </motion.div>
          
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
        onUpload={(entries, metadata) => handleUpload(entries as InternshipEntry[], metadata)}
      />
    </div>
  );
};

export default InternshipPortal;
