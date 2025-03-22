
import React, { useState } from 'react';
import { Upload, Link2, FolderOpen, FileText, Loader2 } from 'lucide-react';
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

  const handleDriveLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDriveLink(e.target.value);
  };

  const handleDriveLinkSubmit = () => {
    if (!driveLink || !driveLink.includes('drive.google.com')) {
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
            { id: "file1", name: "G1_R101_ProjectProposal.pdf", type: "form", groupNo: "G1", rollNo: "R101" },
            { id: "file2", name: "G1_R101_FinalPresentation.pptx", type: "presentation", groupNo: "G1", rollNo: "R101" },
            { id: "file3", name: "G2_ProjectReport.pdf", type: "report", groupNo: "G2" },
          ]
        },
        {
          name: "BCA",
          files: [
            { id: "file4", name: "G3_R103_ProjectReport.pdf", type: "report", groupNo: "G3", rollNo: "R103" },
            { id: "file5", name: "G4_ProjectProposal.pdf", type: "form", groupNo: "G4" }
          ]
        },
        {
          name: "BTech AI/ML",
          files: [
            { id: "file6", name: "G5_R105_FinalPresentation.pptx", type: "presentation", groupNo: "G5", rollNo: "R105" }
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

  const linkFileToProject = (file: DriveFile) => {
    toast.success(`Linked ${file.name} to group ${file.groupNo}`);
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Google Drive Integration</h3>
      
      {!isConnected ? (
        <div className="flex flex-col space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="driveLink">Google Drive Folder Link</Label>
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Link2 className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="driveLink"
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
              <TabsTrigger value="browse" className="flex-1">Browse Files</TabsTrigger>
              <TabsTrigger value="upload" className="flex-1">Upload New Files</TabsTrigger>
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
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop files here or click to browse
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Files will be uploaded to your connected Google Drive folder
                </p>
                
                <Button
                  variant="outline"
                  className="bg-brand-blue/10 text-brand-blue border-0"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select Files
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
