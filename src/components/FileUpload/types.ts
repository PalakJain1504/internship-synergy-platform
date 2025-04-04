
export interface DriveFile {
  id: string;
  name: string;
  type: string;
  groupNo?: string;
  rollNo?: string;
  program?: string;
}

export interface StudentField {
  name: string;
  rollNo: string;
  email: string;
  phoneNo: string;
}

export interface GroupData {
  groupName: string;
  projectTitle: string;
  domain: string;
  facultyMentor: string;
  industryMentor: string;
  students: StudentField[];
}

export interface FormGroupConfig {
  minStudents: number;
  maxStudents: number;
}
