
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ProjectData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to generate sample project data
export function generateSampleProjects(count = 20): ProjectData[] {
  const domains = ['Web Development', 'Mobile App', 'Machine Learning', 'IoT', 'Cloud Computing', 'Blockchain'];
  const facultyMentors = ['Dr. Sharma', 'Prof. Verma', 'Dr. Singh', 'Prof. Kumari', 'Dr. Mehta'];
  const industryMentors = ['Mr. Patel', 'Ms. Gupta', 'Mr. Reddy', 'Ms. Shah', 'Mr. Kumar'];
  const years = ['2021', '2022', '2023'];
  const semesters = ['Spring', 'Summer', 'Fall', 'Winter'];
  const courses = ['BSc', 'BTech CSE', 'BTech AI/ML', 'BCA', 'BCA AI/DS', 'MCA'];
  const facultyCoordinators = ['Dr. Aishwarya Sharma', 'Prof. Rajat Verma', 'Dr. Neeraj Singh', 'Prof. Sunita Kumari'];

  return Array.from({ length: count }).map((_, index) => {
    const groupNo = `G${(index + 1).toString().padStart(2, '0')}`;
    
    return {
      id: `proj-${index + 1}`,
      groupNo,
      rollNo: `R${(10000 + index + 1).toString()}`,
      name: `Student ${index + 1}`,
      email: `student${index + 1}@example.com`,
      phoneNo: `98765${(10000 + index + 1).toString().substring(0, 5)}`,
      title: `Project ${groupNo}: ${domains[index % domains.length]} Solution`,
      domain: domains[index % domains.length],
      facultyMentor: facultyMentors[index % facultyMentors.length],
      industryMentor: industryMentors[index % industryMentors.length],
      form: index % 3 === 0 ? `${groupNo}_form.pdf` : '',
      presentation: index % 4 === 0 ? `${groupNo}_presentation.pdf` : '',
      report: index % 5 === 0 ? `${groupNo}_report.pdf` : '',
      year: years[index % years.length],
      semester: semesters[index % semesters.length],
      course: courses[index % courses.length],
      facultyCoordinator: facultyCoordinators[index % facultyCoordinators.length],
    };
  });
}

// Function to filter projects by criteria
export function filterProjects(projects: ProjectData[], filters: Partial<ProjectData>): ProjectData[] {
  return projects.filter(project => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true; // Skip empty filter values
      return project[key as keyof ProjectData] === value;
    });
  });
}

// Function to export table as PDF
export function exportTableToPDF(
  projects: ProjectData[],
  filters: Partial<ProjectData>,
  title: string = 'Project Data'
) {
  // Initialize jsPDF
  const doc = new jsPDF({
    orientation: 'landscape',
  });
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add filter information
  doc.setFontSize(10);
  let yPos = 30;
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      doc.text(`${key}: ${value}`, 14, yPos);
      yPos += 6;
    }
  });
  
  // Prepare table data
  const tableColumn = [
    'Group No.',
    'Roll No.',
    'Name',
    'Email',
    'Phone',
    'Title',
    'Domain',
    'Faculty Mentor',
    'Industry Mentor',
  ];
  
  const tableRows = projects.map(project => [
    project.groupNo,
    project.rollNo,
    project.name,
    project.email,
    project.phoneNo,
    project.title,
    project.domain,
    project.facultyMentor,
    project.industryMentor,
  ]);
  
  // Generate the table
  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: yPos + 5,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [0, 96, 170],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
  });
  
  // Save the PDF
  doc.save('project_data.pdf');
}

// Add 'jspdf-autotable' declaration
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}
