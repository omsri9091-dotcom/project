import { Request, Response } from 'express';
import { StudyPlan } from '../models/StudyPlan';
import { Student } from '../models/Student';
import { AuthRequest } from '../middleware/auth.middleware';

export const createStudyPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, targetGPA = 8.5, examDate, availableHours = 4, weakSubjects = [] } = req.body;

    let targetStudent = null;
    if (studentId) {
      targetStudent = await Student.findById(studentId);
    } else if (req.user?.role === 'STUDENT') {
      targetStudent = await Student.findOne({
        $or: [{ userId: req.user._id }, { email: req.user.email }],
      });
    }

    if (!targetStudent) {
      res.status(404).json({ success: false, message: 'Student profile not found.' });
      return;
    }

    const defaultSubjects = weakSubjects.length > 0
      ? weakSubjects
      : ['Data Structures & Algorithms', 'Database Management Systems', 'Computer Networks', 'Operating Systems'];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const totalDailyHours = Math.max(2, Math.min(8, Number(availableHours)));

    const weeklyPlan = days.map((day, idx) => {
      const isWeekend = day === 'Saturday' || day === 'Sunday';
      const primarySubject = defaultSubjects[idx % defaultSubjects.length];
      const secondarySubject = defaultSubjects[(idx + 1) % defaultSubjects.length];

      const schedule = [
        {
          time: '07:30 AM - 09:00 AM',
          subject: primarySubject,
          duration: '1.5 Hours',
          activity: 'Deep Conceptual Review & Core Theory',
          focus: `Master foundational unit concepts & lecture slides in ${primarySubject}`,
        },
        {
          time: '04:30 PM - 06:00 PM',
          subject: secondarySubject,
          duration: '1.5 Hours',
          activity: 'Active Problem Solving & Coding Labs',
          focus: `Implement practical examples and solve 3 previous year exam problems in ${secondarySubject}`,
        },
        {
          time: '08:30 PM - 09:30 PM',
          subject: isWeekend ? 'Weekly Cumulative Review' : primarySubject,
          duration: '1.0 Hour',
          activity: isWeekend ? 'Mock Timed Test & Error Log Analysis' : 'Spaced Repetition Flashcards & Quiz',
          focus: 'Formulas, definitions, time-complexity analysis, and short-answer retention',
        },
      ];

      if (totalDailyHours < 3.5) {
        schedule.pop();
      }

      return {
        day,
        totalHours: totalDailyHours,
        schedule,
      };
    });

    const summary = `Generated an adaptive ${totalDailyHours} hr/day weekly study roadmap tailored for a target GPA of ${targetGPA}. Emphasizes intensive review of [${defaultSubjects.join(', ')}] with built-in spaced repetition and mock exam practice.`;

    // Save or update existing active study plan
    const studyPlan = await StudyPlan.findOneAndUpdate(
      { studentId: targetStudent._id },
      {
        studentId: targetStudent._id,
        targetGPA: Number(targetGPA),
        examDate: examDate ? new Date(examDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        availableHours: totalDailyHours,
        weakSubjects: defaultSubjects,
        plan: weeklyPlan,
        summary,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'AI Personalized Study Plan created successfully.',
      data: studyPlan,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to generate study plan.' });
  }
};

export const getStudyPlanByStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    let targetStudentId = studentId;

    if (req.user?.role === 'STUDENT') {
      const student = await Student.findOne({
        $or: [{ userId: req.user._id }, { email: req.user.email }],
      });
      if (student) targetStudentId = student._id.toString();
    }

    const studyPlan = await StudyPlan.findOne({ studentId: targetStudentId }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: studyPlan,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch study plan.' });
  }
};
