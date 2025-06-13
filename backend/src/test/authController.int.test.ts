import request from 'supertest';
import app from '../app';



describe('Integración: Consulta de usuario', () => {
  it('debería obtener los datos de un usuario existente', async () => {
    // Primero, haz login para obtener el token
    const loginRes = await request(app)
      .post('/auth/login') // Usar ruta relativa, no URL completa
      .send({
        usuario_login: 'elaine',
        contrasena: '!Pass.evr2007'
      });

    expect(loginRes.statusCode).toBe(200);
    const token = loginRes.body.token;
    expect(token).toBeDefined();

    // Ahora consulta los datos del usuario autenticado
    const res = await request(app)
      .get('/auth/user-data') // Usar ruta relativa, no URL completa
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('nombre_usuario');
    expect(res.body).toHaveProperty('correo_usuario');
  });
});
