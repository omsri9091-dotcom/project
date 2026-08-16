import { Router } from 'express';
import {
  generateRecommendations,
  getRecommendationsByStudent,
  toggleRecommendationStatus,
} from '../controllers/recommendation.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/generate', generateRecommendations);
router.get('/:studentId', getRecommendationsByStudent);
router.put('/:id/toggle', toggleRecommendationStatus);

export default router;
