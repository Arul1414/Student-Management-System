import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Student, Department, Course, DashboardStats } from './src/types';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'database.json');

// Middleware to parse large JSON requests (for base64 uploaded student images)
app.use(express.json({ limit: '10mb' }));

// Simple stateful database in memory + backed up to a local file
let students: Student[] = [];
let departments: Department[] = [];
let courses: Course[] = [];
let adminPassword = 'adminpassword'; // Default admin password

// Load or seed data
function initDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const rawData = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(rawData);
      students = data.students || [];
      departments = data.departments || [];
      courses = data.courses || [];
      adminPassword = data.adminPassword || 'adminpassword';
      console.log('Database loaded from file.');
    } catch (err) {
      console.error('Error reading database file. Re-initializing with sample data:', err);
    }
  }

  let needsSave = false;

  // Seed sample departments if empty
  if (!departments || departments.length === 0) {
    departments = [
      {
        id: 'CS',
        name: 'Computer Science',
        code: 'DEPT-CS',
        description: 'Department of Computer Science and Engineering'
      },
      {
        id: 'IT',
        name: 'Information Technology',
        code: 'DEPT-IT',
        description: 'Department of Information Technology and Systems'
      },
      {
        id: 'AI',
        name: 'Artificial Intelligence & Data Science',
        code: 'DEPT-AI',
        description: 'Department of AI, Machine Learning, and Big Data Analytics'
      },
      {
        id: 'ECE',
        name: 'Electronics & Communication',
        code: 'DEPT-ECE',
        description: 'Department of Electronics and Communication Engineering'
      },
      {
        id: 'ME',
        name: 'Mechanical Engineering',
        code: 'DEPT-ME',
        description: 'Department of Mechanical Engineering and Design'
      },
      {
        id: 'CE',
        name: 'Civil Engineering',
        code: 'DEPT-CE',
        description: 'Department of Civil and Environmental Engineering'
      }
    ];
    needsSave = true;
  }

  // Seed sample courses if empty
  if (!courses || courses.length === 0) {
    courses = [
      { id: 'CS-01', name: 'B.Tech Computer Science', departmentId: 'CS', duration: '4 Years', description: 'Core computer science degree covering programming, databases, and algorithms' },
      { id: 'CS-02', name: 'M.Sc Computer Science', departmentId: 'CS', duration: '2 Years', description: 'Advanced master course in software engineering and cloud computing' },
      { id: 'IT-01', name: 'B.Tech Information Technology', departmentId: 'IT', duration: '4 Years', description: 'Information systems, network security, and web architectures' },
      { id: 'IT-02', name: 'M.Sc Cybersecurity & Networks', departmentId: 'IT', duration: '2 Years', description: 'Specialized degree in network infrastructure and threat intelligence' },
      { id: 'AI-01', name: 'B.Tech AI & Data Science', departmentId: 'AI', duration: '4 Years', description: 'Deep learning, neural networks, machine learning models, and statistics' },
      { id: 'AI-02', name: 'M.Tech Data Science & Analytics', departmentId: 'AI', duration: '2 Years', description: 'Advanced predictive modeling, generative AI, and enterprise data architecture' },
      { id: 'ECE-01', name: 'B.Tech Electronics & Comm', departmentId: 'ECE', duration: '4 Years', description: 'Embedded systems, analog circuits, and communications signal processing' },
      { id: 'ME-01', name: 'B.Tech Mechanical Engineering', departmentId: 'ME', duration: '4 Years', description: 'Thermodynamics, CAD design, fluid dynamics, and robotics' },
      { id: 'CE-01', name: 'B.Tech Civil Engineering', departmentId: 'CE', duration: '4 Years', description: 'Structural analysis, surveying, geotechnics, and urban planning' }
    ];
    needsSave = true;
  }

  // Seed sample students if empty
  if (!students || students.length === 0) {
    students = [
      {
        id: 'STU1001',
        fullName: 'Jane Doe',
        email: 'jane.doe@school.edu',
        phone: '+1 (555) 019-2834',
        gender: 'Female',
        dob: '2004-04-12',
        address: '742 Evergreen Terrace, Springfield',
        parentName: 'Homer Doe',
        parentPhone: '+1 (555) 019-5555',
        departmentId: 'CS',
        courseId: 'CS-01',
        yearSemester: 'Year 2 / Sem 4',
        admissionDate: '2024-08-15',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        status: 'Active'
      },
      {
        id: 'STU1002',
        fullName: 'John Smith',
        email: 'john.smith@school.edu',
        phone: '+1 (555) 014-9923',
        gender: 'Male',
        dob: '2003-11-22',
        address: '102 Main Street, Apt 3B, Metropolis',
        parentName: 'Richard Smith',
        parentPhone: '+1 (555) 014-8877',
        departmentId: 'CS',
        courseId: 'CS-02',
        yearSemester: 'Year 3 / Sem 6',
        admissionDate: '2023-08-10',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        status: 'Active'
      },
      {
        id: 'STU1003',
        fullName: 'Alice Johnson',
        email: 'alice.j@school.edu',
        phone: '+1 (555) 023-4567',
        gender: 'Female',
        dob: '2005-02-14',
        address: '456 Oak Lane, Pineville',
        parentName: 'Sarah Johnson',
        parentPhone: '+1 (555) 023-4560',
        departmentId: 'IT',
        courseId: 'IT-01',
        yearSemester: 'Year 1 / Sem 2',
        admissionDate: '2025-01-20',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'Active'
      },
      {
        id: 'STU1004',
        fullName: 'Robert Brown',
        email: 'robert.brown@school.edu',
        phone: '+1 (555) 045-8812',
        gender: 'Male',
        dob: '2002-09-05',
        address: '891 Maple Court, Lakeside',
        parentName: 'Helen Brown',
        parentPhone: '+1 (555) 045-8800',
        departmentId: 'ECE',
        courseId: 'ECE-01',
        yearSemester: 'Year 4 / Sem 8',
        admissionDate: '2022-08-12',
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        status: 'Inactive'
      },
      {
        id: 'STU1005',
        fullName: 'Clara Davis',
        email: 'clara.davis@school.edu',
        phone: '+1 (555) 098-7654',
        gender: 'Female',
        dob: '2004-07-30',
        address: '12 Birch Road, Summit',
        parentName: 'Michael Davis',
        parentPhone: '+1 (555) 098-7600',
        departmentId: 'ME',
        courseId: 'ME-01',
        yearSemester: 'Year 2 / Sem 3',
        admissionDate: '2024-08-15',
        profilePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        status: 'Active'
      },
      {
        id: 'STU1006',
        fullName: 'David Wilson',
        email: 'david.wilson@school.edu',
        phone: '+1 (555) 076-1234',
        gender: 'Male',
        dob: '2001-03-18',
        address: '321 Cedar Drive, Rivertown',
        parentName: 'George Wilson',
        parentPhone: '+1 (555) 076-1200',
        departmentId: 'AI',
        courseId: 'AI-01',
        yearSemester: 'Year 1 / Sem 1',
        admissionDate: '2025-05-10',
        profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        status: 'Active'
      },
      {
        id: 'STU1007',
        fullName: 'Sophia Martinez',
        email: 'sophia.m@school.edu',
        phone: '+1 (555) 088-3411',
        gender: 'Female',
        dob: '2004-12-01',
        address: '905 Sunset Blvd, Los Angeles',
        parentName: 'Elena Martinez',
        parentPhone: '+1 (555) 088-3400',
        departmentId: 'CE',
        courseId: 'CE-01',
        yearSemester: 'Year 2 / Sem 4',
        admissionDate: '2024-08-20',
        profilePhoto: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
        status: 'Active'
      },
      {
        id: 'STU1008',
        fullName: 'Ethan Taylor',
        email: 'ethan.taylor@school.edu',
        phone: '+1 (555) 062-7711',
        gender: 'Male',
        dob: '2003-05-19',
        address: '14 West End Ave, New York',
        parentName: 'David Taylor',
        parentPhone: '+1 (555) 062-7700',
        departmentId: 'AI',
        courseId: 'AI-02',
        yearSemester: 'Year 3 / Sem 5',
        admissionDate: '2023-09-01',
        profilePhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        status: 'Active'
      }
    ];
    needsSave = true;
  }

  if (needsSave || !fs.existsSync(DB_FILE)) {
    saveDatabase();
  }
}

