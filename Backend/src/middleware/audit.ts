import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../config/database';

export function auditLog(action: string, entity: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      if (req.user) {
        const entityId = req.params.id || body?.id || null;
        prisma.auditLog.create({
          data: {
            userId: req.user.id,
            userName: req.user.name,
            action,
            entity,
            entityId: entityId?.toString() || undefined,
            details: JSON.stringify({ method: req.method, path: req.originalUrl }),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || undefined,
          },
        }).catch((err) => console.error('Audit log error:', err));
      }
      return originalJson(body);
    };
    next();
  };
}
