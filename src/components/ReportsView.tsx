import { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Users, 
  Percent, 
  CheckCircle2, 
  ShieldAlert,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Student, Department, Course } from '../types';

interface ReportsViewProps {
  students: Student[];
  departments: Department[];
  courses: Course[];
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function ReportsView({ students, departments, courses, showToast }: ReportsViewProps) {
  
  // Filter States
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Helper to resolve Department Name
  const getDeptName = (deptId: string | undefined | null) => {
    if (!deptId) return 'No Department';
    return departments.find(d => d.id === deptId)?.name || deptId;
  };

  // Helper to resolve Course Name
  const getCourseName = (courseId: string | undefined | null) => {
    if (!courseId) return 'No Course';
    return courses.find(c => c.id === courseId)?.name || courseId;
  };

  // --- Filtering Logic for Report ---
  const reportStudents = students.filter(student => {
    const matchesDept = !selectedDept || student.departmentId === selectedDept;
    const matchesCourse = !selectedCourse || student.courseId === selectedCourse;
    const matchesGender = !selectedGender || student.gender === selectedGender;
    const matchesYear = !selectedYear || student.yearSemester === selectedYear;
    const matchesStatus = !selectedStatus || student.status === selectedStatus;

    return matchesDept && matchesCourse && matchesGender && matchesYear && matchesStatus;
  });

  // --- Statistical Calculators ---
  const totalCount = reportStudents.length;
  const activeCount = reportStudents.filter(s => s.status === 'Active').length;
  const activePercent = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  const maleCount = reportStudents.filter(s => s.gender === 'Male').length;
  const femaleCount = reportStudents.filter(s => s.gender === 'Female').length;
  const otherCount = totalCount - maleCount - femaleCount;

  // Department distribution inside report
  const deptChartData = departments.map(d => {
    const count = reportStudents.filter(s => s.departmentId === d.id).length;
    return { name: d.id, count, fullName: d.name };
  }).filter(d => d.count > 0);

  // Status distribution inside report
  const statusChartData = [
    { name: 'Active', value: activeCount },
    { name: 'Inactive', value: totalCount - activeCount }
  ].filter(s => s.value > 0);

  const STATUS_COLORS = ['#10b981', '#64748b'];
  const DEPT_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

  // --- Export Report to CSV ---
  const handleExportCSV = () => {
    if (reportStudents.length === 0) {
      showToast('No students available in the current report filter to export.', 'warning');
      return;
    }

    try {
      // CSV Headers
      const headers = [
        'Student ID',
        'Full Name',
        'Email Address',
        'Phone Number',
        'Gender',
        'Date of Birth',
        'Residential Address',
        'Guardian Name',
        'Guardian Phone',
        'Department',
        'Course',
        'Semester Year',
        'Admission Date',
        'Status'
      ];

      // Convert student records to row arrays
      const rows = reportStudents.map(student => [
        `"${student.id}"`,
        `"${student.fullName.replace(/"/g, '""')}"`,
        `"${student.email}"`,
        `"${student.phone || ''}"`,
        `"${student.gender}"`,
        `"${student.dob || ''}"`,
        `"${(student.address || '').replace(/"/g, '""')}"`,
        `"${(student.parentName || '').replace(/"/g, '""')}"`,
        `"${student.parentPhone || ''}"`,
        `"${getDeptName(student.departmentId).replace(/"/g, '""')}"`,
        `"${getCourseName(student.courseId).replace(/"/g, '""')}"`,
        `"${student.yearSemester}"`,
        `"${student.admissionDate}"`,
        `"${student.status}"`
      ]);

      // Combine and create blob URL
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `EduPulse_Student_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Exported ${reportStudents.length} student records as CSV`, 'success');
    } catch (err) {
      showToast('Failed to generate CSV export file.', 'error');
    }
  };

