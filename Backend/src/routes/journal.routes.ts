import { Router } from 'express';
import { getJournalEntries, getJournalEntry, createJournalEntry, deleteJournalEntry } from '../controllers/journal.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createJournalEntrySchema } from '../utils/schemas';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);
router.get('/', getJournalEntries);
router.get('/:id', getJournalEntry);
router.post('/', authorize('SUPER_ADMIN', 'ACCOUNTING'), validateBody(createJournalEntrySchema), auditLog('CREATE', 'JournalEntry'), createJournalEntry);
router.delete('/:id', authorize('SUPER_ADMIN'), auditLog('DELETE', 'JournalEntry'), deleteJournalEntry);

export default router;
