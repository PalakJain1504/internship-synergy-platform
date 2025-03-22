import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ProjectData, Filter, InternshipData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to generate sample project data
export function generateSampleProjects(count = 70): ProjectData[] {
  const domains = ['Web Development', 'Mobile App', 'Machine Learning', 'IoT', 'Cloud Computing', 'Blockchain'];
  const facultyMentors = ['Dr. Sharma', 'Prof. Verma', 'Dr. Singh', 'Prof. Kumari', 'Dr. Mehta'];
  const industryMentors = ['Mr. Patel', 'Ms. Gupta', 'Mr. Reddy', 'Ms. Shah', 'Mr. Kumar'];
  const years = ['4','3', '2', '1'];
  const semesters = ['8','7','6','5','4','3','2','1'];
  const courses = ['BSc', 'BTech CSE', 'BTech AI/ML', 'BCA', 'BCA AI/DS', 'MCA'];
  const facultyCoordinators = [
    'Dr. Pankaj', 
    'Dr. Meenu', 
    'Dr. Swati', 
    'Dr. Anshu'
  ];

  return Array.from({ length: count }).map((_, index) => {
    const groupNo = `G${Math.floor(index / 3) + 1}`;
    const groupIndex = Math.floor(index / 3);
    
    const title = `${
      groupIndex % 5 === 0
        ? "AI-Powered Web"
        : groupIndex % 5 === 1
        ? "Smart Mobile App"
        : groupIndex % 5 === 2
        ? "ML Project"
        : groupIndex % 5 === 3
        ? "IoT Solution"
        : "Blockchain App"
    } - ${groupIndex + 1}`;
    
    const domain =
      groupIndex % 5 === 0
        ? "Web Development"
        : groupIndex % 5 === 1
        ? "Mobile Development"
        : groupIndex % 5 === 2
        ? "Machine Learning"
        : groupIndex % 5 === 3
        ? "IoT"
        : "Blockchain";
    
    const facultyMentor = facultyMentors[groupIndex % facultyMentors.length];
    const industryMentor = industryMentors[groupIndex % industryMentors.length];
    
    return {
      id: `project-${index + 1}`,
      groupNo,
      rollNo: `R${100 + index}`,
      name: `Student ${index + 1}`,
      email: `student${index + 1}@example.com`,
      phoneNo: `98765${index.toString().padStart(5, "0")}`,
      title,
      domain,
      facultyMentor,
      industryMentor,
      form: index % 2 === 0 ? `form_group${groupIndex + 1}.pdf` : "",
      presentation: index % 3 === 0 ? `presentation_group${groupIndex + 1}.pdf` : "",
      report: index % 4 === 0 ? `report_group${groupIndex + 1}.pdf` : "",
      year: years[groupIndex % years.length],
      semester: semesters[groupIndex % semesters.length],
      course: courses[groupIndex % courses.length],
      facultyCoordinator: facultyCoordinators[groupIndex % facultyCoordinators.length],
    };
  });
}

// Function to generate sample internship data
export function generateSampleInternships(count = 50): InternshipData[] {
  const programs = ['BSc', 'BTech CSE', 'BTech AI/ML', 'BCA', 'BCA AI/DS', 'MCA'];
  const organizations = ['Microsoft', 'Google', 'Amazon', 'IBM', 'Infosys', 'TCS', 'Wipro', 'Accenture'];
  const years = ['4','3', '2', '1'];
  const semesters = ['8','7','6','5','4','3','2','1'];

  return Array.from({ length: count }).map((_, index) => {
    return {
      id: `internship-${index + 1}`,
      rollNo: `R${100 + index}`,
      name: `Student ${index + 1}`,
      program: programs[index % programs.length],
      organization: organizations[index % organizations.length],
      dates: `${new Date().getMonth() + 1}/1/2023 - ${new Date().getMonth() + 2}/1/2023`,
      noc: index % 2 === 0 ? `noc_${index + 1}.pdf` : "",
      offerLetter: index % 3 === 0 ? `offer_${index + 1}.pdf` : "",
      pop: index % 4 === 0 ? `pop_${index + 1}.pdf` : "",
      year: years[index % years.length],
      semester: semesters[index % semesters.length],
      course: programs[index % programs.length],
      ...(index % 5 === 0 ? { "Attendance May": `attendance_may_${index + 1}.pdf` } : {}),
      ...(index % 7 === 0 ? { "Attendance June": `attendance_june_${index + 1}.pdf` } : {})
    };
  });
}

