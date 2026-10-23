import {
  registerUser,
  loginUser,
} from '../services/auth.service.js';

export async function register(req, res) {
  const user = await registerUser(req.body);

  return res.status(201).json({
    message: 'Registrasi berhasil',
    data: user,
  });
}

export async function login(req, res) {
  const result = await loginUser(req.body);

  return res.status(200).json({
    message: 'Login berhasil',
    data: result,
  });
}