import {
  PrismaClient,
  Role,
  StudentStatus,
  AttendanceStatus,
  ProjectStatus,
  ApplicationStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
const daysFromNow = (days: number) => new Date(Date.now() + days * 86400000);
async function main() {
  const password = await bcrypt.hash("demo123", 10);
  await prisma.application.deleteMany();
  await prisma.company.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.mockTest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.student.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.user.deleteMany();
  await prisma.user.createMany({
    data: [
      {
        name: "Aarav Mehta",
        email: "admin@northstar.dev",
        password,
        role: Role.ADMIN,
      },
      {
        name: "Soumya Dubey",
        email: "dubeysoumya8@gmail.com",
        password,
        role: Role.ADMIN,
      },
      {
        name: "Maya Singh",
        email: "trainer@northstar.dev",
        password,
        role: Role.TRAINER,
      },
      {
        name: "Riya Kapoor",
        email: "placement@northstar.dev",
        password,
        role: Role.PLACEMENT,
      },
    ],
  });
  const batches = await Promise.all([
    prisma.batch.create({
      data: {
        name: "Cohort 24 · Full Stack",
        course: "Full Stack Engineering",
        trainer: "Maya Singh",
        schedule: "Mon, Wed, Fri · 10:00 AM",
        startDate: daysFromNow(-42),
      },
    }),
    prisma.batch.create({
      data: {
        name: "Cohort 25 · Data",
        course: "Data Analytics",
        trainer: "Vikram Rao",
        schedule: "Tue, Thu · 2:00 PM",
        startDate: daysFromNow(-18),
      },
    }),
    prisma.batch.create({
      data: {
        name: "Cohort 26 · UX",
        course: "Product Design",
        trainer: "Anika Shah",
        schedule: "Sat · 11:00 AM",
        startDate: daysFromNow(-5),
      },
    }),
  ]);
  const names = [
    "Ishita Nair",
    "Kabir Joshi",
    "Neha Kulkarni",
    "Rohan Verma",
    "Sana Sheikh",
    "Dev Malhotra",
    "Anaya Iyer",
    "Arjun Bhat",
  ];
  const students = await Promise.all(
    names.map((name, i) =>
      prisma.student.create({
        data: {
          name,
          email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
          phone: `+91 98${String(10000000 + i * 9137).slice(0, 8)}`,
          status: i === 7 ? StudentStatus.ON_HOLD : StudentStatus.ACTIVE,
          batchId: batches[i % 3].id,
          joinedAt: daysFromNow(-45 + i * 3),
        },
      }),
    ),
  );
  for (const [i, student] of students.entries())
    for (let offset = 0; offset < 5; offset++)
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          date: daysFromNow(-offset),
          status:
            (i + offset) % 6 === 0
              ? AttendanceStatus.ABSENT
              : AttendanceStatus.PRESENT,
        },
      });
  const tests = await Promise.all([
    prisma.mockTest.create({
      data: {
        title: "React Systems Check",
        topic: "React & APIs",
        date: daysFromNow(2),
      },
    }),
    prisma.mockTest.create({
      data: {
        title: "SQL Fundamentals",
        topic: "Data querying",
        date: daysFromNow(6),
      },
    }),
  ]);
  await prisma.testResult.createMany({
    data: students.slice(0, 5).map((student, i) => ({
      studentId: student.id,
      testId: tests[0].id,
      score: 72 + i * 4,
    })),
  });
  await prisma.interview.createMany({
    data: [
      {
        studentId: students[0].id,
        date: daysFromNow(3),
        round: "Technical",
        interviewer: "Maya Singh",
      },
      {
        studentId: students[2].id,
        date: daysFromNow(5),
        round: "HR",
        interviewer: "Riya Kapoor",
      },
    ],
  });
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: "Campus Connect",
        description: "Peer-to-peer learning platform",
        dueDate: daysFromNow(8),
        status: ProjectStatus.IN_PROGRESS,
      },
    }),
    prisma.project.create({
      data: {
        title: "Insight Board",
        description: "Analytics dashboard for course teams",
        dueDate: daysFromNow(14),
        status: ProjectStatus.SUBMITTED,
      },
    }),
  ]);
  await prisma.projectMember.createMany({
    data: [
      { studentId: students[0].id, projectId: projects[0].id },
      { studentId: students[1].id, projectId: projects[0].id },
      { studentId: students[2].id, projectId: projects[1].id },
    ],
  });
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: "Vertex Labs",
        role: "Frontend Engineer",
        jobCode: "VX-FE-042",
        location: "Bengaluru",
      },
    }),
    prisma.company.create({
      data: {
        name: "Bluebird Systems",
        role: "Data Analyst",
        jobCode: "BB-DA-118",
        location: "Pune",
      },
    }),
  ]);
  await prisma.application.createMany({
    data: [
      {
        companyId: companies[0].id,
        studentId: students[0].id,
        status: ApplicationStatus.INTERVIEW,
      },
      {
        companyId: companies[0].id,
        studentId: students[1].id,
        status: ApplicationStatus.SELECTED,
        ctc: "₹8.5 LPA",
      },
      {
        companyId: companies[1].id,
        studentId: students[2].id,
        status: ApplicationStatus.SCREENING,
      },
    ],
  });
}
main().finally(() => prisma.$disconnect());