export function filterProjects(
  projects: ProjectData[],
  filters: Filter
): ProjectData[] {
  return projects.filter((project) => {
    const yearMatch = !filters.year || 
                      filters.year === 'all-years' || 
                      project.year === filters.year;
                      
    const semesterMatch = !filters.semester || 
                          filters.semester === 'all-semesters' || 
                          project.semester === filters.semester;
                          
    const courseMatch = !filters.course || 
                        filters.course === 'all-courses' || 
                        project.course === filters.course;
                        
    const facultyCoordinatorMatch = !filters.facultyCoordinator || 
                                    filters.facultyCoordinator === 'all-coordinators' || 
                                    project.facultyCoordinator === filters.facultyCoordinator;

    return yearMatch && semesterMatch && courseMatch && facultyCoordinatorMatch;
  });
}

export function filterInternships(
  internships: InternshipData[],
  filters: Filter
): InternshipData[] {
  return internships.filter((internship) => {
    const yearMatch = !filters.year || 
                      filters.year === 'all-years' || 
                      internship.year === filters.year;
                      
    const semesterMatch = !filters.semester || 
                          filters.semester === 'all-semesters' || 
                          internship.semester === filters.semester;
                          
    const courseMatch = !filters.course || 
                        filters.course === 'all-courses' || 
                        internship.course === filters.course;

    return yearMatch && semesterMatch && courseMatch;
  });
}

export function exportTableToPDF(
  data: ProjectData[],
  filters: Filter,
  title: string
) {
  const doc = new jsPDF("landscape", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // Add title
  doc.setFontSize(18);
  doc.text(title, pageWidth / 2, margin, { align: "center" });

  // Add filters
  doc.setFontSize(10);
  const filterTexts = [
    filters.year ? `Year: ${filters.year}` : "",
    filters.semester ? `Semester: ${filters.semester}` : "",
    filters.course ? `Course: ${filters.course}` : "",
    filters.facultyCoordinator
      ? `Faculty Coordinator: ${filters.facultyCoordinator}`
      : "",
  ].filter(Boolean);

  if (filterTexts.length > 0) {
    doc.setFontSize(10);
    doc.text("Filters:", margin, margin + 30);
    filterTexts.forEach((text, i) => {
      doc.text(text, margin, margin + 45 + i * 15);
    });
  }

  // Group data by group number for the report
  type GroupedData = {
    [key: string]: {
      groupNo: string;
      title: string;
      domain: string;
      facultyMentor: string;
      industryMentor: string;
      students: {
        rollNo: string;
        name: string;
        email: string;
        phoneNo: string;
      }[];
      form: string;
      presentation: string;
      report: string;
    }
  };
  
  const groupedData: GroupedData = {};
  
  data.forEach(item => {
    if (!groupedData[item.groupNo]) {
      groupedData[item.groupNo] = {
        groupNo: item.groupNo,
        title: item.title,
        domain: item.domain,
        facultyMentor: item.facultyMentor,
        industryMentor: item.industryMentor,
        students: [],
        form: item.form,
        presentation: item.presentation,
        report: item.report
      };
    }
    
    groupedData[item.groupNo].students.push({
      rollNo: item.rollNo,
      name: item.name,
      email: item.email,
      phoneNo: item.phoneNo
    });
    
    // Update file status (in case different students have uploaded different files)
    if (item.form && !groupedData[item.groupNo].form) {
      groupedData[item.groupNo].form = item.form;
    }
    if (item.presentation && !groupedData[item.groupNo].presentation) {
      groupedData[item.groupNo].presentation = item.presentation;
    }
    if (item.report && !groupedData[item.groupNo].report) {
      groupedData[item.groupNo].report = item.report;
    }
  });
  
  // Prepare table data from grouped data
  const tableData = Object.values(groupedData).map(group => {
    const studentNames = group.students.map(s => s.name).join(", ");
    const studentRolls = group.students.map(s => s.rollNo).join(", ");
    
    return [
      group.groupNo,
      studentRolls,
      studentNames,
      group.title,
      group.domain,
      group.facultyMentor,
      group.industryMentor,
      group.form ? "Yes" : "No",
      group.presentation ? "Yes" : "No",
      group.report ? "Yes" : "No",
    ];
  });

  // Define table columns
  const tableColumns = [
    "Group No.",
    "Roll Numbers",
    "Student Names",
    "Title",
    "Domain",
    "Faculty Mentor",
    "Industry Mentor",
    "Form",
    "Presentation",
    "Report",
  ];

  // Add table to PDF
  autoTable(doc, {
    head: [tableColumns],
    body: tableData,
    startY: margin + 90,
    margin: { top: margin, right: margin, bottom: margin, left: margin },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [200, 200, 200],
    },
    headStyles: {
      fillColor: [30, 94, 170],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 80 },
      2: { cellWidth: 100 },
      3: { cellWidth: 100 },
      4: { cellWidth: 80 },
      5: { cellWidth: 80 },
      6: { cellWidth: 80 },
      7: { cellWidth: 30 },
      8: { cellWidth: 30 },
      9: { cellWidth: 30 },
    },
  });

  // Add date and page numbers
  // Fix the getNumberOfPages method issue
  const totalPages = (doc as any).internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      margin,
      pageHeight - margin / 2
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - margin / 2,
      { align: "right" }
    );
  }

  // Save the PDF
  doc.save("project-portal-report.pdf");
}

