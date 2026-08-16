import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, role, status, page = '1', limit = '10' } = req.query;
    const query: any = {};

    if (search) {
      const regex = new RegExp(String(search), 'i');
      query.$or = [{ name: regex }, { email: regex }, { studentId: regex }];
    }

    if (role && role !== 'ALL') {
      query.role = role;
    }

    if (status && status !== 'ALL') {
      query.isActive = status === 'active';
    }

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch users.' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'STUDENT', department, semester, studentId } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'User with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'STUDENT',
      department: department || 'Computer Science',
      semester: Number(semester) || 1,
      studentId: studentId ? studentId.toUpperCase() : undefined,
    });

    if (user.role === 'STUDENT') {
      const sId = studentId ? studentId.toUpperCase() : `ADX-${Math.floor(1000 + Math.random() * 9000)}`;
      await Student.create({
        userId: user._id,
        studentId: sId,
        name: user.name,
        email: user.email,
        department: user.department,
        semester: user.semester,
        attendance: 75,
        studyHours: 3.5,
        previousMarks: 70,
        assignmentScore: 75,
        internalMarks: 70,
        previousGPA: 7.0,
        participation: 6,
        backlogs: 0,
        currentGPA: 7.2,
      });
      user.studentId = sId;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        semester: user.semester,
        studentId: user.studentId,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create user.' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user && req.user._id.toString() === id) {
      res.status(400).json({ success: false, message: 'You cannot deactivate your own administrative account.' });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      data: { id: user._id, isActive: user.isActive },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to toggle user status.' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user && req.user._id.toString() === id) {
      res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
      return;
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (user.role === 'STUDENT') {
      await Student.findOneAndDelete({ $or: [{ userId: user._id }, { email: user.email }] });
    }

    res.status(200).json({
      success: true,
      message: `User ${user.name} (${user.email}) deleted successfully.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete user.' });
  }
};
