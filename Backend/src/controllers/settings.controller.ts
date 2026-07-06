import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { success } from '../utils/response';

export async function getSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let settings = await prisma.companySettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.companySettings.create({ data: { id: 'default' } });
    }
    return success(res, settings);
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const settings = await prisma.companySettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...req.body },
      update: req.body,
    });
    return success(res, settings, 'Settings updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function getProjects(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projects = await prisma.project.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { transactions: true } } } });
    return success(res, projects);
  } catch (error) {
    next(error);
  }
}

export async function createProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const project = await prisma.project.create({ data: req.body });
    return success(res, project, 'Project created successfully');
  } catch (error) {
    next(error);
  }
}

export async function getDepartments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    return success(res, departments);
  } catch (error) {
    next(error);
  }
}

export async function createDepartment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const department = await prisma.department.create({ data: req.body });
    return success(res, department, 'Department created successfully');
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return success(res, categories);
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const category = await prisma.category.create({ data: req.body });
    return success(res, category, 'Category created successfully');
  } catch (error) {
    next(error);
  }
}
