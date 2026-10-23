import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import AppError from '../utils/app-error.js';

export function authenticate(req, res, next) {
  function unauthorized(message) {
    res.set('WWW-Authenticate', 'Bearer');
    return next(new AppError(message, 401));
  }

  const authHeader = req.get('Authorization');
  const match = authHeader?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return unauthorized('Sertakan Authorization: Bearer <token>');
  }

  let payload;

  try {
    payload = jwt.verify(match[1], jwtConfig.secret, {
      algorithms: [jwtConfig.algorithm],
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return unauthorized('Token sudah kedaluwarsa');
    }

    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.NotBeforeError
    ) {
      return unauthorized('Token tidak valid');
    }

    return next(error);
  }

  if (
    typeof payload !== 'object' ||
    payload === null ||
    typeof payload.sub !== 'string' ||
    typeof payload.exp !== 'number'
  ) {
    return unauthorized('Token tidak valid');
  }

  const userId = Number(payload.sub);

  if (!Number.isSafeInteger(userId) || userId < 1) {
    return unauthorized('Token tidak valid');
  }

  req.user = { id: userId };
  next();
}