import { Request, Response } from 'express';
import Usuario from '../models/Usuario_model';
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
        usuario_login: usuario.usuario_login,
        cedula_usuario: usuario.cedula_usuario,
        rol: usuario.id_rol
      },
      process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy',
      { expiresIn: '24h' }
    );

    // Mostrar token en consola
    console.log('Token generado:', token);

    // Respuesta exitosa
    res.json({
      mensaje: `Inicio de sesión exitoso, ¡Bienvenido/a ${usuario.nombre_usuario} ${usuario.apellido_usuario}!`,
      token,
      nombre_usuario: usuario.nombre_usuario,
      apellido_usuario: usuario.apellido_usuario,
      usuario_login: usuario.usuario_login,
      rol: usuario.id_rol
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const RegisterClient = async (req: Request, res: Response) => {
  const {
    nombre_usuario,
    apellido_usuario,
    cedula_usuario,
    correo_usuario,
    tel_usuario,
    contrasena_login,
    usuario_login,
    
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
      let errorMessage = 'Ya existe un usuario con ';
      if (usuarioExistente.usuario_login === usuario_login) {
        errorMessage += 'ese nombre de usuario';
      } else if (usuarioExistente.cedula_usuario === cedula_usuario) {
        errorMessage += 'esa cédula';
      } else if (usuarioExistente.correo_usuario === correo_usuario) {
        errorMessage += 'ese correo electrónico';
      }
      return res.status(400).json({ error: errorMessage });
    }

    // Crear nuevo cliente
    const nuevoCliente = await Usuario.create({
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
        usuario_login: nuevoCliente.usuario_login,
        cedula_usuario: nuevoCliente.cedula_usuario,
        rol: nuevoCliente.id_rol
      },
      process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      mensaje: `¡Registro exitoso! Bienvenido/a ${nombre_usuario} ${apellido_usuario}`,
      token
    });

  } catch (error) {
    console.error('Error en registro de cliente:', error);
    res.status(500).json({ error: 'Error al registrar cliente' });
  }
};

export const RegisterUser = async (req: Request, res: Response) => {
  const {
    nombre_usuario,
    apellido_usuario,
    cedula_usuario,
    correo_usuario,
    tel_usuario,
    contrasena_login,
    usuario_login,
    id_rol
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
      let errorMessage = 'Ya existe un usuario con ';
      if (usuarioExistente.usuario_login === usuario_login) {
        errorMessage += 'ese nombre de usuario';
      } else if (usuarioExistente.cedula_usuario === cedula_usuario) {
        errorMessage += 'esa cédula';
      } else if (usuarioExistente.correo_usuario === correo_usuario) {
        errorMessage += 'ese correo electrónico';
      }
      return res.status(400).json({ error: errorMessage });
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
      id_rol,
      estado_usuario: 'Activo'
    });

    res.status(201).json({
      mensaje: `¡Usuario ${nombre_usuario} ${apellido_usuario} registrado exitosamente!`,
      usuario: {
        nombre_usuario: nuevoUsuario.nombre_usuario,
        apellido_usuario: nuevoUsuario.apellido_usuario,
        usuario_login: nuevoUsuario.usuario_login,
        id_rol: nuevoUsuario.id_rol
      }
    });

  } catch (error) {
    console.error('Error en registro de usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const GetUserData = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy') as { usuario_login?: string, cedula_usuario?: string };
    
    if (!decoded.usuario_login && !decoded.cedula_usuario) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    const usuario = await Usuario.findOne({
      attributes: [
        'nombre_usuario',
        'apellido_usuario',
        'cedula_usuario',
        'correo_usuario',
        'tel_usuario',
        'usuario_login',
        'id_rol',
        'estado_usuario'
      ],
      where: {
        [Op.or]: [
          { usuario_login: decoded.usuario_login },
          { cedula_usuario: decoded.cedula_usuario }
        ]
      },
      include: [{
        association: 'rol',
        attributes: ['nombre_rol']
      }]
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Enviar datos del usuario
    res.json({
      nombre_usuario: usuario.nombre_usuario,
      apellido_usuario: usuario.apellido_usuario,
      cedula_usuario: usuario.cedula_usuario,
      correo_usuario: usuario.correo_usuario,
      tel_usuario: usuario.tel_usuario,
      usuario_login: usuario.usuario_login,
      id_rol: usuario.id_rol,
      estado_usuario: usuario.estado_usuario,
      rol_nombre: usuario.rol?.nombre_rol
    });

  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
};

export const UpdateUserData = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy') as { usuario_login?: string, cedula_usuario?: string };
    
    if (!decoded.usuario_login && !decoded.cedula_usuario) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    const { correo_usuario, tel_usuario, usuario_login, contrasena_login, contrasena_actual } = req.body;

    // Buscar usuario
    const usuario = await Usuario.findOne({
      where: {
        [Op.or]: [
          { usuario_login: decoded.usuario_login },
          { cedula_usuario: decoded.cedula_usuario }
        ]
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const contrasenaValida = await usuario.compararContrasena(contrasena_actual);
    if (!contrasenaValida) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Verificar si el nuevo nombre de usuario ya existe (si se está cambiando)
    if (usuario_login && usuario_login !== usuario.usuario_login) {
      const usuarioExistente = await Usuario.findOne({
        where: { usuario_login }
      });
      if (usuarioExistente) {
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }
    }

    // Verificar si el nuevo correo ya existe (si se está cambiando)
    if (correo_usuario && correo_usuario !== usuario.correo_usuario) {
      const correoExistente = await Usuario.findOne({
        where: { correo_usuario }
      });
      if (correoExistente) {
        return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
      }
    }

    // Actualizar datos
    const updateData: any = {};
    if (correo_usuario) updateData.correo_usuario = correo_usuario;
    if (tel_usuario) updateData.tel_usuario = tel_usuario;
    if (usuario_login) updateData.usuario_login = usuario_login;
    if (contrasena_login) updateData.contrasena_login = contrasena_login;

    await usuario.update(updateData);

    res.json({
      mensaje: 'Datos actualizados exitosamente',
      usuario: {
        nombre_usuario: usuario.nombre_usuario,
        apellido_usuario: usuario.apellido_usuario,
        correo_usuario: usuario.correo_usuario,
        tel_usuario: usuario.tel_usuario,
        usuario_login: usuario.usuario_login
      }
    });

  } catch (error) {
    console.error('Error al actualizar datos del usuario:', error);
    res.status(500).json({ error: 'Error al actualizar datos del usuario' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy') as { usuario_login?: string, cedula_usuario?: string };
    
    if (!decoded.usuario_login && !decoded.cedula_usuario) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    const usuario = await Usuario.findOne({
      attributes: [
        'nombre_usuario',
        'apellido_usuario',
        'cedula_usuario',
        'correo_usuario',
        'tel_usuario',
        'usuario_login',
        'id_rol',
        'estado_usuario'
      ],
      where: {
        [Op.or]: [
          { usuario_login: decoded.usuario_login },
          { cedula_usuario: decoded.cedula_usuario }
        ]
      },
      include: [{
        association: 'rol',
        attributes: ['nombre_rol']
      }]
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      nombre_usuario: usuario.nombre_usuario,
      apellido_usuario: usuario.apellido_usuario,
      cedula_usuario: usuario.cedula_usuario,
      correo_usuario: usuario.correo_usuario,
      tel_usuario: usuario.tel_usuario,
      usuario_login: usuario.usuario_login,
      id_rol: usuario.id_rol,
      estado_usuario: usuario.estado_usuario,
      rol_nombre: usuario.rol?.nombre_rol
    });

  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
};

export default Login;