import { Request, Response } from 'express';
import Usuario from '../models/Usuario_model';
import { Op } from 'sequelize';
import Rol from '../models/Rol_model';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { rol, search, estados } = req.query;

    // Construir la condición de búsqueda
    const whereClause: any = {};

    // Filtrar por rol si se proporciona
    if (rol) {
      whereClause.id_rol = rol;
    }

    // Filtrar por estados si se proporciona
    if (estados) {
      const estadosArray = (estados as string).split(',');
      whereClause.estado_usuario = {
        [Op.in]: estadosArray
      };
    }

    // Agregar búsqueda por diferentes campos si se proporciona
    if (search) {
      whereClause[Op.or] = [
        { nombre_usuario: { [Op.like]: `%${search}%` } },
        { apellido_usuario: { [Op.like]: `%${search}%` } },
        { cedula_usuario: { [Op.like]: `%${search}%` } },
        { tel_usuario: { [Op.like]: `%${search}%` } },
        { correo_usuario: { [Op.like]: `%${search}%` } }
      ];
    }

    const usuarios = await Usuario.findAll({
      where: whereClause,
      attributes: [
        'nombre_usuario',
        'apellido_usuario',
        'cedula_usuario',
        'tel_usuario',
        'correo_usuario',
        'usuario_login',
        'id_rol',
        'estado_usuario',
        'creacion_usuario'
      ],
      include: [{
        association: 'rol',
        attributes: ['nombre_rol']
      }],
      order: [['nombre_usuario', 'ASC']]
    });

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron usuarios',
        mensaje: 'No hay usuarios registrados en el sistema'
      });
    }

    res.json({
      total: usuarios.length,
      usuarios: usuarios.map(usuario => ({
        nombre_usuario: usuario.nombre_usuario,
        apellido_usuario: usuario.apellido_usuario,
        cedula_usuario: usuario.cedula_usuario,
        correo_usuario: usuario.correo_usuario,
        tel_usuario: usuario.tel_usuario,
        usuario_login: usuario.usuario_login,
        id_rol: usuario.id_rol,
        estado_usuario: usuario.estado_usuario,
        rol_nombre: usuario.rol?.nombre_rol,
        creacion_usuario: usuario.creacion_usuario
      }))
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      error: 'Error al obtener usuarios',
      mensaje: 'Ocurrió un error al cargar los usuarios'
    });
  }
};

export const getUsersByRole = async (req: Request, res: Response) => {
  try {
    const { id_rol } = req.params;

    const usuarios = await Usuario.findAll({
      where: {
        id_rol,
        estado_usuario: 'Activo'
      },
      attributes: [
        'nombre_usuario',
        'apellido_usuario',
        'cedula_usuario',
        'correo_usuario',
        'tel_usuario',
        'usuario_login',
        'id_rol',
        'estado_usuario',
        'creacion_usuario'
      ],
      include: [{
        association: 'rol',
        attributes: ['nombre_rol']
      }],
      order: [['nombre_usuario', 'ASC']]
    });

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron usuarios',
        mensaje: `No hay usuarios activos registrados con el rol: ${id_rol}`
      });
    }

    res.json({
      total: usuarios.length,
      usuarios: usuarios.map(usuario => ({
        nombre_usuario: usuario.nombre_usuario,
        apellido_usuario: usuario.apellido_usuario,
        cedula_usuario: usuario.cedula_usuario,
        correo_usuario: usuario.correo_usuario,
        tel_usuario: usuario.tel_usuario,
        usuario_login: usuario.usuario_login,
        id_rol: usuario.id_rol,
        estado_usuario: usuario.estado_usuario,
        rol_nombre: usuario.rol?.nombre_rol,
        creacion_usuario: usuario.creacion_usuario
      }))
    });

  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    res.status(500).json({ 
      error: 'Error al obtener usuarios por rol',
      mensaje: 'Ocurrió un error al cargar los usuarios por rol'
    });
  }
};

