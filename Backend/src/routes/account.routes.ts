import { Router } from 'express';
import { getAccounts, getAccount, createAccount, updateAccount, deleteAccount } from '../controllers/account.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createAccountSchema, updateAccountSchema } from '../utils/schemas';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);
router.get('/', getAccounts);
router.get('/:id', getAccount);
router.post('/', authorize('SUPER_ADMIN', 'ACCOUNTING'), validateBody(createAccountSchema), auditLog('CREATE', 'Account'), createAccount);
router.put('/:id', authorize('SUPER_ADMIN', 'ACCOUNTING'), validateBody(updateAccountSchema), auditLog('UPDATE', 'Account'), updateAccount);
router.delete('/:id', authorize('SUPER_ADMIN'), auditLog('DELETE', 'Account'), deleteAccount);

export default router;
