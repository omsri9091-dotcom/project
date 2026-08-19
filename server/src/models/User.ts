import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'STUDENT';
  studentId?: string;
  college?: string;
  department?: string;
  semester?: number;
  profileImage?: string;
  isProfileCompleted: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'STUDENT'], default: 'STUDENT' },
    studentId: { type: String, trim: true, unique: true, sparse: true },
    college: { type: String, default: '' },
    department: { type: String, default: 'Computer Science' },
    semester: { type: Number, default: 1 },
    profileImage: { type: String, default: '' },
    isProfileCompleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
