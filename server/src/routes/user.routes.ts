import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  toggleUserStatus,
  deleteUser,
} from '../controllers/user.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.use(authenticateJWT);
router.use(requireAdmin);

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id/status', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;