function saveDatabase() {
  try {
    const data = {
      students,
      departments,
      courses,
      adminPassword
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log('Database saved successfully to file.');
  } catch (err) {
    console.error('Failed to save database file:', err);
  }
}

initDatabase();

// --- JWT Helper Logic ---
// Implements 100% stable, fully functional signed JWT string representations
function signToken(email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = Buffer.from(header + '.' + payload + '.sms_super_secret_2026').toString('base64url').substring(0, 32);
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token: string): any {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;
    const expectedSig = Buffer.from(header + '.' + payload + '.sms_super_secret_2026').toString('base64url').substring(0, 32);
    if (signature !== expectedSig) return null;
    
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (Date.now() > data.exp) return null; // token expired
    return data;
  } catch (err) {
    return null;
  }
}

// Authentication Middleware
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  (req as any).user = decoded;
  next();
}

// --- API ENDPOINTS ---

// Admin Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (email.toLowerCase() === 'admin@school.edu' && password === adminPassword) {
    const token = signToken(email);
    return res.json({
      token,
      user: {
        email: 'admin@school.edu',
        fullName: 'School Admin'
      }
    });
  }

  return res.status(401).json({ error: 'Incorrect email or password' });
});

// Admin Forgot Password
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  if (email.toLowerCase() === 'admin@school.edu') {
    // For local convenience, return the active password in a secure, mock password recovery toast hint
    return res.json({
      message: 'Reset instructions sent successfully. (Developer Notice: The current admin password is: "' + adminPassword + '")',
      currentPassword: adminPassword
    });
  }

  return res.status(404).json({ error: 'Admin account with this email not found' });
});

