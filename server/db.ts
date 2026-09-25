import crypto from 'node:crypto';
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
} from '../src/types';
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
} from '../src/data/mockData';

export interface DBUser extends User {
  passwordHash: string;
}

// Simple salt + hash using node crypto
export function hashPassword(password: string): string {
  const salt = 'careerbridge_salt_2026';
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// In-memory backend database
class BackendDatabase {
  users: DBUser[] = [];
  batches: Batch[] = [];
  students: Student[] = [];
  attendance: AttendanceRecord[] = [];
  mockTests: MockTest[] = [];
  interviews: Interview[] = [];
  projects: Project[] = [];
  openings: JobOpening[] = [];
  applications: PlacementApplication[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    const defaultHash = hashPassword('demo123');

    this.users = INITIAL_USERS.map((u) => ({
      ...u,
      passwordHash: defaultHash,
    }));

    // Clone arrays
    this.batches = JSON.parse(JSON.stringify(INITIAL_BATCHES));
    this.students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
    this.attendance = JSON.parse(JSON.stringify(INITIAL_ATTENDANCE));
    this.mockTests = JSON.parse(JSON.stringify(INITIAL_MOCK_TESTS));
    this.interviews = JSON.parse(JSON.stringify(INITIAL_INTERVIEWS));
    this.projects = JSON.parse(JSON.stringify(INITIAL_PROJECTS));
    this.openings = JSON.parse(JSON.stringify(INITIAL_OPENINGS));
    this.applications = JSON.parse(JSON.stringify(INITIAL_APPLICATIONS));
  }

  findUserByEmail(email: string): DBUser | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): DBUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: Role;
    department?: string;
    phone?: string;
  }): DBUser {
    const newUser: DBUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      passwordHash: hashPassword(userData.password),
      avatar: userData.name.slice(0, 2).toUpperCase(),
      department: userData.department || 'Training Institute',
      phone: userData.phone || '+91 98765 00000',
    };
    this.users.push(newUser);
    return newUser;
  }
}

export const db = new BackendDatabase();