export function exportInternshipTableToPDF(
  data: InternshipData[],
  filters: Filter,
  title: string
) {
  const doc = new jsPDF("landscape", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // Add title
  doc.setFontSize(18);
  doc.text(title, pageWidth / 2, margin, { align: "center" });

  // Add filters
  doc.setFontSize(10);
  const filterTexts = [
    filters.year ? `Year: ${filters.year}` : "",
    filters.semester ? `Semester: ${filters.semester}` : "",
    filters.course ? `Course: ${filters.course}` : "",
  ].filter(Boolean);

  if (filterTexts.length > 0) {
    doc.setFontSize(10);
    doc.text("Filters:", margin, margin + 30);
    filterTexts.forEach((text, i) => {
      doc.text(text, margin, margin + 45 + i * 15);
    });
  }
  
  // Get all columns including dynamic ones
  const staticColumns = [
    "S.No.", "Roll No.", "Student Name", "Program", "Organization", 
    "Dates", "NOC", "Offer Letter", "PoP"
  ];
  
  // Find all dynamic columns (attendance, etc.)
  const dynamicColumns: string[] = [];
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (!["id", "rollNo", "name", "program", "organization", "dates", "noc", "offerLetter", "pop", "year", "semester", "course"].includes(key) && 
          !dynamicColumns.includes(key)) {
        dynamicColumns.push(key);
      }
    });
  });
  
  const allColumns = [...staticColumns, ...dynamicColumns];

  // Prepare table data
  const tableData = data.map((internship, index) => {
    const row = [
      (index + 1).toString(),
      internship.rollNo,
      internship.name,
      internship.program,
      internship.organization,
      internship.dates,
      internship.noc ? "Yes" : "No",
      internship.offerLetter ? "Yes" : "No",
      internship.pop ? "Yes" : "No",
    ];
    
    // Add dynamic column values
    dynamicColumns.forEach(col => {
      row.push(internship[col] ? "Yes" : "No");
    });
    
    return row;
  });

  // Add table to PDF
  autoTable(doc, {
    head: [allColumns],
    body: tableData,
    startY: margin + 90,
    margin: { top: margin, right: margin, bottom: margin, left: margin },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [200, 200, 200],
    },
    headStyles: {
      fillColor: [30, 94, 170],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });

  // Add date and page numbers
  // Fix the getNumberOfPages method issue
  const totalPages = (doc as any).internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      margin,
      pageHeight - margin / 2
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - margin / 2,
      { align: "right" }
    );
  }

  // Save the PDF
  doc.save("internship-portal-report.pdf");
}

// Function to add tabs to the UI
export function addTabs(tab1: string, tab2: string) {
  return [tab1, tab2];
}
