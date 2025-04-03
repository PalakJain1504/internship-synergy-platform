
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

// Sample data for filters
const years = ['4','3', '2', '1'];
const semesters = ['8','7','6','5','4','3','2','1'];
const facultyCoordinators = ['Dr. Pankaj', 'Dr. Meenu', 'Dr. Swati', 'Dr. Anshu'];

interface FilterSectionProps {
  onFilterChange: (filters: Filter) => void;
  availableSessions?: string[];
}

const FilterSection: React.FC<FilterSectionProps> = ({ 
  onFilterChange,
  availableSessions = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<Filter>({
    year: '',
    semester: '',
    session: '',
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
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpand}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ height: 'auto' }}
        animate={{ height: isExpanded ? 'auto' : '80px' }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="year">Year</Label>
            <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
              <SelectTrigger id="year">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="semester">Semester</Label>
            <Select value={filters.semester} onValueChange={(value) => handleFilterChange('semester', value)}>
              <SelectTrigger id="semester">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Semesters</SelectItem>
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester}>
                    {semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="session">Session</Label>
            <Select value={filters.session} onValueChange={(value) => handleFilterChange('session', value)}>
              <SelectTrigger id="session">
                <SelectValue placeholder="Select Session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sessions</SelectItem>
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
            <Label htmlFor="facultyCoordinator">Faculty Coordinator</Label>
            <Select value={filters.facultyCoordinator || ''} onValueChange={(value) => handleFilterChange('facultyCoordinator', value)}>
              <SelectTrigger id="facultyCoordinator">
                <SelectValue placeholder="Select Coordinator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Coordinators</SelectItem>
                {facultyCoordinators.map((coordinator) => (
                  <SelectItem key={coordinator} value={coordinator}>
                    {coordinator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FilterSection;
