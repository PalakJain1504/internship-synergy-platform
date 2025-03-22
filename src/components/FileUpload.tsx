import React, { useState } from 'react';
import { Upload, Link2, FolderOpen, FileText, Loader2, FileUp } from 'lucide-react';
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
import { uploadFile, getFileUrl } from '@/services/supabaseService';

interface FileUploadProps {
  onUploadComplete: (driveLink: string) => void;
}

interface DriveFile {
  id: string;
  name: string;
  type: 'form' | 'presentation' | 'report';
  groupNo: string;
  rollNo?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [driveLink, setDriveLink] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [driveFolders, setDriveFolders] = useState<{name: string, files: DriveFile[]}[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'form' | 'presentation' | 'report'>('form');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Document specific drive links
  const [formDriveLink, setFormDriveLink] = useState('');
  const [presentationDriveLink, setPresentationDriveLink] = useState('');
  const [reportDriveLink, setReportDriveLink] = useState('');
  const [formUploading, setFormUploading] = useState(false);
  const [presentationUploading, setPresentationUploading] = useState(false);
  const [reportUploading, setReportUploading] = useState(false);

  const handleDriveLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDriveLink(e.target.value);
  };

  const handleFormDriveLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormDriveLink(e.target.value);
  };

  const handlePresentationDriveLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPresentationDriveLink(e.target.value);
  };

  const handleReportDriveLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReportDriveLink(e.target.value);
  };

  const validateDriveLink = (link: string) => {
    return link && link.includes('drive.google.com');
  };

  const handleDriveLinkSubmit = () => {
    if (!validateDriveLink(driveLink)) {
      toast.error('Please enter a valid Google Drive link');
      return;
    }

    setIsUploading(true);
    
    // Simulate processing the drive link
    setTimeout(() => {
      // Simulate folders found in Drive
      const mockFolders = [
        {
          name: "BTech CSE",
          files: [
            { id: "file1", name: "G1_R101_ProjectProposal.pdf", type: 'form' as const, groupNo: "G1", rollNo: "R101" },
            { id: "file2", name: "G1_R101_FinalPresentation.pptx", type: 'presentation' as const, groupNo: "G1", rollNo: "R101" },
            { id: "file3", name: "G2_ProjectReport.pdf", type: 'report' as const, groupNo: "G2" },
          ]
        },
        {
          name: "BCA",
          files: [
            { id: "file4", name: "G3_R103_ProjectReport.pdf", type: 'report' as const, groupNo: "G3", rollNo: "R103" },
            { id: "file5", name: "G4_ProjectProposal.pdf", type: 'form' as const, groupNo: "G4" }
          ]
        },
        {
          name: "BTech AI/ML",
          files: [
            { id: "file6", name: "G5_R105_FinalPresentation.pptx", type: 'presentation' as const, groupNo: "G5", rollNo: "R105" }
          ]
        }
      ];
      
      setDriveFolders(mockFolders);
      setIsConnected(true);
      onUploadComplete(driveLink);
      toast.success('Drive link connected successfully');
      setIsUploading(false);
    }, 1500);
  };

  const handleFormDriveLinkSubmit = () => {
    if (!validateDriveLink(formDriveLink)) {
      toast.error('Please enter a valid Google Drive link for forms');
      return;
    }

    setFormUploading(true);
    
    // Simulate processing
    setTimeout(() => {
      toast.success('Form files drive link connected successfully');
      setFormUploading(false);
    }, 1000);
  };

  const handlePresentationDriveLinkSubmit = () => {
    if (!validateDriveLink(presentationDriveLink)) {
      toast.error('Please enter a valid Google Drive link for presentations');
      return;
    }

    setPresentationUploading(true);
    
    // Simulate processing
    setTimeout(() => {
      toast.success('Presentation files drive link connected successfully');
      setPresentationUploading(false);
    }, 1000);
  };

  const handleReportDriveLinkSubmit = () => {
    if (!validateDriveLink(reportDriveLink)) {
      toast.error('Please enter a valid Google Drive link for reports');
      return;
    }

    setReportUploading(true);
    
    // Simulate processing
    setTimeout(() => {
      toast.success('Report files drive link connected successfully');
      setReportUploading(false);
    }, 1000);
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
    
    try {
      // In a real app, this would upload to Supabase storage
      // const path = `${selectedGroup}/${uploadType}/${selectedFile.name}`;
      // await uploadFile(selectedFile, path);
      // const url = await getFileUrl(path);
      
      toast.success(`Uploaded ${selectedFile.name} as ${uploadType} for group ${selectedGroup}`);
      setSelectedFile(null);
    } catch (error) {
      toast.error('Error uploading file');
      console.error('Upload error:', error);
    }
  };

  const linkFileToProject = (file: DriveFile) => {
    toast.success(`Linked ${file.name} to group ${file.groupNo}`);
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Document Management</h3>
      
      {!isConnected ? (
        <div className="flex flex-col space-y-6">
          <div className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="mainDriveLink">Main Google Drive Folder Link</Label>
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Link2 className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="mainDriveLink"
                    type="url"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={driveLink}
                    onChange={handleDriveLinkChange}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={handleDriveLinkSubmit}
                  disabled={isUploading || !driveLink}
                  className="bg-brand-blue hover:bg-brand-darkBlue whitespace-nowrap"
                >
                  {isUploading ? (
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
                Connect a Google Drive folder containing project documents
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Form Drive Link */}
            <div className="space-y-1.5 p-4 border border-gray-100 rounded-md">
              <Label htmlFor="formDriveLink" className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                Form Documents Drive Link
              </Label>
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  <Input
                    id="formDriveLink"
                    type="url"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={formDriveLink}
                    onChange={handleFormDriveLinkChange}
                  />
                </div>
                <Button
                  onClick={handleFormDriveLinkSubmit}
                  disabled={formUploading || !formDriveLink}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {formUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Forms and proposals
              </p>
            </div>

            {/* Presentation Drive Link */}
            <div className="space-y-1.5 p-4 border border-gray-100 rounded-md">
              <Label htmlFor="presentationDriveLink" className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-green-500" />
                Presentation Documents Drive Link
              </Label>
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  <Input
                    id="presentationDriveLink"
                    type="url"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={presentationDriveLink}
                    onChange={handlePresentationDriveLinkChange}
                  />
                </div>
                <Button
                  onClick={handlePresentationDriveLinkSubmit}
                  disabled={presentationUploading || !presentationDriveLink}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {presentationUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Presentations and slides
              </p>
            </div>

            {/* Report Drive Link */}
            <div className="space-y-1.5 p-4 border border-gray-100 rounded-md">
              <Label htmlFor="reportDriveLink" className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-red-500" />
                Report Documents Drive Link
              </Label>
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  <Input
                    id="reportDriveLink"
                    type="url"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={reportDriveLink}
                    onChange={handleReportDriveLinkChange}
                  />
                </div>
                <Button
                  onClick={handleReportDriveLinkSubmit}
                  disabled={reportUploading || !reportDriveLink}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {reportUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Final reports and documentation
              </p>
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
                setDriveLink('');
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
                                <div>
                                  <span className="text-gray-500">Group:</span> {file.groupNo}
                                </div>
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
                                Link to Project
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="uploadType" className="block mb-1.5">Document Type</Label>
                    <select 
                      id="uploadType"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value as 'form' | 'presentation' | 'report')}
                    >
                      <option value="form">Form</option>
                      <option value="presentation">Presentation</option>
                      <option value="report">Report</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="groupSelect" className="block mb-1.5">Group No.</Label>
                    <select
                      id="groupSelect"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={selectedGroup || ''}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                    >
                      <option value="">Select Group</option>
                      <option value="G1">G1</option>
                      <option value="G2">G2</option>
                      <option value="G3">G3</option>
                      <option value="G4">G4</option>
                      <option value="G5">G5</option>
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
    </div>
  );
};

export default FileUpload;
