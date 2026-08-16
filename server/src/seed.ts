import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from './config/database';
import { ENV } from './config/env';
import { User } from './models/User';
import { Student } from './models/Student';
import { Prediction } from './models/Prediction';
import { Recommendation } from './models/Recommendation';
import { StudyPlan } from './models/StudyPlan';
import { Notification } from './models/Notification';

export const seedDatabase = async () => {
  try {
    console.log('[SEED] Clearing old database collections...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Prediction.deleteMany({}),
      Recommendation.deleteMany({}),
      StudyPlan.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash(ENV.DEMO_ADMIN_PASSWORD, salt);
    const studentPassword = await bcrypt.hash(ENV.DEMO_STUDENT_PASSWORD, salt);

    // 1. Create Admin Account
    console.log('[SEED] Creating Admin user...');
    const adminUser = await User.create({
      name: 'Dr. Vikramaditya Rao',
      email: 'admin@adexa.ai',
      password: adminPassword,
      role: 'ADMIN',
      department: 'Computer Science & Engineering',
      semester: 0,
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isActive: true,
    });

    // 2. Comprehensive Student Profiles
    const rawStudents = [
      // Highlighted Evaluator Demo Accounts
      {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@adexa.ai',
        studentId: 'ADX-1001',
        department: 'Computer Science',
        semester: 6,
        attendance: 96,
        studyHours: 6.5,
        previousMarks: 94,
        assignmentScore: 98,
        internalMarks: 95,
        previousGPA: 9.3,
        currentGPA: 9.5,
        participation: 9,
        backlogs: 0,
        persona: 'High Performer',
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@adexa.ai',
        studentId: 'ADX-1002',
        department: 'Information Technology',
        semester: 4,
        attendance: 82,
        studyHours: 4.0,
        previousMarks: 74,
        assignmentScore: 80,
        internalMarks: 76,
        previousGPA: 7.4,
        currentGPA: 7.6,
        participation: 7,
        backlogs: 0,
        persona: 'Average Performer',
      },
      {
        name: 'Amit Kumar',
        email: 'amit.kumar@adexa.ai',
        studentId: 'ADX-1003',
        department: 'Electronics & Communication',
        semester: 5,
        attendance: 68,
        studyHours: 2.5,
        previousMarks: 58,
        assignmentScore: 62,
        internalMarks: 56,
        previousGPA: 5.8,
        currentGPA: 5.9,
        participation: 5,
        backlogs: 1,
        persona: 'At-Risk Student',
      },
      {
        name: 'Neha Singh',
        email: 'neha.singh@adexa.ai',
        studentId: 'ADX-1004',
        department: 'Mechanical Engineering',
        semester: 3,
        attendance: 48,
        studyHours: 1.2,
        previousMarks: 42,
        assignmentScore: 45,
        internalMarks: 40,
        previousGPA: 4.2,
        currentGPA: 4.0,
        participation: 3,
        backlogs: 3,
        persona: 'Critical-Risk Student',
      },

      // Additional 28 diverse students across departments
      { name: 'Aarav Mehta', email: 'aarav.mehta@adexa.ai', studentId: 'ADX-1005', department: 'Computer Science', semester: 2, attendance: 92, studyHours: 5.5, previousMarks: 88, assignmentScore: 90, internalMarks: 89, previousGPA: 8.7, currentGPA: 8.9, participation: 8, backlogs: 0 },
      { name: 'Ananya Deshmukh', email: 'ananya.d@adexa.ai', studentId: 'ADX-1006', department: 'Artificial Intelligence', semester: 4, attendance: 88, studyHours: 5.0, previousMarks: 86, assignmentScore: 92, internalMarks: 84, previousGPA: 8.4, currentGPA: 8.6, participation: 8, backlogs: 0 },
      { name: 'Rohan Gupta', email: 'rohan.gupta@adexa.ai', studentId: 'ADX-1007', department: 'Information Technology', semester: 6, attendance: 71, studyHours: 2.8, previousMarks: 62, assignmentScore: 68, internalMarks: 64, previousGPA: 6.3, currentGPA: 6.4, participation: 6, backlogs: 1 },
      { name: 'Sneha Reddy', email: 'sneha.reddy@adexa.ai', studentId: 'ADX-1008', department: 'Electronics & Communication', semester: 4, attendance: 94, studyHours: 6.0, previousMarks: 91, assignmentScore: 95, internalMarks: 93, previousGPA: 9.1, currentGPA: 9.3, participation: 9, backlogs: 0 },
      { name: 'Vikram Joshi', email: 'vikram.joshi@adexa.ai', studentId: 'ADX-1009', department: 'Mechanical Engineering', semester: 5, attendance: 55, studyHours: 1.5, previousMarks: 49, assignmentScore: 52, internalMarks: 48, previousGPA: 4.8, currentGPA: 4.7, participation: 4, backlogs: 2 },
      { name: 'Kavita Verma', email: 'kavita.verma@adexa.ai', studentId: 'ADX-1010', department: 'Computer Science', semester: 8, attendance: 84, studyHours: 4.5, previousMarks: 79, assignmentScore: 85, internalMarks: 81, previousGPA: 7.9, currentGPA: 8.1, participation: 7, backlogs: 0 },
      { name: 'Siddharth Iyer', email: 'siddharth.i@adexa.ai', studentId: 'ADX-1011', department: 'Artificial Intelligence', semester: 6, attendance: 98, studyHours: 7.0, previousMarks: 96, assignmentScore: 99, internalMarks: 97, previousGPA: 9.6, currentGPA: 9.8, participation: 10, backlogs: 0 },
      { name: 'Tanvi Nair', email: 'tanvi.nair@adexa.ai', studentId: 'ADX-1012', department: 'Information Technology', semester: 3, attendance: 64, studyHours: 2.0, previousMarks: 54, assignmentScore: 59, internalMarks: 53, previousGPA: 5.5, currentGPA: 5.4, participation: 5, backlogs: 2 },
      { name: 'Arjun Das', email: 'arjun.das@adexa.ai', studentId: 'ADX-1013', department: 'Computer Science', semester: 5, attendance: 78, studyHours: 3.5, previousMarks: 72, assignmentScore: 76, internalMarks: 73, previousGPA: 7.1, currentGPA: 7.3, participation: 7, backlogs: 0 },
      { name: 'Ishaan Roy', email: 'ishaan.roy@adexa.ai', studentId: 'ADX-1014', department: 'Electronics & Communication', semester: 7, attendance: 52, studyHours: 1.0, previousMarks: 44, assignmentScore: 48, internalMarks: 42, previousGPA: 4.5, currentGPA: 4.3, participation: 3, backlogs: 4 },
      { name: 'Diya Sen', email: 'diya.sen@adexa.ai', studentId: 'ADX-1015', department: 'Data Science', semester: 4, attendance: 89, studyHours: 5.2, previousMarks: 85, assignmentScore: 88, internalMarks: 86, previousGPA: 8.3, currentGPA: 8.5, participation: 8, backlogs: 0 },
      { name: 'Varun Nair', email: 'varun.nair@adexa.ai', studentId: 'ADX-1016', department: 'Mechanical Engineering', semester: 6, attendance: 62, studyHours: 2.2, previousMarks: 56, assignmentScore: 60, internalMarks: 55, previousGPA: 5.7, currentGPA: 5.6, participation: 5, backlogs: 1 },
      { name: 'Meera Pillai', email: 'meera.pillai@adexa.ai', studentId: 'ADX-1017', department: 'Computer Science', semester: 7, attendance: 95, studyHours: 6.2, previousMarks: 93, assignmentScore: 96, internalMarks: 94, previousGPA: 9.2, currentGPA: 9.4, participation: 9, backlogs: 0 },
      { name: 'Aditya Bhatt', email: 'aditya.bhatt@adexa.ai', studentId: 'ADX-1018', department: 'Artificial Intelligence', semester: 3, attendance: 75, studyHours: 3.2, previousMarks: 69, assignmentScore: 73, internalMarks: 70, previousGPA: 6.9, currentGPA: 7.0, participation: 6, backlogs: 0 },
      { name: 'Pooja Hegde', email: 'pooja.hegde@adexa.ai', studentId: 'ADX-1019', department: 'Information Technology', semester: 5, attendance: 81, studyHours: 4.2, previousMarks: 77, assignmentScore: 82, internalMarks: 78, previousGPA: 7.6, currentGPA: 7.8, participation: 7, backlogs: 0 },
      { name: 'Karan Malhotra', email: 'karan.m@adexa.ai', studentId: 'ADX-1020', department: 'Electronics & Communication', semester: 2, attendance: 58, studyHours: 1.8, previousMarks: 51, assignmentScore: 54, internalMarks: 50, previousGPA: 5.2, currentGPA: 5.1, participation: 4, backlogs: 2 },
      { name: 'Ritu Banerjee', email: 'ritu.b@adexa.ai', studentId: 'ADX-1021', department: 'Data Science', semester: 6, attendance: 91, studyHours: 5.8, previousMarks: 89, assignmentScore: 93, internalMarks: 90, previousGPA: 8.8, currentGPA: 9.0, participation: 9, backlogs: 0 },
      { name: 'Manish Pandey', email: 'manish.p@adexa.ai', studentId: 'ADX-1022', department: 'Mechanical Engineering', semester: 4, attendance: 45, studyHours: 1.0, previousMarks: 38, assignmentScore: 42, internalMarks: 36, previousGPA: 3.9, currentGPA: 3.8, participation: 2, backlogs: 4 },
      { name: 'Deepika Rao', email: 'deepika.rao@adexa.ai', studentId: 'ADX-1023', department: 'Computer Science', semester: 3, attendance: 86, studyHours: 4.8, previousMarks: 82, assignmentScore: 87, internalMarks: 84, previousGPA: 8.1, currentGPA: 8.3, participation: 8, backlogs: 0 },
      { name: 'Abhishek Choudhury', email: 'abhishek.c@adexa.ai', studentId: 'ADX-1024', department: 'Information Technology', semester: 7, attendance: 73, studyHours: 3.0, previousMarks: 66, assignmentScore: 71, internalMarks: 67, previousGPA: 6.7, currentGPA: 6.8, participation: 6, backlogs: 0 },
      { name: 'Simran Kaur', email: 'simran.kaur@adexa.ai', studentId: 'ADX-1025', department: 'Artificial Intelligence', semester: 5, attendance: 93, studyHours: 6.0, previousMarks: 90, assignmentScore: 94, internalMarks: 92, previousGPA: 8.9, currentGPA: 9.1, participation: 9, backlogs: 0 },
      { name: 'Gaurav Sharma', email: 'gaurav.s@adexa.ai', studentId: 'ADX-1026', department: 'Electronics & Communication', semester: 6, attendance: 67, studyHours: 2.6, previousMarks: 60, assignmentScore: 65, internalMarks: 59, previousGPA: 6.1, currentGPA: 6.0, participation: 5, backlogs: 1 },
      { name: 'Ankita Saxena', email: 'ankita.s@adexa.ai', studentId: 'ADX-1027', department: 'Data Science', semester: 2, attendance: 87, studyHours: 5.0, previousMarks: 83, assignmentScore: 89, internalMarks: 85, previousGPA: 8.2, currentGPA: 8.4, participation: 8, backlogs: 0 },
      { name: 'Harsh Vardhan', email: 'harsh.v@adexa.ai', studentId: 'ADX-1028', department: 'Mechanical Engineering', semester: 8, attendance: 76, studyHours: 3.4, previousMarks: 70, assignmentScore: 75, internalMarks: 72, previousGPA: 7.0, currentGPA: 7.2, participation: 7, backlogs: 0 },
      { name: 'Shreya Ghosh', email: 'shreya.ghosh@adexa.ai', studentId: 'ADX-1029', department: 'Computer Science', semester: 4, attendance: 97, studyHours: 6.8, previousMarks: 95, assignmentScore: 98, internalMarks: 96, previousGPA: 9.5, currentGPA: 9.7, participation: 10, backlogs: 0 },
      { name: 'Nikhil Rathi', email: 'nikhil.rathi@adexa.ai', studentId: 'ADX-1030', department: 'Information Technology', semester: 5, attendance: 50, studyHours: 1.4, previousMarks: 46, assignmentScore: 50, internalMarks: 44, previousGPA: 4.6, currentGPA: 4.5, participation: 3, backlogs: 3 },
      { name: 'Bhavna Tiwari', email: 'bhavna.t@adexa.ai', studentId: 'ADX-1031', department: 'Artificial Intelligence', semester: 7, attendance: 85, studyHours: 4.6, previousMarks: 80, assignmentScore: 86, internalMarks: 82, previousGPA: 8.0, currentGPA: 8.2, participation: 7, backlogs: 0 },
      { name: 'Yashwardhan Singhania', email: 'yash.s@adexa.ai', studentId: 'ADX-1032', department: 'Data Science', semester: 3, attendance: 69, studyHours: 2.7, previousMarks: 63, assignmentScore: 67, internalMarks: 61, previousGPA: 6.2, currentGPA: 6.3, participation: 5, backlogs: 1 },
    ];

    console.log(`[SEED] Seeding ${rawStudents.length} student records and accounts...`);

    for (const raw of rawStudents) {
      // 1. Create User account for student
      const user = await User.create({
        name: raw.name,
        email: raw.email,
        password: studentPassword,
        role: 'STUDENT',
        studentId: raw.studentId,
        department: raw.department,
        semester: raw.semester,
        isActive: true,
      });

      // 2. Calculate composite performance score
      const rawScore =
        0.20 * raw.attendance +
        0.16 * (Math.min(raw.studyHours, 8.5) / 8.5 * 100) +
        0.22 * raw.previousMarks +
        0.14 * raw.assignmentScore +
        0.16 * raw.internalMarks +
        0.08 * (raw.previousGPA * 10) +
        0.04 * (raw.participation * 10) -
        4.0 * raw.backlogs;
      const perfScore = Math.round(Math.min(100, Math.max(0, rawScore)) * 10) / 10;

      let perfLevel: 'Poor' | 'Average' | 'Good' | 'Excellent' = 'Good';
      if (perfScore >= 80) perfLevel = 'Excellent';
      else if (perfScore >= 65) perfLevel = 'Good';
      else if (perfScore >= 50) perfLevel = 'Average';
      else perfLevel = 'Poor';

      let risk: 'Low' | 'Medium' | 'High' = 'Low';
      if (perfLevel === 'Poor' || raw.backlogs >= 2 || raw.attendance < 65) risk = 'High';
      else if (perfLevel === 'Average' || raw.attendance < 75 || raw.backlogs === 1) risk = 'Medium';

      // 3. Create Student profile document
      const student = await Student.create({
        userId: user._id,
        studentId: raw.studentId,
        name: raw.name,
        email: raw.email,
        department: raw.department,
        semester: raw.semester,
        attendance: raw.attendance,
        studyHours: raw.studyHours,
        previousMarks: raw.previousMarks,
        assignmentScore: raw.assignmentScore,
        internalMarks: raw.internalMarks,
        previousGPA: raw.previousGPA,
        participation: raw.participation,
        backlogs: raw.backlogs,
        currentGPA: raw.currentGPA,
        performanceScore: perfScore,
        performanceLevel: perfLevel,
        riskLevel: risk,
      });

      // 4. Create Historical AI Prediction
      const factors = [
        { name: 'Previous Marks', importance: 0.28, status: raw.previousMarks >= 70 ? 'Strong' : 'Needs Improvement', impact: 'Positive' },
        { name: 'Attendance', importance: 0.22, status: raw.attendance >= 75 ? 'Strong' : 'Needs Improvement', impact: raw.attendance >= 75 ? 'Positive' : 'Negative' },
        { name: 'Internal Marks', importance: 0.18, status: raw.internalMarks >= 70 ? 'Strong' : 'Needs Improvement', impact: 'Positive' },
        { name: 'Study Hours', importance: 0.14, status: raw.studyHours >= 3.5 ? 'Strong' : 'Needs Improvement', impact: 'Positive' },
        { name: 'Previous GPA', importance: 0.10, status: raw.previousGPA >= 7.0 ? 'Strong' : 'Moderate', impact: 'Positive' },
        { name: 'Assignment Score', importance: 0.05, status: raw.assignmentScore >= 75 ? 'Strong' : 'Moderate', impact: 'Positive' },
        { name: 'Backlogs', importance: 0.03, status: raw.backlogs === 0 ? 'Strong' : 'Needs Improvement', impact: raw.backlogs === 0 ? 'Positive' : 'Negative' },
      ];

      const recommendations = [];
      if (raw.attendance < 75) {
        recommendations.push({
          category: 'Attendance',
          title: 'Immediate Attendance Recovery',
          description: `Current attendance is ${raw.attendance}%. Attend all next 15 sessions to exceed 75% minimum institutional bar.`,
          priority: 'CRITICAL',
          expectedImpact: '+0.6 GPA & Eliminates Exam Restrictions',
          action: 'Ensure zero absences for the remaining module schedule.',
        });
      }
      if (raw.studyHours < 3.5) {
        recommendations.push({
          category: 'Study Habits',
          title: 'Structured Study Time Block',
          description: `Current daily self-study is ${raw.studyHours} hrs. Elevate to 4.0 hrs daily with focused Pomodoro intervals.`,
          priority: risk === 'High' ? 'HIGH' : 'MEDIUM',
          expectedImpact: '+12% Exam Performance Boost',
          action: 'Complete two 90-minute concentrated study blocks each evening.',
        });
      }
      if (raw.backlogs > 0) {
        recommendations.push({
          category: 'Backlogs',
          title: `Clear ${raw.backlogs} Pending Backlog(s)`,
          description: 'Resolve remaining backlog modules before final semester capstone prerequisites.',
          priority: 'CRITICAL',
          expectedImpact: 'Reclassifies Student Risk Level to Low',
          action: 'Enroll in remedial tutorial sessions and practice 5 years of past exam papers.',
        });
      }
      if (recommendations.length === 0 || perfLevel === 'Excellent') {
        recommendations.push({
          category: 'Excellence & Growth',
          title: 'Undergraduate Research & Capstone Mentorship',
          description: 'Outstanding performance across indicators. Transition into competitive programming and open source contributions.',
          priority: 'LOW',
          expectedImpact: 'Institutional Honors & Placement Excellence',
          action: 'Apply for summer research internships or faculty research collaboration.',
        });
      }

      await Prediction.create({
        studentId: student._id,
        studentCode: student.studentId,
        studentName: student.name,
        performance: perfLevel,
        score: perfScore,
        confidence: 0.89,
        riskLevel: risk,
        riskScore: risk === 'High' ? 72.0 : risk === 'Medium' ? 38.0 : 10.5,
        factors,
        recommendations,
        explanation: `ADEXA Random Forest diagnostic: ${perfLevel} (${perfScore}/100) with ${risk} Risk evaluated from multi-dimensional features.`,
        inputData: {
          attendance: raw.attendance,
          studyHours: raw.studyHours,
          previousMarks: raw.previousMarks,
          assignmentScore: raw.assignmentScore,
          internalMarks: raw.internalMarks,
          previousGPA: raw.previousGPA,
          participation: raw.participation,
          backlogs: raw.backlogs,
        },
        modelVersion: 'RF-v1.0.0',
      });

      // 5. Seed Recommendations
      for (const rec of recommendations) {
        await Recommendation.create({
          studentId: student._id,
          category: rec.category,
          title: rec.title,
          description: rec.description,
          priority: rec.priority as any,
          expectedImpact: rec.expectedImpact,
          action: rec.action,
          completed: false,
        });
      }

      // 6. Seed Personalized Study Plan
      const sampleSubjects = raw.department === 'Mechanical Engineering'
        ? ['Thermodynamics', 'Fluid Mechanics', 'Strength of Materials', 'Machine Design']
        : raw.department === 'Electronics & Communication'
        ? ['Signals & Systems', 'Digital Electronics', 'VLSI Design', 'Microprocessors']
        : ['Data Structures & Algorithms', 'Database Systems', 'Operating Systems', 'Computer Networks'];

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const planDays = days.map((day, idx) => ({
        day,
        totalHours: 4,
        schedule: [
          {
            time: '07:30 AM - 09:00 AM',
            subject: sampleSubjects[idx % sampleSubjects.length],
            duration: '1.5 Hours',
            activity: 'Core Concept Mastery & Lecture Note Review',
            focus: `Unit foundations and algorithmic proofs in ${sampleSubjects[idx % sampleSubjects.length]}`,
          },
          {
            time: '04:30 PM - 06:00 PM',
            subject: sampleSubjects[(idx + 1) % sampleSubjects.length],
            duration: '1.5 Hours',
            activity: 'Applied Problem Solving & Lab Exercises',
            focus: `Practice past 3 years university exam problems in ${sampleSubjects[(idx + 1) % sampleSubjects.length]}`,
          },
          {
            time: '08:30 PM - 09:30 PM',
            subject: 'Flashcard Recall & Spaced Repetition',
            duration: '1.0 Hour',
            activity: 'Timed Quiz & Error Log Review',
            focus: 'Definitions, formulas, key theorems, and diagnostic review',
          },
        ],
      }));

      await StudyPlan.create({
        studentId: student._id,
        targetGPA: Math.min(10, raw.currentGPA + 0.8),
        examDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        availableHours: 4,
        weakSubjects: sampleSubjects.slice(0, 2),
        plan: planDays,
        summary: `Adaptive weekly schedule targeting ${(raw.currentGPA + 0.8).toFixed(1)} GPA with structured review for ${sampleSubjects[0]} and ${sampleSubjects[1]}.`,
      });

      // 7. Seed Notifications
      await Notification.create({
        userId: user._id,
        title: '🌟 Welcome to ADEXA AI',
        message: 'Your academic intelligence portal is live. Explore your AI prediction, risk diagnostics, and study roadmap.',
        type: 'SUCCESS',
        link: '/student/dashboard',
        read: false,
      });

      if (risk === 'High') {
        await Notification.create({
          userId: user._id,
          title: '⚠️ Early Academic Risk Alert',
          message: 'Your predicted performance is below institutional benchmark. Please review your personalized recommendations.',
          type: 'CRITICAL',
          link: '/student/recommendations',
          read: false,
        });
      }
    }

    // Admin Notification
    await Notification.create({
      roleTarget: 'ADMIN',
      title: '📊 Semester Academic Analytics Computed',
      message: `System updated: ${rawStudents.length} student profiles analyzed. 5 students identified for targeted early intervention.`,
      type: 'INFO',
      link: '/admin/dashboard',
      read: false,
    });

    console.log('====================================================');
    console.log('✅ [SEED COMPLETE] Database seeded successfully!');
    console.log(`👤 Admin:   admin@adexa.ai        / ${ENV.DEMO_ADMIN_PASSWORD}`);
    console.log(`🎓 Demo 1:  rahul.sharma@adexa.ai (High Performer)   / ${ENV.DEMO_STUDENT_PASSWORD}`);
    console.log(`🎓 Demo 2:  priya.patel@adexa.ai  (Average)          / ${ENV.DEMO_STUDENT_PASSWORD}`);
    console.log(`🎓 Demo 3:  amit.kumar@adexa.ai   (At-Risk)          / ${ENV.DEMO_STUDENT_PASSWORD}`);
    console.log(`🎓 Demo 4:  neha.singh@adexa.ai   (Critical-Risk)    / ${ENV.DEMO_STUDENT_PASSWORD}`);
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// If run directly via `tsx src/seed.ts`
if (require.main === module) {
  (async () => {
    await connectDatabase();
    await seedDatabase();
    await disconnectDatabase();
    process.exit(0);
  })();
}
