import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { success, created, paginated } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { parsePagination } from '../utils/helpers';

export async function getBankKasList(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const bankKas = await prisma.bankKas.findMany({
      include: { account: { select: { id: true, code: true, name: true, balance: true } }, _count: { select: { mutations: true } } },
    });
    return success(res, bankKas);
  } catch (error) {
    next(error);
  }
}

export async function createBankKas(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { accountId, bankName, accountNumber, holderName } = req.body;
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) throw new AppError('Account not found', 404);
    const bank = await prisma.bankKas.create({ data: { accountId, bankName, accountNumber, holderName } });
    return created(res, bank, 'Bank/Cash created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateBankKas(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const bank = await prisma.bankKas.update({ where: { id: req.params.id }, data: req.body });
    return success(res, bank, 'Bank/Cash updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function getMutations(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, limit } = parsePagination(req.query);
    const where: any = {};
    if (req.query.bankKasId) where.bankKasId = req.query.bankKasId;
    if (req.query.startDate || req.query.endDate) {
      where.date = {};
      if (req.query.startDate) where.date.gte = new Date(req.query.startDate as string);
      if (req.query.endDate) {
        const end = new Date(req.query.endDate as string);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }
    const [mutations, total] = await Promise.all([
      prisma.bankMutation.findMany({ where, skip, take, orderBy: { date: 'desc' }, include: { bankKas: { include: { account: true } }, transaction: true } }),
      prisma.bankMutation.count({ where }),
    ]);
    return paginated(res, mutations, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function reconcileMutation(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const mutation = await prisma.bankMutation.update({ where: { id: req.params.id }, data: { isReconciled: true } });
    return success(res, mutation, 'Mutation reconciled successfully');
  } catch (error) {
    next(error);
  }
}
