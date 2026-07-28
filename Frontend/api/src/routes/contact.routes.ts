import { Router } from 'express';
import { getContacts, getContact, createContact, updateContact, deleteContact } from '../controllers/contact.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createContactSchema, updateContactSchema } from '../utils/schemas';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);
router.get('/', getContacts);
router.get('/:id', getContact);
router.post('/', authorize('SUPER_ADMIN', 'FINANCE', 'ACCOUNTING'), validateBody(createContactSchema), auditLog('CREATE', 'Contact'), createContact);
router.put('/:id', authorize('SUPER_ADMIN', 'FINANCE', 'ACCOUNTING'), validateBody(updateContactSchema), auditLog('UPDATE', 'Contact'), updateContact);
router.delete('/:id', authorize('SUPER_ADMIN'), auditLog('DELETE', 'Contact'), deleteContact);

export default router;
