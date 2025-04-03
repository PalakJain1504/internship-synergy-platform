
import React from 'react';
import { FolderOpen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { DriveFile } from './types';

interface DriveFileBrowserProps {
  driveFolders: {name: string, files: DriveFile[]}[];
  selectedCourse: string | null;
  onCourseSelect: (course: string) => void;
  onFileSelect: () => void;
}

const DriveFileBrowser: React.FC<DriveFileBrowserProps> = ({
  driveFolders,
  selectedCourse,
  onCourseSelect,
  onFileSelect
}) => {
  return (
    <div className="space-y-2">
      <Label>Course Folders</Label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {driveFolders.map(folder => (
          <Button
            key={folder.name}
            variant={selectedCourse === folder.name ? "default" : "outline"}
            size="sm"
            className="justify-start"
            onClick={() => onCourseSelect(folder.name)}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            {folder.name}
            <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
              {folder.files.length}
            </span>
          </Button>
        ))}
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
                        onClick={onFileSelect}
                      >
                        Link to Project/Internship
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default DriveFileBrowser;
