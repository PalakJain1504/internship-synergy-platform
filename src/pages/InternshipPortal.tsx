
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import InternshipFilterSection from '@/components/InternshipFilterSection';
import InternshipTable from '@/components/InternshipTable';
import FormCreator from '@/components/FormCreator';
import FormLinkDialog from '@/components/FormLinkDialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, FileUp, FileText } from 'lucide-react';
import { generateSampleInternships, filterInternships, exportInternshipTableToPDF } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Filter, InternshipData } from '@/lib/types';
import UploadModal from '@/components/UploadModal';
import { fetchInternships, uploadMultipleInternships } from '@/services/supabaseService';

const InternshipPortal = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFormCreatorOpen, setIsFormCreatorOpen] = useState(false);
  const [isFormLinkDialogOpen, setIsFormLinkDialogOpen] = useState(false);
  const [formDetails, setFormDetails] = useState({ title: '', url: '' });
  const [allInternships, setAllInternships] = useState<InternshipData[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<InternshipData[]>([]);
  const [currentFilters, setCurrentFilters] = useState<Filter>({
    year: '',
    semester: '',
    session: '',
    program: '',
    facultyCoordinator: '',
  });
  const [pageSize, setPageSize] = useState(50);
  const [dynamicColumns, setDynamicColumns] = useState<string[]>([]);
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const internships = await fetchInternships();
        
        if (internships.length === 0) {
          const sampleData = generateSampleInternships(40);
          const withSessionData = sampleData.map(item => ({
            ...item,
            session: Math.random() > 0.5 ? '2024-2025' : '2023-2024',
            program: ['BTech CSE', 'BTech CSE (FSD)', 'BTech CSE (UI/UX)', 'BTech AI/ML', 'BSc CS', 'BSc DS', 'BSc Cyber', 'BCA', 'BCA (AI/DS)'][Math.floor(Math.random() * 9)]
          }));
          
          setAllInternships(withSessionData);
          setFilteredInternships(withSessionData);
          console.log('Using sample data as no data found in Supabase');
        } else {
          setAllInternships(internships);
          setFilteredInternships(internships);
          console.log('Loaded data from Supabase:', internships.length, 'records');
        }
        
        const sessionsSet = new Set<string>();
        const programsSet = new Set<string>();
        const columnsSet = new Set<string>();
        
        const processedInternships = internships.length > 0 ? internships : allInternships;
        processedInternships.forEach(item => {
          if (item.session) sessionsSet.add(item.session);
          if (item.program) programsSet.add(item.program);
          
          Object.keys(item).forEach(key => {
            if (!["id", "rollNo", "name", "program", "organization", "dates", "noc", "offerLetter", "pop", "year", "semester", "session", "isEditing", "isNew"].includes(key)) {
              if (key.startsWith('Attendance') || !columnsSet.has(key)) {
                columnsSet.add(key);
              }
            }
          });
        });
        
        setAvailableSessions(Array.from(sessionsSet));
        setAvailablePrograms(Array.from(programsSet));
        setDynamicColumns(Array.from(columnsSet));
      } catch (error) {
        console.error('Error loading internships:', error);
        toast.error('Failed to load internship data');
        
        const sampleData = generateSampleInternships(40);
        setAllInternships(sampleData);
        setFilteredInternships(sampleData);
      } finally {
        setLoading(false);
        setIsLoaded(true);
      }
    };
    
    loadData();
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
    setAllInternships(updatedAllInternships);
  };

  const handleUpload = async (entries: InternshipData[], metadata: Filter) => {
    try {
      await uploadMultipleInternships(entries);
      toast.success(`Successfully saved ${entries.length} entries to database`);
      
      const newDynamicColumns = new Set<string>(dynamicColumns);
      
      entries.forEach(entry => {
        Object.keys(entry).forEach(key => {
          if (!["id", "rollNo", "name", "program", "organization", "dates", "noc", "offerLetter", "pop", "year", "semester", "session", "isEditing", "isNew"].includes(key)) {
            if (key.startsWith('Attendance') && !dynamicColumns.includes(key)) {
              newDynamicColumns.add(key);
            } else if (!dynamicColumns.includes(key)) {
              newDynamicColumns.add(key);
            }
          }
        });
      });
      
      if (newDynamicColumns.size > dynamicColumns.length) {
        setDynamicColumns(Array.from(newDynamicColumns));
      }
      
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
      
      const updatedInternships = [...allInternships];
      let newEntries = 0;
      
      entries.forEach(entry => {
        const existingIndex = updatedInternships.findIndex(
          item => item.rollNo === entry.rollNo && item.program === entry.program
        );
        
        if (existingIndex >= 0) {
          updatedInternships[existingIndex] = {
            ...updatedInternships[existingIndex],
            ...entry,
            id: updatedInternships[existingIndex].id
          };
        } else {
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
    } catch (error) {
      console.error('Error uploading internships to Supabase:', error);
      toast.error('Failed to upload internships to database');
    }
  };

  const handleExportPDF = () => {
    exportInternshipTableToPDF(
      filteredInternships,
      currentFilters,
      'Internship Portal - Data Export'
    );
    toast.success('PDF exported successfully');
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

  const handleFormCreated = (formSettings: any, formUrl: string) => {
    setFormDetails({
      title: formSettings.title,
      url: formUrl
    });

    setIsFormLinkDialogOpen(true);
    console.log('Form created:', { formSettings, formUrl });
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
          
          <motion.div className="mb-8">
            <InternshipFilterSection 
              onFilterChange={handleFilterChange} 
              availableSessions={availableSessions}
              availablePrograms={availablePrograms}
              showFacultyCoordinatorOnly={false}
            />
          </motion.div>
          
          <motion.div>
            <div className="overflow-hidden border border-gray-200 rounded-lg bg-white">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-brand-blue/20 mb-4" />
                    <div className="h-2 w-24 bg-brand-blue/20 rounded-full" />
                  </div>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <InternshipTable
                    data={filteredInternships}
                    onDataChange={handleDataChange}
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                    dynamicColumns={dynamicColumns}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>
      
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={(entries, metadata) => handleUpload(entries as InternshipData[], metadata)}
        portalType="internship"
        showOnlyFacultyCoordinator={true}
      />
      
      <FormCreator
        isOpen={isFormCreatorOpen}
        onClose={() => setIsFormCreatorOpen(false)}
        portalType="internship"
        onFormCreated={handleFormCreated}
      />
      
      <FormLinkDialog
        isOpen={isFormLinkDialogOpen}
        onClose={() => setIsFormLinkDialogOpen(false)}
        formTitle={formDetails.title}
        formUrl={formDetails.url}
      />
    </div>
  );
};

export default InternshipPortal;
