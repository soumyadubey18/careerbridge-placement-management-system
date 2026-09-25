# CareerBridge — Training & Placement Management System (TPMS)

CareerBridge is a full-stack, enterprise-grade Training & Placement Management System designed for institutes, universities, and technical bootcamps. It bridges the entire operational lifecycle: learner enrolment, cohort schedules, daily attendance roll calls, timed coding assessments, 1-on-1 mock interview rubrics, capstone project reviews, and campus placement drives.

---

## Table of Contents

- [Key Highlights & Operational Workflow](#key-highlights--operational-workflow)
- [Credentials & User Perspectives](#credentials--user-perspectives)
- [Technology Architecture](#technology-architecture)
- [Module Breakdown](#module-breakdown)
  - [Authentication & Role Management](#1-authentication--role-management)
  - [Dashboard & Recharts Analytics](#2-dashboard--recharts-analytics)
  - [Students Directory & 360° Profile Drawer](#3-students-directory--360-profile-drawer)
  - [Cohorts & Batches](#4-cohorts--batches)
  - [Daily Attendance & 75% Threshold Monitoring](#5-daily-attendance--75-threshold-monitoring)
  - [Mock Assessments & 1-on-1 Interviews](#6-mock-assessments--1-on-1-interviews)
  - [Capstone Projects & Code Evaluation](#7-capstone-projects--code-evaluation)
  - [Campus Placement Drives & Pipeline](#8-campus-placement-drives--pipeline)
- [Backend REST API Reference](#backend-rest-api-reference)
- [Institutional CSV Reporting](#institutional-csv-reporting)
- [How to Push this Code to Git / GitHub](#how-to-push-this-code-to-git--github)
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
```

---

## Credentials & User Perspectives

The platform supports unified role access. **`dubeysoumya8@gmail.com`** has master privileges configured across **Admin**, **Trainer**, and **Placement Officer** operations:

| Role Viewpoint | Email Address | Password | Operational Scope |
|---|---|---|---|
| **Admin** | `dubeysoumya8@gmail.com` | `demo123` | Full administrative control, directory management, batch scheduling, report export. |
| **Trainer** | `dubeysoumya8@gmail.com` | `demo123` | Attendance roll calls, grading coding sprint tests, evaluating capstone rubrics. |
| **Placement Officer** | `dubeysoumya8@gmail.com` | `demo123` | Publishing campus drives, verifying 75% cutoff eligibility, tracking offer CTCs. |
| **Student Trainee** | `rahul.verma@example.com` | `demo123` | Personal student portal: attendance percentage, test history, interview feedback, 1-click job applications. |

> *Note: All sample contact numbers are synthetic placeholders formatted for demonstration. No confidential keys, secrets, or personal phone numbers are stored.*

---

## Technology Architecture

### Frontend
- **React 19 & TypeScript**: Strict type-checking with modular component hierarchy.
- **Tailwind CSS v4**: Utility-first styling with zero-pill metadata typography.
- **Recharts**: Responsive charting for benchmarks, milestones, and conversion funnels.
- **Lucide Icons**: Crisp functional iconography.

### Backend
- **Node.js & Express 4.x**: RESTful API server running on port 3000 with Vite SPA middleware in `server.ts`.
- **Node.js Crypto Security**: Scrypt salted password hashing and HMAC-SHA256 JWT tokens.
- **In-Memory & Persistent Engine**: Synchronized with instant seed resets and local backup.

---

## Module Breakdown

### 1. Authentication & Role Management
- **Sign In**: Email & password authentication with 1-click demo role buttons.
- **Student Registration**: Self-serve registration capturing name, email, password, phone, cohort selection, college, degree, and CGPA.
- **Instant Role Switcher**: Top navigation dropdown allowing administrators to view the system through any staff or student lens.

### 2. Dashboard & Recharts Analytics
- **KPI Summary**: Total Students, Active Cohorts, Average Attendance %, Placed Candidates, and Conversion Rate.
- **Urgent Attention Feed**: Real-time alerts for attendance deficits (<75%), pending project evaluations, and upcoming assessments.
- **Visual Analytics Suite (Recharts)**:
  - *Student Assessment Benchmarks*: Class average %, highest score %, and passing threshold per test.
  - *Cohort Milestones*: Enrolled capacity filled %, attendance health %, and capstone completion.
  - *Placement Conversion Funnel*: Horizontal progression from Applied $\rightarrow$ Screening $\rightarrow$ Interviewing $\rightarrow$ Offered.
  - *CTC Distribution*: Volume breakdown across compensation brackets (6–8 LPA, 8–10 LPA, 10–12 LPA, 12+ LPA).

### 3. Students Directory & 360° Profile Drawer
- Global search across student names, emails, roll numbers, and technical skills (React, Java, Docker, PyTorch).
- Status filtering: `ACTIVE`, `ON_HOLD`, `PLACED`, and `ALUMNI`.
- **360° Profile Drawer**: Tabbed history showing all logged roll call sessions, test scores with trainer feedback, mock interview rating cards, capstone groups, and job applications.

### 4. Cohorts & Batches
- Track curriculum details, lead trainer assignments, schedule hours, and training mode (In-person, Online, Hybrid).
- Visual seat capacity meters.
- View cohort student rosters with one click.

### 5. Daily Attendance & 75% Threshold Monitoring
- **Take Roll Call Mode**: Select batch and session date, toggle *Mark All Present* / *Mark All Absent*, or set individual status with absence notes.
- **Audit & Reports Mode**: Real-time percentage recalculation from historical sessions with automatic flagging for students falling below the 75% placement cutoff threshold.

### 6. Mock Assessments & 1-on-1 Interviews
- **Mock Tests**: Schedule coding tests, input individual student marks, calculate class averages, and log technical observations.
- **Mock Interviews**: Schedule Technical (Round 1 & 2), System Design, and HR rounds. Record numerical rating (1–10), key strengths, areas for improvement, and qualitative mentor notes.

### 7. Capstone Projects & Code Evaluation
- Multi-member team assignments with Git repository links and live demo URLs.
- Trainer evaluation modal supporting numerical scores (0–100) and code architecture review feedback.

### 8. Campus Placement Drives & Pipeline
- Publish hiring drives with job code, location, package (CTC), and eligibility cutoffs (minimum attendance % and minimum CGPA).
- Student pipeline stage management: `APPLIED` $\rightarrow$ `SCREENING` $\rightarrow$ `INTERVIEW` $\rightarrow$ `SELECTED` $\rightarrow$ `REJECTED`.
- Offer letter logging with package and acceptance date.

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
# Authenticate
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"dubeysoumya8@gmail.com","password":"demo123"}'

# Fetch Dashboard Data
curl -X GET "http://localhost:3000/api/dashboard" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## Institutional CSV Reporting

One-click CSV exports accessible from the top navigation bar:
- **Students Master Directory**: Roll number, full name, email, phone, cohort, CGPA, attendance %, and college.
- **Attendance Audit Ledger**: Student name, roll number, total recorded sessions, present count, absent count, and attendance %.
- **Placement Pipeline Outcomes**: Candidate name, cohort, company, job role, pipeline stage, and offered CTC.

---

## How to Push this Code to Git / GitHub

You can initialize Git and push this repository directly to GitHub:

### Step 1: Initialize Git and Commit
```bash
# 1. Initialize local Git repository
git init

# 2. Add all project files
git add .

# 3. Commit with a clear message
git commit -m "feat: complete CareerBridge TPMS with full-stack Express backend, Recharts analytics, and multi-role auth"

# 4. Set the default branch name to main
git branch -M main
```

### Step 2: Link Your GitHub Repository
Create a new empty repository on [GitHub](https://github.com/new) (e.g. `careerbridge-tpms`), then run:

```bash
# Link the remote repository (replace with your GitHub username & repo name)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
```

### Step 3: Push to GitHub
```bash
git push -u origin main
```

> **Tip for Authentication**: When GitHub prompts for credentials:
> - Username: Your GitHub username.
> - Password: Use a **GitHub Personal Access Token (Classic or Fine-Grained)** with `repo` permissions (generate one under GitHub Settings $\rightarrow$ Developer Settings $\rightarrow$ Personal Access Tokens).

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the full-stack Express + Vite dev server
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm start
```
The application will be live at `http://localhost:3000`.
