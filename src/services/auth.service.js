import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import AppError from '../utils/app-error.js';
import { jwtConfig } from '../config/jwt.js';
import {
  createUser,
  findUserByEmail,
} from '../repositories/user.repository.js';

export async function registerUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  try {
    const user = await createUser({
      email: normalizedEmail,
      passwordHash,
    });

    return user;
  } catch (error) {
    if (
      error.code === '23505' &&
      error.constraint === 'users_email_key'
    ) {
      throw new AppError('Email sudah terdaftar', 409);
    }

    throw error;
  }
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new AppError('Email atau password salah', 401);
  }

  const isPasswordValid = await argon2.verify(
    user.password_hash,
    password
  );

  if (!isPasswordValid) {
    throw new AppError('Email atau password salah', 401);
  }

  const accessToken = jwt.sign(
    { sub: String(user.id) },
    jwtConfig.secret,
    {
      algorithm: jwtConfig.algorithm,
      expiresIn: jwtConfig.expiresIn,
    }
  );

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: jwtConfig.expiresIn,
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
  };
}