import express from 'express';
import { getPermissionsByUserId } from '../controllers/permissionController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/:id', verificarToken, getPermissionsByUserId);

export default router; 