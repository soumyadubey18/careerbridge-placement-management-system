export type Role = 'ADMIN' | 'TRAINER' | 'PLACEMENT' | 'STUDENT';

export type StudentStatus = 'ACTIVE' | 'ON_HOLD' | 'PLACED' | 'ALUMNI';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED';

export type ApplicationStage = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';

export type InterviewRound = 'Technical 1' | 'Technical 2' | 'System Design' | 'HR & Behavioral' | 'Director Round';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department?: string;
  phone?: string;
}

export interface Batch {
  id: string;
  name: string;
  code: string;
  course: string;
  trainerName: string;
  trainerEmail: string;
  schedule: string; // e.g. "Mon-Fri 09:30 AM - 12:30 PM"
  mode: 'In-Person' | 'Online' | 'Hybrid';
  startDate: string;
  endDate: string;
  capacity: number;
  classroom?: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  sessionNotes?: string;
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  batchId: string;
  batchName: string;
  status: StudentStatus;
  joiningDate: string;
  college: string;
  degree: string;
  cgpa: number;
  skills: string[];
  attendancePercentage: number;
  notes?: string;
}

export interface TestResult {
  id: string;
  testId: string;
  studentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  percentage: number;
  feedback?: string;
}

export interface MockTest {
  id: string;
  title: string;
  topic: string;
  batchId: string;
  batchName: string;
  scheduledDate: string; // YYYY-MM-DD
  maxMarks: number;
  passingMarks: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  results: TestResult[];
}

export interface Interview {
  id: string;
  studentId: string;
  studentName: string;
  batchName: string;
  round: InterviewRound;
  interviewer: string;
  scheduledDate: string; // YYYY-MM-DD HH:mm
  status: 'SCHEDULED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  score?: number; // 1-10
  feedback?: string;
  strengths?: string;
  improvements?: string;
}

export interface Project {
  id: string;
  title: string;
  batchId: string;
  batchName: string;
  domain: string;
  description: string;
  deadline: string;
  status: ProjectStatus;
  repoUrl?: string;
  demoUrl?: string;
  memberIds: string[];
  members: { id: string; name: string; email: string }[];
  evaluationScore?: number; // 0-100
  evaluatorFeedback?: string;
}

export interface Company {
  id: string;
  name: string;
  logoText: string;
  website?: string;
  roles: JobOpening[];
}

export interface JobOpening {
  id: string;
  companyId: string;
  companyName: string;
  jobCode: string;
  role: string;
  location: string;
  jobType: 'Full-Time' | 'Internship' | 'Contract';
  ctc: string; // e.g. "8.5 LPA"
  deadline: string;
  minAttendance: number; // e.g. 75
  minCgpa: number; // e.g. 7.0
  openingsCount: number;
  status: 'OPEN' | 'INTERVIEWING' | 'CLOSED';
  description: string;
}

export interface PlacementApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  batchName: string;
  appliedDate: string;
  stage: ApplicationStage;
  offeredCtc?: string;
  offerDate?: string;
  notes?: string;
}

export interface AttentionItem {
  id: string;
  type: 'ATTENDANCE_DEFICIT' | 'PROJECT_PENDING' | 'UPCOMING_TEST' | 'UPCOMING_INTERVIEW' | 'HOT_JOB';
  title: string;
  subtitle: string;
  severity: 'high' | 'medium' | 'low';
  targetTab: string;
}
