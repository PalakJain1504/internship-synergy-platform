
import React, { useState, useEffect } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Filter, ProjectData, InternshipData } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as XLSX from 'xlsx';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (entries: ProjectData[] | InternshipData[], metadata: Filter) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<Filter>({
    year: '',
    semester: '',
    course: '',
    facultyCoordinator: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<{
    headers: string[];
    rows: string[][];
    missingRequired: boolean;
  } | null>(null);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreviewData(null);
      setIsUploading(false);
    }
  }, [isOpen]);

  // Parse Excel file and return headers and rows
  const parseExcelFile = async (excelFile: File) => {
    return new Promise<{headers: string[], rows: any[]}>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            reject(new Error('Excel file must contain headers and at least one data row'));
            return;
          }
          
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[];
          
          resolve({ headers, rows });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsBinaryString(excelFile);
    });
  };

  // Handle file selection and preview
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        toast.error('Please upload only Excel files (.xlsx or .xls)');
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
      
      try {
        const { headers, rows } = await parseExcelFile(selectedFile);
        
        // Check for required fields using a more flexible approach to match columns
        const requiredPairs = [
          [['roll', 'number'], ['rollno', 'rollnumber', 'roll', 'roll no', 'roll number']], 
          [['student', 'name'], ['name', 'studentname', 'student name', 'full name']]
        ];
        
        const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/\s/g, ''));
        
        // Check if at least one column matches each required field
        let foundRequiredFields = true;
        for (const [requiredConcepts, possibleMatches] of requiredPairs) {
          // Check if any header contains all required concepts OR matches any possible match exactly
          const hasMatch = normalizedHeaders.some(header => 
            requiredConcepts.every(concept => header.includes(concept)) ||
            possibleMatches.includes(header)
          );
          
          if (!hasMatch) {
            foundRequiredFields = false;
            break;
          }
        }
        
        // Format rows for preview
        const formattedRows = rows.slice(0, 5).map(row => {
          return headers.map((_, index) => row[index] || '');
        });
        
        setPreviewData({
          headers: headers,
          rows: formattedRows,
          missingRequired: !foundRequiredFields
        });
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Failed to parse Excel file. Please check the format.');
        setFile(null);
        e.target.value = '';
      }
    }
  };

  // Handle metadata changes
  const handleMetadataChange = (key: keyof Filter, value: string) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  // Enhanced function to map Excel column headers to our field names with better pattern matching
  const getNormalizedFieldName = (header: string): string => {
    const normalized = header.toLowerCase().replace(/\s/g, '');
    
    // Comprehensive field mapping with pattern matching
    const fieldPatterns = [
      // Roll number patterns
      { pattern: /^s\.?no\.?$/i, field: 'id' },
      { pattern: /^(roll|roll.?no|roll.?number|enrollment)$/i, field: 'rollNo' },
      
      // Name patterns
      { pattern: /^(student.?name|name|full.?name)$/i, field: 'name' },
      
      // Program patterns
      { pattern: /^(program|course|degree)$/i, field: 'program' },
      
      // Organization patterns
      { pattern: /^(organization|company|org|name.*organization|internship.*organization)$/i, field: 'organization' },
      
      // Dates patterns
      { pattern: /^(dates|duration|period|internship.?dates|internship.?period)$/i, field: 'dates' },
      
      // Document patterns
      { pattern: /^(noc|no.?objection|certificate)$/i, field: 'noc' },
      { pattern: /^(offer|offer.?letter|offer.?ltr)$/i, field: 'offerLetter' },
      { pattern: /^(pop|proof|completion|certificate)$/i, field: 'pop' },
      
      // Attendance patterns - these will become dynamic columns
      { pattern: /^attendance.*january$/i, field: 'Attendance January' },
      { pattern: /^attendance.*february$/i, field: 'Attendance February' },
      { pattern: /^attendance.*march$/i, field: 'Attendance March' },
      { pattern: /^attendance.*april$/i, field: 'Attendance April' },
      { pattern: /^attendance.*may$/i, field: 'Attendance May' },
      { pattern: /^attendance.*june$/i, field: 'Attendance June' },
      { pattern: /^attendance.*july$/i, field: 'Attendance July' },
      { pattern: /^attendance.*august$/i, field: 'Attendance August' },
      { pattern: /^attendance.*september$/i, field: 'Attendance September' },
      { pattern: /^attendance.*october$/i, field: 'Attendance October' },
      { pattern: /^attendance.*november$/i, field: 'Attendance November' },
      { pattern: /^attendance.*december$/i, field: 'Attendance December' },
    ];
    
    // Try to match based on patterns first
    for (const { pattern, field } of fieldPatterns) {
      if (pattern.test(normalized)) {
        return field;
      }
    }
    
    // Specific mappings as fallback for exact matches
    const fieldMappings: Record<string, string> = {
      'sno': 'id',
      's.no': 'id',
      'roll': 'rollNo',
      'rollno': 'rollNo',
      'rollnumber': 'rollNo',
      'roll_no': 'rollNo',
      'roll_number': 'rollNo',
      'studentname': 'name',
      'student': 'name',
      'studentfullname': 'name',
      'fullname': 'name',
      'org': 'organization',
      'company': 'organization',
      'internshipcompany': 'organization',
      'nameoftheorganizationfromwhereinternshipisdone': 'organization',
      'date': 'dates',
      'internshipdates': 'dates',
      'duration': 'dates',
      'period': 'dates',
      'noobjection': 'noc',
      'nocobjectioncertificate': 'noc',
      'offer': 'offerLetter',
      'offerltr': 'offerLetter',
      'proofofparticipation': 'pop',
      'completion': 'pop',
      'completioncertificate': 'pop',
      'attendancejanuary': 'Attendance January',
      'attendancefebruary': 'Attendance February',
    };
    
    // Try exact match from our mapping
    return fieldMappings[normalized] || header; // If no match found, keep the original header
  };

  // Handle Excel upload with improved column matching
  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (!metadata.year || !metadata.semester || !metadata.course) {
      toast.error('Please fill in all required metadata fields (year, semester, course)');
      return;
    }

    if (previewData?.missingRequired) {
      toast.error('The Excel file is missing required columns (Roll No and Name)');
      return;
    }

    setIsUploading(true);

    try {
      // Get all the data rows from the Excel file
      const { headers, rows } = await parseExcelFile(file);
      
      // Create a mapping from Excel headers to our field names
      const fieldMapping = new Map<number, string>();
      
      // Map each column index to our standardized field name
      headers.forEach((header, index) => {
        const normalizedFieldName = getNormalizedFieldName(header);
        fieldMapping.set(index, normalizedFieldName);
        console.log(`Mapped column "${header}" to field "${normalizedFieldName}"`);
      });
      
      // Transform Excel data to entry format using the mapping
      const entries = rows.map((row, rowIndex) => {
        const entry: Record<string, string> = {
          id: `upload-${Date.now()}-${rowIndex}`,
          year: metadata.year,
          semester: metadata.semester,
          course: metadata.course,
          // Initialize required fields with empty strings
          rollNo: '',
          name: '',
          program: '',
          organization: '',
          dates: '',
          noc: '',
          offerLetter: '',
          pop: '',
        };
        
        // Map data from Excel columns to our fields based on the mapping
        headers.forEach((_, colIndex) => {
          const fieldName = fieldMapping.get(colIndex);
          
          if (fieldName && row[colIndex] !== undefined && row[colIndex] !== null) {
            entry[fieldName] = String(row[colIndex]);
          }
        });
        
        return entry;
      });

      onUpload(entries as any, metadata);
      setIsUploading(false);
      setFile(null);
      setPreviewData(null);
      toast.success(`Successfully uploaded ${entries.length} entries`);
      onClose();
    } catch (error) {
      console.error('Error during upload:', error);
      toast.error('Failed to upload Excel data');
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upload Excel Sheet</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            {file ? (
              <div className="flex items-center justify-center space-x-3">
                <FileSpreadsheet className="h-8 w-8 text-green-500" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop your Excel file here or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supports .xlsx and .xls files
                </p>
              </>
            )}
            
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-upload"
            />
            <Label
              htmlFor="excel-upload"
              className="mt-4 inline-block px-4 py-2 bg-brand-blue/10 text-brand-blue rounded-md text-sm font-medium cursor-pointer hover:bg-brand-blue/20 transition-colors"
            >
              {file ? 'Change File' : 'Select File'}
            </Label>
          </div>

          {previewData && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">File Preview</h3>
              
              {previewData.missingRequired && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Missing Required Fields</AlertTitle>
                  <AlertDescription>
                    Your Excel file must include at minimum the following columns: 'Roll No' and 'Name'.
                    These can be in any case or format (e.g., "Roll No.", "roll_no", "Roll Number").
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="border rounded-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {previewData.headers.map((header, index) => {
                        const normalizedHeader = header.toLowerCase().replace(/\s/g, '');
                        const isRequired = ['rollno', 'name'].includes(normalizedHeader) || 
                                         normalizedHeader.includes('roll') && normalizedHeader.includes('no');
                        
                        return (
                          <th 
                            key={index}
                            className={`px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                              isRequired ? 'bg-yellow-50' : ''
                            }`}
                          >
                            {header}
                            {isRequired && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td 
                            key={cellIndex}
                            className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap max-w-[100px] truncate"
                            title={cell}
                          >
                            {cell || <span className="text-gray-400">Empty</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <p className="text-xs text-gray-500">
                Showing preview of first 5 rows from your Excel file.
                Fields marked with <span className="text-red-500">*</span> are required.
                The system will automatically map common column variations (e.g., "Roll No", "Roll Number", "Roll_No") to the correct fields.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Internship Metadata</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="year">Year*</Label>
                <Select
                  value={metadata.year}
                  onValueChange={(value) => handleMetadataChange('year', value)}
                >
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="semester">Semester*</Label>
                <Select
                  value={metadata.semester}
                  onValueChange={(value) => handleMetadataChange('semester', value)}
                >
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="course">Course*</Label>
                <Select
                  value={metadata.course}
                  onValueChange={(value) => handleMetadataChange('course', value)}
                >
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BSc">BSc</SelectItem>
                    <SelectItem value="BTech CSE">BTech CSE</SelectItem>
                    <SelectItem value="BTech AI/ML">BTech AI/ML</SelectItem>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="BCA AI/DS">BCA AI/DS</SelectItem>
                    <SelectItem value="MCA">MCA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="facultyCoordinator">Faculty Coordinator*</Label>
                <Select
                  value={metadata.facultyCoordinator}
                  onValueChange={(value) => handleMetadataChange('facultyCoordinator', value)}
                >
                  <SelectTrigger id="facultyCoordinator">
                    <SelectValue placeholder="Select Coordinator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Pankaj">Dr. Pankaj</SelectItem>
                    <SelectItem value="Dr. Meenu">Dr. Meenu</SelectItem>
                    <SelectItem value="Dr. Swati">Dr. Swati</SelectItem>
                    <SelectItem value="Dr. Anshu">Dr. Anshu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              className="bg-brand-blue hover:bg-brand-darkBlue"
              onClick={handleUpload}
              disabled={isUploading || !file || (previewData?.missingRequired || false)}
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
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