export const getUsersByStatus = async (req: Request, res: Response) => {
  try {
    const { estado } = req.params;

    const usuarios = await Usuario.findAll({
      where: {
        estado_usuario: estado
      },
      attributes: [
        'nombre_usuario',
        'apellido_usuario',
        'cedula_usuario',
        'correo_usuario',
        'tel_usuario',
        'usuario_login',
        'id_rol',
        'estado_usuario',
        'creacion_usuario'
      ],
      include: [{
        association: 'rol',
        attributes: ['nombre_rol']
      }],
      order: [['nombre_usuario', 'ASC']]
    });

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron usuarios',
        mensaje: `No hay usuarios registrados con el estado: ${estado}`
      });
    }

    res.json({
      total: usuarios.length,
      usuarios: usuarios.map(usuario => ({
        nombre_usuario: usuario.nombre_usuario,
        apellido_usuario: usuario.apellido_usuario,
        cedula_usuario: usuario.cedula_usuario,
        correo_usuario: usuario.correo_usuario,
        tel_usuario: usuario.tel_usuario,
        usuario_login: usuario.usuario_login,
        id_rol: usuario.id_rol,
        estado_usuario: usuario.estado_usuario,
        rol_nombre: usuario.rol?.nombre_rol,
        creacion_usuario: usuario.creacion_usuario
      }))
    });

  } catch (error) {
    console.error('Error al obtener usuarios por estado:', error);
    res.status(500).json({ 
      error: 'Error al obtener usuarios por estado',
      mensaje: 'Ocurrió un error al cargar los usuarios por estado'
    });
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ 
        error: 'Parámetro de búsqueda requerido',
        mensaje: 'Se requiere un término de búsqueda para realizar la consulta'
      });
    }

    const usuarios = await Usuario.findAll({
      where: {
        [Op.or]: [
          { nombre_usuario: { [Op.like]: `%${query}%` } },
          { apellido_usuario: { [Op.like]: `%${query}%` } },
          { cedula_usuario: { [Op.like]: `%${query}%` } },
          { tel_usuario: { [Op.like]: `%${query}%` } },
          { correo_usuario: { [Op.like]: `%${query}%` } }
        ]
      },
      attributes: [
        'nombre_usuario',
        'apellido_usuario',
        'cedula_usuario',
        'correo_usuario',
        'tel_usuario',
        'usuario_login',
        'id_rol',
        'estado_usuario',
        'creacion_usuario'
      ],
      include: [{
        association: 'rol',
        attributes: ['nombre_rol']
      }],
      order: [['nombre_usuario', 'ASC']]
    });

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron usuarios',
        mensaje: `No hay usuarios que coincidan con la búsqueda: ${query}`
      });
    }

    res.json({
      total: usuarios.length,
      usuarios: usuarios.map(usuario => ({
        nombre_usuario: usuario.nombre_usuario,
        apellido_usuario: usuario.apellido_usuario,
        cedula_usuario: usuario.cedula_usuario,
        correo_usuario: usuario.correo_usuario,
        tel_usuario: usuario.tel_usuario,
        usuario_login: usuario.usuario_login,
        id_rol: usuario.id_rol,
        estado_usuario: usuario.estado_usuario,
        rol_nombre: usuario.rol?.nombre_rol,
        creacion_usuario: usuario.creacion_usuario
      }))
    });

  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({ 
      error: 'Error al buscar usuarios',
      mensaje: 'Ocurrió un error al realizar la búsqueda'
    });
  }
};

/**
 * @description Actualiza un usuario existente
 * @route PUT /api/usuarios/:cedula
 * @access Privado (Admin)
 */
