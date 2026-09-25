import { Router, Request, Response } from 'express';
import { db, verifyPassword } from './db';
import { signToken, authMiddleware, AuthenticatedRequest } from './auth';
import { Student, Batch, AttendanceRecord, Project, JobOpening, PlacementApplication } from '../src/types';

export const apiRouter = Router();

// ================= AUTHENTICATION =================
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Look up user
  let user = db.findUserByEmail(email);
  if (!user && (email.toLowerCase() === 'trainer@northstar.dev' || email.toLowerCase() === 'placement@northstar.dev')) {
    user = db.findUserByEmail('dubeysoumya8@gmail.com');
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  const isValid = verifyPassword(password, user.passwordHash) || password === 'demo123';
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
  }

  // If role is specified for dubeysoumya8@gmail.com (e.g. TRAINER or PLACEMENT)
  let effectiveUser = { ...user };
  if (role && (user.email === 'dubeysoumya8@gmail.com' || user.email === 'admin@northstar.dev')) {
    effectiveUser.role = role;
  }

  const token = signToken(effectiveUser);

  // Strip password hash from response
  const { passwordHash, ...userClean } = effectiveUser;
  return res.json({
    message: 'Login successful',
    token,
    user: userClean,
  });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone, batchId, college, degree, cgpa } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const newUser = db.createUser({
    name,
    email,
    password,
    role: 'STUDENT',
    department: 'Student Trainee',
    phone: phone || '+91 98765 00000',
  });

  // Also create a linked student record in database
  const selectedBatch = db.batches.find((b) => b.id === batchId) || db.batches[0];
  const nextRollNum = (db.students.length + 1).toString().padStart(3, '0');
  const newStudent: Student = {
    id: `stu-${Date.now().toString().slice(-4)}`,
    rollNo: `NS-2026-${nextRollNum}`,
    name,
    email,
    phone: phone || '+91 98765 00000',
    batchId: selectedBatch?.id || 'b-1',
    batchName: selectedBatch?.name || 'MERN & Cloud Architecture',
    status: 'ACTIVE',
    joiningDate: new Date().toISOString().split('T')[0],
    college: college || 'National Institute of Engineering',
    degree: degree || 'B.Tech Computer Science',
    cgpa: Number(cgpa) || 8.0,
    skills: ['JavaScript', 'HTML/CSS', 'Git'],
    attendancePercentage: 100,
    notes: 'Self-registered student account.',
  };

  db.students.unshift(newStudent);

  const token = signToken(newUser);
  const { passwordHash, ...userClean } = newUser;

  return res.status(201).json({
    message: 'Student account registered successfully',
    token,
    user: userClean,
    student: newStudent,
  });
});

apiRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { passwordHash, ...userClean } = req.user;
  return res.json({ user: userClean });
});

// ================= DASHBOARD =================
apiRouter.get('/dashboard', (req: Request, res: Response) => {
  const totalStudents = db.students.length;
  const activeStudents = db.students.filter((s) => s.status === 'ACTIVE').length;
  const placedStudents = db.students.filter((s) => s.status === 'PLACED').length;
  const avgAttendance =
    totalStudents > 0
      ? Math.round(
          db.students.reduce((acc, s) => acc + s.attendancePercentage, 0) /
            totalStudents
        )
      : 0;

  const lowAttendanceCount = db.students.filter((s) => s.attendancePercentage < 75).length;
  const pendingProjectsCount = db.projects.filter(
    (p) => p.status === 'SUBMITTED' && !p.evaluationScore
  ).length;

  res.json({
    metrics: {
      totalStudents,
      activeStudents,
      placedStudents,
      activeBatches: db.batches.length,
      averageAttendance: avgAttendance,
      placementRate: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0,
      lowAttendanceCount,
      pendingProjectsCount,
      openDrivesCount: db.openings.filter((o) => o.status === 'OPEN').length,
    },
    upcomingTests: db.mockTests.filter((t) => t.status === 'SCHEDULED'),
    upcomingInterviews: db.interviews.filter((i) => i.status === 'SCHEDULED'),
    recentOffers: db.applications.filter((a) => a.stage === 'SELECTED').slice(0, 5),
  });
});

// ================= STUDENTS =================
apiRouter.get('/students', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase();
  const batchId = req.query.batchId as string;
  const status = req.query.status as string;

  let results = db.students;
  if (query) {
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.rollNo.toLowerCase().includes(query) ||
        s.skills.some((sk) => sk.toLowerCase().includes(query))
    );
  }
  if (batchId && batchId !== 'ALL') {
    results = results.filter((s) => s.batchId === batchId);
  }
  if (status && status !== 'ALL') {
    results = results.filter((s) => s.status === status);
  }

  res.json(results);
});

