import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  UserX, 
  Download, 
  ArrowUpDown, 
  X,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Department, Course } from '../types';

interface StudentsViewProps {
  students: Student[];
  departments: Department[];
  courses: Course[];
  initialDepartmentFilter?: string;
  onAddStudent: () => void;
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => Promise<void>;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

type SortField = 'fullName' | 'admissionDate' | 'id';
type SortOrder = 'asc' | 'desc';

export default function StudentsView({
  students,
  departments,
  courses,
  initialDepartmentFilter = '',
  onAddStudent,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  showToast
}: StudentsViewProps) {
  
  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState(initialDepartmentFilter);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Sync initialDepartmentFilter if prop changes
  useEffect(() => {
    if (initialDepartmentFilter !== undefined) {
      setSelectedDept(initialDepartmentFilter);
      setCurrentPage(1);
    }
  }, [initialDepartmentFilter]);

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('fullName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Delete Confirmation State
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to resolve Department name
  const getDeptName = (deptId: string | undefined | null) => {
    if (!deptId) return 'No Department';
    return departments.find(d => d.id === deptId)?.name || deptId;
  };

  // Helper to resolve Course name
  const getCourseName = (courseId: string | undefined | null) => {
    if (!courseId) return 'No Course';
    return courses.find(c => c.id === courseId)?.name || courseId;
  };

  // Avatar Initials Helper
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500 text-blue-50',
      'bg-emerald-500 text-emerald-50',
      'bg-indigo-500 text-indigo-50',
      'bg-amber-500 text-amber-50',
      'bg-rose-500 text-rose-50',
      'bg-violet-500 text-violet-50',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Handle deletion confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteCandidateId) return;
    setIsDeleting(true);
    try {
      await onDeleteStudent(deleteCandidateId);
      showToast('Student profile deleted successfully.', 'success');
      setDeleteCandidateId(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete student.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDept('');
    setSelectedCourse('');
    setSelectedYear('');
    setSelectedGender('');
    setSelectedStatus('');
    setCurrentPage(1);
    showToast('Filters cleared successfully.', 'info');
  };

  // Toggle Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // --- Filtering & Sorting Logic ---
  const filteredStudents = students.filter(student => {
    // 1. Search term check
    const searchLower = searchTerm.toLowerCase().trim();
    const deptName = (getDeptName(student.departmentId) || '').toLowerCase();
    const matchesSearch = !searchLower || (
      (student.fullName || '').toLowerCase().includes(searchLower) ||
      (student.id || '').toLowerCase().includes(searchLower) ||
      (student.email || '').toLowerCase().includes(searchLower) ||
      deptName.includes(searchLower)
    );

    // 2. Department check
    const matchesDept = !selectedDept || (student.departmentId && student.departmentId.toLowerCase() === selectedDept.toLowerCase());

    // 3. Course check
    const matchesCourse = !selectedCourse || student.courseId === selectedCourse;

    // 4. Year/Semester check
    const matchesYear = !selectedYear || student.yearSemester === selectedYear;

    // 5. Gender check
    const matchesGender = !selectedGender || student.gender === selectedGender;

    // 6. Status check
    const matchesStatus = !selectedStatus || student.status === selectedStatus;

    return matchesSearch && matchesDept && matchesCourse && matchesYear && matchesGender && matchesStatus;
  });

  // Sort
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'fullName') {
      comparison = a.fullName.localeCompare(b.fullName);
    } else if (sortField === 'admissionDate') {
      comparison = a.admissionDate.localeCompare(b.admissionDate);
    } else if (sortField === 'id') {
      comparison = a.id.localeCompare(b.id);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination bounds
  const totalItems = sortedStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedStudents = sortedStudents.slice(startIndex, endIndex);

  return (
    <div className="space-y-6" id="student-management-section">
      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Active Registrations</h2>
          <p className="text-slate-500 text-xs mt-0.5">Manage, filter, and register official student enrollments.</p>
        </div>
        <button
          onClick={onAddStudent}
          id="add-student-main-btn"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Admission</span>
        </button>
      </div>

      {/* Search & Quick Filter Controls */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl card-shadow border border-slate-200/80 flex flex-col md:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, student roll no, email, or department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-hidden text-xs font-medium bg-slate-50/60 hover:bg-slate-50 focus:bg-white transition-all"
            id="student-search-bar"
          />
        </div>

        {/* Action Controls */}
        <div className="flex gap-2.5">
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            id="student-filter-toggle-btn"
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-2xs ${
              isFilterPanelOpen || selectedDept || selectedCourse || selectedYear || selectedGender || selectedStatus
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {(selectedDept || selectedCourse || selectedYear || selectedGender || selectedStatus) && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            )}
          </button>

          {(searchTerm || selectedDept || selectedCourse || selectedYear || selectedGender || selectedStatus) && (
            <button
              onClick={handleResetFilters}
              id="student-filters-clear-btn"
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Expandable Filter Panel */}
      <AnimatePresence>
        {isFilterPanelOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-slate-100 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 shadow-sm">
              {/* Dept filter */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Department</span>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setSelectedCourse('');
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden"
                  id="filter-dept-select"
                >
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Course filter */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Course</span>
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCourse(val);
                    if (val) {
                      const matched = courses.find(c => c.id === val);
                      if (matched && matched.departmentId !== selectedDept) {
                        setSelectedDept(matched.departmentId);
                      }
                    }
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden hover:border-slate-300 transition-colors"
                  id="filter-course-select"
                >
                  <option value="">All Courses</option>
                  {courses
                    .filter(c => !selectedDept || c.departmentId === selectedDept)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>

              {/* Semester filter */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Year / Semester</span>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden"
                >
                  <option value="">All Semesters</option>
                  <option value="Year 1 / Sem 1">Year 1 / Sem 1</option>
                  <option value="Year 1 / Sem 2">Year 1 / Sem 2</option>
                  <option value="Year 2 / Sem 3">Year 2 / Sem 3</option>
                  <option value="Year 2 / Sem 4">Year 2 / Sem 4</option>
                  <option value="Year 3 / Sem 5">Year 3 / Sem 5</option>
                  <option value="Year 3 / Sem 6">Year 3 / Sem 6</option>
                  <option value="Year 4 / Sem 7">Year 4 / Sem 7</option>
                  <option value="Year 4 / Sem 8">Year 4 / Sem 8</option>
                </select>
              </div>

              {/* Gender filter */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gender</span>
                <select
                  value={selectedGender}
                  onChange={(e) => {
                    setSelectedGender(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden"
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Status filter */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Student Directory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="student-table-container">
        {paginatedStudents.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center max-w-md mx-auto">
            <UserX className="w-14 h-14 text-slate-300 mb-4" />
            <h3 className="text-base font-bold text-slate-800">No Student Records Found</h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              We couldn't find any student profiles matching your search or filters. Try adjustments or register a new admission.
            </p>
            <button
              onClick={handleResetFilters}
              id="empty-state-reset-btn"
              className="mt-5 px-4.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200/50"
            >
              Reset Filters & Search
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4.5 px-6 select-none cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1.5">
                      <span>Student ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-4.5 px-6 select-none cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('fullName')}>
                    <div className="flex items-center gap-1.5">
                      <span>Student Details</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-4.5 px-6">Department & Course</th>
                  <th className="py-4.5 px-6 select-none cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('admissionDate')}>
                    <div className="flex items-center gap-1.5">
                      <span>Enrollment Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-4.5 px-6 text-center">Status</th>
                  <th className="py-4.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                    {/* ID */}
                    <td className="py-4.5 px-6 font-mono text-xs font-bold text-slate-500">
                      {student.id}
                    </td>

                    {/* Photo + Name + Contact */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3">
                        {student.profilePhoto ? (
                          <img
                            src={student.profilePhoto}
                            alt={student.fullName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-xs shrink-0"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ${getAvatarColor(student.fullName)}`}>
                            {getInitials(student.fullName)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800 hover:text-brand-600 transition-colors cursor-pointer" onClick={() => onViewStudent(student)}>
                            {student.fullName}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 text-xs text-slate-400 mt-0.5">
                            <span className="font-medium">{student.email}</span>
                            {student.phone && (
                              <>
                                <span className="hidden sm:inline text-slate-300">•</span>
                                <span className="font-mono">{student.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Academics */}
                    <td className="py-4.5 px-6">
                      <p className="font-semibold text-slate-700">{getDeptName(student.departmentId)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{getCourseName(student.courseId)} • {student.yearSemester}</p>
                    </td>

                    {/* Admission */}
                    <td className="py-4.5 px-6 text-slate-500 font-medium">
                      {student.admissionDate}
                    </td>

                    {/* Status */}
                    <td className="py-4.5 px-6 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        student.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {student.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewStudent(student)}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="View Profile Details"
                          id={`action-view-${student.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-brand-600 rounded-lg transition-colors cursor-pointer"
                          title="Edit Profile"
                          id={`action-edit-${student.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidateId(student.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Student"
                          id={`action-delete-${student.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Panel */}
        {totalItems > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-700">{startIndex + 1}</span> to <span className="font-bold text-slate-700">{endIndex}</span> of <span className="font-bold text-slate-700">{totalItems}</span> registrations
            </span>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                id="pagination-prev-btn"
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800 disabled:opacity-50 disabled:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1 px-2.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7.5 h-7.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page 
                        ? 'bg-brand-600 text-white shadow-xs' 
                        : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                id="pagination-next-btn"
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800 disabled:opacity-50 disabled:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Popup Dialog */}
      <AnimatePresence>
        {deleteCandidateId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6 border border-slate-100 space-y-4"
              id="delete-confirmation-dialog"
            >
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-rose-50 rounded-xl text-rose-600 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Confirm Destructive Action</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Are you sure you want to delete student profile <span className="font-mono font-bold text-slate-800">{deleteCandidateId}</span>? 
                    This will permanently scrub all registrations and records from the database. This action is irreversible.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteCandidateId(null)}
                  disabled={isDeleting}
                  id="delete-cancel-btn"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Keep Profile
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  id="delete-confirm-btn"
                  className="px-4.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/10 hover:shadow-rose-500/20 transition-all cursor-pointer"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