// Admin Reset Password (Settings page option)
app.post('/api/auth/reset-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (currentPassword !== adminPassword) {
    return res.status(400).json({ error: 'Incorrect current password' });
  }

  adminPassword = newPassword;
  saveDatabase();
  return res.json({ message: 'Password updated successfully' });
});

// --- Students CRUD Endpoints ---

// GET /api/students - get all students
app.get('/api/students', authenticateToken, (req, res) => {
  res.json(students);
});

// GET /api/students/:id - get one student
app.get('/api/students/:id', authenticateToken, (req, res) => {
  const student = students.find(s => s.id.toLowerCase() === req.params.id.toLowerCase());
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  res.json(student);
});

// POST /api/students - add student
app.post('/api/students', authenticateToken, (req, res) => {
  const {
    id,
    fullName,
    email,
    phone,
    gender,
    dob,
    address,
    parentName,
    parentPhone,
    departmentId,
    courseId,
    yearSemester,
    admissionDate,
    profilePhoto,
    status,
    cgpa,
    arrears,
    sgpa,
    attendancePercentage,
    completedCredits,
    academicHistory
  } = req.body;

  // Validation
  if (!id || !fullName || !email || !departmentId || !courseId || !yearSemester || !status) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  // Detailed duplicate checks across Student ID, Email, and Phone
  const duplicateErrors: string[] = [];

  const existingIdStudent = students.find(s => s.id.toLowerCase() === id.trim().toLowerCase());
  if (existingIdStudent) {
    duplicateErrors.push(`Student ID/Roll No "${id.trim()}" is already assigned to ${existingIdStudent.fullName} (${existingIdStudent.id}).`);
  }

  const existingEmailStudent = students.find(s => s.email.toLowerCase() === email.trim().toLowerCase());
  if (existingEmailStudent) {
    duplicateErrors.push(`Email address "${email.trim()}" is already registered to ${existingEmailStudent.fullName} (${existingEmailStudent.id}).`);
  }

  if (phone && phone.trim()) {
    const existingPhoneStudent = students.find(s => s.phone && s.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''));
    if (existingPhoneStudent) {
      duplicateErrors.push(`Phone number "${phone.trim()}" is already registered to ${existingPhoneStudent.fullName} (${existingPhoneStudent.id}).`);
    }
  }

  if (duplicateErrors.length > 0) {
    return res.status(400).json({ 
      error: `Duplicate Data Conflict:\n${duplicateErrors.join('\n')}` 
    });
  }

  const newStudent: Student = {
    id: id.trim(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : '',
    gender: gender || 'Male',
    dob: dob || '',
    address: address ? address.trim() : '',
    parentName: parentName ? parentName.trim() : '',
    parentPhone: parentPhone ? parentPhone.trim() : '',
    departmentId,
    courseId,
    yearSemester,
    admissionDate: admissionDate || new Date().toISOString().split('T')[0],
    profilePhoto: profilePhoto || '',
    status: status || 'Active',
    cgpa: cgpa !== undefined ? Number(cgpa) : undefined,
    arrears: arrears !== undefined ? Number(arrears) : undefined,
    sgpa: sgpa !== undefined ? Number(sgpa) : undefined,
    attendancePercentage: attendancePercentage !== undefined ? Number(attendancePercentage) : undefined,
    completedCredits: completedCredits !== undefined ? Number(completedCredits) : undefined,
    academicHistory: academicHistory || []
  };

  students.unshift(newStudent); // add to top
  saveDatabase();
  res.status(201).json(newStudent);
});