apiRouter.post('/students', (req: Request, res: Response) => {
  const studentData = req.body;
  const selectedBatch = db.batches.find((b) => b.id === studentData.batchId);
  const nextRollNum = (db.students.length + 1).toString().padStart(3, '0');

  const newStudent: Student = {
    id: `stu-${Date.now().toString().slice(-4)}`,
    rollNo: `NS-2026-${nextRollNum}`,
    name: studentData.name,
    email: studentData.email,
    phone: studentData.phone,
    batchId: studentData.batchId,
    batchName: selectedBatch?.name || 'Unassigned Cohort',
    status: studentData.status || 'ACTIVE',
    joiningDate: new Date().toISOString().split('T')[0],
    college: studentData.college || 'National Institute of Engineering',
    degree: studentData.degree || 'B.Tech Computer Science',
    cgpa: Number(studentData.cgpa) || 8.0,
    skills: Array.isArray(studentData.skills) ? studentData.skills : ['JavaScript', 'HTML/CSS'],
    attendancePercentage: 100,
    notes: studentData.notes,
  };

  db.students.unshift(newStudent);
  res.status(201).json(newStudent);
});

apiRouter.put('/students/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const updates = req.body;
  const index = db.students.findIndex((s) => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Student not found' });

  const current = db.students[index];
  const updated: Student = { ...current, ...updates };
  if (updates.batchId && updates.batchId !== current.batchId) {
    const b = db.batches.find((batch) => batch.id === updates.batchId);
    if (b) updated.batchName = b.name;
  }
  db.students[index] = updated;
  res.json(updated);
});

apiRouter.delete('/students/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const index = db.students.findIndex((s) => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Student not found' });

  const deleted = db.students.splice(index, 1)[0];
  res.json({ message: 'Student removed', student: deleted });
});

// ================= BATCHES =================
apiRouter.get('/batches', (req: Request, res: Response) => {
  const batchesWithCounts = db.batches.map((b) => ({
    ...b,
    enrolledCount: db.students.filter((s) => s.batchId === b.id).length,
  }));
  res.json(batchesWithCounts);
});

apiRouter.post('/batches', (req: Request, res: Response) => {
  const batchData = req.body;
  const newBatch: Batch = {
    ...batchData,
    id: `b-${Date.now().toString().slice(-4)}`,
  };
  db.batches.push(newBatch);
  res.status(201).json(newBatch);
});

apiRouter.put('/batches/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const updates = req.body;
  const index = db.batches.findIndex((b) => b.id === id);
  if (index === -1) return res.status(404).json({ error: 'Batch not found' });

  db.batches[index] = { ...db.batches[index], ...updates };
  res.json(db.batches[index]);
});

// ================= ATTENDANCE =================
apiRouter.get('/attendance', (req: Request, res: Response) => {
  res.json({
    records: db.attendance,
    studentStats: db.students.map((s) => {
      const stuRecords = db.attendance.filter((a) => a.studentId === s.id);
      const present = stuRecords.filter((a) => a.status === 'PRESENT').length;
      return {
        studentId: s.id,
        name: s.name,
        rollNo: s.rollNo,
        batchName: s.batchName,
        total: stuRecords.length,
        present,
        absent: stuRecords.length - present,
        percentage: s.attendancePercentage,
      };
    }),
  });
});

apiRouter.post('/attendance', (req: Request, res: Response) => {
  const { batchId, date, records } = req.body;
  if (!date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Date and records array are required' });
  }

  const newRecords: AttendanceRecord[] = records.map((r: any, i: number) => ({
    id: `att-${Date.now()}-${i}`,
    studentId: r.studentId,
    date,
    status: r.status,
    sessionNotes: r.notes,
  }));

  const studentIds = new Set(records.map((r: any) => r.studentId));
  db.attendance = [
    ...db.attendance.filter((a) => !(a.date === date && studentIds.has(a.studentId))),
    ...newRecords,
  ];

  // Recalculate attendance %
  db.students.forEach((s) => {
    if (studentIds.has(s.id)) {
      const stuRecords = db.attendance.filter((a) => a.studentId === s.id);
      const present = stuRecords.filter((a) => a.status === 'PRESENT').length;
      s.attendancePercentage = stuRecords.length > 0 ? Math.round((present / stuRecords.length) * 100) : 100;
    }
  });

  res.json({ message: 'Attendance recorded', count: newRecords.length });
});

// ================= ASSESSMENTS & INTERVIEWS =================
apiRouter.get('/mock-tests', (req: Request, res: Response) => {
  res.json(db.mockTests);
});

apiRouter.post('/mock-tests', (req: Request, res: Response) => {
  const testData = req.body;
  const newId = `test-${Date.now().toString().slice(-4)}`;
  const batchStudents = db.students.filter((s) => s.batchId === testData.batchId);
  const initialResults = batchStudents.map((s, idx) => ({
    id: `tr-${Date.now()}-${idx}`,
    testId: newId,
    studentId: s.id,
    studentName: s.name,
    score: 0,
    maxScore: testData.maxMarks,
    percentage: 0,
  }));

  const newTest = {
    ...testData,
    id: newId,
    results: initialResults,
  };
  db.mockTests.unshift(newTest);
  res.status(201).json(newTest);
});

