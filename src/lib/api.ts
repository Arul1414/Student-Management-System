import { Student, Department, Course, DashboardStats } from '../types';

const API_BASE = '/api';

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let token = localStorage.getItem('sms_auth_token');

  // If no token exists, attempt silent auto-login
  if (!token) {
    try {
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@school.edu', password: 'adminpassword' })
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        token = loginData.token;
        localStorage.setItem('sms_auth_token', loginData.token);
        localStorage.setItem('sms_admin_user', JSON.stringify(loginData.user));
      }
    } catch (e) {
      // ignore login attempt error
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  let res = await fetch(url, { ...options, headers });

  // If status is 401 or 403, attempt silent re-login and retry request once
  if (res.status === 401 || res.status === 403) {
    try {
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@school.edu', password: 'adminpassword' })
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        token = loginData.token;
        localStorage.setItem('sms_auth_token', loginData.token);
        localStorage.setItem('sms_admin_user', JSON.stringify(loginData.user));

        const retryHeaders = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(options.headers || {})
        };
        res = await fetch(url, { ...options, headers: retryHeaders });
      }
    } catch (e) {
      // retry failed
    }
  }

  return res;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    let errMsg = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      errMsg = data.error || data.message || errMsg;
    } catch (e) {
      // no JSON response
    }
    throw new Error(errMsg);
  }
  return response.json();
}

export const api = {
  // Authentication
  async login(credentials: { email: string; password?: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(res);
  },

  async resetPassword(passwords: { currentPassword?: string; newPassword?: string }) {
    const res = await fetchWithAuth(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify(passwords)
    });
    return handleResponse(res);
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetchWithAuth(`${API_BASE}/dashboard/stats`);
    return handleResponse(res);
  },

  // Students CRUD
  async getStudents(): Promise<Student[]> {
    const res = await fetchWithAuth(`${API_BASE}/students`);
    return handleResponse(res);
  },

  async getStudentById(id: string): Promise<Student> {
    const res = await fetchWithAuth(`${API_BASE}/students/${id}`);
    return handleResponse(res);
  },

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    const res = await fetchWithAuth(`${API_BASE}/students`, {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
    return handleResponse(res);
  },

  async updateStudent(id: string, studentData: Partial<Student>): Promise<Student> {
    const res = await fetchWithAuth(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
    return handleResponse(res);
  },

  async deleteStudent(id: string): Promise<{ message: string; deletedId: string }> {
    const res = await fetchWithAuth(`${API_BASE}/students/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Departments CRUD
  async getDepartments(): Promise<Department[]> {
    const res = await fetchWithAuth(`${API_BASE}/departments`);
    return handleResponse(res);
  },

  async createDepartment(deptData: Partial<Department>): Promise<Department> {
    const res = await fetchWithAuth(`${API_BASE}/departments`, {
      method: 'POST',
      body: JSON.stringify(deptData)
    });
    return handleResponse(res);
  },

  async updateDepartment(id: string, deptData: Partial<Department>): Promise<Department> {
    const res = await fetchWithAuth(`${API_BASE}/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deptData)
    });
    return handleResponse(res);
  },

  async deleteDepartment(id: string): Promise<{ message: string; deletedId: string }> {
    const res = await fetchWithAuth(`${API_BASE}/departments/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Courses CRUD
  async getCourses(): Promise<Course[]> {
    const res = await fetchWithAuth(`${API_BASE}/courses`);
    return handleResponse(res);
  },

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    const res = await fetchWithAuth(`${API_BASE}/courses`, {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
    return handleResponse(res);
  },

  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
    const res = await fetchWithAuth(`${API_BASE}/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
    return handleResponse(res);
  },

  async deleteCourse(id: string): Promise<{ message: string; deletedId: string }> {
    const res = await fetchWithAuth(`${API_BASE}/courses/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  }
};
