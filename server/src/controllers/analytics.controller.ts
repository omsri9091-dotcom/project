import { Request, Response } from 'express';
import { Student } from '../models/Student';
import { Prediction } from '../models/Prediction';

export const getOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department, semester } = req.query;
    const filter: any = {};
    if (department && department !== 'ALL') filter.department = department;
    if (semester && semester !== 'ALL') filter.semester = Number(semester);

    const totalStudents = await Student.countDocuments(filter);
    if (totalStudents === 0) {
      res.status(200).json({
        success: true,
        data: {
          totalStudents: 0,
          highRiskCount: 0,
          mediumRiskCount: 0,
          lowRiskCount: 0,
          averageGPA: 0,
          averageAttendance: 0,
          averagePerformanceScore: 0,
          recentPredictions: [],
          highRiskAlerts: [],
        },
      });
      return;
    }

    const [
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      stats,
      recentPredictions,
      highRiskAlerts,
    ] = await Promise.all([
      Student.countDocuments({ ...filter, riskLevel: 'High' }),
      Student.countDocuments({ ...filter, riskLevel: 'Medium' }),
      Student.countDocuments({ ...filter, riskLevel: 'Low' }),
      Student.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            avgGPA: { $avg: '$currentGPA' },
            avgAttendance: { $avg: '$attendance' },
            avgPerformance: { $avg: '$performanceScore' },
            avgStudyHours: { $avg: '$studyHours' },
          },
        },
      ]),
      Prediction.find().sort({ createdAt: -1 }).limit(5),
      Student.find({ ...filter, riskLevel: 'High' }).sort({ performanceScore: 1 }).limit(5),
    ]);

    const aggregateData = stats[0] || {
      avgGPA: 7.2,
      avgAttendance: 78.4,
      avgPerformance: 72.1,
      avgStudyHours: 3.6,
    };

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        averageGPA: Math.round(aggregateData.avgGPA * 100) / 100,
        averageAttendance: Math.round(aggregateData.avgAttendance * 10) / 10,
        averagePerformanceScore: Math.round(aggregateData.avgPerformance * 10) / 10,
        averageStudyHours: Math.round(aggregateData.avgStudyHours * 10) / 10,
        recentPredictions,
        highRiskAlerts,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to generate overview analytics.' });
  }
};

