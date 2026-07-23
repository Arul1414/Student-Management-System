import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { X, Upload, Check, AlertCircle, Camera, Trash } from 'lucide-react';
import { motion } from 'motion/react';
import { Student, Department, Course } from '../types';

interface StudentFormModalProps {
  student: Student | null; // null for ADD, student for EDIT
  existingStudents: Student[];
  departments: Department[];
  courses: Course[];
  onSave: (studentData: Partial<Student>) => Promise<void>;
  onClose: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export default function StudentFormModal({
  student,
  existingStudents,
  departments,
  courses,
  onSave,
  onClose,
  showToast
}: StudentFormModalProps) {
  const isEdit = !!student;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields State
  const [id, setId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [yearSemester, setYearSemester] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  
  // Academic fields
  const [cgpa, setCgpa] = useState<string>('8.50');
  const [arrears, setArrears] = useState<string>('0');
  const [attendancePercentage, setAttendancePercentage] = useState<string>('92');

  // Validation Error States & Duplicate Conflict List
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateConflicts, setDuplicateConflicts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter courses by selected department (case-insensitive)
  const filteredCourses = courses.filter(
    c => c.departmentId && departmentId && c.departmentId.toLowerCase() === departmentId.toLowerCase()
  );

  // Initialize form fields on edit mode
  useEffect(() => {
    if (student) {
      setId(student.id);
      setFullName(student.fullName);
      setEmail(student.email);
      setPhone(student.phone);
      setGender(student.gender);
      setDob(student.dob);
      setAddress(student.address);
      setParentName(student.parentName);
      setParentPhone(student.parentPhone);
      setDepartmentId(student.departmentId);
      setCourseId(student.courseId);
      setYearSemester(student.yearSemester);
      setAdmissionDate(student.admissionDate);
      setProfilePhoto(student.profilePhoto || '');
      setStatus(student.status);
      setCgpa(student.cgpa !== undefined ? String(student.cgpa) : '8.50');
      setArrears(student.arrears !== undefined ? String(student.arrears) : '0');
      setAttendancePercentage(student.attendancePercentage !== undefined ? String(student.attendancePercentage) : '92');
    } else {
      // Set defaults for ADD
      setId(generateSuggestedId());
      setFullName('');
      setEmail('');
      setPhone('');
      setGender('Male');
      setDob('');
      setAddress('');
      setParentName('');
      setParentPhone('');
      const firstDept = departments[0]?.id || '';
      setDepartmentId(firstDept);
      const firstCourse = courses.find(c => c.departmentId === firstDept);
      setCourseId(firstCourse?.id || '');
      setYearSemester('Year 1 / Sem 1');
      setAdmissionDate(new Date().toISOString().split('T')[0]);
      setProfilePhoto('');
      setStatus('Active');
      setCgpa('8.50');
      setArrears('0');
      setAttendancePercentage('92');
    }
    setErrors({});
    setDuplicateConflicts([]);
  }, [student, departments, courses]);

  // Generate suggested next student ID
  const generateSuggestedId = () => {
    if (existingStudents.length === 0) return 'STU1001';
    const ids = existingStudents
      .map(s => {
        const num = parseInt(s.id.replace(/\D/g, ''), 10);
        return isNaN(num) ? 0 : num;
      });
    const maxId = Math.max(...ids, 1000);
    return `STU${maxId + 1}`;
  };

  // Profile photo file uploaded base64 parser
  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be less than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result as string);
      showToast('Profile image uploaded successfully', 'success');
    };
    reader.onerror = () => {
      showToast('Failed to read file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setProfilePhoto('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Form Validation with detailed duplicate detection
  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    const conflicts: string[] = [];

    // Student ID Validation & Duplicate Check
    if (!id.trim()) {
      tempErrors.id = 'Student ID / Roll Number is required.';
    } else if (!/^[A-Za-z0-9-_]+$/.test(id)) {
      tempErrors.id = 'Only alphanumeric characters, dashes, and underscores allowed.';
    } else {
      const matchingStudent = existingStudents.find(
        s => s.id.toLowerCase() === id.trim().toLowerCase() && (!isEdit || s.id.toLowerCase() !== student?.id.toLowerCase())
      );
      if (matchingStudent) {
        const errorMsg = `Duplicate ID: "${id.trim()}" is already assigned to student "${matchingStudent.fullName}" (${matchingStudent.id})`;
        tempErrors.id = errorMsg;
        conflicts.push(`Student Roll No "${id.trim()}" matches existing record: ${matchingStudent.fullName} [${matchingStudent.id}]`);
      }
    }

    // Full Name Validation
    if (!fullName.trim()) {
      tempErrors.fullName = 'Full Name is required.';
    } else if (fullName.trim().length < 3) {
      tempErrors.fullName = 'Name must be at least 3 characters.';
    }

    // Email Address Validation & Duplicate Check
    if (!email.trim()) {
      tempErrors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      tempErrors.email = 'Please provide a valid email address.';
    } else {
      const matchingStudent = existingStudents.find(
        s => s.email.toLowerCase() === email.trim().toLowerCase() && (!isEdit || s.id.toLowerCase() !== student?.id.toLowerCase())
      );
      if (matchingStudent) {
        const errorMsg = `Duplicate Email: "${email.trim()}" is already registered to "${matchingStudent.fullName}" (ID: ${matchingStudent.id})`;
        tempErrors.email = errorMsg;
        conflicts.push(`Email "${email.trim()}" matches existing record: ${matchingStudent.fullName} [ID: ${matchingStudent.id}]`);
      }
    }

    // Phone Number Validation & Duplicate Check
    if (phone && phone.trim()) {
      if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone.trim())) {
        tempErrors.phone = 'Please provide a valid phone number (7-20 digits).';
      } else {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length >= 7) {
          const matchingStudent = existingStudents.find(
            s => s.phone && s.phone.replace(/\D/g, '') === cleanPhone && (!isEdit || s.id.toLowerCase() !== student?.id.toLowerCase())
          );
          if (matchingStudent) {
            const errorMsg = `Duplicate Phone: "${phone.trim()}" is already registered to "${matchingStudent.fullName}" (ID: ${matchingStudent.id})`;
            tempErrors.phone = errorMsg;
            conflicts.push(`Phone Number "${phone.trim()}" matches existing record: ${matchingStudent.fullName} [ID: ${matchingStudent.id}]`);
          }
        }
      }
    }

    if (parentPhone && !/^\+?[0-9\s\-()]{7,20}$/.test(parentPhone)) {
      tempErrors.parentPhone = 'Please provide a valid parent phone number.';
    }

    // Academic Range Validation
    if (cgpa !== '' && (isNaN(Number(cgpa)) || Number(cgpa) < 0 || Number(cgpa) > 10)) {
      tempErrors.cgpa = 'CGPA must be a number between 0.00 and 10.00';
    }

    if (arrears !== '' && (isNaN(Number(arrears)) || Number(arrears) < 0)) {
      tempErrors.arrears = 'Arrears must be a positive integer.';
    }

    if (!departmentId) tempErrors.departmentId = 'Department is required.';
    if (!courseId) tempErrors.courseId = 'Course selection is required.';
    if (!yearSemester) tempErrors.yearSemester = 'Semester / Year is required.';
    if (!status) tempErrors.status = 'Status is required.';

    setErrors(tempErrors);
    setDuplicateConflicts(conflicts);
    return Object.keys(tempErrors).length === 0 && conflicts.length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Validation failed: Duplicate or missing information detected!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const studentPayload: Partial<Student> = {
        id: id.trim(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        gender,
        dob,
        address: address.trim(),
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        departmentId,
        courseId,
        yearSemester,
        admissionDate,
        profilePhoto,
        status,
        cgpa: cgpa !== '' ? parseFloat(Number(cgpa).toFixed(2)) : 8.50,
        arrears: arrears !== '' ? parseInt(arrears, 10) : 0,
        attendancePercentage: attendancePercentage !== '' ? parseFloat(Number(attendancePercentage).toFixed(1)) : 92
      };

      await onSave(studentPayload);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save student record.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper colors for initials avatar
  const getAvatarInitials = () => {
    if (!fullName) return '?';
    return fullName
      .split(' ')
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-2xl w-full max-w-4xl shadow-xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden"
        id="student-form-modal-box"
      >
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div>
            <h2 className="text-base font-bold tracking-tight">
              {isEdit ? `Modify Student Details: ${student.fullName}` : 'Register New Student'}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Provide official admission & personal details</p>
          </div>
          <button
            onClick={onClose}
            id="student-form-close-btn"
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields Box */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Duplicate Conflict Alert Banner */}
          {duplicateConflicts.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Duplicate Data Conflict Detected</span>
              </div>
              <p className="text-rose-700 text-[11px]">
                The following entered information matches data that is already registered to another student in the system:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-rose-900 font-medium font-mono text-[11px]">
                {duplicateConflicts.map((conflict, idx) => (
                  <li key={idx}>{conflict}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 1: Photos & Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div className="flex flex-col items-center justify-center text-center space-y-2 md:col-span-1 border-r border-slate-200/60 pr-2">
              <div className="relative group">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Preview"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-200 shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-slate-200 border-2 border-slate-300 flex flex-col items-center justify-center text-slate-400">
                    <Camera className="w-8 h-8" />
                    <span className="text-[10px] mt-1 font-semibold">No Image</span>
                  </div>
                )}
                
                {profilePhoto && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 text-white rounded-lg hover:bg-rose-600 shadow-md transition-all cursor-pointer"
                    title="Remove Photo"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-uploader"
              />
              <p className="text-[9px] text-slate-400">PNG, JPG up to 2MB</p>
            </div>

            {/* Top row fast identifiers */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Student ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Student ID <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g. STU1001"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-hidden transition-all ${
                    errors.id ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-brand-500 bg-white'
                  }`}
                  id="student-id-field"
                />
                {errors.id ? (
                  <p className="text-xs text-rose-500 font-medium inline-flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.id}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-medium">Standard university registration format (unique ID)</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Student Status <span className="text-rose-500">*</span></label>
                <div className="flex gap-3 bg-white p-1 rounded-xl border border-slate-200 w-fit">
                  <button
                    type="button"
                    onClick={() => setStatus('Active')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      status === 'Active' 
                        ? 'bg-emerald-500 text-white shadow-xs' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('Inactive')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      status === 'Inactive' 
                        ? 'bg-slate-500 text-white shadow-xs' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Inactive status locks core student system registration checks</p>
              </div>
            </div>
          </div>

          {/* Section 2: General Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100">1. Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Mary Doe"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-hidden transition-all ${
                    errors.fullName ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-brand-500'
                  }`}
                  id="student-name-field"
                />
                {errors.fullName && <p className="text-xs text-rose-500 font-medium">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Email Address <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@school.edu"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-hidden transition-all ${
                    errors.email ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-brand-500'
                  }`}
                  id="student-email-field"
                />
                {errors.email && <p className="text-xs text-rose-500 font-medium">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-hidden transition-all ${
                    errors.phone ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-brand-500'
                  }`}
                  id="student-phone-field"
                />
                {errors.phone && <p className="text-xs text-rose-500 font-medium">{errors.phone}</p>}
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:border-brand-500 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:border-brand-500 bg-white"
                />
              </div>

              {/* Residential Address */}
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="742 Evergreen Terrace, Springfield"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:border-brand-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Parental Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100">2. Parent / Guardian Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Parent Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Guardian Name</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Homer Doe"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:border-brand-500 bg-white"
                />
              </div>

              {/* Parent Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Guardian Contact Number</label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="+1 (555) 019-5555"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-hidden transition-all ${
                    errors.parentPhone ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-brand-500'
                  }`}
                />
                {errors.parentPhone && <p className="text-xs text-rose-500 font-medium">{errors.parentPhone}</p>}
              </div>
            </div>
          </div>

          {/* Section 4: Academic Registrations */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100">3. Academic & Enrollment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Department <span className="text-rose-500">*</span></label>
                <select
                  value={departmentId}
                  onChange={(e) => {
                    const selectedDept = e.target.value;
                    setDepartmentId(selectedDept);
                    const matchingCourse = courses.find(
                      c => c.departmentId && selectedDept && c.departmentId.toLowerCase() === selectedDept.toLowerCase()
                    );
                    setCourseId(matchingCourse?.id || '');
                  }}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:border-brand-500 bg-white cursor-pointer"
                  id="student-dept-select"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.id})
                    </option>
                  ))}
                </select>
                {errors.departmentId && <p className="text-xs text-rose-500 font-medium">{errors.departmentId}</p>}
              </div>

              {/* Course */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Course <span className="text-rose-500">*</span></label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  disabled={!departmentId}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:border-brand-500 bg-white disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                  id="student-course-select"
                >
                  <option value="">
                    {!departmentId
                      ? 'Select Department First'
                      : filteredCourses.length === 0
                      ? 'No courses available for this department'
                      : 'Select Course'}
                  </option>
                  {filteredCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
                {errors.courseId && <p className="text-xs text-rose-500 font-medium">{errors.courseId}</p>}
              </div>

              {/* Semester / Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Semester / Year <span className="text-rose-500">*</span></label>
                <select
                  value={yearSemester}
                  onChange={(e) => setYearSemester(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:border-brand-500 bg-white"
                >
                  <option value="Year 1 / Sem 1">Year 1 / Sem 1</option>
                  <option value="Year 1 / Sem 2">Year 1 / Sem 2</option>
                  <option value="Year 2 / Sem 3">Year 2 / Sem 3</option>
                  <option value="Year 2 / Sem 4">Year 2 / Sem 4</option>
                  <option value="Year 3 / Sem 5">Year 3 / Sem 5</option>
                  <option value="Year 3 / Sem 6">Year 3 / Sem 6</option>
                  <option value="Year 4 / Sem 7">Year 4 / Sem 7</option>
                  <option value="Year 4 / Sem 8">Year 4 / Sem 8</option>
                </select>
                {errors.yearSemester && <p className="text-xs text-rose-500 font-medium">{errors.yearSemester}</p>}
              </div>

              {/* Admission Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Admission Date</label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:border-brand-500 bg-white"
                />
              </div>

              {/* CGPA */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Cumulative GPA (CGPA)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="e.g. 8.50"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-hidden transition-all ${
                    errors.cgpa ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-brand-500 bg-white'
                  }`}
                  id="student-cgpa-input"
                />
                {errors.cgpa && <p className="text-xs text-rose-500 font-medium">{errors.cgpa}</p>}
              </div>

              {/* Standing Arrears */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Standing Arrears Count</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={arrears}
                  onChange={(e) => setArrears(e.target.value)}
                  placeholder="0 (All Passed)"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-hidden transition-all ${
                    errors.arrears ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-brand-500 bg-white'
                  }`}
                  id="student-arrears-input"
                />
                {errors.arrears && <p className="text-xs text-rose-500 font-medium">{errors.arrears}</p>}
              </div>

              {/* Overall Attendance % */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Attendance (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={attendancePercentage}
                  onChange={(e) => setAttendancePercentage(e.target.value)}
                  placeholder="e.g. 92.5"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:border-brand-500 bg-white"
                  id="student-attendance-input"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            id="student-form-submit-btn"
            disabled={isSubmitting}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:bg-slate-400"
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEdit ? 'Update Profile' : 'Complete Admission'}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
