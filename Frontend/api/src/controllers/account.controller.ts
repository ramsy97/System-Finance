import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { success, created, paginated } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { parsePagination } from '../utils/helpers';

export async function getAccounts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, limit } = parsePagination(req.query);
    const where: any = {};
    if (req.query.type) where.type = req.query.type;
    if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      where.OR = [
        { name: { contains: req.query.search as string, mode: 'insensitive' } },
        { code: { contains: req.query.search as string, mode: 'insensitive' } },
      ];
    }
    const [accounts, total] = await Promise.all([
      prisma.account.findMany({ where, skip, take, orderBy: { code: 'asc' }, include: { bankKas: true, _count: { select: { transactions: true } } } }),
      prisma.account.count({ where }),
    ]);
    return paginated(res, accounts, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function getAccount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const account = await prisma.account.findUnique({
      where: { id: req.params.id },
      include: { bankKas: true, transactions: { take: 10, orderBy: { date: 'desc' } } },
    });
    if (!account) throw new AppError('Account not found', 404);
    return success(res, account);
  } catch (error) {
    next(error);
  }
}

export async function createAccount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { code, name, type, description, balance } = req.body;
    const existing = await prisma.account.findUnique({ where: { code } });
    if (existing) throw new AppError('Account code already exists', 409);
    const account = await prisma.account.create({
      data: { code, name, type, description, balance: balance || 0 },
    });
    return created(res, account, 'Account created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateAccount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, description, isActive } = req.body;
    const account = await prisma.account.update({
      where: { id: req.params.id },
      data: { ...(name && { name }), ...(description !== undefined && { description }), ...(isActive !== undefined && { isActive }) },
    });
    return success(res, account, 'Account updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const account = await prisma.account.findUnique({ where: { id } });
    if (account?.isSystem) throw new AppError('Cannot delete system account', 400);
    await prisma.account.update({ where: { id }, data: { isActive: false } });
    return success(res, null, 'Account deactivated successfully');
  } catch (error) {
    next(error);
  }
}
