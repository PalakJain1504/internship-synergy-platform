
import React from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColumnSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  showCustomInput: boolean;
  customColumnName: string;
  onCustomColumnNameChange: (value: string) => void;
  onColumnSelect: (columnType: string) => void;
  onBackClick: () => void;
  onCustomColumnSubmit: () => void;
  portalType: 'project' | 'internship';
}

const ColumnSelectionDialog: React.FC<ColumnSelectionDialogProps> = ({
  isOpen,
  onClose,
  showCustomInput,
  customColumnName,
  onCustomColumnNameChange,
  onColumnSelect,
  onBackClick,
  onCustomColumnSubmit,
  portalType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {showCustomInput ? (
              <button
                onClick={onBackClick}
                className="mr-2 p-1 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : null}
            {showCustomInput ? 'Enter Custom Column Name' : 'Select Column Type'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {showCustomInput ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customColumnName">Column Name</Label>
              <Input
                id="customColumnName"
                placeholder="e.g., Certificate, Review, etc."
                value={customColumnName}
                onChange={(e) => onCustomColumnNameChange(e.target.value)}
                autoFocus
              />
            </div>
            <Button
              className="w-full"
              onClick={onCustomColumnSubmit}
              disabled={!customColumnName.trim()}
            >
              Save
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {portalType === 'project' ? (
              <>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center" onClick={() => onColumnSelect('form')}>
                  <span className="text-sm font-medium">Form</span>
                  <span className="text-xs text-gray-500 mt-1">Project Proposal</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center" onClick={() => onColumnSelect('presentation')}>
                  <span className="text-sm font-medium">Presentation</span>
                  <span className="text-xs text-gray-500 mt-1">Final Slides</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center" onClick={() => onColumnSelect('report')}>
                  <span className="text-sm font-medium">Report</span>
                  <span className="text-xs text-gray-500 mt-1">Project Documentation</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center" onClick={() => onColumnSelect('noc')}>
                  <span className="text-sm font-medium">NOC</span>
                  <span className="text-xs text-gray-500 mt-1">No Objection Certificate</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center" onClick={() => onColumnSelect('offerLetter')}>
                  <span className="text-sm font-medium">Offer Letter</span>
                  <span className="text-xs text-gray-500 mt-1">Internship Confirmation</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center" onClick={() => onColumnSelect('pop')}>
                  <span className="text-sm font-medium">PoP</span>
                  <span className="text-xs text-gray-500 mt-1">Proof of Participation</span>
                </Button>
              </>
            )}
            
            <Button variant="outline" className="h-auto py-3 flex flex-col items-center" onClick={() => onColumnSelect('attendance')}>
              <span className="text-sm font-medium">Attendance</span>
              <span className="text-xs text-gray-500 mt-1">Monthly Record</span>
            </Button>
            
            <Button variant="outline" className="h-auto py-3 flex flex-col items-center col-span-2" onClick={() => onColumnSelect('custom')}>
              <span className="text-sm font-medium">Custom Column</span>
              <span className="text-xs text-gray-500 mt-1">Define Your Own</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnSelectionDialog;