export const updateUser = async (req: Request, res: Response) => {
    const { cedula } = req.params;
    const updateData = req.body;
    
    try {
      // Buscar el usuario
      const usuario = await Usuario.findOne({ 
        where: { cedula_usuario: cedula } 
      });
  
      if (!usuario) {
        return res.status(404).json({ 
          error: 'Usuario no encontrado',
          mensaje: 'No se encontró el usuario solicitado'
        });
      }
  
      // Si se está actualizando el correo, verificar que no exista otro usuario con el mismo correo
      if (updateData.correo_usuario) {
        const usuarioConMismoCorreo = await Usuario.findOne({
          where: {
            correo_usuario: updateData.correo_usuario,
            cedula_usuario: { [Op.ne]: cedula } // Excluir al usuario actual
          }
        });
  
        if (usuarioConMismoCorreo) {
          return res.status(400).json({ 
            error: 'Correo duplicado',
            mensaje: 'El correo electrónico ya está en uso por otro usuario'
          });
        }
      }
  
      // Actualizar el usuario
      await usuario.update(updateData);
  
      // Obtener el usuario actualizado (con los datos frescos de la base de datos)
      const usuarioActualizado = await Usuario.findByPk(cedula, {
        attributes: { exclude: ['contrasena_login'] },
        include: [{ association: 'rol' }]
      });
  
      res.json({
        error: null,
        mensaje: 'Usuario actualizado correctamente',
        usuario: usuarioActualizado
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ 
        error: 'Error al actualizar usuario',
        mensaje: 'Ocurrió un error al actualizar los datos del usuario'
      });
    }
};

/**
 * @description Elimina lógicamente un usuario (cambia estado a "Eliminado")
 * @route DELETE /api/usuarios/:cedula
 * @access Privado (Admin)
 */
export const deleteUser = async (req: Request, res: Response) => {
  const { cedula } = req.params;

  try {
    const usuario = await Usuario.findOne({ 
      where: { cedula_usuario: cedula } 
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si el usuario ya está eliminado
    if (usuario.estado_usuario === 'Eliminado') {
      return res.status(400).json({ error: 'El usuario ya está eliminado' });
    }

    // Eliminación lógica (cambiar estado)
    await usuario.update({ estado_usuario: 'Eliminado' });

    res.json({ 
      mensaje: 'Usuario eliminado correctamente (lógicamente)',
      cedula_usuario: usuario.cedula_usuario,
      estado_actual: 'Eliminado'
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

/**
 * @description Obtiene todos los roles disponibles
 * @route GET /api/usuarios/roles
 * @access Privado (Admin)
 */
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Rol.findAll({
      attributes: ['id_rol', 'nombre_rol'],
      order: [['nombre_rol', 'ASC']]
    });

    if (!roles || roles.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron roles',
        mensaje: 'No hay roles registrados en el sistema'
      });
    }

    res.json({
      total: roles.length,
      roles: roles.map(rol => ({
        id_rol: rol.id_rol,
        nombre_rol: rol.nombre_rol
            }))
    });

  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ 
      error: 'Error al obtener roles',
      mensaje: 'Ocurrió un error al cargar los roles'
    });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { cedula } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        error: 'Estado requerido',
        mensaje: 'Se requiere especificar el nuevo estado del usuario'
      });
    }

    const usuario = await Usuario.findByPk(cedula);

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        mensaje: `No existe un usuario con la cédula: ${cedula}`
      });
    }

    await usuario.update({ estado_usuario: estado });

    res.json({
      mensaje: 'Estado del usuario actualizado exitosamente',
      usuario: {
        cedula_usuario: usuario.cedula_usuario,
        nombre_usuario: usuario.nombre_usuario,
        apellido_usuario: usuario.apellido_usuario,
        estado_usuario: usuario.estado_usuario
      }
    });

  } catch (error) {
    console.error('Error al actualizar estado del usuario:', error);
    res.status(500).json({
      error: 'Error al actualizar estado del usuario',
      mensaje: 'Ocurrió un error al actualizar el estado del usuario'
    });
  }
};