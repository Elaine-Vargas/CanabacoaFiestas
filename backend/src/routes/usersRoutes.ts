import { Router } from 'express';
import { 
  getAllUsers, 
  getUsersByStatus,
  getUsersByRole, 
  searchUsers,
  updateUser,
  deleteUser,
  getAllRoles
} from '../controllers/usersController';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    await getAllUsers(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/estado/:estado_usuario', async (req, res, next) => {
  try {
    await getUsersByStatus(req, res);
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

router.get('/roles', async (req, res, next) => {
  try {
    await getAllRoles(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:cedula', async (req, res, next) => {
  try {
    await updateUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:cedula', async (req, res, next) => {
  try {
    await deleteUser(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;