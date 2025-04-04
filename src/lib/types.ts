
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
  session: string;
  program: string; // Adding program field for projects
  facultyCoordinator: string;
  isEditing?: boolean;
  isNew?: boolean;
  [key: string]: string | boolean | undefined; // Update index signature to allow boolean and undefined
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
  session: string;
  isEditing?: boolean;
  isNew?: boolean;
  [key: string]: string | boolean | undefined; // Update for dynamic attendance columns
}

export interface Filter {
  year: string;
  semester: string;
  session: string;
  facultyCoordinator?: string;
  program?: string;
}

// Define Form submission settings types
export interface FormSettings {
  portalType: 'project' | 'internship';
  title: string;
  session: string;
  year: string;
  semester: string;
  program?: string;
  minStudents?: number;
  maxStudents?: number;
  includeFields: string[];
  pdfFields: string[];
  customFields: string[];
}

export interface FormSubmission {
  formId: string;
  timestamp: string;
  data: Record<string, string>;
  files: Record<string, string>;
}

// Add ProjectEntry and InternshipEntry types for supabase service
export interface ProjectEntry extends ProjectData {}
export interface InternshipEntry extends InternshipData {}
