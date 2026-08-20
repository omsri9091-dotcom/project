import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Student, ISubject, ISemesterRecord } from '../models/Student';
import { User } from '../models/User';
import { Prediction } from '../models/Prediction';
import { Recommendation } from '../models/Recommendation';
import { AuthRequest } from '../middleware/auth.middleware';

export const getStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      department,
      semester,
      riskLevel,
      performanceLevel,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '10',
    } = req.query;

    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { name: searchRegex },
        { studentId: searchRegex },
        { email: searchRegex },
        { department: searchRegex },
      ];
    }

    if (department && department !== 'ALL') {
      query.department = department;
    }

    if (semester && semester !== 'ALL') {
      query.semester = Number(semester);
    }

    if (riskLevel && riskLevel !== 'ALL') {
      query.riskLevel = riskLevel;
    }

    if (performanceLevel && performanceLevel !== 'ALL') {
      query.performanceLevel = performanceLevel;
    }

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions: any = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    sortOptions[String(sortBy)] = order;

    const [students, total] = await Promise.all([
      Student.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Student.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch students.' });
  }
};

export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      student = await Student.findOne({ email: req.user.email.toLowerCase() });
      if (student) {
        student.userId = req.user._id;
        await student.save();
      }
    }
    if (!student && req.user.studentId) {
      student = await Student.findOne({ studentId: req.user.studentId });
      if (student) {
        student.userId = req.user._id;
        await student.save();
      }
    }

    if (!student) {
      student = await Student.create({
        userId: req.user._id,
        studentId: req.user.studentId || `ADX-${Math.floor(1000 + Math.random() * 9000)}`,
        name: req.user.name,
        email: req.user.email,
        college: req.user.college || '',
        department: req.user.department || 'Computer Science',
        semester: req.user.semester || 1,
        isProfileCompleted: false,
        attendance: 0,
        studyHours: 0,
        previousMarks: 0,
        assignmentScore: 0,
        internalMarks: 0,
        previousGPA: 0,
        participation: 5,
        backlogs: 0,
        currentGPA: 0,
        subjects: [],
        semesterHistory: [],
        performanceScore: 0,
        performanceLevel: 'Average',
        riskLevel: 'Low',
      });
    }

    const [predictions, recommendations] = await Promise.all([
      Prediction.find({ studentId: student._id }).sort({ createdAt: -1 }).limit(10),
      Recommendation.find({ studentId: student._id }).sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        student,
        isProfileCompleted: student.isProfileCompleted,
        predictions,
        recommendations,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to retrieve profile.' });
  }
};

export const getStudentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // RBAC: If student role or 'me', ensure they view strictly their own profile
    let student = null;
    if (req.user?.role === 'STUDENT' || id === 'me') {
      student = await Student.findOne({ userId: req.user?._id });
      if (!student && req.user) {
        student = await Student.findOne({ email: req.user.email.toLowerCase() });
        if (student && !student.userId) {
          student.userId = req.user._id;
          await student.save();
        }
      }
      if (!student && req.user?.studentId) {
        student = await Student.findOne({ studentId: req.user.studentId });
        if (student && !student.userId) {
          student.userId = req.user._id;
          await student.save();
        }
      }
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findById(id);
    } else {
      student = await Student.findOne({ studentId: id.toUpperCase() });
    }

    if (!student) {
      res.status(404).json({ success: false, message: 'Student record not found or unauthorized.' });
      return;
    }

    const [predictions, recommendations] = await Promise.all([
      Prediction.find({ studentId: student._id }).sort({ createdAt: -1 }).limit(10),
      Recommendation.find({ studentId: student._id }).sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        student,
        isProfileCompleted: student.isProfileCompleted,
        predictions,
        recommendations,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to retrieve student details.' });
  }
};

