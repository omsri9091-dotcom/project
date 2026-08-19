import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../services/api';
import { Student, SubjectItem } from '../../types';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  User,
  Hash,
  School,
  Zap,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: (student: Student) => void;
  existingProfile?: Student | null;
}

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingProfile,
}) => {
  const { user, updateStudentProfile } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Step 1: Basic & Institutional Details
  const [name, setName] = useState(existingProfile?.name || user?.name || '');
  const [studentId, setStudentId] = useState(existingProfile?.studentId || user?.studentId || '');
  const [college, setCollege] = useState(existingProfile?.college || user?.college || 'National Institute of Technology');
  const [department, setDepartment] = useState(existingProfile?.department || user?.department || 'Computer Science');
  const [semester, setSemester] = useState<number>(existingProfile?.semester || user?.semester || 1);
  const [year, setYear] = useState<number>(existingProfile?.year || Math.ceil((existingProfile?.semester || user?.semester || 1) / 2));
  const [section, setSection] = useState(existingProfile?.section || 'A');

  // Step 2: Academic Metrics
  const [currentGPA, setCurrentGPA] = useState<number>(existingProfile?.currentGPA || 8.2);
  const [previousGPA, setPreviousGPA] = useState<number>(existingProfile?.previousGPA || 8.0);
  const [attendance, setAttendance] = useState<number>(existingProfile?.attendance || 85);
  const [previousMarks, setPreviousMarks] = useState<number>(existingProfile?.previousMarks || 82);
  const [internalMarks, setInternalMarks] = useState<number>(existingProfile?.internalMarks || 80);
  const [assignmentScore, setAssignmentScore] = useState<number>(existingProfile?.assignmentScore || 85);
  const [studyHours, setStudyHours] = useState<number>(existingProfile?.studyHours || 4.0);
  const [backlogs, setBacklogs] = useState<number>(existingProfile?.backlogs || 0);
  const [participation, setParticipation] = useState<number>(existingProfile?.participation || 7);

  // Step 3: Subject-wise Marks
  const defaultSubjects: SubjectItem[] = existingProfile?.subjects && existingProfile.subjects.length > 0
    ? existingProfile.subjects
    : [
        { name: 'Data Structures & Algorithms', score: 88, attendance: 90, internalMarks: 85 },
        { name: 'Database Management Systems', score: 84, attendance: 85, internalMarks: 82 },
        { name: 'Operating Systems', score: 79, attendance: 80, internalMarks: 76 },
        { name: 'Computer Networks', score: 76, attendance: 82, internalMarks: 74 },
        { name: 'Discrete Mathematics', score: 82, attendance: 88, internalMarks: 80 },
      ];

  const [subjects, setSubjects] = useState<SubjectItem[]>(defaultSubjects);

  if (!isOpen) return null;

  const handleSemesterChange = (newSem: number) => {
    setSemester(newSem);
    setYear(Math.ceil(newSem / 2));
  };

  const handleAddSubject = () => {
    setSubjects([...subjects, { name: '', score: 75, attendance: 80, internalMarks: 75 }]);
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

  const handlePrepopulateStandardSubjects = () => {
    let list: SubjectItem[] = [];
    if (department.toLowerCase().includes('computer') || department.toLowerCase().includes('it') || department.toLowerCase().includes('artificial')) {
      list = [
        { name: 'Data Structures & Algorithms', score: Math.round(previousMarks + 4), attendance: attendance, internalMarks: internalMarks },
        { name: 'Database Management Systems', score: Math.round(previousMarks + 2), attendance: attendance, internalMarks: internalMarks },
        { name: 'Operating Systems', score: Math.round(previousMarks - 2), attendance: attendance, internalMarks: internalMarks },
        { name: 'Computer Networks', score: Math.round(previousMarks - 5), attendance: attendance, internalMarks: internalMarks },
        { name: 'Software Engineering', score: Math.round(previousMarks + 3), attendance: attendance, internalMarks: internalMarks },
      ];
    } else {
      list = [
        { name: `${department} Core Module 1`, score: Math.round(previousMarks + 2), attendance: attendance, internalMarks: internalMarks },
        { name: `${department} Core Module 2`, score: Math.round(previousMarks), attendance: attendance, internalMarks: internalMarks },
        { name: 'Applied Mathematics', score: Math.round(previousMarks - 3), attendance: attendance, internalMarks: internalMarks },
        { name: 'Engineering Physics / Electronics', score: Math.round(previousMarks + 1), attendance: attendance, internalMarks: internalMarks },
        { name: 'Technical Communication & Ethics', score: Math.round(previousMarks + 6), attendance: attendance, internalMarks: internalMarks },
      ];
    }
    setSubjects(list);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!name.trim()) throw new Error('Full Name is required.');
      if (!studentId.trim()) throw new Error('Student ID is required.');
      if (!department.trim()) throw new Error('Department is required.');
      if (attendance < 0 || attendance > 100) throw new Error('Attendance must be between 0 and 100%.');
      if (currentGPA < 0 || currentGPA > 10) throw new Error('CGPA must be between 0 and 10.');

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

      const savedStudent =
        res.data?.student ||
        res.user?.studentProfile ||
        res.student ||
        (res.success ? { ...existingProfile, ...payload, isProfileCompleted: true } : null);

      if (res.success || savedStudent) {
        if (savedStudent) {
          updateStudentProfile(savedStudent);
        }
        setError(null);
        setSuccessMessage('Profile and academic records saved to MongoDB database successfully!');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        setTimeout(() => {
          if (onSuccess && savedStudent) {
            onSuccess(savedStudent);
          }
          if (onClose) {
            onClose();
          }
        }, 1200);
      } else {
        throw new Error(res.message || 'Failed to save profile.');
      }
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'Error saving academic profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-card rounded-3xl border border-indigo-500/40 bg-[#0c1222] shadow-2xl p-6 sm:p-8 my-8 text-white">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>ADEXA AI Student Intelligence Setup</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Complete Your Student Profile
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Enter your genuine academic performance indicators to unlock personalized AI predictions, risk classification, and tailored study pathways.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-xs">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`p-3 rounded-2xl border text-left transition-all ${
              step === 1
                ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <span className="text-[10px] block opacity-70">STEP 1</span>
            <span>1. Identity & College</span>
          </button>

          <button
            type="button"
            onClick={() => setStep(2)}
            className={`p-3 rounded-2xl border text-left transition-all ${
              step === 2
                ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <span className="text-[10px] block opacity-70">STEP 2</span>
            <span>2. Academic Metrics</span>
          </button>

          <button
            type="button"
            onClick={() => setStep(3)}
            className={`p-3 rounded-2xl border text-left transition-all ${
              step === 3
                ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <span className="text-[10px] block opacity-70">STEP 3</span>
            <span>3. Subjects & Marks</span>
          </button>
        </div>

        {/* GREEN SUCCESS BANNER */}
        {successMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5 shadow-lg">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-emerald-300">Saved Successfully!</div>
              <div className="text-emerald-400/90">{successMessage}</div>
            </div>
          </div>
        )}

        {/* RED ERROR BANNER (Only if actual failure, never on success) */}
        {error && !successMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* STEP 1: Basic & Institutional Details */}
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Legal Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Student ID / Roll Number *</label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                      placeholder="e.g. ADX-1040"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white uppercase focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">College / Institute / University *</label>
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
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Course / Department / Branch *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Computer Science">Computer Science & Engineering</option>
                    <option value="Artificial Intelligence">Artificial Intelligence & Machine Learning</option>
                    <option value="Data Science">Data Science & Analytics</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Section (Optional)</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g. A"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Semester (1-8) *</label>
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
                  <label className="block text-slate-300 font-semibold mb-1">Academic Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>1st Year (Freshman)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center gap-2"
                >
                  <span>Continue to Academic Metrics</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Academic Metrics */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-semibold">Cumulative CGPA (0-10) *</label>
                    <span className="font-mono text-emerald-400 font-bold">{Number(currentGPA).toFixed(2)}</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={currentGPA}
                    onChange={(e) => setCurrentGPA(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                  <p className="text-[10px] text-slate-400">Overall cumulative grade point average.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-semibold">SGPA / Previous GPA (0-10) *</label>
                    <span className="font-mono text-indigo-400 font-bold">{Number(previousGPA).toFixed(2)}</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={previousGPA}
                    onChange={(e) => setPreviousGPA(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                  <p className="text-[10px] text-slate-400">Latest completed semester grade point average.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <label className="block text-slate-300 font-semibold mb-1">Overall Attendance % *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={attendance}
                    onChange={(e) => setAttendance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Institutional minimum: 75%</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <label className="block text-slate-300 font-semibold mb-1">Daily Study Hours *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    required
                    value={studyHours}
                    onChange={(e) => setStudyHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Self-study hours/day</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <label className="block text-slate-300 font-semibold mb-1">Active Backlogs *</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    required
                    value={backlogs}
                    onChange={(e) => setBacklogs(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Current carryover modules</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <label className="block text-slate-300 font-semibold mb-1">Previous Exam Marks (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={previousMarks}
                    onChange={(e) => setPreviousMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <label className="block text-slate-300 font-semibold mb-1">Internal / Midterm (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={internalMarks}
                    onChange={(e) => setInternalMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <label className="block text-slate-300 font-semibold mb-1">Assignment Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={assignmentScore}
                    onChange={(e) => setAssignmentScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center gap-2"
                >
                  <span>Continue to Subjects</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Enrolled Subjects & Marks */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white">Current Semester Subjects & Subject-wise Marks</h3>
                  <p className="text-slate-400 text-[11px]">List your current registered subjects and scores for precision AI subject benchmarking.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrepopulateStandardSubjects}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 hover:text-white transition-all text-[11px]"
                  >
                    Auto-Fill Department Subjects
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subject</span>
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                {subjects.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-12 gap-2.5 items-center"
                  >
                    <div className="col-span-12 sm:col-span-6">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Subject Name</label>
                      <input
                        type="text"
                        required
                        value={sub.name}
                        onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Data Structures & Algorithms"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Marks (/100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={sub.score}
                        onChange={(e) => handleSubjectChange(idx, 'score', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Attendance %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sub.attendance || attendance}
                        onChange={(e) => handleSubjectChange(idx, 'attendance', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-1 pt-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(idx)}
                        disabled={subjects.length <= 1}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold shadow-glow-brand transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save & Complete Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
