import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import predictionRoutes from './routes/prediction.routes';
import recommendationRoutes from './routes/recommendation.routes';
import studyPlanRoutes from './routes/studyPlan.routes';
import analyticsRoutes from './routes/analytics.routes';
import notificationRoutes from './routes/notification.routes';
import aiRoutes from './routes/ai.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/errorHandler.middleware';

const app: Application = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_ORIGIN || 'https://adexa-ai-new.vercel.app,http://localhost:5173,http://localhost:5500,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Global Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      const isADEXAVercelDeployment = /^https:\/\/adexa-ai(?:-new)?(?:-[a-z0-9]+-omsri9091-dotcoms-projects)?\.vercel\.app$/i.test(origin || '');
      if (!origin || allowedOrigins.includes(origin) || isADEXAVercelDeployment) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'ADEXA AI Node.js Backend REST API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// Centralized Safe Error Handler
app.use(errorHandler);

export default app;