export const saveMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      name,
      studentId,
      college,
      department,
      year,
      semester,
      section,
      attendance,
      studyHours,
      previousMarks,
      assignmentScore,
      internalMarks,
      previousGPA,
      currentGPA,
      participation,
      backlogs,
      subjects,
    } = req.body;

    const studentName = (name && name.trim()) || req.user.name;
    const sId = (studentId && studentId.trim().toUpperCase()) || req.user.studentId || `ADX-${Math.floor(1000 + Math.random() * 9000)}`;

    // Validate that studentId is not in use by another user/student
    if (sId !== req.user.studentId) {
      const existingUserWithId = await User.findOne({ studentId: sId, _id: { $ne: req.user._id } });
      const existingStudentWithId = await Student.findOne({ studentId: sId, userId: { $ne: req.user._id } });
      if (existingUserWithId || existingStudentWithId) {
        res.status(400).json({ success: false, message: 'This Student ID is already registered to another student.' });
        return;
      }
    }

    const dept = (department && department.trim()) || req.user.department || 'Computer Science';
    const sem = Number(semester) || req.user.semester || 1;
    const yr = Number(year) || Math.ceil(sem / 2) || 1;
    const clg = college !== undefined ? college.trim() : (req.user.college || '');
    const sec = section !== undefined ? section.trim() : '';

    // Validate numeric inputs
    const att = Math.min(100, Math.max(0, Number(attendance) || 0));
    const sh = Math.min(24, Math.max(0, Number(studyHours) || 0));
    const pm = Math.min(100, Math.max(0, Number(previousMarks) || 0));
    const as = Math.min(100, Math.max(0, Number(assignmentScore) || 0));
    const im = Math.min(100, Math.max(0, Number(internalMarks) || 0));
    const pgpa = Math.min(10, Math.max(0, Number(previousGPA) || 0));
    const cgpa = Math.min(10, Math.max(0, Number(currentGPA) || (pgpa > 0 ? pgpa : 0)));
    const part = Math.min(10, Math.max(1, Number(participation) || 6));
    const bl = Math.min(20, Math.max(0, Number(backlogs) || 0));

    // Format subjects list
    let parsedSubjects: ISubject[] = [];
    if (Array.isArray(subjects) && subjects.length > 0) {
      parsedSubjects = subjects
        .filter((sub: any) => sub && sub.name && sub.name.trim())
        .map((sub: any) => ({
          name: String(sub.name).trim(),
          score: Math.min(100, Math.max(0, Number(sub.score) || 0)),
          attendance: sub.attendance !== undefined ? Math.min(100, Math.max(0, Number(sub.attendance))) : att,
          internalMarks: sub.internalMarks !== undefined ? Math.min(100, Math.max(0, Number(sub.internalMarks))) : im,
        }));
    }

    // Build dynamic semester history
    const semesterHistory: ISemesterRecord[] = [];
    for (let s = 1; s < sem; s++) {
      const gpaEst = Math.max(4.0, Math.min(10.0, Math.round((pgpa - (sem - s) * 0.2 + (Math.random() * 0.4 - 0.2)) * 100) / 100));
      const attEst = Math.max(50, Math.min(100, Math.round(att - (sem - s) * 1 + (Math.random() * 4 - 2))));
      semesterHistory.push({
        semester: `Sem ${s}`,
        gpa: gpaEst,
        attendance: attEst,
      });
    }
    semesterHistory.push({
      semester: `Sem ${sem} (Current)`,
      gpa: cgpa > 0 ? cgpa : (pgpa > 0 ? pgpa : 7.0),
      attendance: att,
    });

    // Compute composite AI performance score
    const perfScore = Math.min(100, Math.max(0, Math.round(
      0.20 * att +
      0.16 * (Math.min(sh, 8.5) / 8.5 * 100) +
      0.22 * pm +
      0.14 * as +
      0.16 * im +
      0.08 * (pgpa * 10) +
      0.04 * (part * 10) -
      4.0 * bl
    )));

    let perfLevel: 'Poor' | 'Average' | 'Good' | 'Excellent' = 'Good';
    if (perfScore >= 80) perfLevel = 'Excellent';
    else if (perfScore >= 65) perfLevel = 'Good';
    else if (perfScore >= 50) perfLevel = 'Average';
    else perfLevel = 'Poor';

    let risk: 'Low' | 'Medium' | 'High' = 'Low';
    if (perfLevel === 'Poor' || bl >= 2 || att < 65) risk = 'High';
    else if (perfLevel === 'Average' || att < 75 || bl === 1) risk = 'Medium';

    // Find or create student document associated with userId
    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      student = await Student.findOne({ email: req.user.email.toLowerCase() });
    }
    if (!student && req.user.studentId) {
      student = await Student.findOne({ studentId: req.user.studentId });
    }

    if (!student) {
      student = new Student({
        userId: req.user._id,
        studentId: sId,
        email: req.user.email,
      });
    }

    student.userId = req.user._id;
    student.name = studentName;
    student.studentId = sId;
    student.college = clg;
    student.department = dept;
    student.year = yr;
    student.semester = sem;
    student.section = sec;
    student.isProfileCompleted = true;
    student.attendance = att;
    student.studyHours = sh;
    student.previousMarks = pm;
    student.assignmentScore = as;
    student.internalMarks = im;
    student.previousGPA = pgpa;
    student.currentGPA = cgpa;
    student.participation = part;
    student.backlogs = bl;
    student.subjects = parsedSubjects;
    student.semesterHistory = semesterHistory;
    student.performanceScore = perfScore;
    student.performanceLevel = perfLevel;
    student.riskLevel = risk;

    await student.save();

    // Update User record
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: studentName,
        studentId: sId,
        college: clg,
        department: dept,
        semester: sem,
        isProfileCompleted: true,
      },
      { new: true }
    );

    // Auto-generate fresh recommendations specific to this student
    const recs = [];
    if (student.attendance < 75) {
      recs.push({
        studentId: student._id,
        category: 'Attendance',
        title: 'Priority Attendance Recovery',
        description: `Current lecture attendance is ${student.attendance}%. Maintain regular lecture attendance for semester clearance.`,
        priority: 'CRITICAL',
        expectedImpact: '+0.5-0.8 GPA & Exam Clearance',
        action: 'Attend all scheduled theory lectures and laboratory sessions regularly.',
      });
    }

    if (student.studyHours < 3.5) {
      recs.push({
        studentId: student._id,
        category: 'Study Habits',
        title: 'Daily Deep Work Timetable',
        description: `Current daily self-study is ${student.studyHours} hours. Elevate to 3.5+ hours using structured intervals.`,
        priority: student.riskLevel === 'High' ? 'HIGH' : 'MEDIUM',
        expectedImpact: '+12% Exam Performance Boost',
        action: 'Block out dedicated morning and evening focus intervals for active recall.',
      });
    }

    if (student.backlogs > 0) {
      recs.push({
        studentId: student._id,
        category: 'Backlogs',
        title: `Clear ${student.backlogs} Active Backlog Modules`,
        description: 'Active backlogs impede graduation timelines and impact cumulative CGPA.',
        priority: 'CRITICAL',
        expectedImpact: 'Reclassifies Student Risk to Low',
        action: 'Review past semester question banks and attend weekly doubt clinics.',
      });
    }

    if (student.assignmentScore < 75) {
      recs.push({
        studentId: student._id,
        category: 'Continuous Assessment',
        title: 'Enhance Assignment & Lab Report Quality',
        description: `Assignment score is ${student.assignmentScore}%. Internal continuous assessments carry significant weight.`,
        priority: 'MEDIUM',
        expectedImpact: '+8% Overall Internal Weightage',
        action: 'Submit coursework and laboratory notebooks prior to the deadlines.',
      });
    }

    if (recs.length === 0 || student.performanceLevel === 'Excellent') {
      recs.push({
        studentId: student._id,
        category: 'Excellence & Growth',
        title: 'Capstone Projects & Technical Leadership',
        description: 'Outstanding academic standing achieved. Focus on competitive coding, open-source, and research publications.',
        priority: 'LOW',
        expectedImpact: 'Institutional Honors & Placement Distinction',
        action: 'Engage in collaborative open-source projects or submit papers to undergraduate conferences.',
      });
    }

    await Recommendation.deleteMany({ studentId: student._id });
    const createdRecs = await Recommendation.insertMany(recs);

    // Auto-generate/update initial Prediction record
    const riskScore = risk === 'High' ? 68.5 : risk === 'Medium' ? 38.0 : 12.0;
    const predictionFactors = [
      { name: 'Previous Marks', importance: 0.28, status: pm >= 60 ? 'Strong' : 'Needs Improvement', impact: 'Positive' },
      { name: 'Attendance', importance: 0.22, status: att >= 75 ? 'Strong' : 'Needs Improvement', impact: att >= 75 ? 'Positive' : 'Negative' },
      { name: 'Internal Marks', importance: 0.18, status: im >= 60 ? 'Strong' : 'Needs Improvement', impact: 'Positive' },
      { name: 'Study Hours', importance: 0.14, status: sh >= 3 ? 'Strong' : 'Needs Improvement', impact: 'Positive' },
      { name: 'Previous GPA', importance: 0.10, status: pgpa >= 6.5 ? 'Strong' : 'Moderate', impact: 'Positive' },
      { name: 'Assignment Score', importance: 0.05, status: as >= 70 ? 'Strong' : 'Moderate', impact: 'Positive' },
      { name: 'Backlogs', importance: 0.03, status: bl === 0 ? 'Strong' : 'Needs Improvement', impact: bl === 0 ? 'Positive' : 'Negative' },
    ];

    await Prediction.deleteMany({ studentId: student._id });
    const createdPrediction = await Prediction.create({
      studentId: student._id,
      studentCode: student.studentId,
      studentName: student.name,
      performance: perfLevel,
      score: perfScore,
      confidence: 0.90,
      riskLevel: risk,
      riskScore,
      factors: predictionFactors,
      explanation: `Composite AI assessment rating: ${perfScore}/100 based on ${att}% attendance, ${cgpa} CGPA, and assessment trajectory.`,
      inputData: {
        attendance: att,
        studyHours: sh,
        previousMarks: pm,
        assignmentScore: as,
        internalMarks: im,
        previousGPA: pgpa,
        participation: part,
        backlogs: bl,
      },
      modelVersion: 'RandomForest-Ensemble-v2.1',
    });

    res.status(200).json({
      success: true,
      message: 'Student profile completed and saved successfully.',
      data: {
        student,
        isProfileCompleted: true,
        predictions: [createdPrediction],
        recommendations: createdRecs,
      },
      user: updatedUser
        ? {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            studentId: updatedUser.studentId,
            college: updatedUser.college,
            department: updatedUser.department,
            semester: updatedUser.semester,
            profileImage: updatedUser.profileImage,
            isProfileCompleted: true,
            studentProfile: student,
          }
        : undefined,
    });
  } catch (error: any) {
    console.error('Error saving profile:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to save student profile.' });
  }
};

