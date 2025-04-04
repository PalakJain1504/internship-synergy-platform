
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Filter } from '@/lib/types';

export interface FilterSectionProps {
  onFilterChange: (filters: Filter) => void;
  availableSessions: string[];
  availablePrograms: string[];
}

const FilterSection: React.FC<FilterSectionProps> = ({ 
  onFilterChange, 
  availableSessions,
  availablePrograms
}) => {
  const [year, setYear] = useState<string>('');
  const [semester, setSemester] = useState<string>('');
  const [session, setSession] = useState<string>('');
  const [facultyCoordinator, setFacultyCoordinator] = useState<string>('');
  const [program, setProgram] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [availableSemesters, setAvailableSemesters] = useState<string[]>(['1', '2', '3', '4', '5', '6', '7', '8']);

  // Mapping for year to semesters
  const yearToSemesterMap: Record<string, string[]> = {
    '1': ['1', '2'],
    '2': ['3', '4'],
    '3': ['5', '6'],
    '4': ['7', '8']
  };

  // Update available semesters when year changes
  useEffect(() => {
    if (year) {
      setAvailableSemesters(yearToSemesterMap[year] || []);
      // If current selected semester is not in the available semesters, reset it
      if (semester && !yearToSemesterMap[year]?.includes(semester)) {
        setSemester('');
      }
    } else {
      setAvailableSemesters(['1', '2', '3', '4', '5', '6', '7', '8']);
    }
  }, [year, semester]);

  useEffect(() => {
    // Apply filters immediately when they change
    const filters: Filter = {
      year,
      semester,
      session,
      facultyCoordinator,
      program
    };
    
    onFilterChange(filters);
  }, [year, semester, session, facultyCoordinator, program, onFilterChange]);

  const clearFilters = () => {
    setYear('');
    setSemester('');
    setSession('');
    setFacultyCoordinator('');
    setProgram('');
    setSearchText('');
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-full md:w-auto flex-1 min-w-[200px]">
          <label htmlFor="session" className="block text-sm font-medium text-gray-700 mb-1">
            Session
          </label>
          <Select
            value={session}
            onValueChange={setSession}
          >
            <SelectTrigger className="w-full" id="session">
              <SelectValue placeholder="All Sessions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-sessions">All Sessions</SelectItem>
              {availableSessions.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-auto flex-1 min-w-[150px]">
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <Select
            value={year}
            onValueChange={setYear}
          >
            <SelectTrigger className="w-full" id="year">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-years">All Years</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-auto flex-1 min-w-[150px]">
          <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
            Semester
          </label>
          <Select
            value={semester}
            onValueChange={setSemester}
          >
            <SelectTrigger className="w-full" id="semester">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-semesters">All Semesters</SelectItem>
              {availableSemesters.map((sem) => (
                <SelectItem key={sem} value={sem}>{sem}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-auto flex-1 min-w-[200px]">
          <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
            Program
          </label>
          <Select
            value={program}
            onValueChange={setProgram}
          >
            <SelectTrigger className="w-full" id="program">
              <SelectValue placeholder="All Programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-programs">All Programs</SelectItem>
              {availablePrograms.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-auto flex-1 min-w-[200px]">
          <label htmlFor="faculty" className="block text-sm font-medium text-gray-700 mb-1">
            Faculty Coordinator
          </label>
          <Select
            value={facultyCoordinator}
            onValueChange={setFacultyCoordinator}
          >
            <SelectTrigger className="w-full" id="faculty">
              <SelectValue placeholder="All Coordinators" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-coordinators">All Coordinators</SelectItem>
              <SelectItem value="Dr. Pankaj">Dr. Pankaj</SelectItem>
              <SelectItem value="Dr. Meenu">Dr. Meenu</SelectItem>
              <SelectItem value="Dr. Swati">Dr. Swati</SelectItem>
              <SelectItem value="Dr. Anshu">Dr. Anshu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearFilters}
            className="h-9 px-2.5"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
