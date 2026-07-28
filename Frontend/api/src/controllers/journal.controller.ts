import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { success, created, paginated } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, generateJournalEntryNumber } from '../utils/helpers';

export async function getJournalEntries(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, limit } = parsePagination(req.query);
    const where: any = {};
    if (req.query.type) where.type = req.query.type;
    if (req.query.startDate || req.query.endDate) {
      where.date = {};
      if (req.query.startDate) where.date.gte = new Date(req.query.startDate as string);
      if (req.query.endDate) {
        const end = new Date(req.query.endDate as string);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }
    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where, skip, take, orderBy: { date: 'desc' },
        include: { items: { include: { account: { select: { id: true, code: true, name: true, type: true } } } } },
      }),
      prisma.journalEntry.count({ where }),
    ]);
    return paginated(res, entries, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function getJournalEntry(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            account: { select: { id: true, code: true, name: true, type: true } },
            contact: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
            department: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!entry) throw new AppError('Journal entry not found', 404);
    return success(res, entry);
  } catch (error) {
    next(error);
  }
}

export async function createJournalEntry(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { items, ...data } = req.body;

    const totalDebit = items.reduce((sum: number, item: any) => sum + item.debit, 0);
    const totalCredit = items.reduce((sum: number, item: any) => sum + item.credit, 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new AppError('Total debit must equal total credit', 400);
    }

    const entryNumber = generateJournalEntryNumber();
    const entry = await prisma.journalEntry.create({
      data: {
        ...data,
        entryNumber,
        date: new Date(data.date),
        isSystemGenerated: false,
        createdById: req.user!.id,
        items: { create: items.map((item: any) => ({ ...item, contactId: item.contactId || undefined, projectId: item.projectId || undefined, departmentId: item.departmentId || undefined })) },
      },
      include: { items: { include: { account: true } } },
    });

    for (const item of items) {
      await prisma.account.update({
        where: { id: item.accountId },
        data: { balance: { increment: item.debit - item.credit } },
      });
    }

    return created(res, entry, 'Journal entry created successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteJournalEntry(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });
    if (!entry) throw new AppError('Journal entry not found', 404);
    if (entry.isSystemGenerated) throw new AppError('Cannot delete system-generated journal entry', 400);

    for (const item of entry.items) {
      await prisma.account.update({
        where: { id: item.accountId },
        data: { balance: { increment: Number(item.credit) - Number(item.debit) } },
      });
    }

    await prisma.journalEntry.delete({ where: { id: req.params.id } });
    return success(res, null, 'Journal entry deleted successfully');
  } catch (error) {
    next(error);
  }
}