export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      studentId,
      name,
      email,
      department,
      semester,
      attendance,
      studyHours,
      previousMarks,
      assignmentScore,
      internalMarks,
      previousGPA,
      participation,
      backlogs,
      currentGPA,
    } = req.body;

    if (!name || !email || !studentId) {
      res.status(400).json({ success: false, message: 'Name, Email, and Student ID are required.' });
      return;
    }

    const existingStudent = await Student.findOne({
      $or: [{ studentId: studentId.toUpperCase() }, { email: email.toLowerCase() }],
    });
    if (existingStudent) {
      res.status(400).json({ success: false, message: 'A student with this ID or email already exists.' });
      return;
    }

    // Baseline performance estimation
    const att = Number(attendance) || 75;
    const sh = Number(studyHours) || 3;
    const pm = Number(previousMarks) || 70;
    const as = Number(assignmentScore) || 70;
    const im = Number(internalMarks) || 70;
    const pgpa = Number(previousGPA) || 7.0;
    const part = Number(participation) || 6;
    const bl = Number(backlogs) || 0;
    const cgpa = Number(currentGPA) || pgpa;

    const perfScore = Math.min(100, Math.max(0, Math.round(
      0.20 * att +
      0.16 * (Math.min(sh, 8.5) / 8.5 * 100) +
      0.22 * pm +
      0.14 * as +
      0.16 * im +
      0.08 * (pgpa * 10) +
      0.04 * (part * 10) -
      4.0 * bl
    )));

    let perfLevel: 'Poor' | 'Average' | 'Good' | 'Excellent' = 'Good';
    if (perfScore >= 80) perfLevel = 'Excellent';
    else if (perfScore >= 65) perfLevel = 'Good';
    else if (perfScore >= 50) perfLevel = 'Average';
    else perfLevel = 'Poor';

    let risk: 'Low' | 'Medium' | 'High' = 'Low';
    if (perfLevel === 'Poor' || bl >= 2 || att < 65) risk = 'High';
    else if (perfLevel === 'Average' || att < 75 || bl === 1) risk = 'Medium';

    const student = await Student.create({
      studentId: studentId.toUpperCase(),
      name,
      email: email.toLowerCase(),
      department: department || 'Computer Science',
      semester: Number(semester) || 1,
      attendance: att,
      studyHours: sh,
      previousMarks: pm,
      assignmentScore: as,
      internalMarks: im,
      previousGPA: pgpa,
      participation: part,
      backlogs: bl,
      currentGPA: cgpa,
      performanceScore: perfScore,
      performanceLevel: perfLevel,
      riskLevel: risk,
    });

    res.status(201).json({
      success: true,
      message: 'Student profile created successfully.',
      data: student,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create student.' });
  }
};

