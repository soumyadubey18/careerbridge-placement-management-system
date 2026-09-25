const TOKEN_KEY = 'careerbridge_auth_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Server request failed');
  }
  return data as T;
}

export const apiClient = {
  // Auth
  login: (email: string, password: string, role?: string) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),

  register: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    batchId?: string;
    college?: string;
    degree?: string;
    cgpa?: number;
  }) =>
    request<{ token: string; user: any; student: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ user: any }>('/auth/me'),

  // Dashboard
  getDashboard: () => request<any>('/dashboard'),

  // Students
  getStudents: (params?: { q?: string; batchId?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.batchId) query.set('batchId', params.batchId);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<any[]>(`/students${qs}`);
  },

  createStudent: (student: any) =>
    request<any>('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    }),

  updateStudent: (id: string, updates: any) =>
    request<any>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteStudent: (id: string) =>
    request<any>(`/students/${id}`, {
      method: 'DELETE',
    }),

  // Batches
  getBatches: () => request<any[]>('/batches'),

  createBatch: (batch: any) =>
    request<any>('/batches', {
      method: 'POST',
      body: JSON.stringify(batch),
    }),

  updateBatch: (id: string, updates: any) =>
    request<any>(`/batches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Attendance
  getAttendance: () => request<{ records: any[]; studentStats: any[] }>('/attendance'),

  recordAttendance: (batchId: string, date: string, records: any[]) =>
    request<any>('/attendance', {
      method: 'POST',
      body: JSON.stringify({ batchId, date, records }),
    }),

  // Mock Tests
  getMockTests: () => request<any[]>('/mock-tests'),

  createMockTest: (test: any) =>
    request<any>('/mock-tests', {
      method: 'POST',
      body: JSON.stringify(test),
    }),

  updateTestScore: (testId: string, studentId: string, score: number, feedback?: string) =>
    request<any>(`/mock-tests/${testId}/scores`, {
      method: 'PUT',
      body: JSON.stringify({ studentId, score, feedback }),
    }),

  // Interviews
  getInterviews: () => request<any[]>('/interviews'),

  createInterview: (interview: any) =>
    request<any>('/interviews', {
      method: 'POST',
      body: JSON.stringify(interview),
    }),

  updateInterview: (id: string, updates: any) =>
    request<any>(`/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Projects
  getProjects: () => request<any[]>('/projects'),

  createProject: (project: any) =>
    request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    }),

  updateProject: (id: string, updates: any) =>
    request<any>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Placements
  getPlacements: () => request<{ openings: any[]; applications: any[] }>('/placements'),

  createOpening: (opening: any) =>
    request<any>('/placements/openings', {
      method: 'POST',
      body: JSON.stringify(opening),
    }),

  applyJob: (jobId: string, studentId: string) =>
    request<any>('/placements/apply', {
      method: 'POST',
      body: JSON.stringify({ jobId, studentId }),
    }),

  updateApplication: (id: string, data: { stage: string; offeredCtc?: string; notes?: string }) =>
    request<any>(`/placements/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  resetData: () => request<any>('/reset', { method: 'POST' }),
};
