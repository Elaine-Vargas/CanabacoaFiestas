import { Router } from 'express';
import { 
  Login, 
  RegisterClient, 
  RegisterUser, 
  GetUserData, 
  UpdateUserData, 
  getCurrentUser,
  completeRegistration 
} from '../controllers/authController';
import { 
  sendRecoveryEmail, 
  resetPassword, 
  sendWelcomeEmail,
  sendVerificationEmail,
  verifyEmailCode 
} from '../controllers/mailController';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    await Login(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/send-verification', async (req, res, next) => {
  try {
    await sendVerificationEmail(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/verify-code', async (req, res, next) => {
  try {
    await verifyEmailCode(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/register-client', async (req, res, next) => {
  try {
    await RegisterClient(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/register-user', async (req, res, next) => {
  try {
    await RegisterUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/user-data', async (req, res, next) => {
  try {
    await GetUserData(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/update-user', async (req, res, next) => {
  try {
    await UpdateUserData(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/current', async (req, res, next) => {
  try {
    await getCurrentUser(req, res);
  } catch (error) {
    next(error);
  }
});

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

router.post('/complete-registration', async (req, res, next) => {
  try {
    await completeRegistration(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
