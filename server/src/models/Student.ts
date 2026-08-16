import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStudent extends Document {
  userId?: Types.ObjectId;
  studentId: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  attendance: number;
  studyHours: number;
  previousMarks: number;
  assignmentScore: number;
  internalMarks: number;
  previousGPA: number;
  participation: number;
  backlogs: number;
  currentGPA: number;
  performanceScore: number;
  performanceLevel: 'Poor' | 'Average' | 'Good' | 'Excellent';
  riskLevel: 'Low' | 'Medium' | 'High';
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
    studentId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, required: true, default: 'Computer Science' },
    semester: { type: Number, required: true, min: 1, max: 8, default: 1 },
    attendance: { type: Number, required: true, min: 0, max: 100, default: 75 },
    studyHours: { type: Number, required: true, min: 0, max: 24, default: 3 },
    previousMarks: { type: Number, required: true, min: 0, max: 100, default: 70 },
    assignmentScore: { type: Number, required: true, min: 0, max: 100, default: 75 },
    internalMarks: { type: Number, required: true, min: 0, max: 100, default: 70 },
    previousGPA: { type: Number, required: true, min: 0, max: 10, default: 7.0 },
    participation: { type: Number, required: true, min: 1, max: 10, default: 6 },
    backlogs: { type: Number, required: true, min: 0, max: 20, default: 0 },
    currentGPA: { type: Number, required: true, min: 0, max: 10, default: 7.2 },
    performanceScore: { type: Number, default: 70 },
    performanceLevel: {
      type: String,
      enum: ['Poor', 'Average', 'Good', 'Excellent'],
      default: 'Good',
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