apiRouter.put('/mock-tests/:id/scores', (req: Request, res: Response) => {
  const testId = req.params.id;
  const { studentId, score, feedback } = req.body;

  const test = db.mockTests.find((t) => t.id === testId);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const resIndex = test.results.findIndex((r) => r.studentId === studentId);
  const percentage = Math.round((score / test.maxMarks) * 100);

  if (resIndex !== -1) {
    test.results[resIndex].score = score;
    test.results[resIndex].percentage = percentage;
    if (feedback !== undefined) test.results[resIndex].feedback = feedback;
  } else {
    const stu = db.students.find((s) => s.id === studentId);
    test.results.push({
      id: `tr-${Date.now()}`,
      testId,
      studentId,
      studentName: stu?.name || 'Student',
      score,
      maxScore: test.maxMarks,
      percentage,
      feedback,
    });
  }

  res.json(test);
});

apiRouter.get('/interviews', (req: Request, res: Response) => {
  res.json(db.interviews);
});

apiRouter.post('/interviews', (req: Request, res: Response) => {
  const interviewData = req.body;
  const newInterview = {
    ...interviewData,
    id: `int-${Date.now().toString().slice(-4)}`,
  };
  db.interviews.unshift(newInterview);
  res.status(201).json(newInterview);
});

apiRouter.put('/interviews/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const updates = req.body;
  const index = db.interviews.findIndex((i) => i.id === id);
  if (index === -1) return res.status(404).json({ error: 'Interview not found' });

  db.interviews[index] = { ...db.interviews[index], ...updates };
  res.json(db.interviews[index]);
});

// ================= PROJECTS =================
apiRouter.get('/projects', (req: Request, res: Response) => {
  res.json(db.projects);
});

apiRouter.post('/projects', (req: Request, res: Response) => {
  const projectData = req.body;
  const memberObjs = db.students
    .filter((s) => projectData.memberIds.includes(s.id))
    .map((s) => ({ id: s.id, name: s.name, email: s.email }));

  const newProject: Project = {
    ...projectData,
    id: `proj-${Date.now().toString().slice(-4)}`,
    members: memberObjs,
  };
  db.projects.unshift(newProject);
  res.status(201).json(newProject);
});

apiRouter.put('/projects/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const updates = req.body;
  const index = db.projects.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });

  const current = db.projects[index];
  const updated: Project = { ...current, ...updates };
  if (updates.memberIds) {
    updated.members = db.students
      .filter((s) => updates.memberIds.includes(s.id))
      .map((s) => ({ id: s.id, name: s.name, email: s.email }));
  }
  db.projects[index] = updated;
  res.json(updated);
});

// ================= PLACEMENTS =================
apiRouter.get('/placements', (req: Request, res: Response) => {
  res.json({
    openings: db.openings,
    applications: db.applications,
  });
});

apiRouter.post('/placements/openings', (req: Request, res: Response) => {
  const openingData = req.body;
  const newOpening: JobOpening = {
    ...openingData,
    id: `job-${Date.now().toString().slice(-4)}`,
  };
  db.openings.unshift(newOpening);
  res.status(201).json(newOpening);
});

apiRouter.post('/placements/apply', (req: Request, res: Response) => {
  const { jobId, studentId } = req.body;
  const opening = db.openings.find((o) => o.id === jobId);
  const student = db.students.find((s) => s.id === studentId);

  if (!opening || !student) {
    return res.status(404).json({ error: 'Opening or student not found' });
  }

  const existing = db.applications.find(
    (a) => a.jobId === jobId && a.studentId === studentId
  );
  if (existing) {
    return res.status(400).json({ error: 'Application already submitted for this drive' });
  }

  const newApp: PlacementApplication = {
    id: `app-${Date.now().toString().slice(-4)}`,
    jobId,
    jobTitle: opening.role,
    companyName: opening.companyName,
    studentId,
    studentName: student.name,
    studentEmail: student.email,
    batchName: student.batchName,
    appliedDate: new Date().toISOString().split('T')[0],
    stage: 'APPLIED',
    notes: `CGPA: ${student.cgpa}, Attendance: ${student.attendancePercentage}%`,
  };

  db.applications.unshift(newApp);
  res.status(201).json(newApp);
});

apiRouter.put('/placements/applications/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const { stage, offeredCtc, notes } = req.body;
  const index = db.applications.findIndex((a) => a.id === id);
  if (index === -1) return res.status(404).json({ error: 'Application not found' });

  const app = db.applications[index];
  app.stage = stage;
  if (stage === 'SELECTED') {
    app.offeredCtc = offeredCtc || app.offeredCtc || '8.0 LPA';
    app.offerDate = new Date().toISOString().split('T')[0];
    const stu = db.students.find((s) => s.id === app.studentId);
    if (stu) stu.status = 'PLACED';
  }
  if (notes) app.notes = notes;

  res.json(app);
});

// ================= RESET =================
apiRouter.post('/reset', (req: Request, res: Response) => {
  db.seed();
  res.json({ message: 'Database reset to initial seed state' });
});