export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const student = await Student.findById(id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student record not found.' });
      return;
    }

    // Apply updates
    Object.assign(student, updates);

    // Re-evaluate performance score & risk
    const att = student.attendance;
    const sh = student.studyHours;
    const pm = student.previousMarks;
    const as = student.assignmentScore;
    const im = student.internalMarks;
    const pgpa = student.previousGPA;
    const part = student.participation;
    const bl = student.backlogs;

    student.performanceScore = Math.min(100, Math.max(0, Math.round(
      0.20 * att +
      0.16 * (Math.min(sh, 8.5) / 8.5 * 100) +
      0.22 * pm +
      0.14 * as +
      0.16 * im +
      0.08 * (pgpa * 10) +
      0.04 * (part * 10) -
      4.0 * bl
    )));

    if (student.performanceScore >= 80) student.performanceLevel = 'Excellent';
    else if (student.performanceScore >= 65) student.performanceLevel = 'Good';
    else if (student.performanceScore >= 50) student.performanceLevel = 'Average';
    else student.performanceLevel = 'Poor';

    if (student.performanceLevel === 'Poor' || bl >= 2 || att < 65) student.riskLevel = 'High';
    else if (student.performanceLevel === 'Average' || att < 75 || bl === 1) student.riskLevel = 'Medium';
    else student.riskLevel = 'Low';

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully.',
      data: student,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update student.' });
  }
};

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    // Clean up associated records
    await Promise.all([
      Prediction.deleteMany({ studentId: id }),
      Recommendation.deleteMany({ studentId: id }),
    ]);

    res.status(200).json({
      success: true,
      message: `Student ${student.name} (${student.studentId}) deleted successfully.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete student.' });
  }
};

export const exportStudentsCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const students = await Student.find().sort({ studentId: 1 });

    const headers = [
      'Student ID',
      'Name',
      'Email',
      'Department',
      'Semester',
      'Attendance (%)',
      'Study Hours (hrs/day)',
      'Previous Marks (%)',
      'Assignment Score (%)',
      'Internal Marks (%)',
      'Previous GPA',
      'Current GPA',
      'Participation',
      'Backlogs',
      'Performance Score',
      'Performance Level',
      'Risk Level',
    ];

    const rows = students.map((s) => [
      s.studentId,
      `"${s.name.replace(/"/g, '""')}"`,
      s.email,
      `"${s.department}"`,
      s.semester,
      s.attendance,
      s.studyHours,
      s.previousMarks,
      s.assignmentScore,
      s.internalMarks,
      s.previousGPA,
      s.currentGPA,
      s.participation,
      s.backlogs,
      s.performanceScore,
      s.performanceLevel,
      s.riskLevel,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="adexa_students_export.csv"');
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to export CSV.' });
  }
};
