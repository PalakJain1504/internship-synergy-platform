
import React, { useState } from 'react';
import { Upload, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface FileUploadProps {
  onUploadComplete: (driveLink: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [driveLink, setDriveLink] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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
      onUploadComplete(driveLink);
      toast.success('Drive link connected successfully');
      setDriveLink('');
      setIsUploading(false);
    }, 1500);
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Upload from Google Drive</h3>
      
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
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
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
    </div>
  );
};

export default FileUpload;
