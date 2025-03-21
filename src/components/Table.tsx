
import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  FileText,
  Upload,
  Download,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

export interface ProjectEntry {
  id: string;
  groupNo: string;
  rollNo: string;
  name: string;
  email: string;
  phoneNo: string;
  title: string;
  domain: string;
  facultyMentor: string;
  industryMentor: string;
  form: string;
  presentation: string;
  report: string;
  year: string;
  semester: string;
  course: string;
  facultyCoordinator: string;
  isEditing?: boolean;
  isNew?: boolean;
}

interface TableProps {
  data: ProjectEntry[];
  onDataChange: (newData: ProjectEntry[]) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

const Table: React.FC<TableProps> = ({
  data,
  onDataChange,
  pageSize,
  onPageSizeChange,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<ProjectEntry | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFileField, setActiveFileField] = useState<{id: string, field: string} | null>(null);
  
  // Calculate pagination info
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);
  const currentData = data.slice(startIndex, endIndex);

  // Handle page changes
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Start editing a row
  const startEditing = (id: string) => {
    if (editingRow) {
      toast.error('Please save or cancel the current edit first.');
      return;
    }
    
    setEditingRow(id);
    const rowToEdit = data.find((row) => row.id === id);
    if (rowToEdit) {
      setEditedData({ ...rowToEdit });
    }
  };

  // Save edited row
  const saveEditing = () => {
    if (!editingRow || !editedData) return;

    // Validate required fields
    if (!editedData.groupNo || !editedData.name || !editedData.rollNo) {
      toast.error('Group No, Roll No, and Name are required fields.');
      return;
    }
    
    const newData = data.map((row) =>
      row.id === editingRow ? { ...editedData, isEditing: false, isNew: false } : row
    );
    
    onDataChange(newData);
    setEditingRow(null);
    setEditedData(null);
    
    toast.success('Data saved successfully!');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingRow(null);
    setEditedData(null);
  };

  // Delete a row
  const deleteRow = (id: string) => {
    const newData = data.filter((row) => row.id !== id);
    onDataChange(newData);
    setEditingRow(null);
    setEditedData(null);
    
    toast.success('Row deleted successfully!');
  };

  // Add a new row
  const addNewRow = () => {
    if (editingRow) {
      toast.error('Please save or cancel the current edit first.');
      return;
    }
    
    const newId = `new-${Date.now()}`;
    const newRow: ProjectEntry = {
      id: newId,
      groupNo: '',
      rollNo: '',
      name: '',
      email: '',
      phoneNo: '',
      title: '',
      domain: '',
      facultyMentor: '',
      industryMentor: '',
      form: '',
      presentation: '',
      report: '',
      year: '',
      semester: '',
      course: '',
      facultyCoordinator: '',
      isEditing: true,
      isNew: true,
    };
    
    onDataChange([...data, newRow]);
    setEditingRow(newId);
    setEditedData(newRow);
    
    // Auto-scroll to the bottom of the table
    setTimeout(() => {
      const tableContainer = document.querySelector('.table-container');
      if (tableContainer) {
        tableContainer.scrollTop = tableContainer.scrollHeight;
      }
    }, 100);
  };

  // Handle input change in editable cells
  const handleInputChange = (
    field: keyof ProjectEntry,
    value: string
  ) => {
    if (!editedData) return;
    setEditedData({ ...editedData, [field]: value });
  };

  // Trigger file input click
  const triggerFileInput = (id: string, field: 'form' | 'presentation' | 'report') => {
    setActiveFileField({id, field});
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedData || !activeFileField) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create a file name based on group number and file type
    const fieldName = activeFileField.field;
    const fileName = `${editedData.groupNo}_${editedData.rollNo}_${fieldName}.${file.name.split('.').pop()}`;
    