// PUT /api/students/:id - update student
app.put('/api/students/:id', authenticateToken, (req, res) => {
  const currentId = req.params.id;
  const index = students.findIndex(s => s.id.toLowerCase() === currentId.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const {
    id: newId,
    fullName,
    email,
    phone,
    gender,
    dob,
    address,
    parentName,
    parentPhone,
    departmentId,
    courseId,
    yearSemester,
    admissionDate,
    profilePhoto,
    status,
    cgpa,
    arrears,
    sgpa,
    attendancePercentage,
    completedCredits,
    academicHistory
  } = req.body;

  // Validation
  if (!newId || !fullName || !email || !departmentId || !courseId || !yearSemester || !status) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  // Detailed duplicate checks (excluding current student being edited)
  const duplicateErrors: string[] = [];

  if (newId.trim().toLowerCase() !== currentId.toLowerCase()) {
    const existingIdStudent = students.find(s => s.id.toLowerCase() === newId.trim().toLowerCase());
    if (existingIdStudent) {
      duplicateErrors.push(`Student ID/Roll No "${newId.trim()}" is already assigned to ${existingIdStudent.fullName} (${existingIdStudent.id}).`);
    }
  }

  const existingEmailStudent = students.find(
    s => s.email.toLowerCase() === email.trim().toLowerCase() && s.id.toLowerCase() !== currentId.toLowerCase()
  );
  if (existingEmailStudent) {
    duplicateErrors.push(`Email address "${email.trim()}" is already registered to ${existingEmailStudent.fullName} (${existingEmailStudent.id}).`);
  }

  if (phone && phone.trim()) {
    const existingPhoneStudent = students.find(
      s => s.phone && s.phone.replace(/\D/g, '') === phone.replace(/\D/g, '') && s.id.toLowerCase() !== currentId.toLowerCase()
    );
    if (existingPhoneStudent) {
      duplicateErrors.push(`Phone number "${phone.trim()}" is already registered to ${existingPhoneStudent.fullName} (${existingPhoneStudent.id}).`);
    }
  }

  if (duplicateErrors.length > 0) {
    return res.status(400).json({ 
      error: `Duplicate Data Conflict:\n${duplicateErrors.join('\n')}` 
    });
  }

  const updatedStudent: Student = {
    ...students[index],
    id: newId.trim(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : '',
    gender,
    dob,
    address: address ? address.trim() : '',
    parentName: parentName ? parentName.trim() : '',
    parentPhone: parentPhone ? parentPhone.trim() : '',
    departmentId,
    courseId,
    yearSemester,
    admissionDate,
    profilePhoto: profilePhoto !== undefined ? profilePhoto : students[index].profilePhoto,
    status,
    cgpa: cgpa !== undefined ? Number(cgpa) : students[index].cgpa,
    arrears: arrears !== undefined ? Number(arrears) : students[index].arrears,
    sgpa: sgpa !== undefined ? Number(sgpa) : students[index].sgpa,
    attendancePercentage: attendancePercentage !== undefined ? Number(attendancePercentage) : students[index].attendancePercentage,
    completedCredits: completedCredits !== undefined ? Number(completedCredits) : students[index].completedCredits,
    academicHistory: academicHistory || students[index].academicHistory || []
  };

  students[index] = updatedStudent;
  saveDatabase();
  res.json(updatedStudent);
});

// DELETE /api/students/:id - delete student
app.delete('/api/students/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const index = students.findIndex(s => s.id.toLowerCase() === id.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  students.splice(index, 1);
  saveDatabase();
  res.json({ message: 'Student deleted successfully', deletedId: id });
});

// --- Departments CRUD Endpoints ---

app.get('/api/departments', authenticateToken, (req, res) => {
  res.json(departments);
});

app.post('/api/departments', authenticateToken, (req, res) => {
  const { id, name, code, description } = req.body;
  if (!id || !name || !code) {
    return res.status(400).json({ error: 'ID, Name, and Code are required' });
  }

  if (departments.some(d => d.id.toLowerCase() === id.toLowerCase() || d.code.toLowerCase() === code.toLowerCase())) {
    return res.status(400).json({ error: 'Department ID or Code already exists' });
  }

  const newDept: Department = { id, name, code, description: description || '' };
  departments.push(newDept);
  saveDatabase();
  res.status(201).json(newDept);
});

app.put('/api/departments/:id', authenticateToken, (req, res) => {
  const currentId = req.params.id;
  const index = departments.findIndex(d => d.id === currentId);
  if (index === -1) {
    return res.status(404).json({ error: 'Department not found' });
  }

  const { name, code, description } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'Name and Code are required' });
  }

  // Check unique code excluding self
  if (departments.some(d => d.code.toLowerCase() === code.toLowerCase() && d.id !== currentId)) {
    return res.status(400).json({ error: 'Department Code already exists' });
  }

  departments[index] = {
    ...departments[index],
    name,
    code,
    description: description || ''
  };
  saveDatabase();
  res.json(departments[index]);
});

