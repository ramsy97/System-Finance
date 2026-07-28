import { Router } from 'express';
import { getTrialBalance, getIncomeStatement, getBalanceSheet, getCashFlow, getDashboardStats, getAuditLogs, getNotifications, markNotificationRead, exportReportPdf, exportReportExcel } from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/dashboard', getDashboardStats);
router.get('/trial-balance', getTrialBalance);
router.get('/income-statement', getIncomeStatement);
router.get('/balance-sheet', getBalanceSheet);
router.get('/cash-flow', getCashFlow);
router.get('/audit-logs', authorize('SUPER_ADMIN', 'MANAGER'), getAuditLogs);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.get('/export/:type/pdf', exportReportPdf);
router.get('/export/:type/excel', exportReportExcel);

export default router;
