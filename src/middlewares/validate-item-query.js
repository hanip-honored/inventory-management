import { z } from 'zod';
import AppError from '../utils/app-error.js';

const itemQuerySchema = z.strictObject({
  search: z
    .string({ error: 'Search harus berupa teks' })
    .trim()
    .max(150, { error: 'Search maksimal 150 karakter' })
    .default(''),

  page: z.coerce
    .number({ error: 'Page harus berupa angka' })
    .int({ error: 'Page harus bilangan bulat' })
    .min(1, { error: 'Page minimal 1' })
    .max(1000000, { error: 'Page maksimal 1000000' })
    .default(1),

  limit: z.coerce
    .number({ error: 'Limit harus berupa angka' })
    .int({ error: 'Limit harus bilangan bulat' })
    .min(1, { error: 'Limit minimal 1' })
    .max(100, { error: 'Limit maksimal 100' })
    .default(10),
});

export function validateItemQuery(req, res, next) {
  const result = itemQuerySchema.safeParse(req.query);

  if (!result.success) {
    return next(
      new AppError(result.error.issues[0].message, 400)
    );
  }

  req.validatedQuery = result.data;
  next();
}