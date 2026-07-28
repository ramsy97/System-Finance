import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { success, created, paginated } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { parsePagination } from '../utils/helpers';

export async function getContacts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, limit } = parsePagination(req.query);
    const where: any = {};
    if (req.query.type) where.type = req.query.type;
    if (req.query.search) {
      where.OR = [
        { name: { contains: req.query.search as string, mode: 'insensitive' } },
        { email: { contains: req.query.search as string, mode: 'insensitive' } },
        { phone: { contains: req.query.search as string } },
      ];
    }
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({ where, skip, take, orderBy: { name: 'asc' }, include: { _count: { select: { invoices: true, transactions: true } } } }),
      prisma.contact.count({ where }),
    ]);
    return paginated(res, contacts, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function getContact(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id },
      include: { invoices: { take: 10, orderBy: { date: 'desc' } }, transactions: { take: 10, orderBy: { date: 'desc' } } },
    });
    if (!contact) throw new AppError('Contact not found', 404);
    return success(res, contact);
  } catch (error) {
    next(error);
  }
}

export async function createContact(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const contact = await prisma.contact.create({ data: req.body });
    return created(res, contact, 'Contact created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateContact(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const contact = await prisma.contact.update({ where: { id: req.params.id }, data: req.body });
    return success(res, contact, 'Contact updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteContact(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.contact.update({ where: { id: req.params.id }, data: { isActive: false } });
    return success(res, null, 'Contact deactivated successfully');
  } catch (error) {
    next(error);
  }
}
