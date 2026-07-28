import { Response } from 'express';

export function success(res: Response, data: any, message: string = 'Success', statusCode: number = 200) {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
}

export function paginated(res: Response, data: any[], total: number, page: number, limit: number) {
  return res.status(200).json({
    status: 'success',
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export function created(res: Response, data: any, message: string = 'Created successfully') {
  return success(res, data, message, 201);
}
