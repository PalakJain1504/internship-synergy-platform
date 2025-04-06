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
  portalType?: 'project' | 'internship';
  showOnlyFacultyCoordinator?: boolean;
}

const UploadModal: React.FC<UploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpload,
  portalType = 'project',
  showOnlyFacultyCoordinator = false
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<Filter>({
    year: '',
    semester: '',
    session: '',
    facultyCoordinator: '',
    program: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<{
    headers: string[];
    rows: string[][];
    missingRequired: boolean;
  } | null>(null);
  const [availablePrograms] = useState([
    { group: 'BTech', options: ['BTech CSE', 'BTech CSE (FSD)', 'BTech CSE (UI/UX)', 'BTech AI/ML']},
    { group: 'BSc', options: ['BSc CS', 'BSc DS', 'BSc Cyber']},
    { group: 'BCA', options: ['BCA', 'BCA (AI/DS)']}
  ]);

  // Mapping for year to semesters
  const yearToSemesterMap: Record<string, string[]> = {
    '1': ['1', '2'],
    '2': ['3', '4'],
    '3': ['5', '6'],
    '4': ['7', '8']
  };

  const [availableSemesters, setAvailableSemesters] = useState<string[]>(['1', '2', '3', '4', '5', '6', '7', '8']);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreviewData(null);
      setIsUploading(false);
      setMetadata({
        year: '',
        semester: '',
        session: '',
        facultyCoordinator: '',
        program: '',
      });
    }
  }, [isOpen]);

  const parseExcelFile = async (excelFile: File) => {
    return new Promise<{headers: string[], rows: any[]}>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            reject(new Error('Excel file must contain headers and at least one data row'));
            return;
          }
          
          const headers = jsonData[0] as string[];
          console.log("Raw headers from Excel:", headers);
          
          const filteredHeaders = headers.filter(h => h !== undefined && h !== null && h.toString().trim() !== '');
          console.log("Filtered headers:", filteredHeaders);
          
          const rows = jsonData.slice(1) as any[];
          
          resolve({ headers: filteredHeaders, rows });
        } catch (error) {
          console.error("Error parsing Excel:", error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsBinaryString(excelFile);
    });
  };

  const checkForRequiredFields = (headers: string[]) => {
    console.log("Checking required fields in headers:", headers);
    
    const headerStrings = headers.map(h => String(h).trim().toLowerCase());
    console.log("Normalized header strings:", headerStrings);
    
    const hasRollNumber = headerStrings.some(h => {
      const patterns = [
        'roll', 'enrollment', 'rollno', 'rollnumber', 'rno', 'roll no', 'roll number',
        'enroll', 'enrollno', 'enrolment', 'registration', 'regno', 'registration no',
        'registration number', 'id', 's.no', 'sno', 'serial'
      ];
      return patterns.some(pattern => h.includes(pattern));
    });
    
    const hasName = headerStrings.some(h => {
      const patterns = [
        'name', 'student', 'student name', 'studentname', 'full name', 'fullname'
      ];
      return patterns.some(pattern => h.includes(pattern));
    });
    
    console.log(`Has Roll Number: ${hasRollNumber}, Has Name: ${hasName}`);
    
    // Return true even if missing - we'll generate defaults
    return true;
  };

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
        console.log("Parsed headers:", headers);
        console.log("First row sample:", rows[0]);
        
        const hasRequiredFields = checkForRequiredFields(headers);
        
        const previewRows = Math.min(rows.length, 5);
        const formattedRows = rows.slice(0, previewRows).map(row => {
          return headers.map((_, index) => {
            const value = row[index];
            return (value !== undefined && value !== null) ? String(value) : '';
          });
        });
        
        setPreviewData({
          headers: headers,
          rows: formattedRows,
          missingRequired: !hasRequiredFields
        });
        
        // Try to extract year from the data
        const yearPattern = /20\d{2}[-/]20\d{2}/;
        let yearValue = '';
        
        // Check if any header looks like a session year
        for (const header of headers) {
          if (header && yearPattern.test(header.toString())) {
            yearValue = header.toString().match(yearPattern)?.[0] || '';
            break;
          }
        }
        
        // If no year found in headers, check first few rows for session pattern
        if (!yearValue) {
          for (let i = 0; i < Math.min(3, rows.length); i++) {
            for (const cell of rows[i]) {
              if (cell && typeof cell === 'string' && yearPattern.test(cell)) {
                yearValue = cell.match(yearPattern)?.[0] || '';
                break;
              }
            }
            if (yearValue) break;
          }
        }
        
        // Update session metadata if year was found
        if (yearValue) {
          setMetadata(prev => ({
            ...prev,
            session: yearValue
          }));
        }
        
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Failed to parse Excel file. Please check the format.');
        setFile(null);
        e.target.value = '';
      }
    }
  };

  const handleMetadataChange = (key: keyof Filter, value: string) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const getNormalizedFieldName = (header: string): string => {
    if (header === undefined || header === null) {
      return 'unknown';
    }
    
    const originalHeader = String(header);
    const normalized = originalHeader.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    
    console.log(`Normalizing header: "${originalHeader}" -> "${normalized}"`);
    
    if (/^(s\.?no\.?|sno|serial|serialno|serialnumber|num|number|column\d+)$/i.test(normalized) || 
        normalized === '' || normalized === 'column1') {
      return 'id';
    }
    
    if (/roll|enrollment|rno|enrollno|registration|regno|regist/i.test(normalized)) {
      console.log(`  Matched as roll number: "${originalHeader}"`);
      return 'rollNo';
    }
    
    if (/name|student/i.test(normalized)) {
      console.log(`  Matched as student name: "${originalHeader}"`);
      return 'name';
    }

    if (/email/i.test(normalized)) {
      return 'email';
    }

    if (/phone|mobile|contact/i.test(normalized)) {
      return 'phoneNo';
    }

    if (/group|gr\.?no|grno/i.test(normalized)) {
      return 'groupNo';
    }

    if (/title|project|projecttitle/i.test(normalized)) {
      return 'title';
    }

    if (/domain|area|field/i.test(normalized)) {
      return 'domain';
    }

    if (/faculty|mentor|guide|internal/i.test(normalized)) {
      return 'facultyMentor';
    }

    if (/industry|external|company/i.test(normalized)) {
      return 'industryMentor';
    }
    
    if (/program|course|degree|branch|stream/i.test(normalized)) {
      return 'program';
    }
    
    if (/year[^s]/i.test(normalized)) {
      return 'year';
    }
    
    if (/session|academ|period|session/i.test(normalized)) {
      return 'session';
    }
    
    if (/organization|company|org|internship|place|where/i.test(normalized)) {
      return 'organization';
    }
    
    if (/dates|duration|period|time/i.test(normalized)) {
      return 'dates';
    }
    
    if (/noc|objection|certificate/i.test(normalized)) {
      return 'noc';
    }
    
    if (/offer|letter/i.test(normalized)) {
      return 'offerLetter';
    }
    
    if (/pop|proof|completion/i.test(normalized)) {
      return 'pop';
    }
    
    if (/attendance/i.test(normalized)) {
      const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                      'july', 'august', 'september', 'october', 'november', 'december'];
      
      for (const month of months) {
        if (normalized.includes(month)) {
          return `Attendance ${month.charAt(0).toUpperCase() + month.slice(1)}`;
        }
      }
      
      return 'Attendance';
    }
    
    return originalHeader;
  };

  const normalizeProgram = (programName: string): string => {
    const lowerProgram = programName.toLowerCase().trim();
    
    // BTech variations
    if (lowerProgram.includes('btech') || lowerProgram.includes('b.tech')) {
      if (lowerProgram.includes('fsd') || lowerProgram.includes('full stack')) {
        return 'BTech CSE (FSD)';
      } else if (lowerProgram.includes('ui') || lowerProgram.includes('ux')) {
        return 'BTech CSE (UI/UX)';
      } else if (lowerProgram.includes('ai') || lowerProgram.includes('ml')) {
        return 'BTech AI/ML';
      } else {
        return 'BTech CSE';
      }
    }
    
    // BSc variations
    if (lowerProgram.includes('bsc') || lowerProgram.includes('b.sc')) {
      if (lowerProgram.includes('data') || lowerProgram.includes('ds')) {
        return 'BSc DS';
      } else if (lowerProgram.includes('cyber') || lowerProgram.includes('security')) {
        return 'BSc Cyber';
      } else {
        return 'BSc CS';
      }
    }
    
    // BCA variations
    if (lowerProgram.includes('bca') || lowerProgram.includes('b.c.a')) {
      if (lowerProgram.includes('ai') || lowerProgram.includes('data') || lowerProgram.includes('ds')) {
        return 'BCA (AI/DS)';
      } else {
        return 'BCA';
      }
    }
    
    return programName; // Return as is if no match found
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (!metadata.year || !metadata.session) {
      toast.error('Please fill in all required metadata fields (year, session)');
      return;
    }
    
    if (portalType === 'project' && !metadata.semester) {
      toast.error('Please select a semester');
      return;
    }

    setIsUploading(true);

    try {
      const { headers, rows } = await parseExcelFile(file);
      
      console.log("Headers for mapping:", headers);
      
      const fieldMapping = new Map<number, string>();
      
      headers.forEach((header, index) => {
        if (header === undefined || header === null || header.toString().trim() === '') {
          fieldMapping.set(index, `column${index}`);
          return;
        }
        
        const normalizedFieldName = getNormalizedFieldName(header);
        fieldMapping.set(index, normalizedFieldName);
        console.log(`Mapped column "${header}" (index ${index}) to field "${normalizedFieldName}"`);
      });
      
      // Organize entries by group (for project portal)
      const groupMap = new Map<string, any[]>();
      
      rows.forEach((row, rowIndex) => {
        const entry: Record<string, string> = {
          id: `upload-${Date.now()}-${rowIndex}`,
          year: '',
          semester: '',
          session: '',
          rollNo: '',
          name: '',
          program: '',
        };
        
        if (portalType === 'project') {
          entry.groupNo = '';
          entry.email = '';
          entry.phoneNo = '';
          entry.title = '';
          entry.domain = '';
          entry.facultyMentor = '';
          entry.industryMentor = '';
          entry.form = '';
          entry.presentation = '';
          entry.report = '';
        } else {
          entry.organization = '';
          entry.dates = '';
          entry.noc = '';
          entry.offerLetter = '';
          entry.pop = '';
        }
        
        if (metadata.facultyCoordinator) {
          entry.facultyCoordinator = metadata.facultyCoordinator;
        }
        
        // First, map data from the columns using our field mapping
        for (let colIndex = 0; colIndex < headers.length; colIndex++) {
          const fieldName = fieldMapping.get(colIndex);
          
          if (fieldName && row[colIndex] !== undefined && row[colIndex] !== null) {
            entry[fieldName] = String(row[colIndex]);
            
            // Normalize program field if it exists
            if (fieldName === 'program' && entry.program) {
              entry.program = normalizeProgram(entry.program);
            }
            
            console.log(`Setting ${fieldName} = ${entry[fieldName]} from column ${colIndex}`);
          }
        }
        
        // Try to extract year from row data if not already set
        if (!entry.year) {
          // Look in known year columns first
          const yearCol = headers.findIndex(h => 
            h && String(h).toLowerCase().includes('year')
          );
          
          if (yearCol !== -1 && row[yearCol]) {
            entry.year = String(row[yearCol]);
          }
        }
        
        // If we still don't have roll number, try to infer it
        if (!entry.rollNo || entry.rollNo.trim() === '') {
          const potentialRollColumns = [1, 2, 3];
          for (const col of potentialRollColumns) {
            if (row[col] && String(row[col]).trim() !== '') {
              const value = String(row[col]);
              if (/^\d+$/.test(value) || /^[A-Za-z]+\d+/.test(value)) {
                entry.rollNo = value;
                console.log(`Inferred rollNo = ${value} from column ${col}`);
                break;
              }
            }
          }
        }
        
        // If we still don't have name, try to infer it
        if (!entry.name || entry.name.trim() === '') {
          const potentialNameColumns = [2, 3, 4];
          for (const col of potentialNameColumns) {
            if (row[col] && String(row[col]).trim() !== '') {
              const value = String(row[col]);
              if (!/^\d+$/.test(value)) {
                entry.name = value;
                console.log(`Inferred name = ${value} from column ${col}`);
                break;
              }
            }
          }
        }
        
        // Set defaults if still missing
        if (!entry.rollNo || entry.rollNo.trim() === '') {
          entry.rollNo = `R${rowIndex + 1000}`;
          console.log(`Generated default rollNo = ${entry.rollNo}`);
        }
        
        if (!entry.name || entry.name.trim() === '') {
          entry.name = `Student ${rowIndex + 1}`;
          console.log(`Generated default name = ${entry.name}`);
        }
        
        // For project portal, organize by groups
        if (portalType === 'project') {
          const groupKey = entry.groupNo || 'unknown';
          if (!groupMap.has(groupKey)) {
            groupMap.set(groupKey, []);
          }
          groupMap.get(groupKey)?.push(entry);
        } else {
          // For internship portal, just add to the group map with a unique key
          const uniqueKey = `${entry.rollNo}-${rowIndex}`;
          groupMap.set(uniqueKey, [entry]);
        }
      });
      
      // Process groups (for project portal)
      const finalEntries: any[] = [];
      
      groupMap.forEach((groupEntries, groupKey) => {
        if (portalType === 'project' && groupEntries.length > 0) {
          // For project portal, copy group-level fields from the first entry to all entries
          const groupFields = ['groupNo', 'title', 'domain', 'facultyMentor', 'industryMentor'];
          const firstEntry = groupEntries[0];
          
          groupEntries.forEach((entry, index) => {
            if (index > 0) {
              groupFields.forEach(field => {
                if (firstEntry[field]) {
                  entry[field] = firstEntry[field];
                }
              });
            }
            finalEntries.push(entry);
          });
        } else {
          // For internship portal, just add each entry
          groupEntries.forEach(entry => {
            finalEntries.push(entry);
          });
        }
      });

      console.log(`Successfully processed ${finalEntries.length} entries`);
      
      onUpload(finalEntries as any, metadata);
      setIsUploading(false);
      setFile(null);
      setPreviewData(null);
      toast.success(`Successfully uploaded ${finalEntries.length} entries`);
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
                    The system will attempt to map data using available columns and generate any missing values.
                    Please check the results carefully after upload.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="border rounded-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {previewData.headers.map((header, index) => {
                        const normalizedField = getNormalizedFieldName(header);
                        const isRequired = normalizedField === 'rollNo' || normalizedField === 'name';
                        
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
                The system will automatically map common column variations and generate default values if needed.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Metadata</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="facultyCoordinator">Faculty Coordinator</Label>
                <Select
                  value={metadata.facultyCoordinator || ''}
                  onValueChange={(value) => handleMetadataChange('facultyCoordinator', value)}
                >
                  <SelectTrigger id="facultyCoordinator">
                    <SelectValue placeholder="Select Coordinator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-coordinators">All Coordinators</SelectItem>
                    <SelectItem value="Dr. Amit Kumar">Dr. Amit Kumar</SelectItem>
                    <SelectItem value="Dr. Preeti Sharma">Dr. Preeti Sharma</SelectItem>
                    <SelectItem value="Dr. Neetu Singh">Dr. Neetu Singh</SelectItem>
                    <SelectItem value="Dr. Rahul Gupta">Dr. Rahul Gupta</SelectItem>
                    <SelectItem value="Dr. Sunita Yadav">Dr. Sunita Yadav</SelectItem>
                    <SelectItem value="Dr. Rajesh Verma">Dr. Rajesh Verma</SelectItem>
                    <SelectItem value="Dr. Priya Patel">Dr. Priya Patel</SelectItem>
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
              disabled={isUploading || !file}
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
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
