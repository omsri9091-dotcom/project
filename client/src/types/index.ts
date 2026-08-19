export interface SubjectItem {
  name: string;
  score: number;
  attendance?: number;
  internalMarks?: number;
}

export interface SemesterRecord {
  semester: string;
  gpa: number;
  attendance: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STUDENT';
  studentId?: string;
  college?: string;
  department?: string;
  semester?: number;
  profileImage?: string;
  isProfileCompleted?: boolean;
  isActive?: boolean;
  studentProfile?: Student;
}

export interface Student {
  _id: string;
  userId?: string;
  studentId: string;
  name: string;
  email: string;
  college?: string;
  department: string;
  year?: number;
  semester: number;
  section?: string;
  isProfileCompleted: boolean;
  attendance: number;
  studyHours: number;
  previousMarks: number;
  assignmentScore: number;
  internalMarks: number;
  previousGPA: number;
  participation: number;
  backlogs: number;
  currentGPA: number;
  subjects: SubjectItem[];
  semesterHistory: SemesterRecord[];
  performanceScore: number;
  performanceLevel: 'Poor' | 'Average' | 'Good' | 'Excellent';
  riskLevel: 'Low' | 'Medium' | 'High';
  createdAt: string;
  updatedAt: string;
}

export interface Factor {
  name: string;
  importance: number;
  status: string;
  impact: string;
}

export interface PredictionRecommendation {
  category: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedImpact: string;
  action: string;
}

export interface Prediction {
  _id: string;
  studentId: string;
  studentCode?: string;
  studentName?: string;
  performance: 'Poor' | 'Average' | 'Good' | 'Excellent';
  score: number;
  confidence: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  factors: Factor[];
  recommendations: PredictionRecommendation[];
  explanation: string;
  inputData: {
    attendance: number;
    studyHours: number;
    previousMarks: number;
    assignmentScore: number;
    internalMarks: number;
    previousGPA: number;
    participation: number;
    backlogs: number;
  };
  modelVersion: string;
  createdAt: string;
}

export interface Recommendation {
  _id: string;
  studentId: string;
  category: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedImpact: string;
  action: string;
  completed: boolean;
  createdAt: string;
}

export interface ScheduleItem {
  time: string;
  subject: string;
  duration: string;
  activity: string;
  focus: string;
}

export interface DayPlan {
  day: string;
  totalHours: number;
  schedule: ScheduleItem[];
}

export interface StudyPlan {
  _id: string;
  studentId: string;
  targetGPA: number;
  examDate?: string;
  availableHours: number;
  weakSubjects: string[];
  plan: DayPlan[];
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  userId?: string;
  roleTarget?: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: number[][];
  classes: string[];
  feature_importances: { name: string; importance: number }[];
}

export interface AnalyticsOverview {
  totalStudents: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  averageGPA: number;
  averageAttendance: number;
  averagePerformanceScore: number;
  averageStudyHours: number;
  recentPredictions: Prediction[];
  highRiskAlerts: Student[];
}
