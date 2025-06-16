"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const mailController_1 = require("../controllers/mailController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Wrapper function to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// Rutas públicas
router.post('/login', asyncHandler(authController_1.Login));
router.post('/send-verification', asyncHandler(async (req, res) => {
    const { correo_usuario } = req.body;
    if (!correo_usuario) {
        return res.status(400).json({ error: 'El correo es requerido' });
    }
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    await (0, mailController_1.sendVerificationEmail)(correo_usuario, verificationCode);
    res.status(200).json({
        success: true,
        message: 'Código de verificación enviado exitosamente',
        requiresVerification: true,
        verificationCode // Solo para desarrollo, quitar en producción
    });
}));
router.post('/verify-code', async (req, res, next) => {
    try {
        await (0, mailController_1.verifyEmailCode)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post('/register-client', asyncHandler(authController_1.RegisterClient));
router.post('/register-user', asyncHandler(authController_1.RegisterUser));
router.post('/complete-registration', asyncHandler(authController_1.completeRegistration));
router.post('/validate-registration', asyncHandler(authController_1.validateRegistration));
// Rutas protegidas
router.post('/send-update-email-verification', authMiddleware_1.verificarToken, asyncHandler(authController_1.sendUpdateEmailVerification));
router.post('/verify-update-email', authMiddleware_1.verificarToken, asyncHandler(authController_1.verifyUpdateEmail));
router.get('/user-data', authMiddleware_1.verificarToken, asyncHandler(authController_1.GetUserData));
router.get('/current', authMiddleware_1.verificarToken, asyncHandler(authController_1.getCurrentUser));
router.put('/update-user', authMiddleware_1.verificarToken, asyncHandler(authController_1.UpdateUserData));
router.post('/mail-recovery', async (req, res, next) => {
    try {
        await (0, mailController_1.sendRecoveryEmail)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post('/reset-password', async (req, res, next) => {
    try {
        await (0, mailController_1.resetPassword)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post('/welcome-mail', async (req, res, next) => {
    try {
        await (0, mailController_1.sendWelcomeEmail)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
