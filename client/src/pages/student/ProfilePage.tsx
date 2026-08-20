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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [student, setStudent] = useState<Student | null>(studentProfile);

  // Basic Information
  const [name, setName] = useState(studentProfile?.name || user?.name || '');
  const [studentId, setStudentId] = useState(studentProfile?.studentId || user?.studentId || '');
  const [college, setCollege] = useState(studentProfile?.college || user?.college || '');
  const [department, setDepartment] = useState(studentProfile?.department || user?.department || 'Computer Science');
  const [semester, setSemester] = useState<number>(studentProfile?.semester || user?.semester || 1);
  const [year, setYear] = useState<number>(studentProfile?.year || Math.ceil((studentProfile?.semester || user?.semester || 1) / 2));
  const [section, setSection] = useState(studentProfile?.section || '');

  // Academic Metrics
  const [currentGPA, setCurrentGPA] = useState<number>(studentProfile?.currentGPA ?? 0);
  const [previousGPA, setPreviousGPA] = useState<number>(studentProfile?.previousGPA ?? 0);
  const [attendance, setAttendance] = useState<number>(studentProfile?.attendance ?? 0);
  const [studyHours, setStudyHours] = useState<number>(studentProfile?.studyHours ?? 0);
  const [previousMarks, setPreviousMarks] = useState<number>(studentProfile?.previousMarks ?? 0);
  const [assignmentScore, setAssignmentScore] = useState<number>(studentProfile?.assignmentScore ?? 0);
  const [internalMarks, setInternalMarks] = useState<number>(studentProfile?.internalMarks ?? 0);
  const [participation, setParticipation] = useState<number>(studentProfile?.participation ?? 5);
  const [backlogs, setBacklogs] = useState<number>(studentProfile?.backlogs ?? 0);

  // Subjects
  const [subjects, setSubjects] = useState<SubjectItem[]>(studentProfile?.subjects || []);

  const syncStateFromStudent = (s: Student) => {
    setStudent(s);
    setName(s.name || user?.name || '');
    setStudentId(s.studentId || user?.studentId || '');
    setCollege(s.college || user?.college || '');
    setDepartment(s.department || user?.department || 'Computer Science');
    setSemester(s.semester || user?.semester || 1);
    setYear(s.year || Math.ceil((s.semester || 1) / 2));
    setSection(s.section || '');

    setCurrentGPA(s.currentGPA ?? 0);
    setPreviousGPA(s.previousGPA ?? 0);
    setAttendance(s.attendance ?? 0);
    setStudyHours(s.studyHours ?? 0);
    setPreviousMarks(s.previousMarks ?? 0);
    setAssignmentScore(s.assignmentScore ?? 0);
    setInternalMarks(s.internalMarks ?? 0);
    setParticipation(s.participation ?? 5);
    setBacklogs(s.backlogs ?? 0);

    setSubjects(s.subjects && s.subjects.length > 0 ? s.subjects : []);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await studentApi.getMyProfile();
        if (res.success && res.data?.student) {
          syncStateFromStudent(res.data.student);
          updateStudentProfile(res.data.student);
        }
      } catch (error) {
        console.error('Failed to load profile details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSemesterChange = (newSem: number) => {
    setSemester(newSem);
    setYear(Math.ceil(newSem / 2));
  };

  const handleAddSubject = () => {
    setSubjects([...subjects, { name: '', score: 75, attendance: attendance || 75, internalMarks: internalMarks || 70 }]);
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
        setMessage({ type: 'success', text: 'Academic records and profile saved successfully to database.' });
      } else {
        throw new Error(res.message || 'Failed to save profile.');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading your student profile from database...</p>
      </div>
    );
  }

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

      {!student?.isProfileCompleted && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
          <div>
            <strong className="font-bold">Profile Incomplete:</strong> Please fill in your genuine academic marks, attendance, and enrolled subjects below to activate AI prediction and recommendations.
          </div>
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
            <p className="text-[11px] text-indigo-400 mt-1">{college || department || 'Student Member'}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Current CGPA:</span>
              <strong className="text-emerald-400 font-mono">
                {student?.isProfileCompleted ? Number(student.currentGPA).toFixed(2) : 'Not Set'}
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
                    <option value="Electrical Engineering">Electrical Engineering</option>
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
                  <label className="block text-slate-300 font-semibold mb-1">Cumulative CGPA (0-10)</label>
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
                  <label className="block text-slate-300 font-semibold mb-1">Previous SGPA (0-10)</label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Previous Exam Marks (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={previousMarks}
                    onChange={(e) => setPreviousMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assignment Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={assignmentScore}
                    onChange={(e) => setAssignmentScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Subject Breakdown */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Enrolled Subjects & Marks</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Add your registered course modules and scores.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1 text-[11px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subject</span>
                </button>
              </div>

              {subjects.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-400">No subjects added yet.</p>
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold inline-flex items-center gap-1.5 border border-indigo-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Click to add your first subject</span>
                  </button>
                </div>
              ) : (
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
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
