import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../services/api';
import { Student, SubjectItem } from '../../types';
import confetti from 'canvas-confetti';
import {
  User,
  Mail,
  BookOpen,
  Hash,
  Award,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  School,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { user, studentProfile, updateStudentProfile } = useAuth();

  // Basic Information
  const [name, setName] = useState(user?.name || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [college, setCollege] = useState(user?.college || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science');
  const [semester, setSemester] = useState<number>(user?.semester || 1);
  const [year, setYear] = useState<number>(1);
  const [section, setSection] = useState('');

  // Academic Metrics
  const [currentGPA, setCurrentGPA] = useState<number>(8.0);
  const [previousGPA, setPreviousGPA] = useState<number>(7.8);
  const [attendance, setAttendance] = useState<number>(85);
  const [studyHours, setStudyHours] = useState<number>(3.5);
  const [previousMarks, setPreviousMarks] = useState<number>(80);
  const [assignmentScore, setAssignmentScore] = useState<number>(80);
  const [internalMarks, setInternalMarks] = useState<number>(75);
  const [participation, setParticipation] = useState<number>(7);
  const [backlogs, setBacklogs] = useState<number>(0);

  // Subjects
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);

  const [student, setStudent] = useState<Student | null>(studentProfile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const syncStateFromStudent = (s: Student) => {
    setStudent(s);
    setName(s.name);
    setStudentId(s.studentId);
    setCollege(s.college || 'National Institute of Technology');
    setDepartment(s.department);
    setSemester(s.semester);
    setYear(s.year || Math.ceil(s.semester / 2));
    setSection(s.section || 'A');

    setCurrentGPA(s.currentGPA || 8.0);
    setPreviousGPA(s.previousGPA || 7.8);
    setAttendance(s.attendance || 85);
    setStudyHours(s.studyHours || 3.5);
    setPreviousMarks(s.previousMarks || 80);
    setAssignmentScore(s.assignmentScore || 80);
    setInternalMarks(s.internalMarks || 75);
    setParticipation(s.participation || 7);
    setBacklogs(s.backlogs || 0);

    if (s.subjects && s.subjects.length > 0) {
      setSubjects(s.subjects);
    } else {
      setSubjects([
        { name: 'Data Structures & Algorithms', score: 88, attendance: 90, internalMarks: 85 },
        { name: 'Database Management Systems', score: 84, attendance: 85, internalMarks: 82 },
        { name: 'Operating Systems', score: 79, attendance: 80, internalMarks: 76 },
      ]);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentApi.getMyProfile();
        if (res.success && res.data?.student) {
          syncStateFromStudent(res.data.student);
        }
      } catch (error) {
        console.error('Failed to load profile details:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleSemesterChange = (newSem: number) => {
    setSemester(newSem);
    setYear(Math.ceil(newSem / 2));
  };

  const handleAddSubject = () => {
    setSubjects([...subjects, { name: '', score: 75, attendance: attendance, internalMarks: internalMarks }]);
  };

  const handleRemoveSubject = (idx: number) => {
    setSubjects(subjects.filter((_, i) => i !== idx));
  };

  const handleSubjectChange = (idx: number, field: keyof SubjectItem, val: string | number) => {
    const updated = [...subjects];
    if (field === 'name') {
      updated[idx].name = String(val);
    } else {
      updated[idx][field] = Number(val);
    }
    setSubjects(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const validSubjects = subjects.filter((s) => s.name && s.name.trim().length > 0);

      const payload = {
        name: name.trim(),
        studentId: studentId.trim().toUpperCase(),
        college: college.trim(),
        department: department.trim(),
        year: Number(year),
        semester: Number(semester),
        section: section.trim(),
        attendance: Number(attendance),
        studyHours: Number(studyHours),
        previousMarks: Number(previousMarks),
        assignmentScore: Number(assignmentScore),
        internalMarks: Number(internalMarks),
        previousGPA: Number(previousGPA),
        currentGPA: Number(currentGPA),
        participation: Number(participation),
        backlogs: Number(backlogs),
        subjects: validSubjects,
      };

      const res = await studentApi.saveProfile(payload);
      if (res.success && res.data?.student) {
        syncStateFromStudent(res.data.student);
        updateStudentProfile(res.data.student);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
        setMessage({ type: 'success', text: 'Academic records and profile saved successfully.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Academic Profile & Data Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your enrolled college details, academic metrics, semester standings, and subject scores.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side: Summary Card */}
        <div className="md:col-span-4 glass-card rounded-3xl p-6 border border-slate-800 text-center space-y-4 h-fit">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 mx-auto shadow-glow-brand">
            <div className="w-full h-full rounded-[22px] bg-[#070b14] flex items-center justify-center text-2xl font-extrabold text-indigo-300">
              {name ? name.charAt(0) : 'S'}
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-white">{name || 'Student'}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{studentId || 'ADX-STUDENT'}</p>
            <p className="text-[11px] text-indigo-400 mt-1">{college || 'Institute Member'}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Current CGPA:</span>
              <strong className="text-emerald-400 font-mono">
                {student?.isProfileCompleted ? student.currentGPA.toFixed(2) : 'Not Set'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Attendance:</span>
              <strong className="text-white font-mono">
                {student?.isProfileCompleted ? `${student.attendance}%` : 'Not Set'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Composite Score:</span>
              <strong className="text-indigo-400 font-mono">
                {student?.isProfileCompleted ? `${student.performanceScore}/100` : 'Not Set'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Assessed Risk:</span>
              <strong className={
                student?.riskLevel === 'High'
                  ? 'text-rose-400'
                  : student?.riskLevel === 'Medium'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }>
                {student?.isProfileCompleted ? `${student.riskLevel} Risk` : 'Pending'}
              </strong>
            </div>
          </div>
        </div>

        {/* Right Side: Comprehensive Edit Form */}
        <div className="md:col-span-8 glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <form onSubmit={handleSave} className="space-y-6 text-xs">
            {/* Section 1: Basic Identity */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Identity & Institutional Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Student ID / Roll Number</label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">College / University Name</label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. National Institute of Technology"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department / Branch</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Artificial Intelligence">Artificial Intelligence & ML</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => handleSemesterChange(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Section</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g. A"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Academic Metrics */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Academic Indicators & Performance Metrics</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cumulative CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={currentGPA}
                    onChange={(e) => setCurrentGPA(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Previous SGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={previousGPA}
                    onChange={(e) => setPreviousGPA(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Attendance (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={attendance}
                    onChange={(e) => setAttendance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Daily Study Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={studyHours}
                    onChange={(e) => setStudyHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={backlogs}
                    onChange={(e) => setBacklogs(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Internal Marks (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={internalMarks}
                    onChange={(e) => setInternalMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Subject Breakdown */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Enrolled Subjects & Marks</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1 text-[11px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subject</span>
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {subjects.map((sub, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-7">
                      <input
                        type="text"
                        required
                        value={sub.name}
                        onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)}
                        placeholder="Subject name"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={sub.score}
                        onChange={(e) => handleSubjectChange(idx, 'score', e.target.value)}
                        placeholder="Marks"
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(idx)}
                        disabled={subjects.length <= 1}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-glow-brand transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Academic Records'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
