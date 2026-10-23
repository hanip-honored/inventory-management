import { z } from 'zod';
import AppError from '../utils/app-error.js';

const itemIdSchema = z.string()
  .regex(/^[1-9]\d*$/, {
    error: 'ID barang harus bilangan bulat positif',
  })
  .transform(Number)
  .pipe(
    z.number().int().max(2147483647, {
      error: 'ID barang terlalu besar',
    })
  );

export function validateItemId(req, res, next) {
  const result = itemIdSchema.safeParse(req.params.id);

  if (!result.success) {
    return next(
      new AppError(result.error.issues[0].message, 400)
    );
  }

  req.itemId = result.data;
  next();
}