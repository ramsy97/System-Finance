import { Router } from 'express';
import { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, approveInvoice, sendInvoice, recordPayment, getOverdueInvoices } from '../controllers/invoice.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createInvoiceSchema } from '../utils/schemas';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);
router.get('/', getInvoices);
router.get('/overdue', getOverdueInvoices);
router.get('/:id', getInvoice);
router.post('/', authorize('SUPER_ADMIN', 'FINANCE', 'ACCOUNTING'), validateBody(createInvoiceSchema), auditLog('CREATE', 'Invoice'), createInvoice);
router.put('/:id', authorize('SUPER_ADMIN', 'FINANCE', 'ACCOUNTING'), auditLog('UPDATE', 'Invoice'), updateInvoice);
router.delete('/:id', authorize('SUPER_ADMIN'), auditLog('DELETE', 'Invoice'), deleteInvoice);
router.post('/:id/approve', authorize('SUPER_ADMIN', 'MANAGER'), auditLog('APPROVAL', 'Invoice'), approveInvoice);
router.post('/:id/send', authorize('SUPER_ADMIN', 'FINANCE'), auditLog('SEND', 'Invoice'), sendInvoice);
router.post('/:id/payment', authorize('SUPER_ADMIN', 'FINANCE', 'ACCOUNTING'), auditLog('PAYMENT', 'Invoice'), recordPayment);

export default router;
