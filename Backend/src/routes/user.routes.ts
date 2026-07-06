import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createUserSchema, updateUserSchema } from '../utils/schemas';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);
router.get('/', authorize('SUPER_ADMIN'), getUsers);
router.post('/', authorize('SUPER_ADMIN'), validateBody(createUserSchema), auditLog('CREATE', 'User'), createUser);
router.put('/:id', authorize('SUPER_ADMIN'), validateBody(updateUserSchema), auditLog('UPDATE', 'User'), updateUser);
router.delete('/:id', authorize('SUPER_ADMIN'), auditLog('DELETE', 'User'), deleteUser);

export default router;
