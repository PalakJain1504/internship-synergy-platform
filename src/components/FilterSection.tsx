
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
import { FilterIcon, RefreshCw, Search } from 'lucide-react';
import { Filter } from '@/lib/types';

// Sample data for filters
const years = ['4','3', '2', '1'];
const semesters = ['8','7','6','5','4','3','2','1'];
const courses = ['BSc', 'BTech CSE', 'BTech AI/ML', 'BCA', 'BCA AI/DS', 'MCA'];
const facultyCoordinators = [
  'Dr. Pankaj', 
  'Dr. Meenu', 
  'Dr. Swati', 
  'Dr. Anshu'
];

interface FilterSectionProps {
  onFilterChange: (filters: Filter) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<Filter>({
    year: '',
    semester: '',
    course: '',
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
      course: '',
      facultyCoordinator: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

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
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5 mb-4">
            <Label htmlFor="year">Year</Label>
            <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
              <SelectTrigger id="year">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-years">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 mb-4">
            <Label htmlFor="semester">Semester</Label>
            <Select value={filters.semester} onValueChange={(value) => handleFilterChange('semester', value)}>
              <SelectTrigger id="semester">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-semesters">All Semesters</SelectItem>
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester}>
                    {semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 mb-4">
            <Label htmlFor="course">Course</Label>
            <Select value={filters.course} onValueChange={(value) => handleFilterChange('course', value)}>
              <SelectTrigger id="course">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-courses">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 mb-4">
            <Label htmlFor="facultyCoordinator">Faculty Coordinator</Label>
            <Select
              value={filters.facultyCoordinator}
              onValueChange={(value) => handleFilterChange('facultyCoordinator', value)}
            >
              <SelectTrigger id="facultyCoordinator">
                <SelectValue placeholder="Select Coordinator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-coordinators">All Coordinators</SelectItem>
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
