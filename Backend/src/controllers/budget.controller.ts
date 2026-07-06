import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { success, created, paginated } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { parsePagination } from '../utils/helpers';

export async function getBudgets(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, limit } = parsePagination(req.query);
    const where: any = {};
    if (req.query.year) where.year = parseInt(req.query.year as string);
    if (req.query.categoryId) where.categoryId = req.query.categoryId;
    if (req.query.departmentId) where.departmentId = req.query.departmentId;
    if (req.query.projectId) where.projectId = req.query.projectId;
    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({ where, skip, take, orderBy: [{ year: 'desc' }, { month: 'asc' }], include: { category: true, department: true, project: true } }),
      prisma.budget.count({ where }),
    ]);
    return paginated(res, budgets, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function createBudget(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const budget = await prisma.budget.create({ data: req.body, include: { category: true } });
    return created(res, budget, 'Budget created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateBudget(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const budget = await prisma.budget.update({ where: { id: req.params.id }, data: req.body, include: { category: true } });
    return success(res, budget, 'Budget updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteBudget(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.budget.delete({ where: { id: req.params.id } });
    return success(res, null, 'Budget deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function getBudgetAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const budgets = await prisma.budget.findMany({
      where: { year },
      include: { category: true, department: true },
    });
    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent), 0);
    const usagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    return success(res, { budgets, summary: { totalBudget, totalSpent, usagePercentage, budgetCount: budgets.length } });
  } catch (error) {
    next(error);
  }
}
