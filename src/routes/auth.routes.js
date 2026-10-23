import { Router } from 'express';
import {
  register,
  login,
} from '../controllers/auth.controller.js';
import { validateRegister } from '../middlewares/validate-register.js';
import { validateLogin } from '../middlewares/validate-login.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

export default router;