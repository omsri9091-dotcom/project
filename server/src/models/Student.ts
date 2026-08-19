import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubject {
  name: string;
  score: number;
  attendance?: number;
  internalMarks?: number;
}

export interface ISemesterRecord {
  semester: string;
  gpa: number;
  attendance: number;
}

export interface IStudent extends Document {
  userId?: Types.ObjectId;
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
  subjects: ISubject[];
  semesterHistory: ISemesterRecord[];
  performanceScore: number;
  performanceLevel: 'Poor' | 'Average' | 'Good' | 'Excellent';
  riskLevel: 'Low' | 'Medium' | 'High';
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    attendance: { type: Number, min: 0, max: 100, default: 80 },
    internalMarks: { type: Number, min: 0, max: 100, default: 75 },
  },
  { _id: false }
);

const SemesterRecordSchema = new Schema<ISemesterRecord>(
  {
    semester: { type: String, required: true },
    gpa: { type: Number, required: true, min: 0, max: 10 },
    attendance: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const StudentSchema = new Schema<IStudent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true, index: true },
    studentId: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    college: { type: String, default: '' },
    department: { type: String, required: true, default: 'Computer Science' },
    year: { type: Number, min: 1, max: 5, default: 1 },
    semester: { type: Number, required: true, min: 1, max: 8, default: 1 },
    section: { type: String, default: '' },
    isProfileCompleted: { type: Boolean, default: false, index: true },
    attendance: { type: Number, required: true, min: 0, max: 100, default: 0 },
    studyHours: { type: Number, required: true, min: 0, max: 24, default: 0 },
    previousMarks: { type: Number, required: true, min: 0, max: 100, default: 0 },
    assignmentScore: { type: Number, required: true, min: 0, max: 100, default: 0 },
    internalMarks: { type: Number, required: true, min: 0, max: 100, default: 0 },
    previousGPA: { type: Number, required: true, min: 0, max: 10, default: 0 },
    participation: { type: Number, required: true, min: 1, max: 10, default: 5 },
    backlogs: { type: Number, required: true, min: 0, max: 20, default: 0 },
    currentGPA: { type: Number, required: true, min: 0, max: 10, default: 0 },
    subjects: { type: [SubjectSchema], default: [] },
    semesterHistory: { type: [SemesterRecordSchema], default: [] },
    performanceScore: { type: Number, default: 0 },
    performanceLevel: {
      type: String,
      enum: ['Poor', 'Average', 'Good', 'Excellent'],
      default: 'Average',
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },
  },
  { timestamps: true }
);

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
