
import { ProjectData } from '@/lib/types';

export type GroupedProjectData = {
  groupNo: string;
  title: string;
  domain: string;
  facultyMentor: string;
  industryMentor: string;
  students: {
    id: string;
    rollNo: string;
    name: string;
    email: string;
    phoneNo: string;
    year: string;
    semester: string;
    program: string;
    facultyCoordinator: string;
  }[];
  form: string;
  presentation: string;
  report: string;
  year: string;
  semester: string;
  program: string;
  facultyCoordinator: string;
  session: string;
};

/**
 * Groups project data by groupNo to avoid repeating values
 */
export function groupProjectsByGroup(projects: ProjectData[]): GroupedProjectData[] {
  const groupedMap: Record<string, GroupedProjectData> = {};
  
  projects.forEach(project => {
    if (!groupedMap[project.groupNo]) {
      // Initialize the group
      groupedMap[project.groupNo] = {
        groupNo: project.groupNo,
        title: project.title,
        domain: project.domain,
        facultyMentor: project.facultyMentor,
        industryMentor: project.industryMentor,
        students: [],
        form: project.form,
        presentation: project.presentation,
        report: project.report,
        year: project.year,
        semester: project.semester,
        program: project.program,
        facultyCoordinator: project.facultyCoordinator,
        session: project.session
      };
    }
    
    // Add student to the group
    groupedMap[project.groupNo].students.push({
      id: project.id,
      rollNo: project.rollNo,
      name: project.name,
      email: project.email,
      phoneNo: project.phoneNo,
      year: project.year,
      semester: project.semester,
      program: project.program,
      facultyCoordinator: project.facultyCoordinator
    });
    
    // Update file status if any student has uploaded files
    if (project.form && !groupedMap[project.groupNo].form) {
      groupedMap[project.groupNo].form = project.form;
    }
    if (project.presentation && !groupedMap[project.groupNo].presentation) {
      groupedMap[project.groupNo].presentation = project.presentation;
    }
    if (project.report && !groupedMap[project.groupNo].report) {
      groupedMap[project.groupNo].report = project.report;
    }
  });
  
  return Object.values(groupedMap);
}

/**
 * Converts grouped data back to flat project data
 */
export function ungroupProjects(groupedData: GroupedProjectData[]): ProjectData[] {
  const flatData: ProjectData[] = [];
  
  groupedData.forEach(group => {
    group.students.forEach(student => {
      flatData.push({
        id: student.id,
        groupNo: group.groupNo,
        rollNo: student.rollNo,
        name: student.name,
        email: student.email,
        phoneNo: student.phoneNo,
        title: group.title,
        domain: group.domain,
        facultyMentor: group.facultyMentor,
        industryMentor: group.industryMentor,
        form: group.form,
        presentation: group.presentation,
        report: group.report,
        year: student.year,
        semester: student.semester,
        program: student.program,
        facultyCoordinator: student.facultyCoordinator,
        session: group.session
      });
    });
  });
  
  return flatData;
}
