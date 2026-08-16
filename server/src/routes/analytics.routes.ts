import { Router } from 'express';
import {
  getOverview,
  getPerformanceAnalytics,
  getRiskAnalytics,
} from '../controllers/analytics.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.use(authenticateJWT);
router.use(requireAdmin);

router.get('/overview', getOverview);
router.get('/performance', getPerformanceAnalytics);
router.get('/risk', getRiskAnalytics);

export default router;
