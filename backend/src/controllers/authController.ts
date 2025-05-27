import { Request, Response } from 'express';
import Usuario from '../models/Usuario';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

export const Login = async (req: Request, res: Response) => {
  const { usuario_login, contrasena } = req.body;

  try {
    // Buscar primero por usuario_login
    let usuario = await Usuario.findOne({
      where: {
        usuario_login,
        estado_usuario: 'Activo'
      },
      include: [{ association: 'rol' }]
    });

    // Si no encuentra por usuario_login, intenta por cedula_usuario
    if (!usuario) {
      usuario = await Usuario.findOne({
        where: {
          cedula_usuario: usuario_login,
          estado_usuario: 'Activo'
        },
        include: [{ association: 'rol' }]
      });
    }

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario o contraseña inválidos' });
    }

    // Validar contraseña
    const valido = await usuario.compararContrasena(contrasena);
    if (!valido) {
      return res.status(404).json({ error: 'Usuario o contraseña inválidos' });
    }

    // Generar token
    const token = jwt.sign(
      {
        cedula_usuario: usuario.cedula_usuario,
        rol: usuario.id_rol
      },
      process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy',
      { expiresIn: '1h' }
    );

    // Respuesta exitosa
    res.json({
      mensaje: `Inicio de sesión exitoso, ¡Bienvenido/a ${usuario.nombre_usuario} ${usuario.apellido_usuario}!`,
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const Register = async (req: Request, res: Response) => {
  const {
    nombre_usuario,
    apellido_usuario,
    cedula_usuario,
    correo_usuario,
    tel_usuario,
    contrasena_login,
    usuario_login
  } = req.body;

  try {
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({
      where: {
        [Op.or]: [
          { usuario_login },
          { cedula_usuario },
          { correo_usuario }
        ]
      }
    });

    if (usuarioExistente) {
      return res.status(400).json({ 
        error: 'Ya existe un usuario con ese nombre de usuario, cédula o correo electrónico' 
      });
    }

    // Crear nuevo usuario
    const nuevoUsuario = await Usuario.create({
      nombre_usuario,
      apellido_usuario,
      cedula_usuario,
      correo_usuario,
      tel_usuario,
      contrasena_login,
      usuario_login,
      id_rol: 2, // Rol de cliente
      estado_usuario: 'Activo'
    });

    // Generar token
    const token = jwt.sign(
      {
        cedula_usuario: nuevoUsuario.cedula_usuario,
        rol: nuevoUsuario.id_rol
      },
      process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      mensaje: `¡Registro exitoso! Bienvenido/a ${nombre_usuario} ${apellido_usuario}`,
      token
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export default Login;
