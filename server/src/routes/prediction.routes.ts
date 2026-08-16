import { Router } from 'express';
import { runPrediction, getStudentPredictions, getModelMetrics } from '../controllers/prediction.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Public/authenticated model metrics
router.get('/metrics', getModelMetrics);

// Run prediction (Admin or Student)
router.post('/predict', authenticateJWT, runPrediction);

// Get historical predictions for a student
router.get('/:studentId', authenticateJWT, getStudentPredictions);

export default router;
