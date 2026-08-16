import { Request, Response } from 'express';
import { Student } from '../models/Student';
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

export const getStudentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // RBAC: If student role, ensure they can only view their own profile
    let student = null;
    if (req.user?.role === 'STUDENT') {
      const orList: any[] = [{ userId: req.user._id }, { email: req.user.email }];
      if (req.user.studentId) orList.push({ studentId: req.user.studentId });
      student = await Student.findOne({ _id: id, $or: orList });
      if (!student) {
        student = await Student.findOne({ $or: orList });
      }
    } else {
      student = await Student.findById(id);
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
        predictions,
        recommendations,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to retrieve student details.' });
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
