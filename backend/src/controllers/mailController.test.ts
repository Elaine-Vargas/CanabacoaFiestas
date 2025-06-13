import dotenv from 'dotenv';
dotenv.config();

// Definir variables de entorno por si no existen en .env
process.env.JWT_SECRET = process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy';
process.env.EMAIL_USER = process.env.EMAIL_USER || 'canabacoafiestas@gmail.com';
process.env.EMAIL_PASS = process.env.EMAIL_PASS || 'qmqg dqfi nrsw tsvr';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost/5173/';
process.env.EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';

const mailController = require('./mailController');

jest.mock('nodemailer', () => ({
  createTransport: () => ({
    sendMail: jest.fn().mockResolvedValue({}),
    verify: jest.fn().mockResolvedValue({}),
  }),
}));

describe('sendVerificationEmail', () => {
  it('envía correo de registro con el mensaje correcto', async () => {
    const correo = '2210029@ipisa.edu.do';
    const codigo = '123456';
    const result = await mailController.sendVerificationEmail(correo, codigo, false);
    expect(result).toBe('Correo de verificación enviado exitosamente');
  });

  it('envía correo de actualización con el mensaje correcto', async () => {
    const correo = '2210029@ipisa.edu.do';
    const codigo = '654321';
    const result = await mailController.sendVerificationEmail(correo, codigo, true);
    expect(result).toBe('Correo de verificación enviado exitosamente');
  });
});
