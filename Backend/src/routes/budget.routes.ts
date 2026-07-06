import { Router } from 'express';
import { getBudgets, createBudget, updateBudget, deleteBudget, getBudgetAnalytics } from '../controllers/budget.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createBudgetSchema } from '../utils/schemas';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);
router.get('/', getBudgets);
router.get('/analytics', getBudgetAnalytics);
router.post('/', authorize('SUPER_ADMIN', 'ACCOUNTING', 'MANAGER'), validateBody(createBudgetSchema), auditLog('CREATE', 'Budget'), createBudget);
router.put('/:id', authorize('SUPER_ADMIN', 'ACCOUNTING', 'MANAGER'), auditLog('UPDATE', 'Budget'), updateBudget);
router.delete('/:id', authorize('SUPER_ADMIN'), auditLog('DELETE', 'Budget'), deleteBudget);

export default router;
