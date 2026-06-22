import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type Source = 'body' | 'query' | 'params';

export const validate = (schema: ZodSchema, source: Source = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }
    // Attach parsed + coerced data back to request
    req[source] = result.data as any;
    next();
  };
};
