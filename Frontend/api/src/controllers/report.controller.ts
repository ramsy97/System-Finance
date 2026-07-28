import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { success } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export async function getTrialBalance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    const accounts = await prisma.account.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } });
    const entries = accounts.map((a) => ({
      code: a.code, name: a.name, type: a.type,
      debitBalance: ['ASSET', 'EXPENSE'].includes(a.type) ? Number(a.balance) : 0,
      creditBalance: ['LIABILITY', 'EQUITY', 'REVENUE'].includes(a.type) ? Number(a.balance) : 0,
    }));
    const totalDebit = entries.reduce((s, e) => s + e.debitBalance, 0);
    const totalCredit = entries.reduce((s, e) => s + e.creditBalance, 0);
    return success(res, { entries, totalDebit, totalCredit, date: endDate });
  } catch (error) {
    next(error);
  }
}

export async function getIncomeStatement(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const revenues = await prisma.account.findMany({ where: { type: 'REVENUE', isActive: true } });
    const expenses = await prisma.account.findMany({ where: { type: 'EXPENSE', isActive: true } });

    const revenueTotal = revenues.reduce((s, a) => s + Number(a.balance), 0);
    const expenseTotal = expenses.reduce((s, a) => s + Number(a.balance), 0);
    const netIncome = revenueTotal - expenseTotal;

    return success(res, {
      period: { startDate, endDate },
      revenues: revenues.map((a) => ({ code: a.code, name: a.name, amount: Number(a.balance) })),
      totalRevenue: revenueTotal,
      expenses: expenses.map((a) => ({ code: a.code, name: a.name, amount: Number(a.balance) })),
      totalExpenses: expenseTotal,
      netIncome,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBalanceSheet(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const assets = await prisma.account.findMany({ where: { type: 'ASSET', isActive: true } });
    const liabilities = await prisma.account.findMany({ where: { type: 'LIABILITY', isActive: true } });
    const equities = await prisma.account.findMany({ where: { type: 'EQUITY', isActive: true } });

    const totalAssets = assets.reduce((s, a) => s + Number(a.balance), 0);
    const totalLiabilities = liabilities.reduce((s, a) => s + Number(a.balance), 0);
    const totalEquity = equities.reduce((s, a) => s + Number(a.balance), 0);

    return success(res, {
      asOfDate: new Date(),
      assets: assets.map((a) => ({ code: a.code, name: a.name, amount: Number(a.balance) })),
      totalAssets,
      liabilities: liabilities.map((a) => ({ code: a.code, name: a.name, amount: Number(a.balance) })),
      totalLiabilities,
      equities: equities.map((a) => ({ code: a.code, name: a.name, amount: Number(a.balance) })),
      totalEquity,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCashFlow(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const cashAccounts = await prisma.account.findMany({
      where: { OR: [{ code: { startsWith: '1' } }, { code: { startsWith: '111' } }], isActive: true },
      select: { id: true, code: true, name: true },
    });
    const cashAccountIds = cashAccounts.map((a) => a.id);
    if (cashAccountIds.length === 0) {
      const allAccounts = await prisma.account.findMany({ where: { isActive: true } });
      cashAccountIds.push(allAccounts[0]?.id || '');
    }

    const cashIn = await prisma.transaction.aggregate({
      where: { accountId: { in: cashAccountIds }, type: 'CASH_IN', date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    });
    const cashOut = await prisma.transaction.aggregate({
      where: { accountId: { in: cashAccountIds }, type: 'CASH_OUT', date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    });

    const inflow = Number(cashIn._sum.amount || 0);
    const outflow = Number(cashOut._sum.amount || 0);

    return success(res, {
      period: { startDate, endDate },
      cashIn: inflow,
      cashOut: outflow,
      netCashFlow: inflow - outflow,
      accounts: cashAccounts,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [totalRevenue, totalExpenses, pendingInvoices, accountCount, contactCount, recentTransactions, monthlyCashIn, monthlyCashOut, overdueInvoices, pendingApprovals] = await Promise.all([
      prisma.account.aggregate({ where: { type: 'REVENUE' }, _sum: { balance: true } }),
      prisma.account.aggregate({ where: { type: 'EXPENSE' }, _sum: { balance: true } }),
      prisma.invoice.count({ where: { status: { in: ['DRAFT', 'SENT'] } } }),
      prisma.account.count({ where: { isActive: true } }),
      prisma.contact.count({ where: { isActive: true } }),
      prisma.transaction.findMany({ take: 5, orderBy: { date: 'desc' }, include: { account: { select: { name: true } }, contact: { select: { name: true } } } }),
      prisma.transaction.aggregate({ where: { type: 'CASH_IN', date: { gte: monthStart, lte: monthEnd } }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { type: 'CASH_OUT', date: { gte: monthStart, lte: monthEnd } }, _sum: { amount: true } }),
      prisma.invoice.count({ where: { dueDate: { lt: now }, status: { in: ['SENT', 'PARTIALLY_PAID'] } } }),
      prisma.transaction.count({ where: { approvalStatus: 'PENDING' } }),
    ]);

    return success(res, {
      revenue: Number(totalRevenue._sum.balance || 0),
      expenses: Number(totalExpenses._sum.balance || 0),
      netIncome: Number(totalRevenue._sum.balance || 0) - Number(totalExpenses._sum.balance || 0),
      pendingInvoices,
      totalAccounts: accountCount,
      totalContacts: contactCount,
      monthlyCashIn: Number(monthlyCashIn._sum.amount || 0),
      monthlyCashOut: Number(monthlyCashOut._sum.amount || 0),
      overdueInvoices,
      pendingApprovals,
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || '20', 10)));
    const skip = (page - 1) * limit;
    const where: any = {};
    if (req.query.action) where.action = req.query.action;
    if (req.query.entity) where.entity = req.query.entity;
    if (req.query.userId) where.userId = req.query.userId;
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true, email: true } } } }),
      prisma.auditLog.count({ where }),
    ]);
    return success(res, { data: logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
}

export async function getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    return success(res, notifications);
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
    return success(res, null, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
}

export async function exportReportPdf(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { type } = req.params;
    const { generateReportPdf } = await import('../services/pdf.service');

    let title = '';
    let rows: any[] = [];
    let columns: string[] = [];

    switch (type) {
      case 'trial-balance': {
        title = 'Trial Balance';
        columns = ['Code', 'Account', 'Type', 'Debit', 'Credit'];
        const accounts = await prisma.account.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } });
        rows = accounts.map((a) => ({
          code: a.code,
          account: a.name,
          type: a.type,
          debit: ['ASSET', 'EXPENSE'].includes(a.type) ? `Rp ${Number(a.balance).toLocaleString('id-ID')}` : '-',
          credit: ['LIABILITY', 'EQUITY', 'REVENUE'].includes(a.type) ? `Rp ${Number(a.balance).toLocaleString('id-ID')}` : '-',
        }));
        break;
      }
      case 'income-statement': {
        title = 'Income Statement';
        columns = ['Type', 'Account', 'Amount'];
        const revenues = await prisma.account.findMany({ where: { type: 'REVENUE', isActive: true } });
        const expenses = await prisma.account.findMany({ where: { type: 'EXPENSE', isActive: true } });
        const totalRevenue = revenues.reduce((s, a) => s + Number(a.balance), 0);
        const totalExpenses = expenses.reduce((s, a) => s + Number(a.balance), 0);
        rows = [
          ...revenues.map((a) => ({ type: 'Revenue', account: a.name, amount: `Rp ${Number(a.balance).toLocaleString('id-ID')}` })),
          { type: '', account: 'Total Revenue', amount: `Rp ${totalRevenue.toLocaleString('id-ID')}` },
          ...expenses.map((a) => ({ type: 'Expense', account: a.name, amount: `Rp ${Number(a.balance).toLocaleString('id-ID')}` })),
          { type: '', account: 'Total Expenses', amount: `Rp ${totalExpenses.toLocaleString('id-ID')}` },
          { type: '', account: 'Net Income', amount: `Rp ${(totalRevenue - totalExpenses).toLocaleString('id-ID')}` },
        ];
        break;
      }
      case 'balance-sheet': {
        title = 'Balance Sheet';
        columns = ['Category', 'Account', 'Amount'];
        const assets = await prisma.account.findMany({ where: { type: 'ASSET', isActive: true } });
        const liabilities = await prisma.account.findMany({ where: { type: 'LIABILITY', isActive: true } });
        const equities = await prisma.account.findMany({ where: { type: 'EQUITY', isActive: true } });
        const totalAssets = assets.reduce((s, a) => s + Number(a.balance), 0);
        const totalLiabilities = liabilities.reduce((s, a) => s + Number(a.balance), 0);
        const totalEquity = equities.reduce((s, a) => s + Number(a.balance), 0);
        rows = [
          ...assets.map((a) => ({ category: 'Asset', account: a.name, amount: `Rp ${Number(a.balance).toLocaleString('id-ID')}` })),
          { category: '', account: 'Total Assets', amount: `Rp ${totalAssets.toLocaleString('id-ID')}` },
          ...liabilities.map((a) => ({ category: 'Liability', account: a.name, amount: `Rp ${Number(a.balance).toLocaleString('id-ID')}` })),
          { category: '', account: 'Total Liabilities', amount: `Rp ${totalLiabilities.toLocaleString('id-ID')}` },
          ...equities.map((a) => ({ category: 'Equity', account: a.name, amount: `Rp ${Number(a.balance).toLocaleString('id-ID')}` })),
          { category: '', account: 'Total Equity', amount: `Rp ${totalEquity.toLocaleString('id-ID')}` },
        ];
        break;
      }
      case 'cash-flow': {
        title = 'Cash Flow Statement';
        columns = ['Description', 'Amount'];
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().getFullYear(), 0, 1);
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
        endDate.setHours(23, 59, 59, 999);
        const cashAccounts = await prisma.account.findMany({ where: { OR: [{ code: { startsWith: '1' } }, { code: { startsWith: '111' } }], isActive: true }, select: { id: true } });
        const ids = cashAccounts.length > 0 ? cashAccounts.map((a) => a.id) : [(await prisma.account.findFirst({ where: { isActive: true } }))?.id || ''];
        const cashIn = await prisma.transaction.aggregate({ where: { accountId: { in: ids }, type: 'CASH_IN', date: { gte: startDate, lte: endDate } }, _sum: { amount: true } });
        const cashOut = await prisma.transaction.aggregate({ where: { accountId: { in: ids }, type: 'CASH_OUT', date: { gte: startDate, lte: endDate } }, _sum: { amount: true } });
        const inflow = Number(cashIn._sum.amount || 0);
        const outflow = Number(cashOut._sum.amount || 0);
        rows = [
          { description: 'Cash Inflow', amount: `Rp ${inflow.toLocaleString('id-ID')}` },
          { description: 'Cash Outflow', amount: `Rp ${outflow.toLocaleString('id-ID')}` },
          { description: 'Net Cash Flow', amount: `Rp ${(inflow - outflow).toLocaleString('id-ID')}` },
        ];
        break;
      }
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    const pdfBuffer = await generateReportPdf(title, rows, columns);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

export async function exportReportExcel(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { type } = req.params;
    const { generateExcel } = await import('../services/report.service');

    let title = '';
    let rows: any[] = [];

    switch (type) {
      case 'trial-balance': {
        title = 'Trial Balance';
        const accounts = await prisma.account.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } });
        rows = accounts.map((a) => ({
          Code: a.code,
          Account: a.name,
          Type: a.type,
          Debit: ['ASSET', 'EXPENSE'].includes(a.type) ? Number(a.balance) : 0,
          Credit: ['LIABILITY', 'EQUITY', 'REVENUE'].includes(a.type) ? Number(a.balance) : 0,
        }));
        break;
      }
      case 'income-statement': {
        title = 'Income Statement';
        const revenues = await prisma.account.findMany({ where: { type: 'REVENUE', isActive: true } });
        const expenses = await prisma.account.findMany({ where: { type: 'EXPENSE', isActive: true } });
        rows = [
          ...revenues.map((a) => ({ Type: 'REVENUE', Account: a.name, Amount: Number(a.balance) })),
          ...expenses.map((a) => ({ Type: 'EXPENSE', Account: a.name, Amount: Number(a.balance) })),
        ];
        break;
      }
      case 'balance-sheet': {
        title = 'Balance Sheet';
        const assets = await prisma.account.findMany({ where: { type: 'ASSET', isActive: true } });
        const liabilities = await prisma.account.findMany({ where: { type: 'LIABILITY', isActive: true } });
        const equities = await prisma.account.findMany({ where: { type: 'EQUITY', isActive: true } });
        rows = [
          ...assets.map((a) => ({ Category: 'ASSET', Account: a.name, Amount: Number(a.balance) })),
          ...liabilities.map((a) => ({ Category: 'LIABILITY', Account: a.name, Amount: Number(a.balance) })),
          ...equities.map((a) => ({ Category: 'EQUITY', Account: a.name, Amount: Number(a.balance) })),
        ];
        break;
      }
      case 'cash-flow': {
        title = 'Cash Flow';
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().getFullYear(), 0, 1);
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
        endDate.setHours(23, 59, 59, 999);
        const cashAccounts = await prisma.account.findMany({ where: { OR: [{ code: { startsWith: '1' } }, { code: { startsWith: '111' } }], isActive: true }, select: { id: true } });
        const ids = cashAccounts.length > 0 ? cashAccounts.map((a) => a.id) : [(await prisma.account.findFirst({ where: { isActive: true } }))?.id || ''];
        const cashIn = await prisma.transaction.aggregate({ where: { accountId: { in: ids }, type: 'CASH_IN', date: { gte: startDate, lte: endDate } }, _sum: { amount: true } });
        const cashOut = await prisma.transaction.aggregate({ where: { accountId: { in: ids }, type: 'CASH_OUT', date: { gte: startDate, lte: endDate } }, _sum: { amount: true } });
        const cashInflow = Number(cashIn._sum.amount || 0);
        const cashOutflow = Number(cashOut._sum.amount || 0);
        rows = [
          { Description: 'Cash Inflow', Amount: cashInflow },
          { Description: 'Cash Outflow', Amount: cashOutflow },
          { Description: 'Net Cash Flow', Amount: cashInflow - cashOutflow },
        ];
        break;
      }
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    const excelBuffer = generateExcel(rows, title);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${Date.now()}.xlsx"`);
    res.send(excelBuffer);
  } catch (error) {
    next(error);
  }
}
