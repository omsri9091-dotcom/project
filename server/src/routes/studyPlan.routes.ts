import { Router } from 'express';
import { createStudyPlan, getStudyPlanByStudent } from '../controllers/studyPlan.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', createStudyPlan);
router.get('/:studentId', getStudyPlanByStudent);

export default router;
