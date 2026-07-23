import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

// Core Type definitions
import { Student, Department, Course, DashboardStats, AdminUser } from './types';

// API services
import { api } from './lib/api';

// Visual components
import Sidebar from './components/Sidebar';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import StudentsView from './components/StudentsView';
import DepartmentsCoursesView from './components/DepartmentsCoursesView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';

// Overlay Modals
import StudentFormModal from './components/StudentFormModal';
import StudentDetailsModal from './components/StudentDetailsModal';

// Interactive Toasts
import { ToastContainer, ToastItem, ToastType } from './components/Toast';

const defaultStats: DashboardStats = {
  totalStudents: 0,
  activeStudents: 0,
  maleStudents: 0,
  femaleStudents: 0,
  recentStudents: [],
  departmentDistribution: [],
  genderDistribution: []
};

export default function App() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Active Screen View state
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('');

  // School Database lists
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<DashboardStats>(defaultStats);

  // Loaders and alerts
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Modal display states
  const [activeStudentForm, setActiveStudentForm] = useState<Student | null | undefined>(undefined); // null = ADD, student = EDIT, undefined = CLOSED
  const [activeStudentDetails, setActiveStudentDetails] = useState<Student | null>(null); // null = CLOSED

  // --- Session initialization ---
  useEffect(() => {
    const initSession = async () => {
      const token = localStorage.getItem('sms_auth_token');
      const storedUser = localStorage.getItem('sms_admin_user');
      if (token && storedUser) {
        try {
          setAdminUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          return;
        } catch (e) {
          localStorage.clear();
        }
      }
      
      // Auto-login as default Admin for seamless access
      try {
        const data = await api.login({ email: 'admin@school.edu', password: 'adminpassword' });
        localStorage.setItem('sms_auth_token', data.token);
        localStorage.setItem('sms_admin_user', JSON.stringify(data.user));
        setAdminUser(data.user);
        setIsAuthenticated(true);
      } catch (err) {
        // Fallback to manual login view if auto-login fails
      }
    };

    initSession();
  }, []);

  // Sync data automatically once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Fetch all registers from database
  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsList, deptsList, coursesList, dashboardStats] = await Promise.all([
        api.getStudents(),
        api.getDepartments(),
        api.getCourses(),
        api.getDashboardStats()
      ]);
      setStudents(studentsList);
      setDepartments(deptsList);
      setCourses(coursesList);
      setStats(dashboardStats);
    } catch (err: any) {
      // If unauthorized, attempt auto-relogin once
      if (err.message && (err.message.includes('token') || err.message.includes('expired') || err.message.includes('required'))) {
        try {
          const data = await api.login({ email: 'admin@school.edu', password: 'adminpassword' });
          localStorage.setItem('sms_auth_token', data.token);
          localStorage.setItem('sms_admin_user', JSON.stringify(data.user));
          setAdminUser(data.user);
          setIsAuthenticated(true);
          const [studentsList, deptsList, coursesList, dashboardStats] = await Promise.all([
            api.getStudents(),
            api.getDepartments(),
            api.getCourses(),
            api.getDashboardStats()
          ]);
          setStudents(studentsList);
          setDepartments(deptsList);
          setCourses(coursesList);
          setStats(dashboardStats);
          return;
        } catch (retryErr) {
          handleLogout();
          showToast('Session expired. Please log in again.', 'warning');
        }
      } else {
        showToast(err.message || 'Failed to fetch academic registers.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Toasts notification hub ---
  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Authentication Actions ---
  const handleLoginSuccess = (token: string, user: { email: string; fullName: string }) => {
    localStorage.setItem('sms_auth_token', token);
    localStorage.setItem('sms_admin_user', JSON.stringify(user));
    setAdminUser(user);
    setIsAuthenticated(true);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('sms_auth_token');
    localStorage.removeItem('sms_admin_user');
    setAdminUser(null);
    setIsAuthenticated(false);
    showToast('Administrator logged out successfully.', 'success');
  };

  // --- Student CRUD Handlers ---
  const handleSaveStudent = async (studentData: Partial<Student>) => {
    try {
      if (activeStudentForm && activeStudentForm.id) {
        // Update
        await api.updateStudent(activeStudentForm.id, studentData);
        showToast(`Student profile "${studentData.fullName}" updated successfully.`, 'success');
      } else {
        // Create
        await api.createStudent(studentData);
        showToast(`Successfully registered "${studentData.fullName}" as new student.`, 'success');
      }
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save student record.', 'error');
      throw err;
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await api.deleteStudent(id);
      showToast(`Student ${id} deleted successfully.`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete student.', 'error');
      throw err;
    }
  };

  // --- Departments CRUD Handlers ---
  const handleAddDept = async (dept: Partial<Department>) => {
    try {
      await api.createDepartment(dept);
      showToast(`Department "${dept.name}" created successfully.`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create department.', 'error');
      throw err;
    }
  };

  const handleUpdateDept = async (id: string, dept: Partial<Department>) => {
    try {
      await api.updateDepartment(id, dept);
      showToast(`Department "${dept.name}" updated successfully.`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update department.', 'error');
      throw err;
    }
  };

  const handleDeleteDept = async (id: string) => {
    try {
      await api.deleteDepartment(id);
      showToast(`Department deleted successfully.`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete department.', 'error');
      throw err;
    }
  };

  // --- Courses CRUD Handlers ---
  const handleAddCourse = async (course: Partial<Course>) => {
    try {
      await api.createCourse(course);
      showToast(`Course "${course.name}" created successfully.`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create course.', 'error');
      throw err;
    }
  };

  const handleUpdateCourse = async (id: string, course: Partial<Course>) => {
    try {
      await api.updateCourse(id, course);
      showToast(`Course "${course.name}" updated successfully.`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update course.', 'error');
      throw err;
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      await api.deleteCourse(id);
      showToast(`Course deleted successfully.`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete course.', 'error');
      throw err;
    }
  };

  // Render Loading cover
  const renderLoadingCover = () => (
    <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100">
        <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
        <span className="text-xs font-semibold text-slate-700">Synchronizing database...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans" id="app-root-frame">
      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Database sync overlays */}
      {loading && !students.length && renderLoadingCover()}

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          /* --- Login view --- */
          <motion.div
            key="login-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <LoginView onLoginSuccess={handleLoginSuccess} showToast={showToast} />
          </motion.div>
        ) : (
          /* --- Full Admin system views --- */
          <div key="portal-screen" className="flex flex-col md:flex-row w-full min-h-screen">
            {/* Sidebar navigation */}
            <Sidebar 
              activeView={activeView} 
              setActiveView={setActiveView} 
              adminUser={adminUser} 
              onLogout={handleLogout} 
            />

            {/* Central Work Space Wrapper */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
              {/* Header */}
              <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 shrink-0 z-10">
                <h1 className="text-lg font-bold text-slate-800 tracking-tight capitalize">
                  {activeView === 'dashboard' && 'Dashboard Overview'}
                  {activeView === 'students' && 'Student Directory'}
                  {activeView === 'departments-courses' && 'Academic Departments'}
                  {activeView === 'reports' && 'Reports & Analytics'}
                  {activeView === 'settings' && 'System Configuration'}
                </h1>
                
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-slate-800">{adminUser?.fullName || 'College Admin'}</p>
                      <p className="text-xs text-slate-500">System Administrator</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border border-slate-200 text-brand-600 font-bold text-sm shrink-0">
                      {adminUser?.fullName ? adminUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
                    </div>
                  </div>
                </div>
              </header>

              {/* Central Work Space */}
              <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="max-w-7xl mx-auto h-full"
                  >
                    {activeView === 'dashboard' && (
                      <DashboardView
                        stats={stats}
                        departments={departments}
                        courses={courses}
                        onViewStudent={(s) => setActiveStudentDetails(s)}
                        onNavigateToStudents={() => setActiveView('students')}
                      />
                    )}

                    {activeView === 'students' && (
                      <StudentsView
                        students={students}
                        departments={departments}
                        courses={courses}
                        initialDepartmentFilter={selectedDeptFilter}
                        onAddStudent={() => setActiveStudentForm(null)}
                        onViewStudent={(s) => setActiveStudentDetails(s)}
                        onEditStudent={(s) => setActiveStudentForm(s)}
                        onDeleteStudent={handleDeleteStudent}
                        showToast={showToast}
                      />
                    )}

                    {activeView === 'departments-courses' && (
                      <DepartmentsCoursesView
                        departments={departments}
                        courses={courses}
                        students={students}
                        onSelectDepartment={(deptId) => {
                          setSelectedDeptFilter(deptId);
                          setActiveView('students');
                        }}
                        onAddDept={handleAddDept}
                        onUpdateDept={handleUpdateDept}
                        onDeleteDept={handleDeleteDept}
                        onAddCourse={handleAddCourse}
                        onUpdateCourse={handleUpdateCourse}
                        onDeleteCourse={handleDeleteCourse}
                        showToast={showToast}
                      />
                    )}

                    {activeView === 'reports' && (
                      <ReportsView
                        students={students}
                        departments={departments}
                        courses={courses}
                        showToast={showToast}
                      />
                    )}

                    {activeView === 'settings' && (
                      <SettingsView showToast={showToast} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* --- OVERLAY MODALS --- */}
      <AnimatePresence>
        {/* ADD/EDIT STUDENT FORM */}
        {activeStudentForm !== undefined && (
          <StudentFormModal
            student={activeStudentForm}
            existingStudents={students}
            departments={departments}
            courses={courses}
            onSave={handleSaveStudent}
            onClose={() => setActiveStudentForm(undefined)}
            showToast={showToast}
          />
        )}

        {/* VIEW DETAILS DRAWER */}
        {activeStudentDetails && (
          <StudentDetailsModal
            student={activeStudentDetails}
            departments={departments}
            courses={courses}
            onClose={() => setActiveStudentDetails(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
