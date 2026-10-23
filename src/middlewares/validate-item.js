import { z } from 'zod';
import AppError from '../utils/app-error.js';

const itemSchema = z.strictObject({
  name: z
    .string({ error: 'Nama wajib berupa teks' })
    .trim()
    .min(1, { error: 'Nama wajib diisi' })
    .max(150, { error: 'Nama maksimal 150 karakter' }),

  description: z
    .string({ error: 'Deskripsi harus berupa teks' })
    .trim()
    .max(2000, { error: 'Deskripsi maksimal 2000 karakter' })
    .default(''),

  stock: z
    .number({ error: 'Stok wajib berupa angka' })
    .int({ error: 'Stok harus bilangan bulat' })
    .min(0, { error: 'Stok tidak boleh negatif' })
    .max(2147483647, { error: 'Stok terlalu besar' }),

  price: z
    .union([z.number(), z.string()], {
      error: 'Harga wajib berupa angka atau teks desimal',
    })
    .transform((value) => String(value))
    .pipe(
      z.string().regex(
        /^(0|[1-9]\d{0,9})(\.\d{1,2})?$/,
        {
          error: 'Harga harus 0–9999999999.99 dengan maksimal 2 angka desimal',
        }
      )
    ),
});

export function validateItem(req, res, next) {
  const result = itemSchema.safeParse(req.body);

  if (!result.success) {
    return next(
      new AppError(result.error.issues[0].message, 400)
    );
  }

  req.body = result.data;
  next();
}