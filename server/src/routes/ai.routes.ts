import { Router } from 'express';
import { chatWithAssistant } from '../controllers/aiAssistant.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/chat', chatWithAssistant);

export default router;
