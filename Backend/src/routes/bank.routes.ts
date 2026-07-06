import { Router } from 'express';
import { getBankKasList, createBankKas, updateBankKas, getMutations, reconcileMutation } from '../controllers/bank.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);
router.get('/', getBankKasList);
router.post('/', authorize('SUPER_ADMIN', 'FINANCE', 'ACCOUNTING'), auditLog('CREATE', 'BankKas'), createBankKas);
router.put('/:id', authorize('SUPER_ADMIN', 'FINANCE', 'ACCOUNTING'), auditLog('UPDATE', 'BankKas'), updateBankKas);
router.get('/mutations', getMutations);
router.post('/mutations/:id/reconcile', authorize('SUPER_ADMIN', 'FINANCE', 'ACCOUNTING'), auditLog('RECONCILE', 'BankMutation'), reconcileMutation);

export default router;
