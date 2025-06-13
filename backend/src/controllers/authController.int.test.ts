import request from 'supertest';
import app from '../app';

describe('Auth Integration', () => {
  it('debería responder 400 si faltan credenciales', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('debería responder 200 y un token si las credenciales de elaine son válidas', async () => {
    const res = await request(app).post('/api/auth/login').send({
      usuario_login: 'elaine',
      contrasena: '!Pass.evr2007',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});


