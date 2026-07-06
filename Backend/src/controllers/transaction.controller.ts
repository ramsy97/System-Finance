import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { success, created, paginated } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, generateTransactionNumber } from '../utils/helpers';
import { ApprovalStatus } from '@prisma/client';

export async function getTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, limit } = parsePagination(req.query);
    const where: any = {};
    if (req.query.type) where.type = req.query.type;
    if (req.query.accountId) where.accountId = req.query.accountId;
    if (req.query.categoryId) where.categoryId = req.query.categoryId;
    if (req.query.contactId) where.contactId = req.query.contactId;
    if (req.query.projectId) where.projectId = req.query.projectId;
    if (req.query.departmentId) where.departmentId = req.query.departmentId;
    if (req.query.approvalStatus) where.approvalStatus = req.query.approvalStatus;
    if (req.query.startDate || req.query.endDate) {
      where.date = {};
      if (req.query.startDate) where.date.gte = new Date(req.query.startDate as string);
      if (req.query.endDate) {
        const end = new Date(req.query.endDate as string);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }
    if (req.query.search) {
      where.OR = [{ transactionNo: { contains: req.query.search as string, mode: 'insensitive' } }, { description: { contains: req.query.search as string, mode: 'insensitive' } }];
    }
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where, skip, take, orderBy: { date: 'desc' },
        include: {
          account: { select: { id: true, code: true, name: true } },
          targetAccount: { select: { id: true, code: true, name: true } },
          category: { select: { id: true, name: true } },
          contact: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
          approvedBy: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);
    return paginated(res, transactions, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function getTransaction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: {
        account: true, targetAccount: true, category: true, contact: true, project: true, department: true,
        approvedBy: { select: { id: true, name: true } }, createdBy: { select: { id: true, name: true } },
        mutations: { include: { bankKas: true } },
      },
    });
    if (!transaction) throw new AppError('Transaction not found', 404);
    return success(res, transaction);
  } catch (error) {
    next(error);
  }
}

export async function createTransaction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const transactionNo = generateTransactionNumber();
    const data = { ...req.body, date: new Date(req.body.date), transactionNo, createdById: req.user!.id };
    const transaction = await prisma.transaction.create({
      data,
      include: { account: true, category: true, contact: true },
    });
    if (data.accountId && data.type !== 'TRANSFER') {
      const balanceChange = data.type === 'CASH_IN' ? data.amount : -data.amount;
      await prisma.account.update({ where: { id: data.accountId }, data: { balance: { increment: balanceChange } } });
    }
    if (data.type === 'TRANSFER' && data.targetAccountId) {
      await prisma.account.update({ where: { id: data.accountId }, data: { balance: { decrement: data.amount } } });
      await prisma.account.update({ where: { id: data.targetAccountId }, data: { balance: { increment: data.amount } } });
    }
    return created(res, transaction, 'Transaction created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateTransaction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = { ...req.body, ...(req.body.date && { date: new Date(req.body.date) }) };
    const transaction = await prisma.transaction.update({ where: { id }, data });
    return success(res, transaction, 'Transaction updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteTransaction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!transaction) throw new AppError('Transaction not found', 404);
    await prisma.transaction.delete({ where: { id: req.params.id } });
    if (transaction.type !== 'TRANSFER') {
      const balanceChange = transaction.type === 'CASH_IN' ? -transaction.amount : transaction.amount;
      await prisma.account.update({ where: { id: transaction.accountId }, data: { balance: { increment: balanceChange } } });
    }
    return success(res, null, 'Transaction deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function approveTransaction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) throw new AppError('Invalid approval status', 400);
    const transaction = await prisma.transaction.update({
      where: { id },
      data: { approvalStatus: status as ApprovalStatus, approvedById: req.user!.id },
    });
    return success(res, transaction, `Transaction ${status.toLowerCase()} successfully`);
  } catch (error) {
    next(error);
  }
}
