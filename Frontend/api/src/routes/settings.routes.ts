import { Router } from 'express';
import { getSettings, updateSettings, getProjects, createProject, getDepartments, createDepartment, getCategories, createCategory } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);
router.get('/', getSettings);
router.put('/', authorize('SUPER_ADMIN'), auditLog('UPDATE', 'Settings'), updateSettings);
router.get('/projects', getProjects);
router.post('/projects', authorize('SUPER_ADMIN'), auditLog('CREATE', 'Project'), createProject);
router.get('/departments', getDepartments);
router.post('/departments', authorize('SUPER_ADMIN'), auditLog('CREATE', 'Department'), createDepartment);
router.get('/categories', getCategories);
router.post('/categories', authorize('SUPER_ADMIN', 'ACCOUNTING'), auditLog('CREATE', 'Category'), createCategory);

export default router;
