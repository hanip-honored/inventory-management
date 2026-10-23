import { z } from 'zod';
import AppError from '../utils/app-error.js';

const registerSchema = z.strictObject({
  email: z
    .string({ error: 'Email wajib berupa teks' })
    .trim()
    .max(254, { error: 'Email maksimal 254 karakter' })
    .pipe(z.email({ error: 'Format email tidak valid' })),

  password: z
    .string({ error: 'Password wajib berupa teks' })
    .min(8, { error: 'Password minimal 8 karakter' })
    .max(128, { error: 'Password maksimal 128 karakter' }),
});

export function validateRegister(req, res, next) {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return next(
      new AppError(result.error.issues[0].message, 400)
    );
  }

  req.body = result.data;
  next();
}