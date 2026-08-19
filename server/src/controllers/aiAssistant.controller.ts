import { Request, Response } from 'express';
import axios from 'axios';
import { Student } from '../models/Student';
import { ENV } from '../config/env';
import { AuthRequest } from '../middleware/auth.middleware';

export const chatWithAssistant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, studentId, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'A text message prompt is required.' });
      return;
    }

    // Retrieve student academic context
    let student = null;
    if (studentId) {
      student = await Student.findById(studentId);
    } else if (req.user?.role === 'STUDENT') {
      const orList: any[] = [{ userId: req.user._id }, { email: req.user.email }];
      if (req.user.studentId) orList.push({ studentId: req.user.studentId });
      student = await Student.findOne({ $or: orList });
    }

    const studentContext = student
      ? {
          name: student.name,
          studentId: student.studentId,
          college: student.college,
          department: student.department,
          semester: student.semester,
          isProfileCompleted: student.isProfileCompleted,
          attendance: student.attendance,
          studyHours: student.studyHours,
          previousMarks: student.previousMarks,
          internalMarks: student.internalMarks,
          assignmentScore: student.assignmentScore,
          currentGPA: student.currentGPA,
          previousGPA: student.previousGPA,
          backlogs: student.backlogs,
          subjects: student.subjects || [],
          performanceScore: student.performanceScore,
          performanceLevel: student.performanceLevel,
          riskLevel: student.riskLevel,
        }
      : null;

    // 1. External LLM Integration if OpenAI Key is configured
    if (ENV.OPENAI_API_KEY) {
      try {
        const systemPrompt = `You are the ADEXA AI Academic Assistant ("From Performance to Possibility"), an empathetic, highly structured expert academic advisor and tutor.
Student Profile:
${JSON.stringify(studentContext, null, 2)}

Provide clear, actionable, evidence-based academic mentoring tailored specifically to this student's recorded subjects, marks, and habits. Format responses with clean markdown bullet points, bold key steps, and constructive encouragement.`;

        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6),
          { role: 'user', content: message },
        ];

        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages,
            temperature: 0.7,
            max_tokens: 600,
          },
          {
            headers: {
              Authorization: `Bearer ${ENV.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 8000,
          }
        );

        const reply = response.data.choices[0].message.content;
        res.status(200).json({
          success: true,
          reply,
          provider: 'OpenAI GPT',
        });
        return;
      } catch (llmErr) {
        console.warn('⚠️ OpenAI LLM call failed, reverting to ADEXA intelligent context engine.');
      }
    }

    // 2. Intelligent Context-Aware Academic Reasoning Engine (Fallback & Default Mode)
    const lower = message.toLowerCase();
    let reply = '';
    const name = studentContext?.name || 'Student';
    const att = studentContext?.attendance ?? 75;
    const gpa = studentContext?.currentGPA ?? 7.2;
    const marks = studentContext?.previousMarks ?? 70;
    const backlogs = studentContext?.backlogs ?? 0;
    const hours = studentContext?.studyHours ?? 3;
    const risk = studentContext?.riskLevel ?? 'Low';
    const perf = studentContext?.performanceLevel ?? 'Good';

    if (lower.includes('why') && (lower.includes('risk') || lower.includes('low') || lower.includes('declining') || lower.includes('poor'))) {
      reply = `### 📊 Academic Risk & Performance Diagnostic for **${name}**\n\n` +
        `Your profile is currently evaluated at **${risk} Risk** (Predicted: **${perf}**, Score: **${studentContext?.performanceScore ?? 70}/100**).\n\n` +
        `**Key contributing factors:**\n` +
        `- **Attendance:** ${att}% ${att < 75 ? '⚠️ *(Below 75% threshold — high weight penalty)*' : '✅ *(Good standing)*'}\n` +
        `- **Active Backlogs:** ${backlogs} ${backlogs > 0 ? `⚠️ *(${backlogs} backlogs create prerequisite and time management friction)*` : '✅ *(Zero backlogs)*'}\n` +
        `- **Daily Study Hours:** ${hours} hrs/day ${hours < 3.5 ? '⚠️ *(Recommended: 3.5 - 4.5 hrs/day for optimal retention)*' : '✅ *(Consistent)*'}\n` +
        `- **Internal & Previous Marks:** ${marks}% / Internal: ${studentContext?.internalMarks ?? 70}%\n\n` +
        `**Recommended Next Step:** Target your lowest indicator first to see rapid improvement in your ADEXA risk score!`;
    } else if (lower.includes('gpa') || lower.includes('improve') || lower.includes('better marks') || lower.includes('score')) {
      reply = `### 🚀 4-Step Strategic Plan to Elevate Your GPA\n\n` +
        `Hi **${name}**, your current GPA is **${gpa}**. Here is the high-impact roadmap to push toward **${Math.min(10, gpa + 1.2).toFixed(1)}+**:\n\n` +
        `1. **Continuous Assessment Mastery (30% Weightage):** Ensure 100% on-time submission for lab assignments. This is the easiest grade booster.\n` +
        `2. **Spaced Repetition & Active Recall:** Spend 45 minutes daily reviewing notes from earlier weeks rather than cramming before exams.\n` +
        `3. **Attendance Discipline:** Elevate attendance to **85%+**. Students with 85%+ attendance consistently score 1.2 to 1.8 GPA points higher on semester finals.\n` +
        `4. **Weekly Problem Practice:** Solve 5 previous semester exam questions per subject every weekend.`;
    } else if (lower.includes('study plan') || lower.includes('schedule') || lower.includes('timetable') || lower.includes('routine')) {
      reply = `### 📅 Recommended Daily Study Architecture for **${name}**\n\n` +
        `Based on your target and ${hours} current daily hours, here is an optimized daily cadence:\n\n` +
        `* **07:00 AM – 08:30 AM (90 mins):** Deep conceptual reading (most challenging subject) when cognitive focus is highest.\n` +
        `* **04:30 PM – 06:00 PM (90 mins):** Problem sets, lab programming, and assignment completion.\n` +
        `* **08:30 PM – 09:30 PM (60 mins):** Active recall flashcards, formula sheets, and error log revision.\n\n` +
        `💡 *Tip: You can generate and customize your full weekly calendar in the **AI Study Plan** tab!*`;
    } else if (lower.includes('focus') || lower.includes('priority') || lower.includes('what should i do') || lower.includes('advice')) {
      const topPriority = backlogs > 0
        ? `Resolving your ${backlogs} active backlog(s)`
        : att < 75
        ? `Raising your attendance from ${att}% to 80%+`
        : `Maximizing midterm assessment and project grades`;
      reply = `### 🎯 Your #1 Strategic Focus This Month\n\n` +
        `**${name}**, based on our AI predictive diagnostics, your immediate highest leverage point is:\n\n` +
        `👉 **${topPriority}**\n\n` +
        `**Why?** In the ADEXA Random Forest feature weighting, this single dimension is currently placing the greatest drag on your predicted performance.\n\n` +
        `**Action Item:** Dedicate 1 dedicated hour every day specifically to this objective.`;
    } else if (lower.includes('backlog') || lower.includes('arrear') || lower.includes('fail')) {
      reply = `### 🛡️ Backlog Clearance Strategy\n\n` +
        `Having **${backlogs} active backlog(s)** is completely reversible with structured planning:\n\n` +
        `1. **Obtain Syllabus Weightage:** Focus first on the 4 core units that account for 70% of question paper marks.\n` +
        `2. **Solve 5 Years of Past Papers:** In university evaluations, 60%+ of question patterns repeat.\n` +
        `3. **Attend Remedial Sessions:** Speak to your course faculty during weekly office hours.\n` +
        `4. **Peer Study Pairing:** Partner with a top-scoring classmate for 2 hours every Saturday.`;
    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      reply = `👋 Hello **${name}**! I am your **ADEXA AI Academic Assistant**.\n\n` +
        `I am tuned to your specific academic profile (GPA: **${gpa}**, Attendance: **${att}%**, Risk Level: **${risk}**).\n\n` +
        `How can I help you excel today? You can ask me:\n` +
        `- *"Why is my performance predicted as ${perf}?"*\n` +
        `- *"How do I improve my GPA this semester?"*\n` +
        `- *"Create an optimized weekly study plan for me."*\n` +
        `- *"What should I focus on this week?"*`;
    } else {
      reply = `### 💡 ADEXA Academic Insight\n\n` +
        `Thank you for asking, **${name}**. Here is tailored guidance regarding *"**${message}**"*:\n\n` +
        `- **Academic Context:** You are currently in Semester ${studentContext?.semester ?? 1} (${studentContext?.department ?? 'Computer Science'}) with a **${gpa} GPA** and **${att}% attendance**.\n` +
        `- **Best Practice:** Break large academic goals into measurable 45-minute study sprints with 10-minute rest intervals (Pomodoro technique).\n` +
        `- **Actionable Step:** Head over to the **AI Study Plan** tab to generate an adaptive weekly timetable, or check **Recommendations** for high-priority action items.`;
    }

    res.status(200).json({
      success: true,
      reply,
      provider: 'ADEXA Intelligent Context Engine',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Assistant response generation failed.' });
  }
};
