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

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide all required fields (name, email, password).' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'STUDENT',
      studentId: studentId ? studentId.toUpperCase() : undefined,
      department: department || 'Computer Science',
      semester: Number(semester) || 1,
    });

    let studentProfile = null;
    if (user.role === 'STUDENT') {
      const sId = studentId ? studentId.toUpperCase() : `ADX-${Math.floor(1000 + Math.random() * 9000)}`;
      studentProfile = await Student.create({
        userId: user._id,
        studentId: sId,
        name: user.name,
        email: user.email,
        department: user.department,
        semester: user.semester,
        attendance: 75,
        studyHours: 3.5,
        previousMarks: 72,
        assignmentScore: 78,
        internalMarks: 74,
        previousGPA: 7.2,
        participation: 7,
        backlogs: 0,
        currentGPA: 7.4,
        performanceScore: 72,
        performanceLevel: 'Good',
        riskLevel: 'Low',
      });
      user.studentId = sId;
      await user.save();
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
      const queryList: any[] = [{ userId: user._id }, { email: user.email }];
      if (user.studentId) {
        queryList.push({ studentId: user.studentId });
      }
      studentProfile = await Student.findOne({ $or: queryList });
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
        department: user.department,
        semester: user.semester,
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
      const queryList: any[] = [{ userId: req.user._id }, { email: req.user.email }];
      if (req.user.studentId) {
        queryList.push({ studentId: req.user.studentId });
      }
      studentProfile = await Student.findOne({ $or: queryList });
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        studentId: req.user.studentId,
        department: req.user.department,
        semester: req.user.semester,
        profileImage: req.user.profileImage,
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

    const { name, department, semester, profileImage } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (name) user.name = name;
    if (department) user.department = department;
    if (semester) user.semester = Number(semester);
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    if (user.role === 'STUDENT') {
      await Student.findOneAndUpdate(
        { $or: [{ userId: user._id }, { email: user.email }] },
        { name: user.name, department: user.department, semester: user.semester }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        semester: user.semester,
        profileImage: user.profileImage,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Profile update failed.' });
  }
};