    setEditedData({ ...editedData, [fieldName]: fileName });
    toast.success(`File selected: ${fileName}`);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setActiveFileField(null);
  };

  // Handle Drive link
  const handleDriveLink = (id: string, field: 'form' | 'presentation' | 'report') => {
    // This would be integrated with the Drive link functionality
    // For now, just simulate adding a link
    if (!editedData) return;
    
    const fileName = `${editedData.groupNo}_${editedData.rollNo}_${field}_drive.pdf`;
    setEditedData({ ...editedData, [field]: fileName });
    
    toast.success(`Added from Drive: ${fileName}`);
  };

  // Render a table cell based on whether it's being edited
  const renderCell = (row: ProjectEntry, field: keyof ProjectEntry) => {
    const isEditing = row.id === editingRow;
    
    // Special handling for form, presentation, and report fields
    if (field === 'form' || field === 'presentation' || field === 'report') {
      const fileValue = row[field] as string;
      
      if (isEditing) {
        return (
          <div className="space-y-2">
            {fileValue ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs truncate max-w-[100px]">{fileValue}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => triggerFileInput(row.id, field as 'form' | 'presentation' | 'report')}
                >
                  <Upload className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs w-full"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload File
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs justify-start"
                      onClick={() => triggerFileInput(row.id, field as 'form' | 'presentation' | 'report')}
                    >
                      <Upload className="h-3 w-3 mr-2" />
                      From Computer
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-xs justify-start"
                      onClick={() => handleDriveLink(row.id, field as 'form' | 'presentation' | 'report')}
                    >
                      <ExternalLink className="h-3 w-3 mr-2" />
                      From Drive
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      }
      
      return fileValue ? (
        <div className="flex items-center space-x-2">
          <span className="text-xs truncate max-w-[100px]">{fileValue}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-brand-blue">
            <FileText className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <span className="text-gray-400 text-xs">No file</span>
      );
    }
    
    // For other regular text fields
    if (isEditing) {
      return (
        <Input
          value={(editedData?.[field] as string) || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="h-8 text-sm"
        />
      );
    }
    
    return <span>{row[field] as string}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelection}
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx"
      />
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="table-header table-cell">Group No.</th>
              <th className="table-header table-cell">Roll No.</th>
              <th className="table-header table-cell">Name</th>
              <th className="table-header table-cell">Email</th>
              <th className="table-header table-cell">Phone No.</th>
              <th className="table-header table-cell">Title</th>
              <th className="table-header table-cell">Domain</th>
              <th className="table-header table-cell">Faculty Mentor</th>
              <th className="table-header table-cell">Industry Mentor</th>
              <th className="table-header table-cell">Form</th>
              <th className="table-header table-cell">Presentation</th>
              <th className="table-header table-cell">Report</th>
              <th className="table-header table-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row) => (
                <tr key={row.id} className="table-row">
                  <td className="table-cell">{renderCell(row, 'groupNo')}</td>
                  <td className="table-cell">{renderCell(row, 'rollNo')}</td>
                  <td className="table-cell">{renderCell(row, 'name')}</td>
                  <td className="table-cell">{renderCell(row, 'email')}</td>
                  <td className="table-cell">{renderCell(row, 'phoneNo')}</td>
                  <td className="table-cell">{renderCell(row, 'title')}</td>
                  <td className="table-cell">{renderCell(row, 'domain')}</td>
                  <td className="table-cell">{renderCell(row, 'facultyMentor')}</td>
                  <td className="table-cell">{renderCell(row, 'industryMentor')}</td>
                  <td className="table-cell">{renderCell(row, 'form')}</td>
                  <td className="table-cell">{renderCell(row, 'presentation')}</td>
                  <td className="table-cell">{renderCell(row, 'report')}</td>
                  <td className="table-cell">
                    {row.id === editingRow ? (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-green-600 border-green-200"
                          onClick={saveEditing}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-gray-500 border-gray-200"
                          onClick={cancelEditing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-500 border-red-200"
                          onClick={() => deleteRow(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : row.isNew ? (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-green-600 border-green-200"
                          onClick={() => startEditing(row.id)}
                        >
                          Add Entry
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-500 border-red-200"
                          onClick={() => deleteRow(row.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-brand-blue border-brand-blue/20"
                          onClick={() => startEditing(row.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={13} className="table-cell text-center py-8 text-gray-500">
                  No data available. Add a new entry to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addNewRow}
            className="text-brand-blue border-brand-blue/20"
            disabled={!!editingRow}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New Row
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Rows per page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm mx-2">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
