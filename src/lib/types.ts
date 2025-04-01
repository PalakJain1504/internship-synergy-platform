
export interface User {
  username: string;
  name: string;
}

export interface ProjectData {
  id: string;
  groupNo: string;
  rollNo: string;
  name: string;
  email: string;
  phoneNo: string;
  title: string;
  domain: string;
  facultyMentor: string;
  industryMentor: string;
  form: string;
  presentation: string;
  report: string;
  year: string;
  semester: string;
  course: string;
  facultyCoordinator: string;
  [key: string]: string; // Add index signature to ProjectData
}

export interface InternshipData {
  id: string;
  rollNo: string;
  name: string;
  program: string;
  organization: string;
  dates: string;
  noc: string;
  offerLetter: string;
  pop: string;
  year: string;
  semester: string;
  course: string;
  [key: string]: string; // For dynamic attendance columns
}

export interface Filter {
  year: string;
  semester: string;
  course: string;
  facultyCoordinator?: string;
}

// Extended interfaces for table components
export interface ProjectEntry {
  id: string;
  groupNo: string;
  rollNo: string;
  name: string;
  email: string;
  phoneNo: string;
  title: string;
  domain: string;
  facultyMentor: string;
  industryMentor: string;
  form: string;
  presentation: string;
  report: string;
  year: string;
  semester: string;
  course: string;
  facultyCoordinator: string;
  isEditing?: boolean;
  isNew?: boolean;
  [key: string]: string | boolean | undefined;
}

export interface InternshipEntry {
  id: string;
  rollNo: string;
  name: string;
  program: string;
  organization: string;
  dates: string;
  noc: string;
  offerLetter: string;
  pop: string;
  year: string;
  semester: string;
  course: string;
  isEditing?: boolean;
  isNew?: boolean;
  [key: string]: string | boolean | undefined;
}
