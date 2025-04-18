
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterIcon, RefreshCw } from 'lucide-react';
import { Filter } from '@/lib/types';

interface FilterSectionProps {
  onFilterChange: (filters: Filter) => void;
  availableSessions?: string[];
  availablePrograms?: string[];
  showSemester?: boolean;
  inlineLayout?: boolean;
  showFacultyCoordinatorOnly?: boolean;
}

const InternshipFilterSection: React.FC<FilterSectionProps> = ({ 
  onFilterChange, 
  availableSessions = [],
  availablePrograms = [],
  showSemester = true,
  inlineLayout = false,
  showFacultyCoordinatorOnly = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<Filter>({
    year: '',
    semester: '',
    session: '',
    program: '',
    facultyCoordinator: '',
  });

  const handleFilterChange = (key: keyof Filter, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      year: '',
      semester: '',
      session: '',
      program: '',
      facultyCoordinator: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Get unique sessions for dropdown
  const uniqueSessions = availableSessions.length > 0 
    ? ['all-sessions', ...new Set(availableSessions)]
    : ['all-sessions', '2022-2023', '2023-2024', '2024-2025', '2025-2026'];

  // Get unique programs for dropdown
  const uniquePrograms = availablePrograms.length > 0
    ? ['all-programs', ...new Set(availablePrograms)]
    : ['all-programs', 'BTech CSE', 'BTech CSE (FSD)', 'BTech CSE (UI/UX)', 'BTech AI/ML', 'BSc CS', 'BSc DS', 'BSc Cyber', 'BCA', 'BCA (AI/DS)'];

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center">
          <FilterIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="font-medium text-gray-900">Filters</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      <div className="p-4">
        {showFacultyCoordinatorOnly ? (
          <div className="grid grid-cols-1">
            <div className="space-y-1.5">
              <Label htmlFor="faculty-coordinator">Faculty Coordinator</Label>
              <Select value={filters.facultyCoordinator || ''} onValueChange={(value) => handleFilterChange('facultyCoordinator', value)}>
                <SelectTrigger id="faculty-coordinator">
                  <SelectValue placeholder="Select Faculty Coordinator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-coordinators">All Coordinators</SelectItem>
                  <SelectItem value="Dr. Pankaj">Dr. Pankaj</SelectItem>
                  <SelectItem value="Dr. Anshu">Dr. Anshu</SelectItem>
                  <SelectItem value="Dr. Meenu">Dr. Meenu</SelectItem>
                  <SelectItem value="Dr. Swati">Dr. Swati</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="session">Session</Label>
              <Select value={filters.session} onValueChange={(value) => handleFilterChange('session', value)}>
                <SelectTrigger id="session">
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-sessions">All Sessions</SelectItem>
                  {uniqueSessions.map((session) => (
                    session !== 'all-sessions' && (
                      <SelectItem key={session} value={session}>
                        {session}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-years">All Years</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="program">Program</Label>
              <Select value={filters.program || ''} onValueChange={(value) => handleFilterChange('program', value)}>
                <SelectTrigger id="program">
                  <SelectValue placeholder="Select Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-programs">All Programs</SelectItem>
                  <SelectItem value="BTech">B.Tech</SelectItem>
                  <SelectItem value="BSc">B.Sc</SelectItem>
                  {uniquePrograms.map((program) => (
                    program !== 'all-programs' && !['BTech', 'BSc'].includes(program) && (
                      <SelectItem key={program} value={program}>
                        {program}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showSemester && (
              <div className="space-y-1.5">
                <Label htmlFor="semester">Semester</Label>
                <Select value={filters.semester} onValueChange={(value) => handleFilterChange('semester', value)}>
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-semesters">All Semesters</SelectItem>
                    {['8','7','6','5','4','3','2','1'].map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label htmlFor="faculty-coordinator">Faculty Coordinator</Label>
              <Select value={filters.facultyCoordinator || ''} onValueChange={(value) => handleFilterChange('facultyCoordinator', value)}>
                <SelectTrigger id="faculty-coordinator">
                  <SelectValue placeholder="Select Faculty Coordinator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-coordinators">All Coordinators</SelectItem>
                  <SelectItem value="Dr. Pankaj">Dr. Pankaj</SelectItem>
                  <SelectItem value="Dr. Anshu">Dr. Anshu</SelectItem>
                  <SelectItem value="Dr. Meenu">Dr. Meenu</SelectItem>
                  <SelectItem value="Dr. Swati">Dr. Swati</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternshipFilterSection;
