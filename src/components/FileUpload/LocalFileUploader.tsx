
import React, { useState } from 'react';
import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface LocalFileUploaderProps {
  portalType: 'project' | 'internship';
  onUploadComplete: (file: File, group: string) => void;
}

const LocalFileUploader: React.FC<LocalFileUploaderProps> = ({ portalType, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      toast.success(`Selected file: ${e.target.files[0].name}`);
    }
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }
    
    if (!selectedGroup) {
      toast.error('Please select a group to link this file to');
      return;
    }
    
    onUploadComplete(selectedFile, selectedGroup);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="groupSelect" className="block mb-1.5">
            {portalType === 'project' ? 'Group No.' : 'Roll No.'}
          </Label>
          <select
            id="groupSelect"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={selectedGroup}
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
  );
};

export default LocalFileUploader;
