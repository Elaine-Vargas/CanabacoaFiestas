import Usuario from './models/Usuario_model';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize-typescript';

dotenv.config({ path: './.env' });

const testPasswordComparison = async (testEmail, currentPasswordInput, newPasswordInput) => {
  const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    models: [Usuario],
    logging: false, // Set to true to see SQL queries
  });

  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida exitosamente.');

    const usuario = await Usuario.findOne({
      where: { correo_usuario: testEmail },
    });

    if (!usuario) {
      console.log(`Usuario con correo '${testEmail}' no encontrado.`);
      return;
    }

    console.log(`
--- Prueba de Comparación para el usuario: ${usuario.nombre_usuario} ${usuario.apellido_usuario} (${usuario.correo_usuario}) ---
`);

    // Esta es la comparación clave: nueva_contrasena_a_probar vs hash_almacenado
    const isSameAsStored = await usuario.compararContrasena(newPasswordInput);

    if (isSameAsStored) {
      console.log('¡La nueva contraseña de prueba ES IGUAL a la contraseña actual del usuario en la BD!');
      console.log('Esto significa que la verificación en el backend funciona correctamente.');
    } else {
      console.log('La nueva contraseña de prueba NO ES IGUAL a la contraseña actual del usuario en la BD.');
      console.log('Esto significa que la verificación en el backend funciona correctamente.');
    }

    // Opcional: Para verificar que tu contraseña de prueba actual sea correcta (solo para depuración)
    const verifyCurrentInput = await usuario.compararContrasena(currentPasswordInput);
    console.log(`
--- Verificación adicional: ¿La contraseña que ingresaste como ACTUAL es correcta? ---`);
    if (verifyCurrentInput) {
      console.log('La contraseña ingresada como \'actual\' ES CORRECTA (coincide con el hash de la BD).');
    } else {
      console.log('La contraseña ingresada como \'actual\' NO ES CORRECTA (NO coincide con el hash de la BD).');
    }
    console.log('-----------------------------------------------------------------------------------');

  } catch (error) {
    console.error('Error durante la prueba de comparación de contraseñas:', error);
  } finally {
    await sequelize.close();
    console.log('Conexión a la base de datos cerrada.');
  }
};

// --- Configura tu prueba aquí ---
const emailToTest = 'elamv02@gmail.com'; // <<<<< CAMBIA ESTE CORREO
const currentPasswordInDb = '!Pass.evr2007'; // <<<<< CAMBIA ESTA CONTRASEÑA (la que YA tiene el usuario en la BD, en texto plano)
const newPasswordToTest = '!Pass.evr2007'; // <<<<< CAMBIA ESTA POR LA NUEVA CONTRASEÑA QUE QUIERES PROBAR
// -------------------------------

testPasswordComparison(emailToTest, currentPasswordInDb, newPasswordToTest); 