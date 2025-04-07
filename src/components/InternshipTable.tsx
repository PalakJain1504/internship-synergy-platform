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
import { toast } from 'sonner';
import { InternshipData } from '@/lib/types';

interface InternshipTableProps {
  data: InternshipData[];
  onDataChange: (newData: InternshipData[]) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  dynamicColumns?: string[];
}

const emptyRow: InternshipData = {
  id: `new-${Date.now()}`,
  rollNo: '',
  name: '',
  program: '',
  organization: '',
  dates: '',
  internshipDuration: '',
  mobileNumber: '',
  noc: '',
  offerLetter: '',
  pop: '',
  year: '',
  semester: '',
  session: '',
  isEditing: true,
  isNew: true,
};

const InternshipTable: React.FC<InternshipTableProps> = ({
  data,
  onDataChange,
  pageSize,
  onPageSizeChange,
  dynamicColumns = [],
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<InternshipData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFileField, setActiveFileField] = useState<{id: string, field: string} | null>(null);
  
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

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

  const saveEditing = () => {
    if (!editingRow || !editedData) return;

    if (!editedData.rollNo || !editedData.name) {
      toast.error('Roll No and Name are required fields.');
      return;
    }
    
    const updatedEntry: InternshipData = { 
      ...editedData,
      isEditing: false,
      isNew: false
    };
    
    const newData = data.map((row) =>
      row.id === editingRow ? updatedEntry : row
    );
    
    onDataChange(newData);
    setEditingRow(null);
    setEditedData(null);
    
    toast.success('Data saved successfully!');
  };

  const cancelEditing = () => {
    setEditingRow(null);
    setEditedData(null);
  };

  const deleteRow = (id: string) => {
    const newData = data.filter((row) => row.id !== id);
    onDataChange(newData);
    setEditingRow(null);
    setEditedData(null);
    
    toast.success('Row deleted successfully!');
  };

  const addNewRow = () => {
    if (editingRow) {
      toast.error('Please save or cancel the current edit first.');
      return;
    }
    
    const newId = `new-${Date.now()}`;
    const newRow: InternshipData = {
      id: newId,
      rollNo: '',
      name: '',
      program: '',
      organization: '',
      dates: '',
      internshipDuration: '',
      mobileNumber: '',
      noc: '',
      offerLetter: '',
      pop: '',
      year: '',
      semester: '',
      session: '',
      isEditing: true,
      isNew: true
    };
    
    dynamicColumns.forEach(col => {
      newRow[col] = '';
    });
    
    onDataChange([...data, newRow]);
    setEditingRow(newId);
    setEditedData(newRow);
    
    // Auto-scroll to the bottom of the table
    setTimeout(() => {
      const tableContainer = document.querySelector('.table-container');
      if (tableContainer) {
        tableContainer.scrollTop = tableContainer.scrollHeight;
      }
      
      // Set pagination to last page to show the new row
      if (totalPages > 0) {
        setCurrentPage(totalPages);
      }
    }, 100);
  };

  const handleInputChange = (
    field: string,
    value: string
  ) => {
    if (!editedData) return;
    setEditedData({ 
      ...editedData, 
      [field]: value 
    });
  };

  const triggerFileInput = (id: string, field: string) => {
    setActiveFileField({id, field});
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedData || !activeFileField) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fieldName = activeFileField.field;
    const fileName = `${editedData.rollNo}_${fieldName}.${file.name.split('.').pop()}`;
    
    setEditedData({ 
      ...editedData, 
      [fieldName]: fileName 
    });
    toast.success(`File selected: ${fileName}`);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setActiveFileField(null);
  };

  const renderCell = (row: InternshipData, field: string) => {
    const isEditing = row.id === editingRow;
    
    if (field === 'noc' || field === 'offerLetter' || field === 'pop' || field.startsWith('Attendance')) {
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
                  onClick={() => triggerFileInput(row.id, field)}
                >
                  <Upload className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs w-full"
                onClick={() => triggerFileInput(row.id, field)}
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload File
              </Button>
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

  const getAllColumns = () => {
    const baseColumns = [
      { id: 'rollNo', label: 'Roll No.' },
      { id: 'name', label: 'Student Name' },
      { id: 'program', label: 'Program' },
      { id: 'year', label: 'Year' },
      { id: 'session', label: 'Session' },
      { id: 'organization', label: 'Organization' },
      { id: 'dates', label: 'Dates' },
      { id: 'noc', label: 'NOC' },
      { id: 'offerLetter', label: 'Offer Letter' },
      { id: 'pop', label: 'PoP' },
    ];
    
    // Only include attendance columns that are in dynamicColumns
    const attendanceColumns = dynamicColumns
      .filter(col => col.startsWith('Attendance'))
      .map(col => ({ id: col, label: col }));
    
    // Include other dynamic columns that are not attendance columns
    const otherDynamicColumns = dynamicColumns
      .filter(col => !col.startsWith('Attendance'))
      .map(col => ({ id: col, label: col }));
    
    return [
      ...baseColumns,
      ...attendanceColumns,
      ...otherDynamicColumns
    ];
  };

  const columns = getAllColumns();

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelection}
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx"
      />
      
      <div className="table-container overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">S.No.</th>
              {columns.map(column => (
                <th 
                  key={column.id} 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="px-4 py-2 text-sm whitespace-nowrap">
                    {startIndex + index + 1}
                  </td>
                  {columns.map(column => (
                    <td key={column.id} className="px-4 py-2 text-sm whitespace-nowrap">
                      {renderCell(row, column.id)}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-sm whitespace-nowrap">
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
                <td colSpan={columns.length + 2} className="px-4 py-8 text-center text-gray-500">
                  No data available. Add a new entry or upload an Excel sheet to get started.
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

export default InternshipTable;
