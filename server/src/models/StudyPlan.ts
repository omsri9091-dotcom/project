import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IScheduleItem {
  time: string;
  subject: string;
  duration: string;
  activity: string;
  focus: string;
}

export interface IDayPlan {
  day: string;
  totalHours: number;
  schedule: IScheduleItem[];
}

export interface IStudyPlan extends Document {
  studentId: Types.ObjectId;
  targetGPA: number;
  examDate?: Date;
  availableHours: number;
  weakSubjects: string[];
  plan: IDayPlan[];
  summary: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudyPlanSchema = new Schema<IStudyPlan>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    targetGPA: { type: Number, required: true, default: 8.5 },
    examDate: { type: Date },
    availableHours: { type: Number, required: true, default: 4 },
    weakSubjects: [{ type: String }],
    plan: [
      {
        day: { type: String, required: true },
        totalHours: { type: Number, default: 3 },
        schedule: [
          {
            time: { type: String },
            subject: { type: String },
            duration: { type: String },
            activity: { type: String },
            focus: { type: String },
          },
        ],
      },
    ],
    summary: { type: String },
  },
  { timestamps: true }
);

export const StudyPlan = mongoose.model<IStudyPlan>('StudyPlan', StudyPlanSchema);
