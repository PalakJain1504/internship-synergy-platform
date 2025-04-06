
import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ExcelFormatGuideProps {
  portalType: 'project' | 'internship';
}

const ExcelFormatGuide: React.FC<ExcelFormatGuideProps> = ({ portalType }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const renderColumnList = () => {
    if (portalType === 'project') {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Column Name</TableHead>
              <TableHead className="w-1/4">Alternative Names</TableHead>
              <TableHead className="w-1/2">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">S.No.</TableCell>
              <TableCell>Serial No., ID</TableCell>
              <TableCell>Optional - will be generated automatically if missing</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Group No.</TableCell>
              <TableCell>Group, Team No.</TableCell>
              <TableCell>Group identifier (e.g., G1, G2, etc.)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Roll No.</TableCell>
              <TableCell>Enrollment No., Registration No.</TableCell>
              <TableCell>Student's roll number (required)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Name</TableCell>
              <TableCell>Student Name, Full Name</TableCell>
              <TableCell>Student's full name (required)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Email</TableCell>
              <TableCell>Email ID, Mail</TableCell>
              <TableCell>Student's email address</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Phone No.</TableCell>
              <TableCell>Contact, Mobile</TableCell>
              <TableCell>Student's contact number</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Title</TableCell>
              <TableCell>Project Title, Project Name</TableCell>
              <TableCell>Title of the project</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Domain</TableCell>
              <TableCell>Area, Field</TableCell>
              <TableCell>Project domain/field (e.g., AI, Web Development)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Faculty Mentor</TableCell>
              <TableCell>Guide, Internal Mentor</TableCell>
              <TableCell>Name of faculty guiding the project</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Industry Mentor</TableCell>
              <TableCell>External Mentor, Company Mentor</TableCell>
              <TableCell>Name of industry person guiding the project (if any)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Program</TableCell>
              <TableCell>Course, Degree, Branch</TableCell>
              <TableCell>Program of study (e.g., BTech CSE, BCA)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Year</TableCell>
              <TableCell>Study Year</TableCell>
              <TableCell>Year of study (1, 2, 3, 4)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Session</TableCell>
              <TableCell>Academic Year, Period</TableCell>
              <TableCell>Academic session (e.g., 2023-2024)</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    } else {
      // Internship format
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Column Name</TableHead>
              <TableHead className="w-1/4">Alternative Names</TableHead>
              <TableHead className="w-1/2">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">S.No.</TableCell>
              <TableCell>Serial No., ID</TableCell>
              <TableCell>Optional - will be generated automatically if missing</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Roll No.</TableCell>
              <TableCell>Enrollment No., Registration No.</TableCell>
              <TableCell>Student's roll number (required)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Name</TableCell>
              <TableCell>Student Name, Full Name</TableCell>
              <TableCell>Student's full name (required)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Program</TableCell>
              <TableCell>Course, Degree, Branch</TableCell>
              <TableCell>Program of study (e.g., BTech CSE, BCA)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Organization</TableCell>
              <TableCell>Company, Internship Place</TableCell>
              <TableCell>Name of organization where internship was done</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Dates</TableCell>
              <TableCell>Duration, Period</TableCell>
              <TableCell>Internship duration/dates (e.g., "June 2023 - July 2023")</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Year</TableCell>
              <TableCell>Study Year</TableCell>
              <TableCell>Year of study (1, 2, 3, 4)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Semester</TableCell>
              <TableCell>Term, Sem</TableCell>
              <TableCell>Semester of study (1-8)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Session</TableCell>
              <TableCell>Academic Year, Period</TableCell>
              <TableCell>Academic session (e.g., 2023-2024)</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    }
  };

  return (
    <div className="space-y-3 rounded-md border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <HelpCircle className="mr-2 h-4 w-4 text-brand-blue" />
          <h3 className="text-sm font-medium text-gray-700">Excel Format Guide</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpanded}
          className="h-8 p-0 px-2"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="text-sm text-gray-600 space-y-4 mt-2">
          <p>
            Follow these guidelines to prepare your Excel file for upload:
          </p>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Required Format:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>The first row must contain column headers</li>
              <li>Each subsequent row represents a single {portalType === 'project' ? 'project entry' : 'internship entry'}</li>
              <li>Roll No. and Name are required fields</li>
              <li>For projects, students in the same group should have the same Group No.</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Recommended Columns:</h4>
            <div className="overflow-x-auto">
              {renderColumnList()}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Notes:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>The system will attempt to recognize column names even if they don't exactly match the recommended names</li>
              <li>If Roll No. or Name is missing, the system will generate default values</li>
              <li>Additional metadata can be set in the form below after uploading</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelFormatGuide;
