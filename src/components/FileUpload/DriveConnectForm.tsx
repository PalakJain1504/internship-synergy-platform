
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Link } from 'lucide-react';

interface DriveConnectFormProps {
  driveLinks: {[key: string]: string};
  portalType: 'project' | 'internship';
  isUploading: boolean;
  activeColumnType: string;
  onDriveLinkChange: (type: string, value: string) => void;
  onDriveLinkSubmit: (type: string) => void;
}

const DriveConnectForm: React.FC<DriveConnectFormProps> = ({ 
  driveLinks, 
  portalType,
  isUploading,
  activeColumnType,
  onDriveLinkChange, 
  onDriveLinkSubmit 
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="mainDriveLink" className="text-xs font-medium">
            Main Google Drive Folder
          </Label>
          <div className="flex mt-1">
            <Input
              id="mainDriveLink"
              placeholder="https://drive.google.com/drive/folders/..."
              value={driveLinks.main}
              onChange={(e) => onDriveLinkChange('main', e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => onDriveLinkSubmit('main')}
              className="ml-2 whitespace-nowrap"
              disabled={isUploading && activeColumnType === 'main'}
            >
              {isUploading && activeColumnType === 'main' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This should be the main folder containing all documents for {portalType === 'project' ? 'projects' : 'internships'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Specific Document Folders</h4>
        <p className="text-xs text-gray-500">
          Connect to specific document type folders for better organization
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portalType === 'project' ? (
            <>
              <div>
                <Label htmlFor="formDriveLink" className="text-xs font-medium">
                  Project Proposal Forms
                </Label>
                <div className="flex mt-1">
                  <Input
                    id="formDriveLink"
                    placeholder="Google Drive Folder URL"
                    value={driveLinks.form}
                    onChange={(e) => onDriveLinkChange('form', e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => onDriveLinkSubmit('form')} 
                    className="ml-2"
                    size="sm"
                    disabled={isUploading && activeColumnType === 'form'}
                  >
                    {isUploading && activeColumnType === 'form' ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="presentationDriveLink" className="text-xs font-medium">
                  Presentations
                </Label>
                <div className="flex mt-1">
                  <Input
                    id="presentationDriveLink"
                    placeholder="Google Drive Folder URL"
                    value={driveLinks.presentation}
                    onChange={(e) => onDriveLinkChange('presentation', e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => onDriveLinkSubmit('presentation')} 
                    className="ml-2"
                    size="sm"
                    disabled={isUploading && activeColumnType === 'presentation'}
                  >
                    {isUploading && activeColumnType === 'presentation' ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="reportDriveLink" className="text-xs font-medium">
                  Project Reports
                </Label>
                <div className="flex mt-1">
                  <Input
                    id="reportDriveLink"
                    placeholder="Google Drive Folder URL"
                    value={driveLinks.report}
                    onChange={(e) => onDriveLinkChange('report', e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => onDriveLinkSubmit('report')} 
                    className="ml-2"
                    size="sm"
                    disabled={isUploading && activeColumnType === 'report'}
                  >
                    {isUploading && activeColumnType === 'report' ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="nocDriveLink" className="text-xs font-medium">
                  NOC Documents
                </Label>
                <div className="flex mt-1">
                  <Input
                    id="nocDriveLink"
                    placeholder="Google Drive Folder URL"
                    value={driveLinks.noc}
                    onChange={(e) => onDriveLinkChange('noc', e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => onDriveLinkSubmit('noc')} 
                    className="ml-2"
                    size="sm"
                    disabled={isUploading && activeColumnType === 'noc'}
                  >
                    {isUploading && activeColumnType === 'noc' ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="offerLetterDriveLink" className="text-xs font-medium">
                  Offer Letters
                </Label>
                <div className="flex mt-1">
                  <Input
                    id="offerLetterDriveLink"
                    placeholder="Google Drive Folder URL"
                    value={driveLinks.offerLetter}
                    onChange={(e) => onDriveLinkChange('offerLetter', e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => onDriveLinkSubmit('offerLetter')} 
                    className="ml-2"
                    size="sm"
                    disabled={isUploading && activeColumnType === 'offerLetter'}
                  >
                    {isUploading && activeColumnType === 'offerLetter' ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="popDriveLink" className="text-xs font-medium">
                  Proof of Participation
                </Label>
                <div className="flex mt-1">
                  <Input
                    id="popDriveLink"
                    placeholder="Google Drive Folder URL"
                    value={driveLinks.pop}
                    onChange={(e) => onDriveLinkChange('pop', e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => onDriveLinkSubmit('pop')} 
                    className="ml-2"
                    size="sm"
                    disabled={isUploading && activeColumnType === 'pop'}
                  >
                    {isUploading && activeColumnType === 'pop' ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriveConnectForm;
