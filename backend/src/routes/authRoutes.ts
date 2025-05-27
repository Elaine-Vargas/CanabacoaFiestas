import { Router } from 'express';
import { Login, Register } from '../controllers/authController';

const router = Router();

router.post('/login', (req, res, next) => {
  Promise.resolve(Login(req, res)).catch(next);
});

router.post('/register', (req, res, next) => {
  Promise.resolve(Register(req, res)).catch(next);
});

export default router;
