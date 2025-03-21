
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
}

export interface Filter {
  year: string;
  semester: string;
  course: string;
  facultyCoordinator: string;
}
