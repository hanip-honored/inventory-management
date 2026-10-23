const secret = process.env.JWT_SECRET;

if (!secret || secret.length < 32) {
  throw new Error('JWT_SECRET wajib diisi minimal 32 karakter');
}

export const jwtConfig = {
  secret,
  algorithm: 'HS256',
  expiresIn: 3600,
};