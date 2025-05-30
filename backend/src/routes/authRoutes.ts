import { Router } from 'express';
import { Login, RegisterClient, RegisterUser, GetUserData, UpdateUserData, getCurrentUser } from '../controllers/authController';

const router = Router();

router.post('/login', (req, res, next) => {
  Promise.resolve(Login(req, res)).catch(next);
});

router.post('/register-client', (req, res, next) => {
  Promise.resolve(RegisterClient(req, res)).catch(next);
});

router.post('/register-user', (req, res, next) => {
  Promise.resolve(RegisterUser(req, res)).catch(next);
});

router.get('/user-data', (req, res, next) => {
  Promise.resolve(GetUserData(req, res)).catch(next);
});

router.put('/update-user', (req, res, next) => {
  Promise.resolve(UpdateUserData(req, res)).catch(next);
});

// Nueva ruta para obtener el usuario actual
router.get('/current', (req, res, next) => {
  Promise.resolve(getCurrentUser(req, res)).catch(next);
});

export default router;
