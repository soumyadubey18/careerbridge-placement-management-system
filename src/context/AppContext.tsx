import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Batch,
  Student,
  AttendanceRecord,
  MockTest,
  Interview,
  Project,
  JobOpening,
  PlacementApplication,
  Role,
  AttendanceStatus,
  ApplicationStage,
  AttentionItem,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_BATCHES,
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE,
  INITIAL_MOCK_TESTS,
  INITIAL_INTERVIEWS,
  INITIAL_PROJECTS,
  INITIAL_OPENINGS,
  INITIAL_APPLICATIONS,
} from '../data/mockData';
import { apiClient, getStoredToken, setStoredToken } from '../api/client';

interface AppContextType {
  isAuthenticated: boolean;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  batches: Batch[];
  students: Student[];
  attendance: AttendanceRecord[];
  mockTests: MockTest[];
  interviews: Interview[];
  projects: Project[];
  openings: JobOpening[];
  applications: PlacementApplication[];
  attentionItems: AttentionItem[];

  // Authentication
  login: (email: string, password: string, role?: Role) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    batchId?: string;
    college?: string;
    degree?: string;
    cgpa?: number;
  }) => Promise<void>;
  logout: () => void;
  
  // Student actions
  addStudent: (studentData: {
    name: string;
    email: string;
    phone: string;
    batchId: string;
    college: string;
    degree: string;
    cgpa: number;
    skills: string[];
    notes?: string;
  }) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Batch actions
  addBatch: (batchData: Omit<Batch, 'id'>) => Batch;
  updateBatch: (id: string, updates: Partial<Batch>) => void;

  // Attendance actions
  recordBatchAttendance: (
    batchId: string,
    date: string,
    records: { studentId: string; status: AttendanceStatus; notes?: string }[]
  ) => void;
  getStudentAttendanceStats: (studentId: string) => {
    total: number;
    present: number;
    absent: number;
    percentage: number;
  };

  // Assessment & Interview actions
  addMockTest: (testData: Omit<MockTest, 'id' | 'results'>) => MockTest;
  updateTestScore: (testId: string, studentId: string, score: number, feedback?: string) => void;
  addInterview: (interviewData: Omit<Interview, 'id'>) => Interview;
  updateInterview: (id: string, updates: Partial<Interview>) => void;

  // Project actions
  addProject: (projectData: Omit<Project, 'id' | 'members'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  evaluateProject: (id: string, score: number, feedback: string) => void;

  // Placement actions
  addJobOpening: (openingData: Omit<JobOpening, 'id'>) => JobOpening;
  updateJobOpening: (id: string, updates: Partial<JobOpening>) => void;
  applyForJob: (jobId: string, studentId: string) => boolean;
  updateApplicationStage: (
    appId: string,
    stage: ApplicationStage,
    offeredCtc?: string,
    notes?: string
  ) => void;

  // Utility
  switchRoleUser: (role: Role) => void;
  resetAllData: () => void;
  exportCsv: (category: 'students' | 'attendance' | 'placements') => void;
  notification: string | null;
  setNotification: (msg: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'careerbridge_user_v1',
  AUTH: 'careerbridge_is_auth_v1',
  BATCHES: 'careerbridge_batches_v1',
  STUDENTS: 'careerbridge_students_v1',
  ATTENDANCE: 'careerbridge_attendance_v1',
  TESTS: 'careerbridge_tests_v1',
  INTERVIEWS: 'careerbridge_interviews_v1',
  PROJECTS: 'careerbridge_projects_v1',
  OPENINGS: 'careerbridge_openings_v1',
  APPLICATIONS: 'careerbridge_apps_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_USERS[0]; // Soumya Dubey (Admin)
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
    const token = getStoredToken();
    return savedAuth === 'true' && Boolean(token);
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [notification, setNotification] = useState<string | null>(null);

  const [batches, setBatches] = useState<Batch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_BATCHES;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_STUDENTS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_ATTENDANCE;
  });

  const [mockTests, setMockTests] = useState<MockTest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TESTS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_MOCK_TESTS;
  });

  const [interviews, setInterviews] = useState<Interview[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_INTERVIEWS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_PROJECTS;
  });

  const [openings, setOpenings] = useState<JobOpening[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OPENINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_OPENINGS;
  });

  const [applications, setApplications] = useState<PlacementApplication[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_APPLICATIONS;
  });

  // Sync state with backend on mount
  useEffect(() => {
    async function syncFromBackend() {
      try {
        const [dashRes, stuRes, batchRes, attRes] = await Promise.allSettled([
          apiClient.getDashboard(),
          apiClient.getStudents(),
          apiClient.getBatches(),
          apiClient.getAttendance(),
        ]);

        if (stuRes.status === 'fulfilled' && Array.isArray(stuRes.value) && stuRes.value.length > 0) {
          setStudents(stuRes.value);
        }
        if (batchRes.status === 'fulfilled' && Array.isArray(batchRes.value) && batchRes.value.length > 0) {
          setBatches(batchRes.value);
        }
        if (attRes.status === 'fulfilled' && attRes.value?.records?.length > 0) {
          setAttendance(attRes.value.records);
        }
      } catch (err) {
        // Fall back gracefully to local state
      }
    }

    syncFromBackend();
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(mockTests));
  }, [mockTests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(interviews));
  }, [interviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPENINGS, JSON.stringify(openings));
  }, [openings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
  }, [applications]);

  // Auto clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (msg: string | null) => {
    setNotification(msg);
  };

  // Auth functions
  const login = async (email: string, password: string, role?: Role) => {
    try {
      const res = await apiClient.login(email, password, role);
      setStoredToken(res.token);
      let user = res.user;
      if (role && (user.email === 'dubeysoumya8@gmail.com' || user.email === 'admin@northstar.dev')) {
        user = { ...user, role };
      }
      setCurrentUser(user);
      setIsAuthenticated(true);
      if (user.role === 'STUDENT') {
        setActiveTab('my-portal');
      } else {
        setActiveTab('dashboard');
      }
      showNotification(`Welcome back, ${user.name}! Logged in as ${user.role}.`);
    } catch (err: any) {
      // Fallback check against initial users for offline demo resilience
      const matched = INITIAL_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() || (role && u.role === role)
      );
      if (matched && (password === 'demo123' || !password)) {
        const effectiveUser = {
          ...matched,
          role: role || matched.role,
        };
        const dummyToken = `demo_token_${Date.now()}`;
        setStoredToken(dummyToken);
        setCurrentUser(effectiveUser);
        setIsAuthenticated(true);
        if (effectiveUser.role === 'STUDENT') {
          setActiveTab('my-portal');
        } else {
          setActiveTab('dashboard');
        }
        showNotification(`Welcome back, ${effectiveUser.name}! (Role: ${effectiveUser.role})`);
        return;
      }
      throw err;
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    batchId?: string;
    college?: string;
    degree?: string;
    cgpa?: number;
  }) => {
    try {
      const res = await apiClient.register(payload);
      setStoredToken(res.token);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      if (res.student) {
        setStudents((prev) => [res.student, ...prev]);
      }
      setActiveTab('my-portal');
      showNotification(`Account created for ${res.user.name}. Welcome to CareerBridge!`);
    } catch (err: any) {
      // Offline fallback
      const newUser: User = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        name: payload.name,
        email: payload.email,
        role: 'STUDENT',
        avatar: payload.name.slice(0, 2).toUpperCase(),
        department: 'Student Trainee',
        phone: payload.phone,
      };
      setStoredToken(`token_${Date.now()}`);
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      setActiveTab('my-portal');
      showNotification(`Account created for ${newUser.name}. Welcome to CareerBridge!`);
    }
  };

  const logout = () => {
    setStoredToken(null);
    setIsAuthenticated(false);
    showNotification('Logged out successfully.');
  };

  const getStudentAttendanceStats = (studentId: string) => {
    const records = attendance.filter((a) => a.studentId === studentId);
    if (records.length === 0) {
      const stu = students.find((s) => s.id === studentId);
      return {
        total: 5,
        present: Math.round(5 * ((stu?.attendancePercentage || 85) / 100)),
        absent: 5 - Math.round(5 * ((stu?.attendancePercentage || 85) / 100)),
        percentage: stu?.attendancePercentage || 85,
      };
    }
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const total = records.length;
    const percentage = Math.round((present / total) * 100);
    return { total, present, absent: total - present, percentage };
  };

  const addStudent = (studentData: {
    name: string;
    email: string;
    phone: string;
    batchId: string;
    college: string;
    degree: string;
    cgpa: number;
    skills: string[];
    notes?: string;
  }) => {
    const selectedBatch = batches.find((b) => b.id === studentData.batchId);
    const newId = `stu-${Date.now().toString().slice(-4)}`;
    const nextRollNum = (students.length + 1).toString().padStart(3, '0');
    const newStudent: Student = {
      id: newId,
      rollNo: `NS-2026-${nextRollNum}`,
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone,
      batchId: studentData.batchId,
      batchName: selectedBatch?.name || 'Unassigned Cohort',
      status: 'ACTIVE',
      joiningDate: new Date().toISOString().split('T')[0],
      college: studentData.college || 'National Institute of Engineering',
      degree: studentData.degree || 'B.Tech Computer Science',
      cgpa: studentData.cgpa || 8.0,
      skills: studentData.skills.length > 0 ? studentData.skills : ['JavaScript', 'HTML/CSS', 'Git'],
      attendancePercentage: 100,
      notes: studentData.notes,
    };

    setStudents((prev) => [newStudent, ...prev]);
    // Sync with backend API
    apiClient.createStudent(newStudent).catch(() => {});
    showNotification(`Student "${newStudent.name}" enrolled into ${newStudent.batchName}.`);
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          if (updates.batchId && updates.batchId !== s.batchId) {
            const b = batches.find((batch) => batch.id === updates.batchId);
            if (b) updated.batchName = b.name;
          }
          return updated;
        }
        return s;
      })
    );
    apiClient.updateStudent(id, updates).catch(() => {});
    showNotification('Student details updated.');
  };

  const deleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    apiClient.deleteStudent(id).catch(() => {});
    showNotification(`Student "${target?.name || id}" removed from directory.`);
  };

  const addBatch = (batchData: Omit<Batch, 'id'>) => {
    const newId = `b-${Date.now().toString().slice(-4)}`;
    const newBatch: Batch = { ...batchData, id: newId };
    setBatches((prev) => [...prev, newBatch]);
    apiClient.createBatch(newBatch).catch(() => {});
    showNotification(`New cohort "${newBatch.name}" created.`);
    return newBatch;
  };

  const updateBatch = (id: string, updates: Partial<Batch>) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    apiClient.updateBatch(id, updates).catch(() => {});
    showNotification('Batch details updated.');
  };

  const recordBatchAttendance = (
    batchId: string,
    date: string,
    records: { studentId: string; status: AttendanceStatus; notes?: string }[]
  ) => {
    const newRecords: AttendanceRecord[] = records.map((r, i) => ({
      id: `att-${Date.now()}-${i}`,
      studentId: r.studentId,
      date,
      status: r.status,
      sessionNotes: r.notes,
    }));

    setAttendance((prev) => {
      const studentIds = new Set(records.map((r) => r.studentId));
      const filtered = prev.filter(
        (a) => !(a.date === date && studentIds.has(a.studentId))
      );
      return [...filtered, ...newRecords];
    });

    setStudents((prev) =>
      prev.map((s) => {
        const studentRecord = records.find((r) => r.studentId === s.id);
        if (!studentRecord) return s;

        const priorRecords = attendance.filter(
          (a) => a.studentId === s.id && a.date !== date
        );
        const allRecords = [...priorRecords, { ...studentRecord, id: 'temp', date }];
        const presentCount = allRecords.filter((r) => r.status === 'PRESENT').length;
        const newPct = Math.round((presentCount / allRecords.length) * 100);

        return { ...s, attendancePercentage: newPct };
      })
    );

    apiClient.recordAttendance(batchId, date, records).catch(() => {});
    showNotification(`Attendance for session (${date}) recorded successfully for ${records.length} students.`);
  };

  const addMockTest = (testData: Omit<MockTest, 'id' | 'results'>) => {
    const newId = `test-${Date.now().toString().slice(-4)}`;
    const batchStudents = students.filter((s) => s.batchId === testData.batchId);
    const initialResults = batchStudents.map((s, idx) => ({
      id: `tr-${Date.now()}-${idx}`,
      testId: newId,
      studentId: s.id,
      studentName: s.name,
      score: 0,
      maxScore: testData.maxMarks,
      percentage: 0,
    }));

    const newTest: MockTest = {
      ...testData,
      id: newId,
      results: initialResults,
    };

    setMockTests((prev) => [newTest, ...prev]);
    apiClient.createMockTest(newTest).catch(() => {});
    showNotification(`Mock assessment "${newTest.title}" scheduled.`);
    return newTest;
  };

  const updateTestScore = (
    testId: string,
    studentId: string,
    score: number,
    feedback?: string
  ) => {
    setMockTests((prev) =>
      prev.map((t) => {
        if (t.id !== testId) return t;
        const existingResult = t.results.find((r) => r.studentId === studentId);
        const stu = students.find((s) => s.id === studentId);
        const percentage = Math.round((score / t.maxMarks) * 100);

        let updatedResults;
        if (existingResult) {
          updatedResults = t.results.map((r) =>
            r.studentId === studentId
              ? { ...r, score, percentage, feedback: feedback || r.feedback }
              : r
          );
        } else {
          updatedResults = [
            ...t.results,
            {
              id: `tr-${Date.now()}`,
              testId,
              studentId,
              studentName: stu?.name || 'Student',
              score,
              maxScore: t.maxMarks,
              percentage,
              feedback,
            },
          ];
        }

        return { ...t, results: updatedResults };
      })
    );
    apiClient.updateTestScore(testId, studentId, score, feedback).catch(() => {});
    showNotification('Assessment score recorded.');
  };

  const addInterview = (interviewData: Omit<Interview, 'id'>) => {
    const newId = `int-${Date.now().toString().slice(-4)}`;
    const newInterview: Interview = { ...interviewData, id: newId };
    setInterviews((prev) => [newInterview, ...prev]);
    apiClient.createInterview(newInterview).catch(() => {});
    showNotification(`Mock interview with ${newInterview.studentName} scheduled.`);
    return newInterview;
  };

  const updateInterview = (id: string, updates: Partial<Interview>) => {
    setInterviews((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    apiClient.updateInterview(id, updates).catch(() => {});
    showNotification('Interview evaluation updated.');
  };

  const addProject = (projectData: Omit<Project, 'id' | 'members'>) => {
    const newId = `proj-${Date.now().toString().slice(-4)}`;
    const memberObjs = students
      .filter((s) => projectData.memberIds.includes(s.id))
      .map((s) => ({ id: s.id, name: s.name, email: s.email }));

    const newProject: Project = {
      ...projectData,
      id: newId,
      members: memberObjs,
    };
    setProjects((prev) => [newProject, ...prev]);
    apiClient.createProject(newProject).catch(() => {});
    showNotification(`Capstone project "${newProject.title}" initialized.`);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates };
        if (updates.memberIds) {
          updated.members = students
            .filter((s) => updates.memberIds!.includes(s.id))
            .map((s) => ({ id: s.id, name: s.name, email: s.email }));
        }
        return updated;
      })
    );
    apiClient.updateProject(id, updates).catch(() => {});
    showNotification('Project details saved.');
  };

  const evaluateProject = (id: string, score: number, feedback: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              evaluationScore: score,
              evaluatorFeedback: feedback,
              status: score >= 60 ? 'COMPLETED' : 'SUBMITTED',
            }
          : p
      )
    );
    apiClient.updateProject(id, { evaluationScore: score, evaluatorFeedback: feedback }).catch(() => {});
    showNotification('Project evaluation rubric submitted.');
  };

  const addJobOpening = (openingData: Omit<JobOpening, 'id'>) => {
    const newId = `job-${Date.now().toString().slice(-4)}`;
    const newOpening: JobOpening = { ...openingData, id: newId };
    setOpenings((prev) => [newOpening, ...prev]);
    apiClient.createOpening(newOpening).catch(() => {});
    showNotification(`Campus drive opening for ${newOpening.companyName} added.`);
    return newOpening;
  };

  const updateJobOpening = (id: string, updates: Partial<JobOpening>) => {
    setOpenings((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
    showNotification('Job drive parameters updated.');
  };

  const applyForJob = (jobId: string, studentId: string) => {
    const opening = openings.find((o) => o.id === jobId);
    const stu = students.find((s) => s.id === studentId);
    if (!opening || !stu) return false;

    const existing = applications.find(
      (a) => a.jobId === jobId && a.studentId === studentId
    );
    if (existing) {
      showNotification(`Already applied to ${opening.companyName}.`);
      return false;
    }

    const newApp: PlacementApplication = {
      id: `app-${Date.now().toString().slice(-4)}`,
      jobId,
      jobTitle: opening.role,
      companyName: opening.companyName,
      studentId,
      studentName: stu.name,
      studentEmail: stu.email,
      batchName: stu.batchName,
      appliedDate: new Date().toISOString().split('T')[0],
      stage: 'APPLIED',
      notes: `Applied through portal. CGPA: ${stu.cgpa}, Attendance: ${stu.attendancePercentage}%`,
    };

    setApplications((prev) => [newApp, ...prev]);
    apiClient.applyJob(jobId, studentId).catch(() => {});
    showNotification(`Application submitted for ${opening.companyName} (${opening.role}).`);
    return true;
  };

  const updateApplicationStage = (
    appId: string,
    stage: ApplicationStage,
    offeredCtc?: string,
    notes?: string
  ) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== appId) return a;
        const updated: PlacementApplication = { ...a, stage };
        if (stage === 'SELECTED') {
          updated.offeredCtc = offeredCtc || a.offeredCtc || '8.0 LPA';
          updated.offerDate = new Date().toISOString().split('T')[0];
          updateStudent(a.studentId, { status: 'PLACED' });
        }
        if (notes) updated.notes = notes;
        return updated;
      })
    );
    apiClient.updateApplication(appId, { stage, offeredCtc, notes }).catch(() => {});
    showNotification(`Application stage moved to ${stage}.`);
  };

  const switchRoleUser = (role: Role) => {
    const matched = INITIAL_USERS.find((u) => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      if (role === 'STUDENT') {
        setActiveTab('my-portal');
      } else if (activeTab === 'my-portal') {
        setActiveTab('dashboard');
      }
      showNotification(`Switched viewpoint to ${matched.name} (${role}).`);
    }
  };

  const resetAllData = () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    setBatches(INITIAL_BATCHES);
    setStudents(INITIAL_STUDENTS);
    setAttendance(INITIAL_ATTENDANCE);
    setMockTests(INITIAL_MOCK_TESTS);
    setInterviews(INITIAL_INTERVIEWS);
    setProjects(INITIAL_PROJECTS);
    setOpenings(INITIAL_OPENINGS);
    setApplications(INITIAL_APPLICATIONS);
    setCurrentUser(INITIAL_USERS[0]);
    setIsAuthenticated(true);
    setStoredToken('demo_token');
    apiClient.resetData().catch(() => {});
    showNotification('System records restored to demo seed dataset.');
  };

  const exportCsv = (category: 'students' | 'attendance' | 'placements') => {
    let csvContent = '';
    let filename = '';

    if (category === 'students') {
      filename = `careerbridge_students_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Roll No,Name,Email,Phone,Batch,Status,CGPA,Attendance %,College\n';
      students.forEach((s) => {
        csvContent += `"${s.rollNo}","${s.name}","${s.email}","${s.phone}","${s.batchName}","${s.status}","${s.cgpa}","${s.attendancePercentage}%","${s.college}"\n`;
      });
    } else if (category === 'attendance') {
      filename = `careerbridge_attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Student Name,Roll No,Batch,Total Recorded Sessions,Present,Absent,Overall Attendance %\n';
      students.forEach((s) => {
        const stats = getStudentAttendanceStats(s.id);
        csvContent += `"${s.name}","${s.rollNo}","${s.batchName}",${stats.total},${stats.present},${stats.absent},"${stats.percentage}%"\n`;
      });
    } else if (category === 'placements') {
      filename = `careerbridge_placement_outcomes_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Student Name,Batch,Company,Job Role,Stage,Offered CTC,Offer Date,Notes\n';
      applications.forEach((a) => {
        csvContent += `"${a.studentName}","${a.batchName}","${a.companyName}","${a.jobTitle}","${a.stage}","${a.offeredCtc || 'N/A'}","${a.offerDate || 'N/A'}","${a.notes || ''}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exported ${filename}`);
  };

  // Compute live attention items
  const attentionItems: AttentionItem[] = [];

  students
    .filter((s) => s.attendancePercentage < 75)
    .forEach((s) => {
      attentionItems.push({
        id: `att-alert-${s.id}`,
        type: 'ATTENDANCE_DEFICIT',
        title: `Attendance Deficit: ${s.name} (${s.attendancePercentage}%)`,
        subtitle: `${s.batchName} · Below 75% placement cutoff threshold`,
        severity: 'high',
        targetTab: 'attendance',
      });
    });

  projects
    .filter((p) => p.status === 'SUBMITTED' && !p.evaluationScore)
    .forEach((p) => {
      attentionItems.push({
        id: `proj-alert-${p.id}`,
        type: 'PROJECT_PENDING',
        title: `Project Review Awaiting Evaluation: ${p.title}`,
        subtitle: `${p.batchName} · Submitted by ${p.members.map((m) => m.name).join(', ')}`,
        severity: 'medium',
        targetTab: 'projects',
      });
    });

  mockTests
    .filter((t) => t.status === 'SCHEDULED')
    .forEach((t) => {
      attentionItems.push({
        id: `test-alert-${t.id}`,
        type: 'UPCOMING_TEST',
        title: `Upcoming Assessment: ${t.title}`,
        subtitle: `${t.batchName} · Scheduled for ${t.scheduledDate}`,
        severity: 'low',
        targetTab: 'assessments',
      });
    });

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        setCurrentUser,
        users: INITIAL_USERS,
        activeTab,
        setActiveTab,
        batches,
        students,
        attendance,
        mockTests,
        interviews,
        projects,
        openings,
        applications,
        attentionItems,
        login,
        register,
        logout,
        addStudent,
        updateStudent,
        deleteStudent,
        addBatch,
        updateBatch,
        recordBatchAttendance,
        getStudentAttendanceStats,
        addMockTest,
        updateTestScore,
        addInterview,
        updateInterview,
        addProject,
        updateProject,
        evaluateProject,
        addJobOpening,
        updateJobOpening,
        applyForJob,
        updateApplicationStage,
        switchRoleUser,
        resetAllData,
        exportCsv,
        notification,
        setNotification: showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