  return (
    <div className="space-y-6" id="reports-and-metrics-section">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Analytical Reports</h2>
          <p className="text-slate-500 text-xs mt-0.5">Filter demographics, generate audit files, and compile spreadsheets.</p>
        </div>

        <button
          onClick={handleExportCSV}
          id="export-csv-btn"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Sheet (.csv)</span>
        </button>
      </div>

      {/* Reports Filters Row */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-700">
          <Filter className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Report Filter Criteria</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Dept */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department</span>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedCourse('');
              }}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Course */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Course Stream</span>
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
              }}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden hover:border-slate-300 transition-colors"
            >
              <option value="">All Courses</option>
              {courses
                .filter(c => !selectedDept || c.departmentId === selectedDept)
                .map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gender Profile</span>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Semester Year */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Semester</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden"
            >
              <option value="">All Semester Years</option>
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

          {/* Status */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Status</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Query Statistics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <motion.div whileHover={{ y: -2 }} className="bg-white p-5 rounded-2xl card-shadow border border-slate-100/80 flex items-center gap-4 relative overflow-hidden group card-shadow-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-indigo-600" />
          <div className="p-3 bg-gradient-to-tr from-brand-600 to-indigo-600 text-white rounded-xl shadow-md shadow-brand-500/20 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Filtered Registrations</span>
            <span className="text-2xl font-black text-slate-900 block mt-0.5">{totalCount} Students</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-white p-5 rounded-2xl card-shadow border border-slate-100/80 flex items-center gap-4 relative overflow-hidden group card-shadow-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-xl shadow-md shadow-emerald-500/20 shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Active Enrollment Rate</span>
            <span className="text-2xl font-black text-slate-900 block mt-0.5">{activePercent}% Active</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-white p-5 rounded-2xl card-shadow border border-slate-100/80 flex items-center gap-4 relative overflow-hidden group card-shadow-hover">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600" />
          <div className="p-3 bg-gradient-to-tr from-purple-600 to-pink-600 text-white rounded-xl shadow-md shadow-purple-500/20 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Gender Demographics (M / F / O)</span>
            <span className="text-xl font-black text-slate-900 block mt-1">{maleCount} / {femaleCount} / {otherCount}</span>
          </div>
        </motion.div>
      </div>

      {/* Report Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Filtered Department Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Filtered Department Spreads</h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribution based on active filter parameters</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="flex-1 w-full">
            {deptChartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">No department data matches report criteria</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={40}>
                    {deptChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Filtered Status Spreads */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Filtered Active Status Ratio</h3>
              <p className="text-xs text-slate-400 mt-0.5">Active vs. inactive spread for current cohort</p>
            </div>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {statusChartData.length === 0 ? (
              <div className="text-slate-400 text-xs font-semibold">No status data matches report criteria</div>
            ) : (
              <>
                <div className="w-full h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Status Legend */}
                <div className="flex gap-5 mt-3 justify-center text-xs">
                  {statusChartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 font-semibold text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }}></span>
                      <span>{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Audit List Preview */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Cohort Audit List Preview ({reportStudents.length} entries)</h3>
          <p className="text-xs text-slate-400 mt-0.5">Preview of students that will be exported in the spreadsheet</p>
        </div>

        {reportStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold">No student records found in current report scope.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[250px] overflow-y-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-5">Student ID</th>
                  <th className="py-3 px-5">Student Name</th>
                  <th className="py-3 px-5">Email Address</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5">Semester Year</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-5 font-mono text-xs font-semibold text-slate-500">{s.id}</td>
                    <td className="py-3 px-5 font-semibold text-slate-800">{s.fullName}</td>
                    <td className="py-3 px-5 text-slate-500 font-medium">{s.email}</td>
                    <td className="py-3 px-5 text-slate-600 font-semibold">{getDeptName(s.departmentId)}</td>
                    <td className="py-3 px-5 text-slate-400 font-medium">{s.yearSemester}</td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        s.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
