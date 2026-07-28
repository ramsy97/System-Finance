import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { success, created, paginated } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { parsePagination } from '../utils/helpers';

export async function getUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, limit } = parsePagination(req.query);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip, take,
        select: { id: true, email: true, name: true, role: true, isActive: true, twoFactorEnabled: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);
    return paginated(res, users, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email, password, name, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already in use', 409);
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: role || 'VIEWER' },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return created(res, user, 'User created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;
    if (email) {
      const existing = await prisma.user.findFirst({ where: { email, NOT: { id } } });
      if (existing) throw new AppError('Email already in use', 409);
    }
    const user = await prisma.user.update({
      where: { id },
      data: { ...(name && { name }), ...(email && { email }), ...(role && { role }), ...(isActive !== undefined && { isActive }) },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });
    return success(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (id === req.user!.id) throw new AppError('Cannot delete yourself', 400);
    await prisma.user.delete({ where: { id } });
    return success(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
}
