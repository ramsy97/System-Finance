import { Router } from 'express';
import { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction, approveTransaction } from '../controllers/transaction.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createTransactionSchema } from '../utils/schemas';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);
router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.post('/', authorize('SUPER_ADMIN', 'FINANCE', 'ACCOUNTING'), validateBody(createTransactionSchema), auditLog('CREATE', 'Transaction'), createTransaction);
router.put('/:id', authorize('SUPER_ADMIN', 'FINANCE', 'ACCOUNTING'), auditLog('UPDATE', 'Transaction'), updateTransaction);
router.delete('/:id', authorize('SUPER_ADMIN'), auditLog('DELETE', 'Transaction'), deleteTransaction);
router.post('/:id/approve', authorize('SUPER_ADMIN', 'MANAGER'), auditLog('APPROVAL', 'Transaction'), approveTransaction);

export default router;
