# CareerBridge — Training & Placement Management System (TPMS)

CareerBridge is an enterprise-grade Training & Placement Management System designed for institutes, universities, technical bootcamps, and vocational colleges. It unifies the entire operational lifecycle: learner enrollment, cohort schedules, daily attendance roll calls, timed coding assessments, 1-on-1 mock interview rubrics, capstone project reviews, campus placement drives, and institutional governance with an admin-only security audit log.

---

## Live Demo

**CareerBridge Live Application:** https://careerbridge-placement-management.netlify.app

---

## Table of Contents

- [Key Highlights & Operational Workflow](#key-highlights--operational-workflow)
- [Credentials & User Perspectives](#credentials--user-perspectives)
- [Technology Architecture](#technology-architecture)
- [Module Breakdown](#module-breakdown)
  - [Authentication & Role Management](#1-authentication--role-management)
  - [Dashboard & Recharts Analytics](#2-dashboard--recharts-analytics)
  - [Institutional Audit & Governance Log (Admin Exclusive)](#3-institutional-audit--governance-log-admin-exclusive)
  - [Students Directory & 360° Profile Drawer](#4-students-directory--360-profile-drawer)
  - [Cohorts & Batches](#5-cohorts--batches)
  - [Daily Attendance & 75% Threshold Monitoring](#6-daily-attendance--75-threshold-monitoring)
  - [Mock Assessments & 1-on-1 Interviews](#7-mock-assessments--1-on-1-interviews)
  - [Capstone Projects & Code Evaluation](#8-capstone-projects--code-evaluation)
  - [Campus Placement Drives & Pipeline](#9-campus-placement-drives--pipeline)
  - [Student Trainee Portal](#10-student-trainee-portal)
- [Backend REST API Reference](#backend-rest-api-reference)
- [Institutional CSV Reporting](#institutional-csv-reporting)
- [Running Locally](#running-locally)

---

## Key Highlights & Operational Workflow

CareerBridge aligns training delivery with placement results:

```
Enrol Student ──► Assign Cohort ──► Take Roll Call (75% Cutoff)
       │
       ▼
Mock Assessments & 1-on-1 Interviews ──► Capstone Project Evaluation
       │
       ▼
Campus Placement Drives ──► Eligibility Clearance ──► Pipeline (Offer & CTC)
       │
       ▼
Institutional Audit Trail (All actions logged with actor, timestamp & JSON payload)
```

---

## Credentials & User Perspectives

The platform supports unified role-based access control (RBAC):

| Role Viewpoint | Email Address | Password | Operational Scope |
|---|---|---|---|
| **Admin** | `dubeysoumya8@gmail.com` | `demo123` | Full administrative control, directory management, batch scheduling, report export, and exclusive access to the **Security & Audit Log**. |
| **Trainer** | `dubeysoumya8@gmail.com` | `demo123` | Attendance roll calls, grading coding sprint tests, evaluating capstone rubrics. |
| **Placement Officer** | `dubeysoumya8@gmail.com` | `demo123` | Publishing campus drives, verifying 75% cutoff eligibility, tracking candidate offer CTCs. |
| **Student Trainee** | `rahul.verma@example.com` | `demo123` | Personal student portal: attendance percentage, test history, interview feedback, 1-click job applications. |

> **Note**: The public login page features a secure, clean authentication form. Once signed in as an administrator, you can switch perspectives seamlessly via the role switcher in the top navigation bar.

---

## Technology Architecture

### Frontend
- **React 19 & TypeScript**: Strict type-checking with modular component hierarchy.
- **Tailwind CSS v4**: Modern utility-first styling with high visual hierarchy.
- **Recharts**: Responsive charting for benchmarks, milestones, CTC distribution, and placement funnels.
- **Lucide Icons**: Clean, functional iconography across all workflows.

### Backend
- **Node.js & Express 4.x**: RESTful API server running on port 3000 with Vite SPA middleware mounted in `server.ts`.
- **Node.js Crypto Security**: Scrypt salted password hashing and HMAC-SHA256 JWT tokens.
- **Synchronized State Engine**: Bidirectional synchronization between local browser persistence and Express backend endpoints with full fallback resilience.

---

## Module Breakdown

### 1. Authentication & Role Management
- **Secure Sign In**: Clean email and password inputs with password reveal toggle and session caching.
- **Student Registration**: Self-serve registration capturing name, email, password, contact number, cohort selection, college, degree, and academic CGPA.
- **Instant Role Switcher**: Top navigation dropdown allowing administrators to view the system through Admin, Trainer, Placement Officer, or Student perspectives.

### 2. Dashboard & Recharts Analytics
- **KPI Summary**: Total Students, Active Cohorts, Average Attendance %, Placed Candidates, and Conversion Rate.
- **Urgent Attention Feed**: Real-time alerts for attendance deficits (<75%), pending project evaluations, and upcoming assessments.
- **Visual Analytics Suite (Recharts)**:
  - *Student Assessment Benchmarks*: Class average %, highest score %, and passing threshold per test.
  - *Cohort Milestones*: Enrolled capacity filled %, attendance health %, and capstone completion.
  - *Placement Conversion Funnel*: Horizontal progression from Applied $\rightarrow$ Screening $\rightarrow$ Interviewing $\rightarrow$ Offered.
  - *CTC Distribution*: Volume breakdown across compensation brackets (6–8 LPA, 8–10 LPA, 10–12 LPA, 12+ LPA).

### 3. Institutional Audit & Governance Log (Admin Exclusive)
- **Role-Gated Security**: Accessible only to users with the `ADMIN` role. Non-admins encounter an access restriction banner.
- **Automated Lifecycle Tracking**: Automatically captures:
  - `STUDENT_ADDED`: Name, roll number, cohort, CGPA, degree, and enrollment timestamp.
  - `BATCH_CREATED` & `BATCH_UPDATED`: Code, capacity, mode, schedule hours, and lead trainer.
  - `PROFILE_UPDATED`: Field changes, placement status transitions, offered CTC, and hiring company.
  - `ATTENDANCE_RECORDED`: Roll call submission dates, present/absent counts, and flagged low-attendance candidates.
  - `PROJECT_EVALUATED`: Numerical scores (0–100) and qualitative architecture review rubrics.
  - `JOB_OPENING_POSTED`: Hiring company, role, package CTC, and eligibility criteria.
  - `STUDENT_DELETED` & `SYSTEM_RESET`: Deletion archives and database resets.
- **Deep Search & Multi-Level Filtering**: Filter by category (*Student*, *Batch*, *Attendance*, *Academic*, *Placement*, *Security*), action type, or text search.
- **Interactive JSON Payload Inspector**: Expandable drawer revealing structured before/after parameters for compliance verification.
- **1-Click CSV Export**: Download a timestamped audit trail CSV (`careerbridge_audit_logs_YYYY-MM-DD.csv`).

### 4. Students Directory & 360° Profile Drawer
- Global search across student names, emails, roll numbers, and technical skills (React, Java, Docker, PyTorch).
- Status filtering: `ACTIVE`, `ON_HOLD`, `PLACED`, and `ALUMNI`.
- **360° Profile Drawer**: Tabbed history showing all logged roll call sessions, test scores with trainer feedback, mock interview rating cards, capstone groups, and job applications.

### 5. Cohorts & Batches
- Track curriculum details, lead trainer assignments, schedule hours, and training mode (In-person, Online, Hybrid).
- Visual seat capacity meters.
- View cohort student rosters with one click.

### 6. Daily Attendance & 75% Threshold Monitoring
- **Take Roll Call Mode**: Select batch and session date, toggle *Mark All Present* / *Mark All Absent*, or set individual status with absence notes.
- **Audit & Reports Mode**: Real-time percentage recalculation from historical sessions with automatic flagging for students falling below the 75% placement cutoff threshold.

### 7. Mock Assessments & 1-on-1 Interviews
- **Mock Tests**: Schedule coding tests, input individual student marks, calculate class averages, and log technical observations.
- **Mock Interviews**: Schedule Technical (Round 1 & 2), System Design, and HR rounds. Record numerical rating (1–10), key strengths, areas for improvement, and qualitative mentor notes.

### 8. Capstone Projects & Code Evaluation
- Multi-member team assignments with Git repository links and live demo URLs.
- Trainer evaluation modal supporting numerical scores (0–100) and code architecture review feedback.

### 9. Campus Placement Drives & Pipeline
- Publish hiring drives with job code, location, package (CTC), and eligibility cutoffs (minimum attendance % and minimum CGPA).
- Student pipeline stage management: `APPLIED` $\rightarrow$ `SCREENING` $\rightarrow$ `INTERVIEW` $\rightarrow$ `SELECTED` $\rightarrow$ `REJECTED`.
- Offer letter logging with package and acceptance date.

### 10. Student Trainee Portal
- Personal performance cockpit: current attendance %, eligibility status for upcoming placement drives, mock test ranking, and interview feedback rubrics.
- 1-click applications to active campus placement drives with automated criteria validation.

---

## Backend REST API Reference

The backend runs on `http://localhost:3000/api` with full JSON support:

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/login` | `POST` | Public | Authenticate user & issue JWT bearer token |
| `/api/auth/register` | `POST` | Public | Register new student trainee account |
| `/api/auth/me` | `GET` | Bearer | Verify current session token |
| `/api/dashboard` | `GET` | Optional | Retrieve KPI metrics, alerts, and upcoming schedule |
| `/api/students` | `GET`, `POST` | Bearer | List, filter, or create student records |
| `/api/students/:id` | `PUT`, `DELETE` | Bearer | Update or remove student record |
| `/api/batches` | `GET`, `POST`, `PUT` | Bearer | Query or create cohort batches |
| `/api/attendance` | `GET`, `POST` | Bearer | Query logs or record batch roll call |
| `/api/mock-tests` | `GET`, `POST`, `PUT` | Bearer | Schedule tests and enter candidate scores |
| `/api/interviews` | `GET`, `POST`, `PUT` | Bearer | Schedule interviews and submit feedback |
| `/api/projects` | `GET`, `POST`, `PUT` | Bearer | Manage projects and evaluate code rubrics |
| `/api/placements` | `GET`, `POST`, `PUT` | Bearer | Manage job openings and application stages |
| `/api/reset` | `POST` | Bearer | Reset database back to default seed dataset |

### Quick cURL Example
```bash
# 1. Authenticate as Admin
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"dubeysoumya8@gmail.com","password":"demo123"}'

# 2. Fetch Dashboard Metrics
curl -X GET "http://localhost:3000/api/dashboard" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## Institutional CSV Reporting

CareerBridge provides compliance CSV reporting for accreditation and corporate partner submissions:
1. **Students Directory CSV**: Complete demographics, cohort codes, skills, CGPA, and placement statuses.
2. **Attendance Log CSV**: Session-by-session records with percentage cutoffs and attendance flags.
3. **Placement Pipeline CSV**: All student applications, hiring companies, package CTCs, and current pipeline stages.
4. **Security & Governance Audit CSV**: Immutable audit logs containing timestamp, actor, action, category, and metadata payload.

---

## Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/soumyadubey18/careerbridge-placement-management-system.git

# 2. Navigate to project root
cd careerbridge-placement-management-system

# 3. Install dependencies
npm install

# 4. Start full-stack development server (Express API + Vite SPA)
npm run dev

# 5. Open http://localhost:3000 in your browser
```
