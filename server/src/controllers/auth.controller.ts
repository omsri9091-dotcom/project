import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { ENV } from '../config/env';
import { AuthRequest } from '../middleware/auth.middleware';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'STUDENT', studentId, department, semester } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide all required fields (name, email, password).' });
      return;
    }

    const sId = (studentId && studentId.trim().toUpperCase()) || `ADX-${Math.floor(1000 + Math.random() * 9000)}`;
    const dept = (department && department.trim()) || 'Computer Science';
    const semesterNum = Number(semester) || 1;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    // Check if student ID already exists if explicitly provided
    if (studentId) {
      const existingStudentId = await Student.findOne({ studentId: sId });
      if (existingStudentId) {
        res.status(400).json({ success: false, message: 'This Student ID is already registered.' });
        return;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'STUDENT',
      studentId: sId,
      department: dept,
      semester: semesterNum,
      isProfileCompleted: false,
    });

    let studentProfile = null;
    if (user.role === 'STUDENT') {
      studentProfile = await Student.create({
        userId: user._id,
        studentId: sId,
        name: user.name,
        email: user.email,
        department: dept,
        semester: semesterNum,
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

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        semester: user.semester,
        isProfileCompleted: false,
        studentProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact an administrator.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    // Role check if provided
    if (role && role.toUpperCase() !== user.role) {
      res.status(403).json({
        success: false,
        message: `This account is registered as ${user.role}. Please select the ${user.role} tab or login with appropriate credentials.`,
      });
      return;
    }

    let studentProfile = null;
    if (user.role === 'STUDENT') {
      studentProfile = await Student.findOne({ userId: user._id });
      if (!studentProfile) {
        studentProfile = await Student.findOne({ email: user.email.toLowerCase() });
        if (studentProfile) {
          studentProfile.userId = user._id;
          await studentProfile.save();
        }
      }

      if (!studentProfile && user.studentId) {
        studentProfile = await Student.findOne({ studentId: user.studentId });
        if (studentProfile) {
          studentProfile.userId = user._id;
          await studentProfile.save();
        }
      }

      if (!studentProfile) {
        studentProfile = await Student.create({
          userId: user._id,
          studentId: user.studentId || `ADX-${Math.floor(1000 + Math.random() * 9000)}`,
          name: user.name,
          email: user.email,
          department: user.department || 'Computer Science',
          semester: user.semester || 1,
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
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        college: user.college,
        department: user.department,
        semester: user.semester,
        isProfileCompleted: studentProfile ? studentProfile.isProfileCompleted : user.isProfileCompleted,
        studentProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let studentProfile = null;
    if (req.user.role === 'STUDENT') {
      studentProfile = await Student.findOne({ userId: req.user._id });
      if (!studentProfile) {
        studentProfile = await Student.findOne({ email: req.user.email.toLowerCase() });
        if (studentProfile) {
          studentProfile.userId = req.user._id;
          await studentProfile.save();
        }
      }

      if (!studentProfile && req.user.studentId) {
        studentProfile = await Student.findOne({ studentId: req.user.studentId });
        if (studentProfile) {
          studentProfile.userId = req.user._id;
          await studentProfile.save();
        }
      }

      if (!studentProfile) {
        studentProfile = await Student.create({
          userId: req.user._id,
          studentId: req.user.studentId || `ADX-${Math.floor(1000 + Math.random() * 9000)}`,
          name: req.user.name,
          email: req.user.email,
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
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        studentId: req.user.studentId,
        college: req.user.college,
        department: req.user.department,
        semester: req.user.semester,
        profileImage: req.user.profileImage,
        isProfileCompleted: studentProfile ? studentProfile.isProfileCompleted : req.user.isProfileCompleted,
        studentProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch user session.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
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
      profileImage,
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

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (studentId && studentId.trim().toUpperCase() !== user.studentId) {
      const sIdUpper = studentId.trim().toUpperCase();
      const existingUserWithId = await User.findOne({ studentId: sIdUpper, _id: { $ne: user._id } });
      const existingStudentWithId = await Student.findOne({ studentId: sIdUpper, userId: { $ne: user._id } });
      if (existingUserWithId || existingStudentWithId) {
        res.status(400).json({ success: false, message: 'This Student ID is already in use by another student.' });
        return;
      }
      user.studentId = sIdUpper;
    }

    if (name && name.trim()) user.name = name.trim();
    if (college !== undefined) user.college = college.trim();
    if (department && department.trim()) user.department = department.trim();
    if (semester) user.semester = Number(semester);
    if (profileImage !== undefined) user.profileImage = profileImage;

    let studentProfile = null;

    if (user.role === 'STUDENT') {
      let student = await Student.findOne({ userId: user._id });
      if (!student) {
        student = await Student.findOne({ email: user.email.toLowerCase() });
      }
      if (!student && user.studentId) {
        student = await Student.findOne({ studentId: user.studentId });
      }

      if (!student) {
        student = new Student({
          userId: user._id,
          studentId: user.studentId || `ADX-${Math.floor(1000 + Math.random() * 9000)}`,
          email: user.email,
        });
      }

      student.userId = user._id;
      student.name = user.name;
      student.email = user.email;
      student.studentId = user.studentId || student.studentId;
      if (college !== undefined) student.college = college.trim();
      student.department = user.department || 'Computer Science';
      student.semester = user.semester || 1;
      if (year !== undefined) student.year = Number(year);
      if (section !== undefined) student.section = section.trim();

      if (attendance !== undefined || currentGPA !== undefined || previousMarks !== undefined) {
        student.isProfileCompleted = true;
        user.isProfileCompleted = true;
      }

      if (attendance !== undefined) student.attendance = Math.min(100, Math.max(0, Number(attendance)));
      if (studyHours !== undefined) student.studyHours = Math.min(24, Math.max(0, Number(studyHours)));
      if (previousMarks !== undefined) student.previousMarks = Math.min(100, Math.max(0, Number(previousMarks)));
      if (assignmentScore !== undefined) student.assignmentScore = Math.min(100, Math.max(0, Number(assignmentScore)));
      if (internalMarks !== undefined) student.internalMarks = Math.min(100, Math.max(0, Number(internalMarks)));
      if (previousGPA !== undefined) student.previousGPA = Math.min(10, Math.max(0, Number(previousGPA)));
      if (currentGPA !== undefined) student.currentGPA = Math.min(10, Math.max(0, Number(currentGPA)));
      if (participation !== undefined) student.participation = Math.min(10, Math.max(1, Number(participation)));
      if (backlogs !== undefined) student.backlogs = Math.min(20, Math.max(0, Number(backlogs)));

      if (Array.isArray(subjects)) {
        student.subjects = subjects
          .filter((sub: any) => sub && sub.name && sub.name.trim())
          .map((sub: any) => ({
            name: String(sub.name).trim(),
            score: Math.min(100, Math.max(0, Number(sub.score) || 0)),
            attendance: sub.attendance !== undefined ? Math.min(100, Math.max(0, Number(sub.attendance))) : student.attendance,
            internalMarks: sub.internalMarks !== undefined ? Math.min(100, Math.max(0, Number(sub.internalMarks))) : student.internalMarks,
          }));
      }

      // Re-evaluate score & risk
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
      studentProfile = student;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        college: user.college,
        department: user.department,
        semester: user.semester,
        profileImage: user.profileImage,
        isProfileCompleted: user.isProfileCompleted,
        studentProfile,
      },
      data: {
        student: studentProfile,
        isProfileCompleted: user.isProfileCompleted,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Profile update failed.' });
  }
};