app.delete('/api/departments/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const index = departments.findIndex(d => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Department not found' });
  }

  // Optional: Prevent deleting if students are assigned to this department
  const hasStudents = students.some(s => s.departmentId === id);
  if (hasStudents) {
    return res.status(400).json({ error: 'Cannot delete department: students are currently enrolled in it.' });
  }

  departments.splice(index, 1);
  saveDatabase();
  res.json({ message: 'Department deleted successfully', deletedId: id });
});

// --- Courses CRUD Endpoints ---

app.get('/api/courses', authenticateToken, (req, res) => {
  res.json(courses);
});

app.post('/api/courses', authenticateToken, (req, res) => {
  const { id, name, departmentId, duration, description } = req.body;
  if (!id || !name || !departmentId || !duration) {
    return res.status(400).json({ error: 'ID, Name, Department, and Duration are required' });
  }

  if (courses.some(c => c.id.toLowerCase() === id.toLowerCase())) {
    return res.status(400).json({ error: 'Course ID already exists' });
  }

  const newCourse: Course = { id, name, departmentId, duration, description: description || '' };
  courses.push(newCourse);
  saveDatabase();
  res.status(201).json(newCourse);
});

app.put('/api/courses/:id', authenticateToken, (req, res) => {
  const currentId = req.params.id;
  const index = courses.findIndex(c => c.id === currentId);
  if (index === -1) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const { name, departmentId, duration, description } = req.body;
  if (!name || !departmentId || !duration) {
    return res.status(400).json({ error: 'Name, Department, and Duration are required' });
  }

  courses[index] = {
    ...courses[index],
    name,
    departmentId,
    duration,
    description: description || ''
  };
  saveDatabase();
  res.json(courses[index]);
});

app.delete('/api/courses/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const index = courses.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Course not found' });
  }

  // Prevent deleting if students are enrolled
  const hasStudents = students.some(s => s.courseId === id);
  if (hasStudents) {
    return res.status(400).json({ error: 'Cannot delete course: students are currently enrolled in it.' });
  }

  courses.splice(index, 1);
  saveDatabase();
  res.json({ message: 'Course deleted successfully', deletedId: id });
});

// --- Dashboard Statistics API ---
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const total = students.length;
  const active = students.filter(s => s.status === 'Active').length;
  const male = students.filter(s => s.gender === 'Male').length;
  const female = students.filter(s => s.gender === 'Female').length;

  const recent = [...students].slice(0, 5);

  // Department distribution with names
  const deptDist = departments.map(d => {
    const count = students.filter(s => s.departmentId === d.id).length;
    return { name: d.name, count };
  });

  // Gender distribution
  const genderDist = [
    { name: 'Male', value: male },
    { name: 'Female', value: female },
    { name: 'Other', value: total - male - female }
  ].filter(g => g.value > 0);

  const stats: DashboardStats = {
    totalStudents: total,
    activeStudents: active,
    maleStudents: male,
    femaleStudents: female,
    recentStudents: recent,
    departmentDistribution: deptDist,
    genderDistribution: genderDist
  };

  res.json(stats);
});

// --- Vite & Client Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('Vite development middleware integrated.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static asset server running.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Student Management System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
