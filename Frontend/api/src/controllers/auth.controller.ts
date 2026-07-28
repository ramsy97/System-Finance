import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import prisma from '../config/database';
import { config } from '../config';
import { AuthRequest } from '../middleware/auth';
import { success, created } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid email or password', 401);
    }
    if (!user.isActive) {
      throw new AppError('Account is disabled', 403);
    }

    await prisma.auditLog.create({
      data: { userId: user.id, userName: user.name, action: 'LOGIN', entity: 'Auth', ipAddress: req.ip, userAgent: req.headers['user-agent'] || undefined },
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any });

    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });

    return success(res, {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, twoFactorEnabled: user.twoFactorEnabled },
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true, isActive: true, twoFactorEnabled: true, createdAt: true },
    });
    return success(res, user);
  } catch (error) {
    next(error);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.user) {
      await prisma.auditLog.create({
        data: { userId: req.user.id, userName: req.user.name, action: 'LOGOUT', entity: 'Auth', ipAddress: req.ip, userAgent: req.headers['user-agent'] || undefined },
      });
    }
    res.clearCookie('token');
    return success(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
}

export async function setup2FA(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const secret = speakeasy.generateSecret({ name: `SistemKeuangan:${req.user!.email}` });
    await prisma.user.update({ where: { id: req.user!.id }, data: { twoFactorSecret: secret.base32 } });
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);
    return success(res, { secret: secret.base32, qrCodeUrl }, '2FA setup initiated');
  } catch (error) {
    next(error);
  }
}

export async function verify2FA(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.twoFactorSecret) throw new AppError('2FA not setup', 400);
    const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token });
    if (!verified) throw new AppError('Invalid token', 400);
    await prisma.user.update({ where: { id: req.user!.id }, data: { twoFactorEnabled: true } });
    return success(res, null, '2FA enabled successfully');
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      throw new AppError('Current password is incorrect', 400);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user!.id }, data: { password: hashedPassword } });
    return success(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
}
