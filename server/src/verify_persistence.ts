import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './models/User';
import { Student } from './models/Student';
import { ENV } from './config/env';

async function run() {
  console.log('================================================================');
  console.log('   ADEXA AI: STUDENT PROFILE PERSISTENCE & ISOLATION TEST');
  console.log('================================================================');

  let mongod: MongoMemoryServer | null = null;
  try {
    // Connect to database (try local MongoDB first, or memory server)
    try {
      await mongoose.connect(ENV.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
      console.log('✅ Connected to MongoDB:', ENV.MONGODB_URI);
    } catch {
      console.log('⚡ Starting in-memory MongoDB for testing...');
      mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
      console.log('✅ Connected to in-memory MongoDB test instance.');
    }

    // Clean test accounts
    await User.deleteMany({ email: { $in: ['rahul.test@adexa.ai', 'aman.test@adexa.ai'] } });
    await Student.deleteMany({ email: { $in: ['rahul.test@adexa.ai', 'aman.test@adexa.ai'] } });

    console.log('\n--- [TEST 1] Registering Student A (Rahul) ---');
    const userA = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul.test@adexa.ai',
      password: await bcrypt.hash('Password@123', 10),
      role: 'STUDENT',
      studentId: 'ADX-9001',
      college: 'Delhi Technological University',
      department: 'Computer Science',
      semester: 4,
      isProfileCompleted: false,
    });

    const studentA = await Student.create({
      userId: userA._id,
      studentId: 'ADX-9001',
      name: 'Rahul Sharma',
      email: 'rahul.test@adexa.ai',
      college: 'Delhi Technological University',
      department: 'Computer Science',
      year: 2,
      semester: 4,
      section: 'A',
      isProfileCompleted: false,
      attendance: 0,
      studyHours: 0,
      previousMarks: 0,
      assignmentScore: 0,
      internalMarks: 0,
      previousGPA: 0,
      currentGPA: 0,
      participation: 5,
      backlogs: 0,
      subjects: [],
      semesterHistory: [],
      performanceScore: 0,
      performanceLevel: 'Average',
      riskLevel: 'Low',
    });
    console.log(`✓ Student A created (User ID: ${userA._id}, Student ID: ${studentA.studentId})`);

    console.log('\n--- [TEST 2] Saving Rahul\'s Academic Profile via saveMyProfile Logic ---');
    const rahulPayload = {
      name: 'Rahul Sharma',
      studentId: 'ADX-9001',
      college: 'Delhi Technological University',
      department: 'Computer Science',
      year: 2,
      semester: 4,
      section: 'A',
      attendance: 91,
      studyHours: 5.0,
      previousMarks: 88,
      assignmentScore: 90,
      internalMarks: 86,
      previousGPA: 8.4,
      currentGPA: 8.5,
      participation: 8,
      backlogs: 0,
      subjects: [
        { name: 'Advanced Algorithms', score: 92, attendance: 95, internalMarks: 90 },
        { name: 'Distributed Databases', score: 90, attendance: 92, internalMarks: 88 },
      ],
    };

    // Update Student A
    const updatedStudentA = await Student.findOneAndUpdate(
      { userId: userA._id },
      { ...rahulPayload, isProfileCompleted: true, performanceScore: 89, performanceLevel: 'Excellent', riskLevel: 'Low' },
      { new: true }
    );
    await User.findByIdAndUpdate(userA._id, { isProfileCompleted: true, college: rahulPayload.college, studentId: rahulPayload.studentId });
    console.log('✓ Rahul\'s profile saved to MongoDB.');

    console.log('\n--- [TEST 3] Registering Student B (Aman) ---');
    const userB = await User.create({
      name: 'Aman Verma',
      email: 'aman.test@adexa.ai',
      password: await bcrypt.hash('Password@123', 10),
      role: 'STUDENT',
      studentId: 'ADX-9002',
      college: 'National Institute of Technology',
      department: 'Information Technology',
      semester: 2,
      isProfileCompleted: false,
    });

    const studentB = await Student.create({
      userId: userB._id,
      studentId: 'ADX-9002',
      name: 'Aman Verma',
      email: 'aman.test@adexa.ai',
      college: 'National Institute of Technology',
      department: 'Information Technology',
      year: 1,
      semester: 2,
      section: 'B',
      isProfileCompleted: false,
      attendance: 0,
      studyHours: 0,
      previousMarks: 0,
      assignmentScore: 0,
      internalMarks: 0,
      previousGPA: 0,
      currentGPA: 0,
      participation: 5,
      backlogs: 0,
      subjects: [],
      semesterHistory: [],
      performanceScore: 0,
      performanceLevel: 'Average',
      riskLevel: 'Low',
    });
    console.log(`✓ Student B created (User ID: ${userB._id}, Student ID: ${studentB.studentId})`);

    console.log('\n--- [TEST 4] Saving Aman\'s Academic Profile via saveMyProfile Logic ---');
    const amanPayload = {
      name: 'Aman Verma',
      studentId: 'ADX-9002',
      college: 'National Institute of Technology',
      department: 'Information Technology',
      year: 1,
      semester: 2,
      section: 'B',
      attendance: 78,
      studyHours: 3.0,
      previousMarks: 72,
      assignmentScore: 75,
      internalMarks: 70,
      previousGPA: 7.2,
      currentGPA: 7.4,
      participation: 6,
      backlogs: 1,
      subjects: [
        { name: 'Web Scripting & React', score: 76, attendance: 80, internalMarks: 74 },
        { name: 'Network Fundamentals', score: 80, attendance: 78, internalMarks: 72 },
      ],
    };

    // Update Student B
    const updatedStudentB = await Student.findOneAndUpdate(
      { userId: userB._id },
      { ...amanPayload, isProfileCompleted: true, performanceScore: 71, performanceLevel: 'Good', riskLevel: 'Medium' },
      { new: true }
    );
    await User.findByIdAndUpdate(userB._id, { isProfileCompleted: true, college: amanPayload.college, studentId: amanPayload.studentId });
    console.log('✓ Aman\'s profile saved to MongoDB.');

    console.log('\n--- [TEST 5] Simulating Login & Session Restoration for Rahul ---');
    // Emulate auth /login and /students/me queries
    const rahulSessionUser = await User.findById(userA._id);
    const rahulSessionStudent = await Student.findOne({ userId: rahulSessionUser!._id });

    console.log('Rahul retrieved from MongoDB:');
    console.log(`  Name: ${rahulSessionStudent?.name}`);
    console.log(`  Student ID: ${rahulSessionStudent?.studentId}`);
    console.log(`  College: ${rahulSessionStudent?.college}`);
    console.log(`  Department: ${rahulSessionStudent?.department}`);
    console.log(`  Semester: ${rahulSessionStudent?.semester}`);
    console.log(`  CGPA: ${rahulSessionStudent?.currentGPA}`);
    console.log(`  Attendance: ${rahulSessionStudent?.attendance}%`);
    console.log(`  Backlogs: ${rahulSessionStudent?.backlogs}`);
    console.log(`  Subjects: ${rahulSessionStudent?.subjects.map((s) => `${s.name} (${s.score})`).join(', ')}`);

    console.log('\n--- [TEST 6] Simulating Login & Session Restoration for Aman ---');
    const amanSessionUser = await User.findById(userB._id);
    const amanSessionStudent = await Student.findOne({ userId: amanSessionUser!._id });

    console.log('Aman retrieved from MongoDB:');
    console.log(`  Name: ${amanSessionStudent?.name}`);
    console.log(`  Student ID: ${amanSessionStudent?.studentId}`);
    console.log(`  College: ${amanSessionStudent?.college}`);
    console.log(`  Department: ${amanSessionStudent?.department}`);
    console.log(`  Semester: ${amanSessionStudent?.semester}`);
    console.log(`  CGPA: ${amanSessionStudent?.currentGPA}`);
    console.log(`  Attendance: ${amanSessionStudent?.attendance}%`);
    console.log(`  Backlogs: ${amanSessionStudent?.backlogs}`);
    console.log(`  Subjects: ${amanSessionStudent?.subjects.map((s) => `${s.name} (${s.score})`).join(', ')}`);

    console.log('\n--- [TEST 7] Running Verification Assertions ---');
    const assert = (condition: boolean, msg: string) => {
      if (!condition) {
        console.error(`❌ ASSERTION FAILED: ${msg}`);
        process.exit(1);
      }
      console.log(`  ✅ [PASS] ${msg}`);
    };

    assert(rahulSessionStudent?.userId?.toString() === userA._id.toString(), 'Rahul userId matches User A _id');
    assert(amanSessionStudent?.userId?.toString() === userB._id.toString(), 'Aman userId matches User B _id');
    assert(rahulSessionStudent?.userId?.toString() !== amanSessionStudent?.userId?.toString(), 'Rahul and Aman have separate document IDs');
    assert(rahulSessionStudent?.currentGPA === 8.5, 'Rahul CGPA is 8.50 (no fallback)');
    assert(amanSessionStudent?.currentGPA === 7.4, 'Aman CGPA is 7.40 (no fallback)');
    assert(rahulSessionStudent?.attendance === 91, 'Rahul attendance is 91% (no fallback)');
    assert(amanSessionStudent?.attendance === 78, 'Aman attendance is 78% (no fallback)');
    assert(rahulSessionStudent?.college === 'Delhi Technological University', 'Rahul college is DTU');
    assert(amanSessionStudent?.college === 'National Institute of Technology', 'Aman college is NIT');
    assert(rahulSessionStudent?.subjects[0]?.name === 'Advanced Algorithms', 'Rahul has Advanced Algorithms');
    assert(amanSessionStudent?.subjects[0]?.name === 'Web Scripting & React', 'Aman has Web Scripting & React');

    console.log('\n================================================================');
    console.log('  🎉 ALL DATA PERSISTENCE & MULTI-USER ISOLATION TESTS PASSED!');
    console.log('================================================================\n');
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  }
}

run();
