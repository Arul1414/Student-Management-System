import { useState, FormEvent } from 'react';
import { 
  Building2, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Users, 
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Department, Course, Student } from '../types';

interface DepartmentsCoursesViewProps {
  departments: Department[];
  courses: Course[];
  students: Student[];
  onSelectDepartment?: (deptId: string) => void;
  onAddDept: (dept: Partial<Department>) => Promise<void>;
  onUpdateDept: (id: string, dept: Partial<Department>) => Promise<void>;
  onDeleteDept: (id: string) => Promise<void>;
  onAddCourse: (course: Partial<Course>) => Promise<void>;
  onUpdateCourse: (id: string, course: Partial<Course>) => Promise<void>;
  onDeleteCourse: (id: string) => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function DepartmentsCoursesView({
  departments,
  courses,
  students,
  onSelectDepartment,
  onAddDept,
  onUpdateDept,
  onDeleteDept,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  showToast
}: DepartmentsCoursesViewProps) {
  
  const [activeTab, setActiveTab] = useState<'depts' | 'courses'>('depts');

  // --- Department Roster Modal State ---
  const [activeDeptForRoster, setActiveDeptForRoster] = useState<Department | null>(null);
  const [rosterSearchTerm, setRosterSearchTerm] = useState('');
  const [showSqlPreview, setShowSqlPreview] = useState(false);

  // --- Modal / Form States ---
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptId, setDeptId] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDeptId, setCourseDeptId] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [courseDesc, setCourseDesc] = useState('');

  // Delete Confirmations
  const [deptDeleteId, setDeptDeleteId] = useState<string | null>(null);
  const [courseDeleteId, setCourseDeleteId] = useState<string | null>(null);

  // --- Student Count Calculators ---
  const getDeptStudentCount = (deptId: string) => {
    return students.filter(s => s.departmentId === deptId).length;
  };

  const getCourseStudentCount = (courseId: string) => {
    return students.filter(s => s.courseId === courseId).length;
  };

  // --- Department Form Actions ---
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptId('');
    setDeptName('');
    setDeptCode('');
    setDeptDesc('');
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptId(dept.id);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setDeptDesc(dept.description);
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = async (e: FormEvent) => {
    e.preventDefault();
    if (!deptId.trim() || !deptName.trim() || !deptCode.trim()) {
      showToast('All fields marked with an asterisk are required.', 'error');
      return;
    }

    try {
      const payload = {
        id: deptId.trim(),
        name: deptName.trim(),
        code: deptCode.trim(),
        description: deptDesc.trim()
      };

      if (editingDept) {
        await onUpdateDept(editingDept.id, payload);
        showToast('Department updated successfully', 'success');
      } else {
        await onAddDept(payload);
        showToast('Department created successfully', 'success');
      }
      setIsDeptModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save department', 'error');
    }
  };

  const handleDeleteDeptConfirm = async () => {
    if (!deptDeleteId) return;
    try {
      await onDeleteDept(deptDeleteId);
      showToast('Department removed successfully.', 'success');
      setDeptDeleteId(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete department.', 'error');
    }
  };

  // --- Course Form Actions ---
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseId('');
    setCourseName('');
    setCourseDeptId(departments[0]?.id || '');
    setCourseDuration('4 Years');
    setCourseDesc('');
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseId(course.id);
    setCourseName(course.name);
    setCourseDeptId(course.departmentId);
    setCourseDuration(course.duration);
    setCourseDesc(course.description);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: FormEvent) => {
    e.preventDefault();
    if (!courseId.trim() || !courseName.trim() || !courseDeptId || !courseDuration) {
      showToast('All core course fields are required.', 'error');
      return;
    }

    try {
      const payload = {
        id: courseId.trim(),
        name: courseName.trim(),
        departmentId: courseDeptId,
        duration: courseDuration,
        description: courseDesc.trim()
      };

      if (editingCourse) {
        await onUpdateCourse(editingCourse.id, payload);
        showToast('Course program updated successfully', 'success');
      } else {
        await onAddCourse(payload);
        showToast('Course program registered successfully', 'success');
      }
      setIsCourseModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save course program', 'error');
    }
  };

  const handleDeleteCourseConfirm = async () => {
    if (!courseDeleteId) return;
    try {
      await onDeleteCourse(courseDeleteId);
      showToast('Course program deleted successfully.', 'success');
      setCourseDeleteId(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete course.', 'error');
    }
  };

  return (
    <div className="space-y-6" id="academics-management-section">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Units & Curriculums</h2>
          <p className="text-slate-500 text-xs mt-0.5">Maintain faculties, registered course pathways, and department sizes.</p>
        </div>
        
        {/* Toggle & Add button combined */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1.5 border border-slate-200">
            <button
              onClick={() => setActiveTab('depts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'depts' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              Departments
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'courses' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              Courses
            </button>
          </div>

          <button
            onClick={activeTab === 'depts' ? handleOpenAddDept : handleOpenAddCourse}
            id="academics-add-main-btn"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'depts' ? 'Add Dept' : 'Add Course'}</span>
          </button>
        </div>
      </div>

      {/* --- DEPARTMENTS TAB CONTENT --- */}
      {activeTab === 'depts' && (
        <div className="grid grid-cols-1 gap-6" id="departments-tab-box">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {departments.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">No Departments Available</h3>
                <p className="text-xs text-slate-400 mt-1">Configure your first faculty branch to begin registrations.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="py-4 px-6">ID Code</th>
                      <th className="py-4 px-6">Department Name</th>
                      <th className="py-4 px-6">Serial Code</th>
                      <th className="py-4 px-6">Overview Description</th>
                      <th className="py-4 px-6 text-center">Enrolled Students</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {departments.map((dept) => {
                      const studentCount = getDeptStudentCount(dept.id);
                      return (
                        <tr key={dept.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-4.5 px-6 font-mono text-xs font-bold text-slate-600">{dept.id}</td>
                          <td className="py-4.5 px-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-slate-800">{dept.name}</span>
                            </div>
                          </td>
                          <td className="py-4.5 px-6 font-mono text-xs text-slate-500">{dept.code}</td>
                          <td className="py-4.5 px-6 text-slate-500 max-w-xs truncate">{dept.description || 'No description provided.'}</td>
                          <td className="py-4.5 px-6 text-center">
                            <button
                              onClick={() => {
                                setActiveDeptForRoster(dept);
                                setRosterSearchTerm('');
                                setShowSqlPreview(false);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-lg border border-brand-200/60 transition-all cursor-pointer shadow-2xs hover:scale-102"
                              title="Click to view enrolled student list"
                              id={`view-dept-students-badge-${dept.id}`}
                            >
                              <Users className="w-3.5 h-3.5 text-brand-600" />
                              <span>{studentCount} Students</span>
                            </button>
                          </td>
                          <td className="py-4.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setActiveDeptForRoster(dept);
                                  setRosterSearchTerm('');
                                  setShowSqlPreview(false);
                                }}
                                className="px-2.5 py-1.5 bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                title="View Students List"
                                id={`view-dept-students-btn-${dept.id}`}
                              >
                                <Users className="w-3.5 h-3.5" />
                                <span>Students</span>
                              </button>
                              <button
                                onClick={() => handleOpenEditDept(dept)}
                                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-brand-600 rounded-lg transition-colors cursor-pointer"
                                title="Edit Department"
                                id={`edit-dept-btn-${dept.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeptDeleteId(dept.id)}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                title="Delete Department"
                                id={`delete-dept-btn-${dept.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- COURSES TAB CONTENT --- */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 gap-6" id="courses-tab-box">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {courses.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">No Courses Registered</h3>
                <p className="text-xs text-slate-400 mt-1">Register course curriculums under departments.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="py-4 px-6">ID Code</th>
                      <th className="py-4 px-6">Course Name</th>
                      <th className="py-4 px-6">Assigned Department</th>
                      <th className="py-4 px-6">Standard Duration</th>
                      <th className="py-4 px-6">Enrolled Students</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {courses.map((course) => {
                      const studentCount = getCourseStudentCount(course.id);
                      return (
                        <tr key={course.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-4.5 px-6 font-mono text-xs font-bold text-slate-600">{course.id}</td>
                          <td className="py-4.5 px-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-slate-800">{course.name}</span>
                            </div>
                          </td>
                          <td className="py-4.5 px-6">
                            <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg">
                              {departments.find(d => d.id === course.departmentId)?.name || course.departmentId}
                            </span>
                          </td>
                          <td className="py-4.5 px-6 text-slate-600 font-medium">{course.duration}</td>
                          <td className="py-4.5 px-6">
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-full">
                              {studentCount} Students enrolled
                            </span>
                          </td>
                          <td className="py-4.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditCourse(course)}
                                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                                title="Edit Course"
                                id={`edit-course-btn-${course.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setCourseDeleteId(course.id)}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                title="Delete Course"
                                id={`delete-course-btn-${course.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- DEPARTMENT ADD/EDIT MODAL --- */}
      <AnimatePresence>
        {isDeptModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-100"
            >
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
                <h3 className="text-sm font-bold tracking-tight">{editingDept ? 'Update Department Details' : 'Create Academic Department'}</h3>
                <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSaveDept} className="p-6 space-y-4">
                {/* ID */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Dept ID (Short Code) *</label>
                  <input
                    type="text"
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    disabled={!!editingDept}
                    placeholder="e.g. CS"
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 focus:border-brand-500 focus:outline-hidden disabled:bg-slate-100"
                    id="dept-modal-id-field"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Used as shorthand (cannot change after creation)</span>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Faculty / Dept Name *</label>
                  <input
                    type="text"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 focus:border-brand-500 focus:outline-hidden"
                    id="dept-modal-name-field"
                  />
                </div>

                {/* Code */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Official Serial Code *</label>
                  <input
                    type="text"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="e.g. DEPT-CS"
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 focus:border-brand-500 focus:outline-hidden"
                    id="dept-modal-code-field"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Overview Description</label>
                  <textarea
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                    placeholder="Brief scope of course streams, research domains, etc."
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 focus:border-brand-500 focus:outline-hidden resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsDeptModalOpen(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" id="dept-modal-submit-btn" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">Save Department</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- COURSE ADD/EDIT MODAL --- */}
      <AnimatePresence>
        {isCourseModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-100"
            >
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
                <h3 className="text-sm font-bold tracking-tight">{editingCourse ? 'Modify Course Program' : 'Register Course Program'}</h3>
                <button onClick={() => setIsCourseModalOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSaveCourse} className="p-6 space-y-4">
                {/* ID */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Course ID *</label>
                  <input
                    type="text"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    disabled={!!editingCourse}
                    placeholder="e.g. CS-01"
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 focus:border-indigo-500 focus:outline-hidden disabled:bg-slate-100"
                    id="course-modal-id-field"
                  />
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Course Name *</label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 focus:border-indigo-500 focus:outline-hidden"
                    id="course-modal-name-field"
                  />
                </div>

                {/* Assigned Department */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Parent Department *</label>
                  <select
                    value={courseDeptId}
                    onChange={(e) => setCourseDeptId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 bg-white focus:border-indigo-500 focus:outline-hidden"
                    id="course-modal-dept-select"
                  >
                    <option value="">Select Faculty</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Program Duration *</label>
                  <select
                    value={courseDuration}
                    onChange={(e) => setCourseDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 bg-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="1 Year">1 Year</option>
                    <option value="2 Years">2 Years</option>
                    <option value="3 Years">3 Years</option>
                    <option value="4 Years">4 Years</option>
                    <option value="5 Years">5 Years</option>
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Curriculum Overview</label>
                  <textarea
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    placeholder="Summary of core subjects, lab credits, and prerequisites..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 focus:border-indigo-500 focus:outline-hidden resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsCourseModalOpen(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" id="course-modal-submit-btn" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">Save Course</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DELETION DIALOGS --- */}
      <AnimatePresence>
        {/* Dept delete confirm */}
        {deptDeleteId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-sm p-6 border border-slate-100 shadow-xl space-y-4"
            >
              <div className="flex gap-3.5 items-start">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0"><AlertTriangle className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-bold text-slate-900">Remove Department</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Are you sure you want to delete department <span className="font-mono font-bold text-slate-800">{deptDeleteId}</span>? 
                    All course maps associated with this department will need manual relocation. Enrolled students will throw registration conflicts.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3.5 pt-2">
                <button onClick={() => setDeptDeleteId(null)} className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer">Keep</button>
                <button onClick={handleDeleteDeptConfirm} id="dept-delete-confirm-btn" className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">Remove Dept</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Course delete confirm */}
        {courseDeleteId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-sm p-6 border border-slate-100 shadow-xl space-y-4"
            >
              <div className="flex gap-3.5 items-start">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0"><AlertTriangle className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-bold text-slate-900">Remove Course Program</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Are you sure you want to delete course <span className="font-mono font-bold text-slate-800">{courseDeleteId}</span>? 
                    Active students currently registered to this course must be transitioned manually.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3.5 pt-2">
                <button onClick={() => setCourseDeleteId(null)} className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer">Keep</button>
                <button onClick={handleDeleteCourseConfirm} id="course-delete-confirm-btn" className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">Remove Program</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* --- DEPARTMENT STUDENTS ROSTER DRILLDOWN MODAL --- */}
        {activeDeptForRoster && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-100 my-8 max-h-[90vh] flex flex-col"
              id="department-roster-modal"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-500/20 border border-brand-400/30 rounded-xl text-brand-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{activeDeptForRoster.name}</h3>
                      <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-brand-400 font-mono text-xs font-bold rounded-md">
                        {activeDeptForRoster.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{activeDeptForRoster.description || 'Department Student Records'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSqlPreview(!showSqlPreview)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 text-xs font-mono font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Toggle SQL Query View"
                  >
                    <span>SQL</span>
                  </button>
                  <button 
                    onClick={() => setActiveDeptForRoster(null)} 
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* SQL Preview Box if toggled */}
              {showSqlPreview && (
                <div className="bg-slate-950 p-4 border-b border-slate-800 text-slate-300 text-xs font-mono shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-brand-400 font-bold uppercase tracking-wider text-[10px]">Relational SQL Statement</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`SELECT * FROM students WHERE department_id = '${activeDeptForRoster.id}';`);
                        showToast('SQL Query copied to clipboard!', 'info');
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-sans font-bold cursor-pointer"
                    >
                      Copy SQL
                    </button>
                  </div>
                  <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-emerald-400 overflow-x-auto">
{`-- Fetch all student records belonging to ${activeDeptForRoster.name}
SELECT 
  id AS student_roll_no,
  full_name,
  email,
  course_id,
  gender,
  status
FROM students
WHERE LOWER(department_id) = LOWER('${activeDeptForRoster.id}')
ORDER BY id ASC;`}
                  </pre>
                </div>
              )}

              {/* Modal Body */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Search Bar & Header Stats */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={rosterSearchTerm}
                      onChange={(e) => setRosterSearchTerm(e.target.value)}
                      placeholder="Search student by name or roll no (e.g. 710724205001)..."
                      className="w-full pl-9 pr-3 py-2 bg-white rounded-lg text-xs font-medium border border-slate-200 focus:border-brand-500 focus:outline-hidden"
                      id="roster-search-input"
                    />
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                    <span className="font-bold text-slate-600">
                      Total: <span className="text-brand-600 font-extrabold">{students.filter(s => s.departmentId?.toLowerCase() === activeDeptForRoster.id.toLowerCase()).length} Enrolled</span>
                    </span>

                    {onSelectDepartment && (
                      <button
                        onClick={() => {
                          const deptId = activeDeptForRoster.id;
                          setActiveDeptForRoster(null);
                          onSelectDepartment(deptId);
                        }}
                        className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs"
                        id="open-in-directory-btn"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>Open in Directory</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Students List Table */}
                {(() => {
                  const deptStudents = students.filter(s => {
                    const matchesDept = s.departmentId?.toLowerCase() === activeDeptForRoster.id.toLowerCase();
                    const term = rosterSearchTerm.toLowerCase().trim();
                    const matchesTerm = !term || s.fullName.toLowerCase().includes(term) || s.id.toLowerCase().includes(term) || s.email.toLowerCase().includes(term);
                    return matchesDept && matchesTerm;
                  });

                  if (deptStudents.length === 0) {
                    return (
                      <div className="p-12 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-700">No Student Records Found</p>
                        <p className="text-xs text-slate-400 mt-0.5">No students match your query for {activeDeptForRoster.name}.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                            <th className="py-3.5 px-4">#</th>
                            <th className="py-3.5 px-4">Roll Number</th>
                            <th className="py-3.5 px-4">Student Name</th>
                            <th className="py-3.5 px-4">Assigned Course</th>
                            <th className="py-3.5 px-4">Official Email</th>
                            <th className="py-3.5 px-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {deptStudents.map((s, idx) => {
                            const courseObj = courses.find(c => c.id === s.courseId);
                            return (
                              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                                <td className="py-3 px-4 font-mono font-bold text-brand-700">{s.id}</td>
                                <td className="py-3 px-4 font-bold text-slate-800">
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={s.profilePhoto || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                                      alt={s.fullName}
                                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                    <span>{s.fullName}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-slate-600 font-medium">
                                  {courseObj?.name || s.courseId || 'Core Course'}
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{s.email}</td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                    {s.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-between items-center shrink-0">
                <span className="text-[11px] text-slate-500 font-medium">
                  Showing department student roster records
                </span>
                <button
                  onClick={() => setActiveDeptForRoster(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close Roster
                </button>
              </div>
            </motion.div>
          </div>
        )}      </AnimatePresence>
    </div>
  );
}
