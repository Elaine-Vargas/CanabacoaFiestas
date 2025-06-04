import { Router } from 'express';
import { getAllUsers, getUsersByRole, searchUsers } from '../controllers/usersController';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    await getAllUsers(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/rol/:id_rol', async (req, res, next) => {
  try {
    await getUsersByRole(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/buscar', async (req, res, next) => {
  try {
    await searchUsers(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
