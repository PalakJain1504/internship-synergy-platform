
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
import { Filter, InternshipData } from '@/lib/types';

const InternshipPortal = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [allInternships, setAllInternships] = useState<InternshipData[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<InternshipData[]>([]);
  const [currentFilters, setCurrentFilters] = useState<Filter>({
    year: '',
    semester: '',
    session: '',
    program: '',
  });
  const [pageSize, setPageSize] = useState(50);
  const [dynamicColumns, setDynamicColumns] = useState<string[]>([]);
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }

    const sampleData = generateSampleInternships(40);
    
    // Add session field to sample data
    const withSessionData = sampleData.map(item => ({
      ...item,
      session: Math.random() > 0.5 ? '2024-2025' : '2023-2024'
    }));
    
    const extraColumns = new Set<string>();
    withSessionData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (!["id", "rollNo", "name", "program", "organization", "dates", "noc", "offerLetter", "pop", "year", "semester", "session"].includes(key)) {
          if (key.startsWith('Attendance')) {
            const month = key.replace('Attendance ', '').toLowerCase();
            if (month !== 'may' && month !== 'june') {
              extraColumns.add(key);
            }
          } else {
            extraColumns.add(key);
          }
        }
      });
    });
    
    // Extract available sessions
    const sessions = new Set<string>();
    withSessionData.forEach(item => {
      if (item.session) sessions.add(item.session);
    });
    
    setAvailableSessions(Array.from(sessions));
    setDynamicColumns(Array.from(extraColumns));
    setAllInternships(withSessionData);
    setFilteredInternships(withSessionData);
    
    setTimeout(() => setIsLoaded(true), 500);
  }, [isAuthenticated, navigate]);

  const handleFilterChange = (filters: Filter) => {
    setCurrentFilters(filters);
    
    const filtered = filterInternships(allInternships, filters);
    setFilteredInternships(filtered);
  };

  const handleDataChange = (newData: InternshipData[]) => {
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
    
    // Update available sessions
    const sessions = new Set<string>(availableSessions);
    newData.forEach(item => {
      if (item.session && !sessions.has(item.session)) {
        sessions.add(item.session);
      }
    });
    
    setAvailableSessions(Array.from(sessions));
    setAllInternships(updatedAllInternships);
  };

  const handleUpload = (entries: InternshipData[], metadata: Filter) => {
    // Check for new dynamic columns in the uploaded data
    const newDynamicColumns = new Set<string>(dynamicColumns);
    
    entries.forEach(entry => {
      Object.keys(entry).forEach(key => {
        if (!["id", "rollNo", "name", "program", "organization", "dates", "noc", "offerLetter", "pop", "year", "semester", "session", "isEditing", "isNew"].includes(key)) {
          if (key.startsWith('Attendance')) {
            const month = key.replace('Attendance ', '').toLowerCase();
            if (month !== 'may' && month !== 'june' && !dynamicColumns.includes(key)) {
              newDynamicColumns.add(key);
            }
          } else if (!dynamicColumns.includes(key)) {
            newDynamicColumns.add(key);
          }
        }
      });
    });
    
    // Update dynamic columns if new ones were found
    if (newDynamicColumns.size > dynamicColumns.length) {
      setDynamicColumns(Array.from(newDynamicColumns));
    }
    
    // Update available sessions
    const sessions = new Set<string>(availableSessions);
    entries.forEach(item => {
      if (item.session && !sessions.has(item.session)) {
        sessions.add(item.session);
      }
    });
    
    setAvailableSessions(Array.from(sessions));
    
    // Update internships data by matching on rollNo and program
    const updatedInternships = [...allInternships];
    let newEntries = 0;
    
    entries.forEach(entry => {
      const existingIndex = updatedInternships.findIndex(
        item => item.rollNo === entry.rollNo && item.program === entry.program
      );
      
      if (existingIndex >= 0) {
        // Update existing entry
        updatedInternships[existingIndex] = {
          ...updatedInternships[existingIndex],
          ...entry,
          id: updatedInternships[existingIndex].id // Keep original ID
        };
      } else {
        // Add new entry
        updatedInternships.push(entry);
        newEntries++;
      }
    });
    
    setAllInternships(updatedInternships);
    
    if (newEntries > 0) {
      toast.success(`Added ${newEntries} new entries`);
    } else {
      toast.success(`Updated ${entries.length} existing entries`);
    }
    
    const filtered = filterInternships(updatedInternships, metadata);
    setFilteredInternships(filtered);
    setCurrentFilters(metadata);
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
            <InternshipFilterSection 
              onFilterChange={handleFilterChange} 
              availableSessions={availableSessions}
            />
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
        onUpload={(entries, metadata) => handleUpload(entries as InternshipData[], metadata)}
      />
    </div>
  );
};

export default InternshipPortal;
