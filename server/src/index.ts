import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient, Role, StudentStatus } from "@prisma/client";
import { z } from "zod";
const prisma = new PrismaClient();
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
const secret = process.env.JWT_SECRET || "dev-secret";
const auth = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try {
    (req as any).user = jwt.verify(token, secret);
    next();
  } catch {
    res.status(401).json({ error: "Invalid session" });
  }
};
app.post("/api/auth/login", async (req, res) => {
  const parsed = z
    .object({ email: z.string().email(), password: z.string().min(6) })
    .safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Enter a valid email and password" });
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.password)))
    return res.status(401).json({ error: "Email or password is incorrect" });
  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    secret,
    { expiresIn: "8h" },
  );
  res.json({ token, user: { name: user.name, role: user.role } });
});
app.post("/api/auth/register", async (req, res) => {
  const parsed = z
    .object({
      name: z.string().trim().min(2),
      email: z.string().email(),
      password: z.string().min(6),
    })
    .safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({
      error:
        "Enter a name, valid email, and password with at least 6 characters",
    });
  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existingUser)
    return res
      .status(409)
      .json({ error: "An account with this email already exists" });
  const password = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: { ...parsed.data, password, role: Role.STUDENT },
  });
  res.status(201).json({ message: "Account created successfully" });
});
app.get("/api/dashboard", auth, async (_req, res) => {
  const [
    students,
    batches,
    attendance,
    tests,
    interviews,
    projects,
    applications,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.batch.count(),
    prisma.attendance.findMany({
      where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.mockTest.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 3,
    }),
    prisma.interview.findMany({
      where: { date: { gte: new Date() } },
      include: { student: true },
      orderBy: { date: "asc" },
      take: 3,
    }),
    prisma.project.findMany({
      where: { status: { not: "COMPLETED" } },
      orderBy: { dueDate: "asc" },
      take: 4,
    }),
    prisma.application.groupBy({ by: ["status"], _count: true }),
  ]);
  const present = attendance.filter((a) => a.status === "PRESENT").length;
  res.json({
    metrics: {
      students,
      batches,
      attendance: attendance.length
        ? Math.round((present / attendance.length) * 100)
        : 0,
      placements:
        applications.find((a) => a.status === "SELECTED")?._count || 0,
    },
    tests,
    interviews,
    projects,
    applications,
  });
});
app.get("/api/students", auth, async (req, res) => {
  const q = String(req.query.q || "");
  res.json(
    await prisma.student.findMany({
      where: { OR: [{ name: { contains: q } }, { email: { contains: q } }] },
      include: { batch: true },
      orderBy: { name: "asc" },
    }),
  );
});
app.post("/api/students", auth, async (req, res) => {
  const parsed = z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().min(8),
      batchId: z.coerce.number(),
    })
    .safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: "Please complete all student fields" });
  res.status(201).json(
    await prisma.student.create({
      data: parsed.data,
      include: { batch: true },
    }),
  );
});
app.post("/api/batches", auth, async (req, res) => {
  const parsed = z
    .object({
      name: z.string().min(2),
      course: z.string().min(2),
      trainer: z.string().min(2),
      schedule: z.string().min(2),
      startDate: z.coerce.date(),
    })
    .safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Please complete all batch fields" });
  res.status(201).json(await prisma.batch.create({ data: parsed.data }));
});
app.get("/api/batches", auth, async (_req, res) =>
  res.json(
    await prisma.batch.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: { startDate: "desc" },
    }),
  ),
);
app.get("/api/meta", auth, async (_req, res) =>
  res.json({
    batches: await prisma.batch.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  }),
);
app.get("/api/attendance", auth, async (_req, res) => {
  const rows = await prisma.student.findMany({
    include: { attendance: true, batch: true },
  });
  res.json(
    rows.map((s) => ({
      ...s,
      percentage: s.attendance.length
        ? Math.round(
            (s.attendance.filter((a) => a.status === "PRESENT").length /
              s.attendance.length) *
              100,
          )
        : 0,
    })),
  );
});
app.post("/api/attendance", auth, async (req, res) => {
  const parsed = z
    .object({
      studentId: z.coerce.number(),
      date: z.coerce.date(),
      status: z.enum(["PRESENT", "ABSENT"]),
    })
    .safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: "Please choose a student, date, and status" });
  res.status(201).json(await prisma.attendance.create({ data: parsed.data }));
});
app.get("/api/projects", auth, async (_req, res) =>
  res.json(
    await prisma.project.findMany({
      include: { members: { include: { student: true } } },
      orderBy: { dueDate: "asc" },
    }),
  ),
);
app.post("/api/projects", auth, async (req, res) => {
  const parsed = z
    .object({
      title: z.string().min(2),
      description: z.string().min(2),
      dueDate: z.coerce.date(),
    })
    .safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: "Please complete all project fields" });
  res.status(201).json(await prisma.project.create({ data: parsed.data }));
});
app.get("/api/placements", auth, async (_req, res) =>
  res.json(
    await prisma.company.findMany({
      include: { applications: { include: { student: true } } },
    }),
  ),
);
app.post("/api/placements", auth, async (req, res) => {
  const parsed = z
    .object({
      name: z.string().min(2),
      role: z.string().min(2),
      jobCode: z.string().min(2),
      location: z.string().min(2),
    })
    .safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: "Please complete all opening fields" });
  res.status(201).json(await prisma.company.create({ data: parsed.data }));
});
app.use(
  (
    _err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => res.status(500).json({ error: "Something went wrong" }),
);
app.listen(Number(process.env.PORT) || 4000, () =>
  console.log("Placement Ops API running on http://localhost:4000"),
);
