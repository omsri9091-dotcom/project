import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  exportStudentsCSV,
} from '../controllers/student.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.use(authenticateJWT);

// CSV Export (Admin only)
router.get('/export/csv', requireAdmin, exportStudentsCSV);

// List all students (Admin only)
router.get('/', requireAdmin, getStudents);

// Get student by ID (Admin or the student themselves)
router.get('/:id', getStudentById);

// Add student (Admin only)
router.post('/', requireAdmin, createStudent);

// Update student (Admin only)
router.put('/:id', requireAdmin, updateStudent);

// Delete student (Admin only)
router.delete('/:id', requireAdmin, deleteStudent);

export default router;
