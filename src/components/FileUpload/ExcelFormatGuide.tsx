
import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ExcelFormatGuideProps {
  portalType: 'project' | 'internship';
}

const ExcelFormatGuide: React.FC<ExcelFormatGuideProps> = ({ portalType }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs mb-2 flex items-center"
        >
          <HelpCircle className="h-3 w-3 mr-1" />
          Excel Format Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recommended Excel Format for {portalType === 'project' ? 'Project' : 'Internship'} Upload</DialogTitle>
          <DialogDescription>
            Follow this format to ensure successful data upload
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Required Column Headers:</h3>
            {portalType === 'project' ? (
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li><span className="font-medium">Roll Number</span> (alternative headers: rollno, enrollment, regno)</li>
                <li><span className="font-medium">Name</span> (alternative headers: student name, fullname)</li>
                <li><span className="font-medium">Group No</span> (alternative headers: groupno, grno)</li>
                <li><span className="font-medium">Title</span> (alternative headers: project title, projecttitle)</li>
                <li><span className="font-medium">Faculty Mentor</span> (alternative headers: guide, internal mentor)</li>
              </ul>
            ) : (
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li><span className="font-medium">Roll Number</span> (alternative headers: rollno, enrollment, regno)</li>
                <li><span className="font-medium">Name</span> (alternative headers: student name, fullname)</li>
                <li><span className="font-medium">Program</span> (alternative headers: course, branch, stream)</li>
                <li><span className="font-medium">Organization</span> (alternative headers: company, org, internship place)</li>
                <li><span className="font-medium">Dates</span> (alternative headers: duration, period)</li>
              </ul>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Recommended Additional Columns:</h3>
            {portalType === 'project' ? (
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li><span className="font-medium">Email</span></li>
                <li><span className="font-medium">Phone</span> (alternative headers: mobile, contact)</li>
                <li><span className="font-medium">Domain</span> (alternative headers: area, field)</li>
                <li><span className="font-medium">Industry Mentor</span> (alternative headers: external mentor, company guide)</li>
              </ul>
            ) : (
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li><span className="font-medium">Year</span></li>
                <li><span className="font-medium">Semester</span></li>
                <li><span className="font-medium">Session</span> (format: 2023-2024)</li>
                <li><span className="font-medium">NOC</span> (file references)</li>
                <li><span className="font-medium">Offer Letter</span> (file references)</li>
                <li><span className="font-medium">PoP</span> (Proof of Participation, file references)</li>
              </ul>
            )}
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md">
            <h3 className="text-sm font-medium mb-2 text-blue-700">Example Format:</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    {portalType === 'project' ? (
                      <>
                        <th className="border px-2 py-1">S.No</th>
                        <th className="border px-2 py-1">Roll No</th>
                        <th className="border px-2 py-1">Name</th>
                        <th className="border px-2 py-1">Group No</th>
                        <th className="border px-2 py-1">Title</th>
                        <th className="border px-2 py-1">Domain</th>
                        <th className="border px-2 py-1">Faculty Mentor</th>
                        <th className="border px-2 py-1">Industry Mentor</th>
                      </>
                    ) : (
                      <>
                        <th className="border px-2 py-1">S.No</th>
                        <th className="border px-2 py-1">Roll No</th>
                        <th className="border px-2 py-1">Name</th>
                        <th className="border px-2 py-1">Program</th>
                        <th className="border px-2 py-1">Year</th>
                        <th className="border px-2 py-1">Semester</th>
                        <th className="border px-2 py-1">Session</th>
                        <th className="border px-2 py-1">Organization</th>
                        <th className="border px-2 py-1">Dates</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {portalType === 'project' ? (
                    <>
                      <tr>
                        <td className="border px-2 py-1">1</td>
                        <td className="border px-2 py-1">R101</td>
                        <td className="border px-2 py-1">John Smith</td>
                        <td className="border px-2 py-1">G1</td>
                        <td className="border px-2 py-1">Smart Home Automation</td>
                        <td className="border px-2 py-1">IoT</td>
                        <td className="border px-2 py-1">Dr. Amit Kumar</td>
                        <td className="border px-2 py-1">Mr. Rajiv Mehta</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">2</td>
                        <td className="border px-2 py-1">R102</td>
                        <td className="border px-2 py-1">Sarah Johnson</td>
                        <td className="border px-2 py-1">G1</td>
                        <td className="border px-2 py-1">Smart Home Automation</td>
                        <td className="border px-2 py-1">IoT</td>
                        <td className="border px-2 py-1">Dr. Amit Kumar</td>
                        <td className="border px-2 py-1">Mr. Rajiv Mehta</td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr>
                        <td className="border px-2 py-1">1</td>
                        <td className="border px-2 py-1">R101</td>
                        <td className="border px-2 py-1">John Smith</td>
                        <td className="border px-2 py-1">BTech CSE</td>
                        <td className="border px-2 py-1">3</td>
                        <td className="border px-2 py-1">6</td>
                        <td className="border px-2 py-1">2023-2024</td>
                        <td className="border px-2 py-1">TechCorp Inc.</td>
                        <td className="border px-2 py-1">May-Jul 2023</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">2</td>
                        <td className="border px-2 py-1">R102</td>
                        <td className="border px-2 py-1">Sarah Johnson</td>
                        <td className="border px-2 py-1">BSc CS</td>
                        <td className="border px-2 py-1">2</td>
                        <td className="border px-2 py-1">4</td>
                        <td className="border px-2 py-1">2023-2024</td>
                        <td className="border px-2 py-1">DataSoft Solutions</td>
                        <td className="border px-2 py-1">Jun-Aug 2023</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Important Notes:</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>The system will try to recognize various header names, but using the exact headers as shown above is recommended.</li>
              <li>Make sure to save your Excel file in .xlsx or .xls format.</li>
              <li>If you're uploading to the {portalType === 'project' ? 'Project' : 'Internship'} Portal, ensure the correct portal type is selected.</li>
              <li>For file references (document links), simply enter the filename or leave blank if not available.</li>
              <li>Empty cells are allowed, but the system will fill in default values for required fields if missing.</li>
              <li>If multiple students belong to the same project group, ensure the Group No is identical for all of them.</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelFormatGuide;
