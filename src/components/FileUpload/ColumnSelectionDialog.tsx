
import React from 'react';
import { PlusCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ColumnSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  showCustomInput: boolean;
  customColumnName: string;
  onCustomColumnNameChange: (name: string) => void;
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
  portalType
}) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                onChange={(e) => onCustomColumnNameChange(e.target.value)}
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
                  onClick={() => onColumnSelect(option.value)}
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
                onClick={onBackClick}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={!customColumnName.trim()} 
                onClick={onCustomColumnSubmit}
              >
                Add Column
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnSelectionDialog;
