import { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Building2, 
  ChevronRight, 
  ArrowUpRight, 
  TrendingUp, 
  GraduationCap
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
import { DashboardStats, Student, Department, Course } from '../types';

interface DashboardViewProps {
  stats: DashboardStats;
  departments: Department[];
  courses: Course[];
  onViewStudent: (student: Student) => void;
  onNavigateToStudents: () => void;
}

export default function DashboardView({ 
  stats, 
  departments, 
  courses, 
  onViewStudent, 
  onNavigateToStudents 
}: DashboardViewProps) {
  
  // Custom colors for charts
  const DEPT_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
  const GENDER_COLORS = ['#3b82f6', '#ec4899', '#94a3b8'];

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

  // Helper to generate initials avatar color
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500 text-blue-50 text-xs',
      'bg-emerald-500 text-emerald-50 text-xs',
      'bg-indigo-500 text-indigo-50 text-xs',
      'bg-amber-500 text-amber-50 text-xs',
      'bg-rose-500 text-rose-50 text-xs',
      'bg-violet-500 text-violet-50 text-xs',
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

  return (
    <div className="space-y-8" id="dashboard-view-container">
      {/* Header and Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">System Insights</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Real-time tracking of academic enrollments and gender demographics.
          </p>
        </div>
        <button
          onClick={onNavigateToStudents}
          id="dashboard-new-student-shortcut"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Manage Registrations</span>
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Students */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-6 rounded-2xl card-shadow border border-slate-100/80 flex items-start gap-4 relative overflow-hidden group card-shadow-hover"
          id="stat-card-total"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-indigo-600" />
          <div className="p-3.5 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-2xl text-white shadow-md shadow-brand-500/20 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block">Total Students</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.totalStudents}</span>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-brand-700 font-bold bg-brand-50 border border-brand-100 px-2.5 py-0.5 rounded-full w-fit">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>100% capacity</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Active Students */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-6 rounded-2xl card-shadow border border-slate-100/80 flex items-start gap-4 relative overflow-hidden group card-shadow-hover"
          id="stat-card-active"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <div className="p-3.5 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-2xl text-white shadow-md shadow-emerald-500/20 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block">Active Status</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.activeStudents}</span>
            <div className="flex items-center gap-1 mt-2.5 text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full w-fit">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}% active rate</span>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Male Students */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-6 rounded-2xl card-shadow border border-slate-100/80 flex items-start gap-4 relative overflow-hidden group card-shadow-hover"
          id="stat-card-male"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-600" />
          <div className="p-3.5 bg-gradient-to-tr from-blue-600 to-cyan-600 rounded-2xl text-white shadow-md shadow-blue-500/20 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block">Male Students</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.maleStudents}</span>
            <div className="mt-2.5 text-xs text-slate-500 font-bold bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full w-fit">
              <span>{stats.totalStudents > 0 ? Math.round((stats.maleStudents / stats.totalStudents) * 100) : 0}% of student body</span>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Female Students */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white p-6 rounded-2xl card-shadow border border-slate-100/80 flex items-start gap-4 relative overflow-hidden group card-shadow-hover"
          id="stat-card-female"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-600" />
          <div className="p-3.5 bg-gradient-to-tr from-pink-600 to-rose-600 rounded-2xl text-white shadow-md shadow-pink-500/20 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block">Female Students</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.femaleStudents}</span>
            <div className="mt-2.5 text-xs text-slate-500 font-bold bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full w-fit">
              <span>{stats.totalStudents > 0 ? Math.round((stats.femaleStudents / stats.totalStudents) * 100) : 0}% of student body</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Count Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Registration by Department</h3>
              <p className="text-xs text-slate-400 mt-0.5">Comparative analytics across faculties</p>
            </div>
            <Building2 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 w-full">
            {stats.departmentDistribution.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <p className="text-sm font-medium">No departmental statistics available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.departmentDistribution} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={45}>
                    {stats.departmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gender Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Gender Representation</h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribution across registrations</p>
            </div>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            {stats.genderDistribution.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium">No gender data</p>
            ) : (
              <>
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.genderDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.genderDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="mt-4 grid grid-cols-3 gap-2 w-full text-center">
                  {stats.genderDistribution.map((entry, index) => {
                    const pct = stats.totalStudents > 0 ? Math.round((entry.value / stats.totalStudents) * 100) : 0;
                    return (
                      <div key={entry.name} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">{entry.name}</span>
                        <span className="text-base font-bold text-slate-700 block mt-0.5">{entry.value}</span>
                        <span className="text-[10px] font-medium text-slate-400 block">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Students Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="dashboard-recent-table-box">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Recent Registrations</h3>
            <p className="text-xs text-slate-400 mt-0.5">The last 5 student profiles processed by the system</p>
          </div>
          <button
            onClick={onNavigateToStudents}
            id="view-all-students-recent"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer"
          >
            <span>View All Profiles</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {stats.recentStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium">No students registered yet.</p>
            <button
              onClick={onNavigateToStudents}
              className="mt-2 text-xs font-semibold text-brand-600 hover:underline"
            >
              Add first student
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">Student ID</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Department & Course</th>
                  <th className="py-4 px-6">Admission Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {stats.recentStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-500">
                      {student.id}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {student.profilePhoto ? (
                          <img
                            src={student.profilePhoto}
                            alt={student.fullName}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-sm ${getAvatarColor(student.fullName)}`}>
                            {getInitials(student.fullName)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-800">{student.fullName}</p>
                          <p className="text-xs text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-700">{getDeptName(student.departmentId)}</p>
                      <p className="text-xs text-slate-400">{getCourseName(student.courseId)} • {student.yearSemester}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {student.admissionDate}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        student.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onViewStudent(student)}
                        id={`dashboard-recent-view-${student.id}`}
                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"
                      >
                        <span>View profile</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
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