export const getPerformanceAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department, semester } = req.query;
    const filter: any = {};
    if (department && department !== 'ALL') filter.department = department;
    if (semester && semester !== 'ALL') filter.semester = Number(semester);

    const students = await Student.find(filter);

    // 1. Performance Level Distribution
    const perfDistribution = [
      { name: 'Poor (<50%)', count: students.filter((s) => s.performanceLevel === 'Poor').length, color: '#f43f5e' },
      { name: 'Average (50-65%)', count: students.filter((s) => s.performanceLevel === 'Average').length, color: '#f59e0b' },
      { name: 'Good (65-80%)', count: students.filter((s) => s.performanceLevel === 'Good').length, color: '#3b82f6' },
      { name: 'Excellent (>=80%)', count: students.filter((s) => s.performanceLevel === 'Excellent').length, color: '#10b981' },
    ];

    // 2. Risk Level Distribution
    const riskDistribution = [
      { name: 'Low Risk', value: students.filter((s) => s.riskLevel === 'Low').length, color: '#10b981' },
      { name: 'Medium Risk', value: students.filter((s) => s.riskLevel === 'Medium').length, color: '#f59e0b' },
      { name: 'High Risk', value: students.filter((s) => s.riskLevel === 'High').length, color: '#ef4444' },
    ];

    // 3. GPA Distribution Bins
    const gpaBins = [
      { range: '< 5.0', count: students.filter((s) => s.currentGPA < 5.0).length },
      { range: '5.0 - 6.0', count: students.filter((s) => s.currentGPA >= 5.0 && s.currentGPA < 6.0).length },
      { range: '6.0 - 7.0', count: students.filter((s) => s.currentGPA >= 6.0 && s.currentGPA < 7.0).length },
      { range: '7.0 - 8.0', count: students.filter((s) => s.currentGPA >= 7.0 && s.currentGPA < 8.0).length },
      { range: '8.0 - 9.0', count: students.filter((s) => s.currentGPA >= 8.0 && s.currentGPA < 9.0).length },
      { range: '9.0 - 10.0', count: students.filter((s) => s.currentGPA >= 9.0).length },
    ];

    // 4. Attendance vs Performance Correlation Points (Sampled for chart)
    const scatterData = students.slice(0, 50).map((s) => ({
      name: s.name,
      studentId: s.studentId,
      attendance: s.attendance,
      performanceScore: s.performanceScore,
      studyHours: s.studyHours,
      gpa: s.currentGPA,
      backlogs: s.backlogs,
      riskLevel: s.riskLevel,
    }));

    res.status(200).json({
      success: true,
      data: {
        perfDistribution,
        riskDistribution,
        gpaBins,
        scatterData,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch performance analytics.' });
  }
};

export const getRiskAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department } = req.query;
    const filter: any = {};
    if (department && department !== 'ALL') filter.department = department;

    const students = await Student.find(filter);

    // Department-wise risk breakdown
    const deptMap: Record<string, { total: number; low: number; medium: number; high: number; avgScore: number }> = {};
    students.forEach((s) => {
      if (!deptMap[s.department]) {
        deptMap[s.department] = { total: 0, low: 0, medium: 0, high: 0, avgScore: 0 };
      }
      deptMap[s.department].total += 1;
      deptMap[s.department].avgScore += s.performanceScore;
      if (s.riskLevel === 'Low') deptMap[s.department].low += 1;
      if (s.riskLevel === 'Medium') deptMap[s.department].medium += 1;
      if (s.riskLevel === 'High') deptMap[s.department].high += 1;
    });

    const departmentRisk = Object.entries(deptMap).map(([dept, data]) => ({
      department: dept,
      total: data.total,
      low: data.low,
      medium: data.medium,
      high: data.high,
      avgScore: Math.round((data.avgScore / data.total) * 10) / 10,
      highRiskRate: Math.round((data.high / data.total) * 100),
    }));

    // Semester-wise average performance and high risk count
    const semMap: Record<number, { count: number; totalScore: number; highRiskCount: number }> = {};
    for (let sem = 1; sem <= 8; sem++) {
      semMap[sem] = { count: 0, totalScore: 0, highRiskCount: 0 };
    }
    students.forEach((s) => {
      if (semMap[s.semester]) {
        semMap[s.semester].count += 1;
        semMap[s.semester].totalScore += s.performanceScore;
        if (s.riskLevel === 'High') semMap[s.semester].highRiskCount += 1;
      }
    });

    const semesterTrends = Object.entries(semMap)
      .filter(([_, data]) => data.count > 0)
      .map(([sem, data]) => ({
        semester: `Sem ${sem}`,
        students: data.count,
        avgScore: Math.round((data.totalScore / (data.count || 1)) * 10) / 10,
        highRiskStudents: data.highRiskCount,
      }));

    // Backlogs vs Performance relationship
    const backlogTrends = [0, 1, 2, 3, 4].map((bl) => {
      const subset = students.filter((s) => (bl === 4 ? s.backlogs >= 4 : s.backlogs === bl));
      const avg = subset.length > 0
        ? subset.reduce((acc, curr) => acc + curr.performanceScore, 0) / subset.length
        : 0;
      return {
        backlogs: bl === 4 ? '4+ Backlogs' : `${bl} Backlogs`,
        count: subset.length,
        avgPerformance: Math.round(avg * 10) / 10,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        departmentRisk,
        semesterTrends,
        backlogTrends,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch risk analytics.' });
  }
};
