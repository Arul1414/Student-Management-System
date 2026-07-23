export interface AcademicSemesterRecord {
  semester: string;
  sgpa: number;
  arrears: number;
  status: 'Passed' | 'Arrear Pending' | 'In Progress';
  credits: number;
  subjectsCount: number;
}

export interface Student {
  id: string; // STU1001, etc.
  fullName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string; // YYYY-MM-DD
  address: string;
  parentName: string;
  parentPhone: string;
  departmentId: string; // Code of department (e.g. "CS")
  courseId: string; // ID of course (e.g. "CS-01")
  yearSemester: string; // e.g. "Year 1 / Sem 2"
  admissionDate: string; // YYYY-MM-DD
  profilePhoto: string; // Base64 data URL or placeholder URL
  status: 'Active' | 'Inactive';
  // Academic Metrics
  cgpa?: number;
  arrears?: number;
  sgpa?: number;
  attendancePercentage?: number;
  completedCredits?: number;
  academicHistory?: AcademicSemesterRecord[];
}

export interface Department {
  id: string; // Unique code (e.g. "CS")
  name: string; // e.g. "Computer Science"
  code: string; // e.g. "DEPT-CS"
  description: string;
}

export interface Course {
  id: string; // Unique ID (e.g. "CS-01")
  name: string; // e.g. "B.Tech Computer Science"
  departmentId: string; // Department code (e.g. "CS")
  duration: string; // e.g. "4 Years"
  description: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  maleStudents: number;
  femaleStudents: number;
  recentStudents: Student[];
  departmentDistribution: { name: string; count: number }[];
  genderDistribution: { name: string; value: number }[];
}

export interface AdminUser {
  email: string;
  fullName: string;
}
