import { Request, Response } from 'express';
import { Recommendation } from '../models/Recommendation';
import { Student } from '../models/Student';
import { AuthRequest } from '../middleware/auth.middleware';

export const generateRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.body;
    let student = null;

    if (studentId) {
      student = await Student.findById(studentId);
    } else if (req.user?.role === 'STUDENT') {
      student = await Student.findOne({
        $or: [{ userId: req.user._id }, { email: req.user.email }],
      });
    }

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    const recs = [];

    // Rule & ML contextual generation
    if (student.attendance < 75) {
      recs.push({
        studentId: student._id,
        category: 'Attendance',
        title: 'Priority Attendance Recovery',
        description: `Current attendance is ${student.attendance}%. Institute requires >=75% for semester exam clearance.`,
        priority: 'CRITICAL',
        expectedImpact: '+0.5-0.8 GPA & Debarment Protection',
        action: 'Attend all scheduled theory lectures and laboratory sessions for the next 4 weeks.',
      });
    }

    if (student.studyHours < 3.5) {
      recs.push({
        studentId: student._id,
        category: 'Study Habits',
        title: 'Optimal Deep Work Study Timetable',
        description: `Current daily self-study is ${student.studyHours} hours. Elevate to 4.0 hours using spaced intervals.`,
        priority: student.riskLevel === 'High' ? 'HIGH' : 'MEDIUM',
        expectedImpact: '+12% Exam Performance Boost',
        action: 'Block out 2 hours before 10 AM and 2 hours in evening for active problem solving.',
      });
    }

    if (student.backlogs > 0) {
      recs.push({
        studentId: student._id,
        category: 'Backlogs',
        title: `Clear ${student.backlogs} Active Backlog Modules`,
        description: 'Carryover backlogs impede graduation timelines and impact cumulative CGPA.',
        priority: 'CRITICAL',
        expectedImpact: 'Reclassifies Student Risk to Low',
        action: 'Attend Saturday backlog remedial clinics and solve past 5 semester question sets.',
      });
    }

    if (student.assignmentScore < 75) {
      recs.push({
        studentId: student._id,
        category: 'Continuous Assessment',
        title: 'Enhance Assignment & Lab Report Quality',
        description: `Assignment score is ${student.assignmentScore}%. Internal assessment makes up 30-40% of final grade.`,
        priority: 'MEDIUM',
        expectedImpact: '+8% Overall Internal Weightage',
        action: 'Submit draft code/reports to teaching assistants 48 hours prior to final deadlines.',
      });
    }

    if (student.internalMarks < 65) {
      recs.push({
        studentId: student._id,
        category: 'Academic Performance',
        title: 'Midterm Concept Remediation',
        description: 'Internal assessment indicates conceptual gaps in core curriculum units.',
        priority: 'HIGH',
        expectedImpact: '+15% Mid-Semester Score',
        action: 'Schedule 1-on-1 office hours with course professors for doubt clarification.',
      });
    }

    if (recs.length === 0 || student.performanceLevel === 'Excellent') {
      recs.push({
        studentId: student._id,
        category: 'Excellence & Growth',
        title: 'Research & Industry Capstone Pathway',
        description: 'Exceptional academic metrics achieved. Focus on peer tutoring, open-source, and research publications.',
        priority: 'LOW',
        expectedImpact: 'Institutional Honors & Placement Excellence',
        action: 'Submit paper to undergraduate conference or participate in regional Hackathons.',
      });
    }

    // Save recommendations
    await Recommendation.deleteMany({ studentId: student._id, completed: false });
    const createdRecs = await Recommendation.insertMany(recs);

    res.status(200).json({
      success: true,
      message: 'Personalized recommendations generated successfully.',
      data: createdRecs,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to generate recommendations.' });
  }
};

export const getRecommendationsByStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    let targetStudentId = studentId;

    if (req.user?.role === 'STUDENT') {
      const orList: any[] = [{ userId: req.user._id }, { email: req.user.email }];
      if (req.user.studentId) orList.push({ studentId: req.user.studentId });
      const student = await Student.findOne({ $or: orList });
      if (student) {
        targetStudentId = student._id.toString();
      }
    }

    const recommendations = await Recommendation.find({ studentId: targetStudentId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch recommendations.' });
  }
};

export const toggleRecommendationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const rec = await Recommendation.findById(id);

    if (!rec) {
      res.status(404).json({ success: false, message: 'Recommendation not found.' });
      return;
    }

    rec.completed = !rec.completed;
    await rec.save();

    res.status(200).json({
      success: true,
      message: `Recommendation marked as ${rec.completed ? 'completed' : 'pending'}.`,
      data: rec,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update recommendation.' });
  }
};
