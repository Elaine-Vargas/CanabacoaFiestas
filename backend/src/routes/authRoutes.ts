import { Router, Request, Response, NextFunction } from 'express';
import { 
  Login, 
  RegisterClient, 
  RegisterUser, 
  GetUserData, 
  UpdateUserData, 
  getCurrentUser,
  completeRegistration,
  validateRegistration,
  sendUpdateEmailVerification,
  verifyUpdateEmail
} from '../controllers/authController';
import { 
  sendRecoveryEmail, 
  resetPassword, 
  sendWelcomeEmail,
  sendVerificationEmail,
  verifyEmailCode 
} from '../controllers/mailController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Wrapper function to handle async errors
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Rutas públicas
router.post('/login', asyncHandler(Login));
router.post('/send-verification', asyncHandler(async (req: Request, res: Response) => {
  const { correo_usuario } = req.body;
  if (!correo_usuario) {
    return res.status(400).json({ error: 'El correo es requerido' });
  }
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  await sendVerificationEmail(correo_usuario, verificationCode);
  res.status(200).json({ 
    success: true,
    message: 'Código de verificación enviado exitosamente',
    requiresVerification: true,
    verificationCode // Solo para desarrollo, quitar en producción
  });
}));

router.post('/verify-code', async (req, res, next) => {
  try {
    await verifyEmailCode(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/register-client', asyncHandler(RegisterClient));
router.post('/register-user', asyncHandler(RegisterUser));
router.post('/complete-registration', asyncHandler(completeRegistration));
router.post('/validate-registration', asyncHandler(validateRegistration));

// Rutas protegidas
router.post('/send-update-email-verification', verificarToken, asyncHandler(sendUpdateEmailVerification));
router.post('/verify-update-email', verificarToken, asyncHandler(verifyUpdateEmail));
router.get('/user-data', verificarToken, asyncHandler(GetUserData));
router.get('/current', verificarToken, asyncHandler(getCurrentUser));
router.put('/update-user', verificarToken, asyncHandler(UpdateUserData));

router.post('/mail-recovery', async (req, res, next) => {
  try {
    await sendRecoveryEmail(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    await resetPassword(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/welcome-mail', async (req, res, next) => {
  try {
    await sendWelcomeEmail(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
