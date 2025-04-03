
import React from 'react';
import { Upload, Link2, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
                onChange={(e) => onDriveLinkChange('main', e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => onDriveLinkSubmit('main')}
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
                      onChange={(e) => onDriveLinkChange(section.id, e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={() => onDriveLinkSubmit(section.id)}
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
  );
};

export default DriveConnectForm;
