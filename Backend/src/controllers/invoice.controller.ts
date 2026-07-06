import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { success, created, paginated } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, generateInvoiceNumber } from '../utils/helpers';
import { InvoiceStatus, ApprovalStatus } from '@prisma/client';

export async function getInvoices(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, limit } = parsePagination(req.query);
    const where: any = {};
    if (req.query.type) where.type = req.query.type;
    if (req.query.status) where.status = req.query.status;
    if (req.query.contactId) where.contactId = req.query.contactId;
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
      where.OR = [
        { invoiceNumber: { contains: req.query.search as string, mode: 'insensitive' } },
        { contact: { name: { contains: req.query.search as string, mode: 'insensitive' } } },
      ];
    }
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where, skip, take, orderBy: { date: 'desc' },
        include: { contact: { select: { id: true, name: true, email: true } }, items: true, approvedBy: { select: { id: true, name: true } } },
      }),
      prisma.invoice.count({ where }),
    ]);
    return paginated(res, invoices, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function getInvoice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { contact: true, items: true, approvedBy: { select: { id: true, name: true } } },
    });
    if (!invoice) throw new AppError('Invoice not found', 404);
    return success(res, invoice);
  } catch (error) {
    next(error);
  }
}

export async function createInvoice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const settings = await prisma.companySettings.findUnique({ where: { id: 'default' } });
    const prefix = settings?.invoicePrefix || 'INV';
    const invoiceNumber = generateInvoiceNumber(prefix);
    const { items, ...data } = req.body;
    const invoice = await prisma.invoice.create({
      data: {
        ...data,
        invoiceNumber,
        date: new Date(data.date),
        dueDate: new Date(data.dueDate),
        remainingAmount: data.totalAmount - (data.amountPaid || 0),
        items: { create: items },
      },
      include: { contact: true, items: true },
    });
    return created(res, invoice, 'Invoice created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateInvoice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { items, ...data } = req.body;
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...data,
        ...(data.date && { date: new Date(data.date) }),
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
        ...(items && { items: { create: items } }),
      },
      include: { contact: true, items: true },
    });
    return success(res, invoice, 'Invoice updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteInvoice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.invoice.delete({ where: { id: req.params.id } });
    return success(res, null, 'Invoice deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function approveInvoice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) throw new AppError('Invalid approval status', 400);
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { approvalStatus: status as ApprovalStatus, approvedById: req.user!.id },
    });
    return success(res, invoice, `Invoice ${status.toLowerCase()} successfully`);
  } catch (error) {
    next(error);
  }
}

export async function sendInvoice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status: 'SENT' as InvoiceStatus },
    });
    return success(res, invoice, 'Invoice sent successfully');
  } catch (error) {
    next(error);
  }
}

export async function recordPayment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { amount, accountId, paymentMethod } = req.body;
    const invoice = await prisma.invoice.findUnique({ where: { id }, include: { contact: true } });
    if (!invoice) throw new AppError('Invoice not found', 404);

    const newAmountPaid = Number(invoice.amountPaid) + Number(amount);
    const remaining = Number(invoice.totalAmount) - newAmountPaid;
    const newStatus: InvoiceStatus = remaining <= 0 ? 'PAID' : 'PARTIALLY_PAID';

    const [updatedInvoice] = await Promise.all([
      prisma.invoice.update({
        where: { id },
        data: { amountPaid: newAmountPaid, remainingAmount: remaining, status: newStatus },
      }),
      prisma.transaction.create({
        data: {
          transactionNo: `PAY-${Date.now()}`,
          type: invoice.type === 'SALES' ? 'CASH_IN' : 'CASH_OUT',
          date: new Date(),
          amount,
          accountId,
          contactId: invoice.contactId,
          paymentMethod: paymentMethod || 'CASH',
          description: `Payment for invoice ${invoice.invoiceNumber}`,
          approvalStatus: 'APPROVED',
          createdById: req.user!.id,
          approvedById: req.user!.id,
        },
      }),
    ]);
    return success(res, updatedInvoice, 'Payment recorded successfully');
  } catch (error) {
    next(error);
  }
}

export async function getOverdueInvoices(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { dueDate: { lt: new Date() }, status: { in: ['SENT', 'PARTIALLY_PAID'] } },
      include: { contact: true },
      orderBy: { dueDate: 'asc' },
    });
    return success(res, invoices);
  } catch (error) {
    next(error);
  }
}
