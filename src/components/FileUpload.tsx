
import React, { useState } from 'react';
import { Upload, Link2, FolderOpen, FileText, Loader2, FileUp, ExternalLink, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger, 
} from '@/components/ui/accordion';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { uploadFile, getFileUrl } from '@/services/supabaseService';

interface FileUploadProps {
  onUploadComplete: (driveLink: string) => void;
  portalType: 'project' | 'internship';
  onAddColumn?: (columnName: string) => void;
}

interface DriveFile {
  id: string;
  name: string;
  type: string;
  groupNo?: string;
  rollNo?: string;
}

type ColumnType = 'form' | 'presentation' | 'report' | 'noc' | 'offerLetter' | 'pop' | 'attendance' | 'custom';

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

  const handleDriveLinkChange = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setDriveLinks(prev => ({
      ...prev,
      [type]: e.target.value
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      toast.success(`Selected file: ${e.target.files[0].name}`);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }
    
    if (!selectedGroup) {
      toast.error('Please select a group to link this file to');
      return;
    }
    
    // Open column selection dialog
    setIsColumnSelectOpen(true);
  };

  const finalizeUpload = async (columnType: ColumnType) => {
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

  const linkFileToProject = (file: DriveFile) => {
    // Open column selection dialog
    setIsColumnSelectOpen(true);
  };

  const getColumnOptions = () => {
    if (portalType === 'project') {
      return [
        { value: 'form', label: 'Form' },
        { value: 'presentation', label: 'Presentation' },
        { value: 'report', label: 'Report' },
        { value: 'custom', label: 'Add New Column...' }
      ];
    } else {
      return [
        { value: 'noc', label: 'NOC' },
        { value: 'offerLetter', label: 'Offer Letter' },
        { value: 'pop', label: 'PoP' },
        { value: 'attendance', label: 'Attendance' },
        { value: 'custom', label: 'Add New Column...' }
      ];
    }
  };

  const handleSelectColumnType = (columnType: ColumnType) => {
    if (columnType === 'custom') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      finalizeUpload(columnType);
    }
  };

  // Get specific drive link sections based on portal type
  const getDriveLinkSections = () => {
    if (portalType === 'project') {
      return [
        { id: 'form', label: 'Form Documents' },
        { id: 'presentation', label: 'Presentation Files' },
        { id: 'report', label: 'Report Documents' }
      ];
    } else {
      return [
        { id: 'noc', label: 'NOC Documents' },
        { id: 'offerLetter', label: 'Offer Letter Files' },
        { id: 'pop', label: 'PoP Documents' }
      ];
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Document Management</h3>
      
      {!isConnected ? (
        <div className="flex flex-col space-y-6">
          <div className="space-y-4">
            {/* Main Drive Link */}
            <div className="space-y-1.5">
              <Label htmlFor="customDriveLink">Custom Drive Link (For Additional Columns)</Label>
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Link2 className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="customDriveLink"
                    type="url"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={driveLinks.main}
                    onChange={(e) => handleDriveLinkChange('main', e)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => handleDriveLinkSubmit('main')}
                  disabled={isUploading || !driveLinks.main}
                  className="bg-brand-blue hover:bg-brand-darkBlue whitespace-nowrap"
                >
                  {isUploading && activeColumnType === 'main' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Connect Drive
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Connect a Google Drive folder for custom columns and additional documents
              </p>
            </div>

            {/* Specific Drive Links */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Document-Specific Drive Links</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getDriveLinkSections().map(section => (
                  <div key={section.id} className="space-y-1.5">
                    <Label htmlFor={`${section.id}DriveLink`}>{section.label}</Label>
                    <div className="flex space-x-2">
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <FileText className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                          id={`${section.id}DriveLink`}
                          type="url"
                          placeholder="https://drive.google.com/drive/folders/..."
                          value={driveLinks[section.id]}
                          onChange={(e) => handleDriveLinkChange(section.id, e)}
                          className="pl-10"
                        />
                      </div>
                      <Button
                        onClick={() => handleDriveLinkSubmit(section.id)}
                        disabled={isUploading || !driveLinks[section.id]}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                      >
                        {isUploading && activeColumnType === section.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
              onClick={() => {
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
              }}
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
              <div className="space-y-2">
                <Label>Course Folders</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {driveFolders.map(folder => (
                    <Button
                      key={folder.name}
                      variant={selectedCourse === folder.name ? "default" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => setSelectedCourse(folder.name)}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      {folder.name}
                      <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {folder.files.length}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
              
              {selectedCourse && (
                <div className="border rounded-md">
                  <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                    <span className="font-medium text-sm">Files in {selectedCourse}</span>
                    <span className="text-xs text-gray-500">
                      {driveFolders.find(f => f.name === selectedCourse)?.files.length || 0} files
                    </span>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {driveFolders
                      .find(f => f.name === selectedCourse)
                      ?.files.map(file => (
                        <AccordionItem key={file.id} value={file.id}>
                          <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{file.name}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-3">
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-gray-500">Type:</span> {file.type}
                                </div>
                                {file.groupNo && (
                                  <div>
                                    <span className="text-gray-500">Group:</span> {file.groupNo}
                                  </div>
                                )}
                                {file.rollNo && (
                                  <div>
                                    <span className="text-gray-500">Roll No:</span> {file.rollNo}
                                  </div>
                                )}
                              </div>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs"
                                onClick={() => linkFileToProject(file)}
                              >
                                Link to {portalType === 'project' ? 'Project' : 'Internship'}
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="groupSelect" className="block mb-1.5">
                      {portalType === 'project' ? 'Group No.' : 'Roll No.'}
                    </Label>
                    <select
                      id="groupSelect"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={selectedGroup || ''}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                    >
                      <option value="">Select {portalType === 'project' ? 'Group' : 'Student'}</option>
                      {portalType === 'project' ? (
                        <>
                          <option value="G1">G1</option>
                          <option value="G2">G2</option>
                          <option value="G3">G3</option>
                          <option value="G4">G4</option>
                          <option value="G5">G5</option>
                        </>
                      ) : (
                        <>
                          <option value="R101">R101</option>
                          <option value="R102">R102</option>
                          <option value="R103">R103</option>
                          <option value="R104">R104</option>
                          <option value="R105">R105</option>
                        </>
                      )}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="fileUpload" className="block mb-1.5">File</Label>
                    <Input
                      id="fileUpload"
                      type="file"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
                
                {selectedFile && (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleFileUpload}
                      disabled={!selectedGroup}
                    >
                      Upload & Link
                    </Button>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">
                    Or drop files here
                  </p>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Drag and drop files here
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: PDF, DOCX, PPTX
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Column Selection Dialog */}
      <Dialog open={isColumnSelectOpen} onOpenChange={setIsColumnSelectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Document Column</DialogTitle>
            <DialogDescription>
              Choose which column this document should be linked to
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {showCustomInput ? (
              <div className="space-y-2">
                <Label htmlFor="customColumn">Custom Column Name</Label>
                <Input
                  id="customColumn"
                  placeholder="Enter column name..."
                  value={customColumnName}
                  onChange={(e) => setCustomColumnName(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  This will create a new column in the table
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {getColumnOptions().map(option => (
                  <Button
                    key={option.value}
                    variant="outline"
                    className="justify-start"
                    onClick={() => handleSelectColumnType(option.value as ColumnType)}
                  >
                    {option.value === 'custom' && <PlusCircle className="h-4 w-4 mr-2" />}
                    {option.value === 'attendance' && <FileText className="h-4 w-4 mr-2 text-blue-500" />}
                    {option.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            {showCustomInput && (
              <>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowCustomInput(false)}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={!customColumnName.trim()} 
                  onClick={() => finalizeUpload('custom')}
                >
                  Add Column
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUpload;
