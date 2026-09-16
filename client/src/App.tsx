import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type View =
  | "overview"
  | "students"
  | "batches"
  | "attendance"
  | "projects"
  | "placements";
type StudentPayload = {
  name: string;
  email: string;
  phone: string;
  batchId: number;
};
type ToastItem = {
  id: number;
  message: string;
  tone: "success" | "info" | "error";
};
const API = "http://localhost:4000/api";
const nav: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "batches", label: "Batches", icon: GraduationCap },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "projects", label: "Projects", icon: BriefcaseBusiness },
  { id: "placements", label: "Placements", icon: BarChart3 },
];
const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

export default function App() {
  const [token, setToken] = useState(
    localStorage.getItem("northstar_token") || "",
  );
  const [user, setUser] = useState<any>(
    JSON.parse(localStorage.getItem("northstar_user") || "null"),
  );
  const [view, setView] = useState<View>("overview");
  const [data, setData] = useState<any>({});
  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [placements, setPlacements] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const notify = (message: string, tone: ToastItem["tone"] = "success") => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  };
  const request = async (path: string, options?: RequestInit) => {
    const response = await fetch(API + path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options?.headers || {}),
      },
    });
    if (!response.ok)
      throw new Error((await response.json()).error || "Request failed");
    return response.json();
  };
  const load = async () => {
    if (!token) return;
    const [
      dashboard,
      studentsData,
      batchesData,
      attendanceData,
      projectsData,
      placementsData,
    ] = await Promise.all([
      request("/dashboard"),
      request("/students"),
      request("/batches"),
      request("/attendance"),
      request("/projects"),
      request("/placements"),
    ]);
    setData(dashboard);
    setStudents(studentsData);
    setBatches(batchesData);
    setAttendance(attendanceData);
    setProjects(projectsData);
    setPlacements(placementsData);
  };
  useEffect(() => {
    load().catch(() => logout());
  }, [token]);
  const login = async (email: string, password: string) => {
    const result = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await result.json();
    if (!result.ok) throw new Error(body.error);
    localStorage.setItem("northstar_token", body.token);
    localStorage.setItem("northstar_user", JSON.stringify(body.user));
    setToken(body.token);
    setUser(body.user);
  };
  const logout = () => {
    localStorage.clear();
    setToken("");
    setUser(null);
  };
  if (!token) return <Login onLogin={login} />;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={18} />
          </div>
          <div>
            <strong>careerbridge</strong>
            <span>placement ops</span>
          </div>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={view === id ? "nav-item active" : "nav-item"}
              onClick={() => {
                setView(id);
                setSearch("");
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
              {id === "overview" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item">
            <Settings size={17} />
            <span>Settings</span>
          </button>
          <div className="profile-mini">
            <div className="avatar">{user?.name?.slice(0, 1)}</div>
            <div>
              <strong>{user?.name}</strong>
              <span>{user?.role?.toLowerCase()} access</span>
            </div>
            <button className="icon-button" onClick={logout} title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <button className="mobile-menu icon-button">
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{nav.find((item) => item.id === view)?.label}</strong>
          </div>
          <div className="top-actions">
            <div className="search">
              <Search size={16} />
              <input
                placeholder="Search anything..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="icon-button notification">
              <Bell size={18} />
              <i />
            </button>
            <div className="avatar avatar-top">{user?.name?.slice(0, 1)}</div>
          </div>
        </header>
        <div className="content">
          {view === "overview" && (
            <Overview data={data} go={setView} onNotify={notify} />
          )}
          {view === "students" && (
            <Students
              students={students.filter((s) =>
                `${s.name} ${s.email}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )}
              batches={batches}
              onAdd={async (payload: StudentPayload) => {
                await request("/students", {
                  method: "POST",
                  body: JSON.stringify(payload),
                });
                setModal(false);
                await load();
                notify("Student added to the workspace.");
              }}
              onOpen={() => setModal(true)}
            />
          )}
          {view === "batches" && (
            <Batches batches={batches} onNotify={notify} />
          )}
          {view === "attendance" && (
            <Attendance rows={attendance} onNotify={notify} />
          )}
          {view === "projects" && (
            <Projects projects={projects} onNotify={notify} />
          )}
          {view === "placements" && (
            <Placements companies={placements} onNotify={notify} />
          )}
        </div>
      </main>
      {modal && (
        <StudentModal
          batches={batches}
          onClose={() => setModal(false)}
          onSave={async (payload: StudentPayload) => {
            await request("/students", {
              method: "POST",
              body: JSON.stringify(payload),
            });
            setModal(false);
            await load();
            notify("Student added to the workspace.");
          }}
        />
      )}
      <ToastRegion
        toasts={toasts}
        onDismiss={(id) =>
          setToasts((current) => current.filter((toast) => toast.id !== id))
        }
      />
    </div>
  );
}
function ToastRegion({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div className={`toast toast-${toast.tone}`} key={toast.id}>
          <CheckCircle2 size={18} />
          <span>{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
function Login({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onLogin(email, password);
    } catch (err) {
      setError((err as Error).message);
    }
  };
  return (
    <div className="login-page">
      <div className="login-art">
        <div className="art-top">
          <div className="brand">
            <div className="brand-mark">
              <Sparkles size={18} />
            </div>
            <strong>careerbridge</strong>
          </div>
          <span>TRAINING & PLACEMENT OS</span>
        </div>
        <div className="art-copy">
          <p className="eyebrow">THE CLEARER PATH FORWARD</p>
          <h1>
            Turn potential
            <br />
            <em>into placement.</em>
          </h1>
          <p>
            One focused workspace for the people, progress, and possibilities
            that move your institute forward.
          </p>
        </div>
        <div className="art-footer">
          <span>Trusted by ambitious institutes</span>
          <span>2024 · v1.0</span>
        </div>
      </div>
      <form className="login-form" onSubmit={submit}>
        <div className="form-heading">
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Good to see you.</h2>
          <p>Sign in to your operations workspace.</p>
        </div>
        <label>
          Email address
          <input
            required
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <div className="password">
            <input
              required
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span>Show</span>
          </div>
        </label>
        {error && <div className="error">{error}</div>}
        <button className="primary wide">
          Sign in <ArrowUpRight size={17} />
        </button>
      </form>
    </div>
  );
}
function PageHead({ eyebrow, title, subtitle, action }: any) {
  return (
    <div className="page-head">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
function Overview({ data, go, onNotify }: any) {
  return (
    <>
      <PageHead
        eyebrow="WEDNESDAY · 16 OCTOBER 2024"
        title="Good morning, Aarav"
        subtitle="Here is what needs your attention today."
        action={
          <button className="primary" onClick={() => go("students")}>
            <Plus size={17} /> Add student
          </button>
        }
      />
      <div className="metric-grid">
        {[
          [
            "Active students",
            data.metrics?.students || 0,
            "+12%",
            Users,
            "teal",
          ],
          [
            "Active batches",
            data.metrics?.batches || 0,
            "+2 this month",
            GraduationCap,
            "blue",
          ],
          [
            "Today's attendance",
            `${data.metrics?.attendance || 0}%`,
            "+4.2%",
            ClipboardCheck,
            "yellow",
          ],
          [
            "Placed this season",
            data.metrics?.placements || 0,
            "+8%",
            BarChart3,
            "coral",
          ],
        ].map(([label, value, trend, Icon, color]) => (
          <div className="metric" key={label as string}>
            <div className={`metric-icon ${color}`}>
              <Icon size={19} />
            </div>
            <div className="metric-label">{label}</div>
            <strong>{value}</strong>
            <span className="trend">{trend}</span>
          </div>
        ))}
      </div>
      <div className="overview-grid">
        <section className="panel focus-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">ATTENTION NEEDED</p>
              <h3>This week at a glance</h3>
            </div>
            <button className="text-button">
              View reports <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="focus-list">
            <FocusItem
              icon={<ClipboardCheck />}
              title="Attendance needs a nudge"
              detail="12 students below 75% attendance"
              action="Review list"
              color="yellow"
              onClick={() => go("attendance")}
            />
            <FocusItem
              icon={<BriefcaseBusiness />}
              title="Project reviews pending"
              detail={`${data.projects?.length || 0} projects approaching their deadline`}
              action="Open projects"
              color="coral"
              onClick={() => go("projects")}
            />
            <FocusItem
              icon={<BarChart3 />}
              title="Placement momentum"
              detail="3 candidates moved to interview stage"
              action="See pipeline"
              color="blue"
              onClick={() => go("placements")}
            />
          </div>
        </section>
        <section className="panel calendar-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">UP NEXT</p>
              <h3>Your calendar</h3>
            </div>
            <button
              className="icon-button"
              title="Schedule interview"
              onClick={() =>
                onNotify("Interview scheduling will open here soon.", "info")
              }
            >
              <CalendarDays size={18} />
            </button>
          </div>
          <div className="calendar-list">
            {(data.tests || []).map((item: any) => (
              <CalendarItem
                key={item.id}
                date={item.date}
                type="MOCK TEST"
                title={item.title}
                meta={item.topic}
                color="blue"
              />
            ))}
            {(data.interviews || []).map((item: any) => (
              <CalendarItem
                key={item.id}
                date={item.date}
                type="MOCK INTERVIEW"
                title={item.student.name}
                meta={`${item.round} round · ${item.interviewer}`}
                color="coral"
                onClick={() =>
                  onNotify(
                    `Interview with ${item.student.name} is scheduled.`,
                    "success",
                  )
                }
              />
            ))}
          </div>
        </section>
      </div>
      <div className="panel table-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">RECENT ACTIVITY</p>
            <h3>Placement pipeline</h3>
          </div>
          <button className="text-button" onClick={() => go("placements")}>
            Full pipeline <ArrowUpRight size={15} />
          </button>
        </div>
        <Pipeline placements={data.applications || []} />
      </div>
    </>
  );
}
function FocusItem({ icon, title, detail, action, color, onClick }: any) {
  return (
    <div className="focus-item">
      <div className={`focus-icon ${color}`}>{icon}</div>
      <div className="focus-copy">
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <button className="text-button" onClick={onClick}>
        {action}
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
function CalendarItem({ date, type, title, meta, color, onClick }: any) {
  return (
    <button className="calendar-item" onClick={onClick} type="button">
      <div className={`date-block ${color}`}>
        <strong>{new Date(date).getDate()}</strong>
        <span>
          {new Date(date).toLocaleDateString("en-IN", { month: "short" })}
        </span>
      </div>
      <div>
        <p className="item-type">{type}</p>
        <strong>{title}</strong>
        <span>{meta}</span>
      </div>
      <ChevronRight size={16} className="chevron" />
    </button>
  );
}
function Students({ students, batches, onOpen }: any) {
  return (
    <>
      <PageHead
        eyebrow="PEOPLE / STUDENTS"
        title="Students"
        subtitle={`${students.length} learners in your workspace`}
        action={
          <button className="primary" onClick={onOpen}>
            <Plus size={17} /> Add student
          </button>
        }
      />
      <div className="filter-row">
        <div className="filter-search">
          <Search size={16} />
          <span>Use the search above to filter students</span>
        </div>
        <button className="filter-button">
          All statuses <ChevronRight size={15} />
        </button>
        <button className="filter-button">
          All batches <ChevronRight size={15} />
        </button>
      </div>
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>STUDENT</th>
              <th>BATCH</th>
              <th>STATUS</th>
              <th>JOINED</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {students.map((s: any) => (
              <tr key={s.id}>
                <td>
                  <div className="person">
                    <div className="avatar soft">{s.name.slice(0, 1)}</div>
                    <div>
                      <strong>{s.name}</strong>
                      <span>{s.email}</span>
                    </div>
                  </div>
                </td>
                <td>{s.batch.name}</td>
                <td>
                  <span className={`status ${s.status.toLowerCase()}`}>
                    {s.status.replace("_", " ")}
                  </span>
                </td>
                <td>{dateLabel(s.joinedAt)}</td>
                <td>
                  <button className="icon-button">
                    <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function Batches({ batches, onNotify }: any) {
  return (
    <>
      <PageHead
        eyebrow="PROGRAMS / COHORTS"
        title="Batches"
        subtitle="Keep every cohort moving in the same direction."
        action={
          <button
            className="primary"
            onClick={() =>
              onNotify(
                "Batch creation is ready for the next workflow step.",
                "info",
              )
            }
          >
            <Plus size={17} /> New batch
          </button>
        }
      />
      <div className="batch-grid">
        {batches.map((b: any, i: number) => (
          <div className="batch-card" key={b.id}>
            <div className={`batch-accent accent-${i + 1}`} />
            <div className="batch-card-top">
              <span className="batch-index">0{i + 1}</span>
              <span className="status active">ACTIVE</span>
            </div>
            <h3>{b.name}</h3>
            <p>{b.course}</p>
            <div className="batch-meta">
              <span>
                <Users size={15} /> {b._count.students} students
              </span>
              <span>
                <CalendarDays size={15} /> {b.schedule}
              </span>
            </div>
            <div className="batch-footer">
              <span>Trainer</span>
              <strong>{b.trainer}</strong>
              <ChevronRight size={16} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
function Attendance({ rows, onNotify }: any) {
  return (
    <>
      <PageHead
        eyebrow="PEOPLE / ATTENDANCE"
        title="Attendance"
        subtitle="A quick read on consistency and momentum."
        action={
          <button
            className="primary"
            onClick={() =>
              onNotify(
                "Attendance marking is ready for the next workflow step.",
                "info",
              )
            }
          >
            <Plus size={17} /> Mark attendance
          </button>
        }
      />
      <div className="attendance-summary">
        <div className="attendance-score">
          <span>Overall attendance</span>
          <strong>
            {rows.length
              ? Math.round(
                  rows.reduce(
                    (sum: number, row: any) => sum + row.percentage,
                    0,
                  ) / rows.length,
                )
              : 0}
            %
          </strong>
          <div className="progress large">
            <i
              style={{
                width: `${rows.length ? Math.round(rows.reduce((sum: number, row: any) => sum + row.percentage, 0) / rows.length) : 0}%`,
              }}
            />
          </div>
          <small>Across the last 5 sessions</small>
        </div>
        <div className="attendance-note">
          <Activity size={19} />
          <div>
            <strong>Consistency is trending up</strong>
            <span>4.2% higher than last week across all active cohorts.</span>
          </div>
        </div>
      </div>
      <div className="panel table-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">STUDENT HEALTH</p>
            <h3>Attendance by student</h3>
          </div>
          <button className="filter-button">
            Last 5 sessions <ChevronRight size={15} />
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>STUDENT</th>
              <th>BATCH</th>
              <th>ATTENDANCE</th>
              <th>SESSIONS</th>
              <th>HEALTH</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s: any) => (
              <tr key={s.id}>
                <td>
                  <div className="person">
                    <div className="avatar soft">{s.name.slice(0, 1)}</div>
                    <strong>{s.name}</strong>
                  </div>
                </td>
                <td>{s.batch.name}</td>
                <td>
                  <strong>{s.percentage}%</strong>
                </td>
                <td>{s.attendance.length} total</td>
                <td>
                  <div className="health">
                    <div className="progress">
                      <i style={{ width: `${s.percentage}%` }} />
                    </div>
                    <span className={s.percentage < 75 ? "warning-text" : ""}>
                      {s.percentage < 75 ? "Needs attention" : "On track"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function Projects({ projects, onNotify }: any) {
  return (
    <>
      <PageHead
        eyebrow="WORK / PROJECTS"
        title="Projects"
        subtitle="See what teams are building and what needs a push."
        action={
          <button
            className="primary"
            onClick={() =>
              onNotify(
                "Project creation is ready for the next workflow step.",
                "info",
              )
            }
          >
            <Plus size={17} /> New project
          </button>
        }
      />
      <div className="project-grid">
        {projects.map((p: any) => (
          <div className="project-card" key={p.id}>
            <div className="project-top">
              <span className={`project-status ${p.status.toLowerCase()}`}>
                {p.status.replace("_", " ")}
              </span>
              <button
                className="icon-button"
                title={`Assign ${p.title}`}
                onClick={() =>
                  onNotify(
                    `${p.title} is ready for team assignment.`,
                    "success",
                  )
                }
              >
                <ArrowUpRight size={16} />
              </button>
            </div>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <div className="project-members">
              {p.members.map((m: any) => (
                <div className="avatar soft" title={m.student.name} key={m.id}>
                  {m.student.name.slice(0, 1)}
                </div>
              ))}
            </div>
            <div className="project-footer">
              <span>Due {dateLabel(p.dueDate)}</span>
              <strong>{p.members.length} members</strong>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
function Placements({ companies, onNotify }: any) {
  const all = companies.flatMap((c: any) =>
    c.applications.map((a: any) => ({ ...a, company: c })),
  );
  return (
    <>
      <PageHead
        eyebrow="OUTCOMES / PLACEMENTS"
        title="Placement pipeline"
        subtitle="Turn every application into a clear next step."
        action={
          <button
            className="primary"
            onClick={() =>
              onNotify(
                "Opening creation is ready for the next workflow step.",
                "info",
              )
            }
          >
            <Plus size={17} /> Add opening
          </button>
        }
      />
      <div className="pipeline-stats">
        <div>
          <span>Open roles</span>
          <strong>{companies.length}</strong>
        </div>
        <div>
          <span>Active applications</span>
          <strong>{all.length}</strong>
        </div>
        <div>
          <span>Offers accepted</span>
          <strong>
            {all.filter((a: any) => a.status === "SELECTED").length}
          </strong>
        </div>
      </div>
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>COMPANY / ROLE</th>
              <th>CANDIDATE</th>
              <th>JOB CODE</th>
              <th>STAGE</th>
              <th>CTC</th>
            </tr>
          </thead>
          <tbody>
            {all.map((a: any) => (
              <tr key={a.id}>
                <td>
                  <div>
                    <strong>{a.company.name}</strong>
                    <span>
                      {a.company.role} · {a.company.location}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="person">
                    <div className="avatar soft">
                      {a.student.name.slice(0, 1)}
                    </div>
                    <strong>{a.student.name}</strong>
                  </div>
                </td>
                <td>{a.company.jobCode}</td>
                <td>
                  <span className={`status ${a.status.toLowerCase()}`}>
                    {a.status}
                  </span>
                </td>
                <td>{a.ctc || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function Pipeline({ placements }: any) {
  return (
    <table>
      <thead>
        <tr>
          <th>CANDIDATE</th>
          <th>COMPANY</th>
          <th>ROLE</th>
          <th>STAGE</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {placements.slice(0, 4).map((a: any) => (
          <tr key={a.status}>
            <td>
              <strong>
                {a.status === "SELECTED"
                  ? "Kabir Joshi"
                  : a.status === "INTERVIEW"
                    ? "Ishita Nair"
                    : "Neha Kulkarni"}
              </strong>
            </td>
            <td>
              {a.status === "SCREENING" ? "Bluebird Systems" : "Vertex Labs"}
            </td>
            <td>
              {a.status === "SCREENING" ? "Data Analyst" : "Frontend Engineer"}
            </td>
            <td>
              <span className={`status ${a.status.toLowerCase()}`}>
                {a.status}
              </span>
            </td>
            <td>
              <ChevronRight size={16} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function StudentModal({ batches, onClose, onSave }: any) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    batchId: batches[0]?.id || "",
  });
  return (
    <div className="modal-backdrop">
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ ...form, batchId: Number(form.batchId) });
        }}
      >
        <div className="modal-head">
          <div>
            <p className="eyebrow">STUDENT RECORD</p>
            <h2>Add student</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <label>
          Full name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Meera Shah"
          />
        </label>
        <label>
          Email address
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="meera@example.com"
          />
        </label>
        <label>
          Phone number
          <input
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 98765 43210"
          />
        </label>
        <label>
          Assign batch
          <select
            value={form.batchId}
            onChange={(e) => setForm({ ...form, batchId: e.target.value })}
          >
            {batches.map((b: any) => (
              <option value={b.id} key={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="primary">
            Create student <ArrowUpRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
