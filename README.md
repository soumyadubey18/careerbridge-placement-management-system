# CareerBridge Placement Management System

CareerBridge is a full-stack Training & Placement Management System for training institutes. It brings student records, batches, attendance, mock assessments, interviews, projects, and placement outcomes into one operational workspace.

The application is designed around a practical institute workflow:

> Login -> add a student -> assign a batch -> monitor attendance -> review assessments -> track projects -> manage placement applications.

## Table of Contents

- [What the application does](#what-the-application-does)
- [Technology used](#technology-used)
- [Project structure](#project-structure)
- [How the application works](#how-the-application-works)
- [Database design](#database-design)
- [API reference](#api-reference)
- [Installation and setup](#installation-and-setup)
- [Demo login](#demo-login)
- [Seeded data](#seeded-data)
- [Using the application](#using-the-application)
- [Available scripts](#available-scripts)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Future improvements](#future-improvements)

## What the application does

### Authentication

- Provides a login screen for institute staff.
- Validates email and password on the server.
- Stores passwords as bcrypt hashes rather than plain text.
- Creates an eight-hour JWT session after a successful login.
- Sends the JWT as a Bearer token with protected API requests.
- Supports the roles `ADMIN`, `TRAINER`, and `PLACEMENT` in the database and login response.

### Student management

- Displays student name, email, phone, status, batch, and joining date.
- Searches students by name or email.
- Adds a new student through a validated form.
- Assigns a student to an existing batch.
- Supports the statuses `ACTIVE`, `ON_HOLD`, `PLACED`, and `ALUMNI`.

### Batch management

- Displays cohort name, course, trainer, schedule, start date, and student count.
- Shows batch-wise student totals.
- Keeps the batch relationship on every student record.

### Attendance management

- Stores one attendance record per student and session date.
- Tracks `PRESENT` and `ABSENT` values.
- Calculates an attendance percentage from the available attendance history.
- Shows an overall attendance score and individual student health.
- Highlights students below the 75% attendance threshold.

### Mock tests and interviews

- Stores mock test title, topic, date, and student scores.
- Displays upcoming tests on the dashboard.
- Stores interview date, round, interviewer, attendance, feedback, and score.
- Displays upcoming interviews alongside upcoming tests.

### Project management

- Stores project title, description, deadline, status, evaluation, and team members.
- Supports `NOT_STARTED`, `IN_PROGRESS`, `SUBMITTED`, and `COMPLETED` states.
- Shows project members and upcoming due dates.

### Placement management

- Stores company, job role, job code, and location.
- Tracks applications from students to companies.
- Supports `APPLIED`, `SCREENING`, `INTERVIEW`, `SELECTED`, and `REJECTED` stages.
- Stores offer or CTC information for selected candidates.
- Displays pipeline counts for open roles, active applications, and accepted offers.

### Dashboard and reporting

The Overview screen aggregates operational data into:

- Total active students
- Active batches
- Today's attendance percentage
- Students placed in the current seed dataset
- Attendance follow-ups
- Pending project reviews
- Upcoming mock tests
- Upcoming mock interviews
- Placement pipeline activity

## Technology used

### Frontend

- React 19
- TypeScript
- Vite
- Lucide React icons
- CSS with responsive layouts for desktop, tablet, and mobile

### Backend

- Node.js
- Express
- TypeScript
- Zod request validation
- bcryptjs password hashing
- JSON Web Tokens for sessions
- CORS for local frontend-to-backend communication

### Database

- SQLite for a lightweight local database
- Prisma ORM for schema management, migrations, and typed queries

## Project structure

```text
training-placement-management-system/
├── client/
│   ├── src/
│   │   ├── App.tsx          # Login, layout, pages, forms, API calls
│   │   ├── main.tsx         # React entry point
│   │   └── styles.css       # Application design system and responsive styles
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/
│   ├── prisma/
│   │   ├── schema.prisma    # Database models and relationships
│   │   └── seed.ts          # Demo users and operational data
│   ├── src/
│   │   └── index.ts         # Express server, auth, routes, and queries
│   ├── .env                 # Local database and JWT settings
│   ├── package.json
│   └── tsconfig.json
├── .github/
│   └── copilot-instructions.md
├── .vscode/
│   └── tasks.json           # Start CareerBridge task
├── package.json             # Root commands for both applications
└── README.md
```

## How the application works

### 1. Login request

The client submits credentials to `POST /api/auth/login`. The server:

1. Validates the email and password shape with Zod.
2. Looks up the user by email using Prisma.
3. Compares the submitted password with the bcrypt hash.
4. Signs a JWT containing the user id, name, and role.
5. Returns the token and basic user information.

The client stores the token in browser local storage for the current local demo session. Every protected request adds:

```http
Authorization: Bearer <jwt-token>
```

### 2. Dashboard loading

After login, the client requests dashboard, student, batch, attendance, project, and placement data in parallel. The dashboard endpoint performs aggregate queries for the metric cards and returns upcoming tests, interviews, projects, and placement status counts.

### 3. Adding a student

The Add student dialog collects name, email, phone, and batch. The frontend performs basic required-field validation and sends the record to `POST /api/students`. The backend performs the authoritative Zod validation, inserts the record through Prisma, and returns the new student with their batch.

### 4. Viewing operational modules

The sidebar changes the active view without a full page reload. Each view uses the same authenticated API client and renders real database records. The dashboard links attention items directly to Attendance, Projects, and Placements.

## Database design

The full schema is defined in [server/prisma/schema.prisma](server/prisma/schema.prisma).

| Model           | Purpose                           | Important relationships                                                            |
| --------------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| `User`          | Staff login and role              | One user has a role                                                                |
| `Batch`         | Course cohort                     | One batch has many students                                                        |
| `Student`       | Learner profile                   | Belongs to one batch; owns attendance, results, interviews, projects, applications |
| `Attendance`    | Daily presence                    | Belongs to one student                                                             |
| `MockTest`      | Scheduled assessment              | Has many test results                                                              |
| `TestResult`    | Student score                     | Joins one student to one mock test                                                 |
| `Interview`     | Mock interview event              | Belongs to one student                                                             |
| `Project`       | Team project                      | Has many project members                                                           |
| `ProjectMember` | Student/project join table        | Connects students and projects                                                     |
| `Company`       | Hiring company and opening        | Has many applications                                                              |
| `Application`   | Student placement pipeline record | Joins one student to one company                                                   |

Prisma creates the SQLite database at `server/prisma/dev.db` after migration. The database file is ignored by Git because it is local runtime data.

## API reference

The API base URL is `http://localhost:4000/api`.

| Method | Endpoint          | Auth | Description                               |
| ------ | ----------------- | ---- | ----------------------------------------- |
| `POST` | `/auth/login`     | No   | Validate credentials and return a JWT     |
| `GET`  | `/dashboard`      | Yes  | Return metrics and upcoming activity      |
| `GET`  | `/students?q=...` | Yes  | List or search students                   |
| `POST` | `/students`       | Yes  | Create a student and assign a batch       |
| `GET`  | `/batches`        | Yes  | List batches with student counts          |
| `GET`  | `/meta`           | Yes  | Return lookup values used by forms        |
| `GET`  | `/attendance`     | Yes  | Return student attendance and percentages |
| `GET`  | `/projects`       | Yes  | Return projects with team members         |
| `GET`  | `/placements`     | Yes  | Return companies and applications         |

Example login request:

```http
POST /api/auth/login
Content-Type: application/json

{
	"email": "admin@northstar.dev",
	"password": "demo123"
}
```

Example authenticated request:

```http
GET /api/students
Authorization: Bearer <token>
```

## Installation and setup

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Windows, macOS, or Linux

Check the installation before starting:

```bash
node --version
npm --version
```

### Install dependencies

Run these commands from the project root:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

The first command installs the root `concurrently` package. The next two install backend and frontend dependencies in their respective folders.

### Create the database

Generate the Prisma client and create the first migration:

```bash
npm run prisma:generate --prefix server
npm run prisma:migrate --prefix server
```

When Prisma asks for a migration name, use `init`.

### Add demo data

```bash
npm run seed
```

The seed command clears existing local records and recreates a complete demo dataset. Do not run it against a database containing data you want to preserve.

### Start the application

```bash
npm run dev
```

This starts both processes through `concurrently`:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`

Open the frontend URL in a browser.

## Demo login

Use the pre-filled credentials on the login screen:

| Role              | Email                     | Password  |
| ----------------- | ------------------------- | --------- |
| Admin             | `admin@northstar.dev`     | `demo123` |
| Admin             | `dubeysoumya8@gmail.com`  | `demo123` |
| Trainer           | `trainer@northstar.dev`   | `demo123` |
| Placement officer | `placement@northstar.dev` | `demo123` |

These accounts are for local demonstration only. Change the password and secret before using the application in a real environment.

## Seeded data

The seed script creates:

- 3 staff users
- 3 active batches
- 8 students
- Five attendance entries per student
- 2 upcoming mock tests
- Mock test results
- Upcoming technical and HR interviews
- 2 team projects
- 2 hiring companies
- Placement applications at screening, interview, and selected stages

The seed implementation is in [server/prisma/seed.ts](server/prisma/seed.ts).

## Using the application

### Dashboard

Start on Overview to see health metrics and attention items. Select `Add student` to begin the main workflow.

### Students

Use the global search field to filter students by name or email. Select `Add student`, complete the form, choose a batch, and submit. The list refreshes from the database after creation.

### Batches

Open Batches to see cohort cards, course names, trainers, class schedules, and the number of assigned students.

### Attendance

Open Attendance to review the overall percentage and each student's attendance health. Students below 75% are marked as needing attention.

### Projects

Open Projects to review project status, descriptions, deadlines, and team members.

### Placements

Open Placements to review hiring companies, job codes, candidates, pipeline stages, and offer values.

## Available scripts

### Root scripts

| Command         | Purpose                             |
| --------------- | ----------------------------------- |
| `npm run dev`   | Start frontend and backend together |
| `npm run build` | Build the server and client         |
| `npm run seed`  | Run the backend seed script         |

### Server scripts

| Command                                   | Purpose                                  |
| ----------------------------------------- | ---------------------------------------- |
| `npm run dev --prefix server`             | Start Express with TypeScript watch mode |
| `npm run build --prefix server`           | Compile backend TypeScript               |
| `npm run seed --prefix server`            | Reset and seed the database              |
| `npm run prisma:generate --prefix server` | Generate Prisma Client                   |
| `npm run prisma:migrate --prefix server`  | Create/apply a development migration     |

### Client scripts

| Command                           | Purpose                              |
| --------------------------------- | ------------------------------------ |
| `npm run dev --prefix client`     | Start Vite development server        |
| `npm run build --prefix client`   | Type-check and build frontend assets |
| `npm run preview --prefix client` | Preview the production build         |

## Configuration

The backend reads [server/.env](server/.env):

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="northstar-local-secret"
PORT=4000
```

### Environment variables

| Variable       | Purpose                      | Local default            |
| -------------- | ---------------------------- | ------------------------ |
| `DATABASE_URL` | Prisma database connection   | `file:./dev.db`          |
| `JWT_SECRET`   | Secret used to sign sessions | `northstar-local-secret` |
| `PORT`         | Express server port          | `4000`                   |

For production, use a long random `JWT_SECRET`, a managed database, HTTPS, secure cookies or another protected token strategy, and secrets supplied by the hosting platform rather than committed files.

## Troubleshooting

### `npm is not recognized`

Install Node.js from the official Node.js installer, then close and reopen VS Code so the updated PATH is loaded. Verify with:

```powershell
Get-Command node
Get-Command npm
```

### Prisma cannot find the database

Run the commands from the project root and make sure `server/.env` exists:

```bash
npm run prisma:generate --prefix server
npm run prisma:migrate --prefix server
```

### Port already in use

Change `PORT` in `server/.env`. For the Vite frontend, change the port in `client/vite.config.ts` and update the CORS origin in `server/src/index.ts` to match.

### Login fails after reseeding

Run `npm run seed` again and use one of the demo accounts listed above. The seed script removes old users before recreating them.

### The frontend shows an authentication error

Make sure both servers are running, then sign out and sign in again. The browser stores the JWT in local storage; clearing site storage resets the local session.

## Future improvements

The current project provides the core working slice and database foundation. A production expansion would add:

- Full create, read, update, and delete screens for every entity
- Server-side role authorization middleware for admin, trainer, and placement officer permissions
- Dedicated attendance marking and batch-wise report screens
- Mock test scheduling and result entry forms
- Interview feedback entry and score history
- Project submission uploads and trainer evaluation forms
- Company and job-opening management
- CSV/PDF report exports
- Automated tests and CI checks
- Production PostgreSQL configuration
- Password reset, refresh tokens, audit logs, and stronger session storage
