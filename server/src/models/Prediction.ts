import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFactor {
  name: string;
  importance: number;
  status: string;
  impact: string;
}

export interface IPredictionRecommendation {
  category: string;
  title: string;
  description: string;
  priority: string;
  expectedImpact: string;
  action: string;
}

export interface IPrediction extends Document {
  studentId: Types.ObjectId;
  studentCode?: string;
  studentName?: string;
  performance: 'Poor' | 'Average' | 'Good' | 'Excellent';
  score: number;
  confidence: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  factors: IFactor[];
  recommendations: IPredictionRecommendation[];
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
  createdAt: Date;
  updatedAt: Date;
}

const PredictionSchema = new Schema<IPrediction>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    studentCode: { type: String },
    studentName: { type: String },
    performance: {
      type: String,
      enum: ['Poor', 'Average', 'Good', 'Excellent'],
      required: true,
    },
    score: { type: Number, required: true },
    confidence: { type: Number, required: true },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    riskScore: { type: Number, default: 0 },
    factors: [
      {
        name: { type: String },
        importance: { type: Number },
        status: { type: String },
        impact: { type: String },
      },
    ],
    recommendations: [
      {
        category: { type: String },
        title: { type: String },
        description: { type: String },
        priority: { type: String },
        expectedImpact: { type: String },
        action: { type: String },
      },
    ],
    explanation: { type: String },
    inputData: {
      attendance: Number,
      studyHours: Number,
      previousMarks: Number,
      assignmentScore: Number,
      internalMarks: Number,
      previousGPA: Number,
      participation: Number,
      backlogs: Number,
    },
    modelVersion: { type: String, default: 'RF-v1.0.0' },
  },
  { timestamps: true }
);

export const Prediction = mongoose.model<IPrediction>('Prediction', PredictionSchema);
