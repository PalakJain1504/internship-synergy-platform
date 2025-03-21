
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ProjectData, Filter } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to generate sample project data
export function generateSampleProjects(count = 70): ProjectData[] {
  const domains = ['Web Development', 'Mobile App', 'Machine Learning', 'IoT', 'Cloud Computing', 'Blockchain'];
  const facultyMentors = ['Dr. Sharma', 'Prof. Verma', 'Dr. Singh', 'Prof. Kumari', 'Dr. Mehta'];
  const industryMentors = ['Mr. Patel', 'Ms. Gupta', 'Mr. Reddy', 'Ms. Shah', 'Mr. Kumar'];
  const years = ['2021', '2022', '2023'];
  const semesters = ['Spring', 'Summer', 'Fall', 'Winter'];
  const courses = ['BSc', 'BTech CSE', 'BTech AI/ML', 'BCA', 'BCA AI/DS', 'MCA'];
  const facultyCoordinators = ['Dr. Aishwarya Sharma', 'Prof. Rajat Verma', 'Dr. Neeraj Singh', 'Prof. Sunita Kumari'];

  return Array.from({ length: count }).map((_, index) => ({
    id: `project-${index + 1}`,
    groupNo: `G${Math.floor(index / 3) + 1}`,
    rollNo: `R${100 + index}`,
    name: `Student ${index + 1}`,
    email: `student${index + 1}@example.com`,
    phoneNo: `98765${index.toString().padStart(5, "0")}`,
    title: `Interactive ${
      index % 3 === 0
        ? "Web Application"
        : index % 3 === 1
        ? "Mobile App"
        : "ML Model"
    } - ${index + 1}`,
    domain:
      index % 5 === 0
        ? "Web Development"
        : index % 5 === 1
        ? "Mobile Development"
        : index % 5 === 2
        ? "Machine Learning"
        : index % 5 === 3
        ? "Blockchain"
        : "IoT",
    facultyMentor:
      index % 4 === 0
        ? "Dr. Sharma"
        : index % 4 === 1
        ? "Prof. Kumar"
        : index % 4 === 2
        ? "Dr. Patel"
        : "Prof. Singh",
    industryMentor:
      index % 3 === 0
        ? "Mr. Jain"
        : index % 3 === 1
        ? "Ms. Gupta"
        : "Mr. Verma",
    form: index % 2 === 0 ? "form.pdf" : "",
    presentation: index % 3 === 0 ? "presentation.pptx" : "",
    report: index % 4 === 0 ? "report.pdf" : "",
    year: years[index % years.length],
    semester: semesters[index % semesters.length],
    course: courses[index % courses.length],
    facultyCoordinator: facultyCoordinators[index % facultyCoordinators.length],
  }));
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

  // Prepare table data
  const tableData = data.map((item) => [
    item.groupNo,
    item.rollNo,
    item.name,
    item.title,
    item.domain,
    item.facultyMentor,
    item.industryMentor,
    item.form ? "Yes" : "No",
    item.presentation ? "Yes" : "No",
    item.report ? "Yes" : "No",
  ]);

  // Define table columns
  const tableColumns = [
    "Group No.",
    "Roll No.",
    "Name",
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
      1: { cellWidth: 60 },
      2: { cellWidth: 80 },
      3: { cellWidth: 120 },
      4: { cellWidth: 80 },
      5: { cellWidth: 80 },
      6: { cellWidth: 80 },
      7: { cellWidth: 40 },
      8: { cellWidth: 40 },
      9: { cellWidth: 40 },
    },
  });

  // Add date and page numbers
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
