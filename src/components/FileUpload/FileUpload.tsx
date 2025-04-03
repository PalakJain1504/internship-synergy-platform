
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import DriveConnectForm from './DriveConnectForm';
import DriveFileBrowser from './DriveFileBrowser';
import LocalFileUploader from './LocalFileUploader';
import ColumnSelectionDialog from './ColumnSelectionDialog';
import { DriveFile } from './types';

interface FileUploadProps {
  onUploadComplete: (driveLink: string) => void;
  portalType: 'project' | 'internship';
  onAddColumn?: (columnName: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete, portalType, onAddColumn }) => {
  const [driveLinks, setDriveLinks] = useState<{[key: string]: string}>({
    main: '',
    form: '',
    presentation: '',
    report: '',
    noc: '',
    offerLetter: '',
    pop: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [driveFolders, setDriveFolders] = useState<{name: string, files: DriveFile[]}[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isColumnSelectOpen, setIsColumnSelectOpen] = useState(false);
  const [customColumnName, setCustomColumnName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [activeColumnType, setActiveColumnType] = useState<string>('');

  const handleDriveLinkChange = (type: string, value: string) => {
    setDriveLinks(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const validateDriveLink = (link: string) => {
    return link && link.includes('drive.google.com');
  };

  const handleDriveLinkSubmit = (type: string) => {
    const link = driveLinks[type];
    if (!validateDriveLink(link)) {
      toast.error('Please enter a valid Google Drive link');
      return;
    }

    setIsUploading(true);
    setActiveColumnType(type);
    
    // Open column selection dialog if it's the main drive link
    if (type === 'main') {
      setIsColumnSelectOpen(true);
    } else {
      // For specific column drive links
      simulateProcessing(type);
    }
  };
  
  const simulateProcessing = (type: string) => {
    // Simulate processing the drive link for a specific column
    setTimeout(() => {
      // Simulate folders found in Drive
      const mockFolders = [
        {
          name: "BTech CSE",
          files: [
            { id: "file1", name: `G1_R101_${type === 'form' ? 'ProjectProposal' : type === 'presentation' ? 'FinalPresentation' : type === 'report' ? 'ProjectReport' : type === 'noc' ? 'NOC' : type === 'offerLetter' ? 'OfferLetter' : 'PoP'}.pdf`, type, groupNo: "G1", rollNo: "R101" },
            { id: "file2", name: `G1_R102_${type === 'form' ? 'ProjectProposal' : type === 'presentation' ? 'FinalPresentation' : type === 'report' ? 'ProjectReport' : type === 'noc' ? 'NOC' : type === 'offerLetter' ? 'OfferLetter' : 'PoP'}.pdf`, type, groupNo: "G1", rollNo: "R102" },
          ]
        },
        {
          name: "BCA",
          files: [
            { id: "file3", name: `G2_R103_${type === 'form' ? 'ProjectProposal' : type === 'presentation' ? 'FinalPresentation' : type === 'report' ? 'ProjectReport' : type === 'noc' ? 'NOC' : type === 'offerLetter' ? 'OfferLetter' : 'PoP'}.pdf`, type, groupNo: "G2", rollNo: "R103" },
          ]
        },
      ];
      
      setDriveFolders(mockFolders);
      setIsConnected(true);
      onUploadComplete(driveLinks[type]);
      setIsUploading(false);
    }, 1500);
  };

  const linkFileToProject = () => {
    // Open column selection dialog
    setIsColumnSelectOpen(true);
  };

  const finalizeUpload = async (columnType: string) => {
    try {
      let columnName: string;
      
      // Handle custom column name for attendance
      if (columnType === 'attendance') {
        const month = new Date().toLocaleString('default', { month: 'long' });
        columnName = `Attendance ${month}`;
      } else if (columnType === 'custom' && customColumnName) {
        columnName = customColumnName;
      } else {
        columnName = columnType;
      }
      
      // In a real app, this would upload to Supabase storage
      // const path = `${selectedGroup}/${columnName}/${selectedFile?.name || 'file'}`;
      // await uploadFile(selectedFile, path);
      // const url = await getFileUrl(path);
      
      toast.success(`Uploaded to column: ${columnName}`);
      
      // Notify parent about new column if it's custom or attendance
      if ((columnType === 'custom' || columnType === 'attendance') && onAddColumn) {
        onAddColumn(columnName);
      }
      
      setIsColumnSelectOpen(false);
      setCustomColumnName('');
      setShowCustomInput(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error('Error uploading file');
      console.error('Upload error:', error);
    }
  };

  const handleSelectColumnType = (columnType: string) => {
    if (columnType === 'custom') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      finalizeUpload(columnType);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setDriveFolders([]);
    setSelectedCourse(null);
    setDriveLinks({
      main: '',
      form: '',
      presentation: '',
      report: '',
      noc: '',
      offerLetter: '',
      pop: ''
    });
  };

  const handleFileUploaderComplete = (file: File, group: string) => {
    setSelectedFile(file);
    setSelectedGroup(group);
    setIsColumnSelectOpen(true);
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Document Management</h3>
      
      {!isConnected ? (
        <DriveConnectForm 
          driveLinks={driveLinks}
          portalType={portalType}
          isUploading={isUploading}
          activeColumnType={activeColumnType}
          onDriveLinkChange={handleDriveLinkChange}
          onDriveLinkSubmit={handleDriveLinkSubmit}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-600">Connected to Google Drive</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
          
          <Tabs defaultValue="browse">
            <TabsList className="w-full">
              <TabsTrigger value="browse" className="flex-1">Browse Drive Files</TabsTrigger>
              <TabsTrigger value="upload" className="flex-1">Upload Local Files</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse" className="space-y-4 pt-4">
              <DriveFileBrowser 
                driveFolders={driveFolders}
                selectedCourse={selectedCourse}
                onCourseSelect={setSelectedCourse}
                onFileSelect={linkFileToProject}
              />
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4 pt-4">
              <LocalFileUploader
                portalType={portalType}
                onUploadComplete={handleFileUploaderComplete}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      <ColumnSelectionDialog
        isOpen={isColumnSelectOpen}
        onClose={() => setIsColumnSelectOpen(false)}
        showCustomInput={showCustomInput}
        customColumnName={customColumnName}
        onCustomColumnNameChange={setCustomColumnName}
        onColumnSelect={handleSelectColumnType}
        onBackClick={() => setShowCustomInput(false)}
        onCustomColumnSubmit={() => finalizeUpload('custom')}
        portalType={portalType}
      />
    </div>
  );
};

export default FileUpload;
