import { Request, Response } from 'express';
import Usuario from '../models/Usuario_model';
import { Op } from 'sequelize';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { rol, search } = req.query;

    // Construir la condición de búsqueda
    let whereCondition: any = {
      estado_usuario: 'Activo'
    };

    // Filtrar por rol si se proporciona
    if (rol) {
      whereCondition.id_rol = rol;
    }

    // Agregar búsqueda por diferentes campos si se proporciona
    if (search) {
      whereCondition[Op.or] = [
        { nombre_usuario: { [Op.like]: `%${search}%` } },
        { apellido_usuario: { [Op.like]: `%${search}%` } },
        { cedula_usuario: { [Op.like]: `%${search}%` } },
        { tel_usuario: { [Op.like]: `%${search}%` } },
        { correo_usuario: { [Op.like]: `%${search}%` } }
      ];
    }

    const usuarios = await Usuario.findAll({
      where: whereCondition,
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
      include: [{
        association: 'rol',
        attributes: ['nombre_rol']
      }],
      order: [['nombre_usuario', 'ASC']]
    });

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
        rol_nombre: usuario.rol?.nombre_rol
      }))
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
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
        'estado_usuario'
      ],
      include: [{
        association: 'rol',
        attributes: ['nombre_rol']
      }],
      order: [['nombre_usuario', 'ASC']]
    });

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
        rol_nombre: usuario.rol?.nombre_rol
      }))
    });

  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    res.status(500).json({ error: 'Error al obtener usuarios por rol' });
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
    }

    const usuarios = await Usuario.findAll({
      where: {
        estado_usuario: 'Activo',
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
        'estado_usuario'
      ],
      include: [{
        association: 'rol',
        attributes: ['nombre_rol']
      }],
      order: [['nombre_usuario', 'ASC']]
    });

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
        rol_nombre: usuario.rol?.nombre_rol
      }))
    });

  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({ error: 'Error al buscar usuarios' });
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
      // Validar que no se intente modificar campos sensibles
      const camposProhibidos = ['cedula_usuario', 'contrasena_login', 'creacion_usuario'];
      for (const campo of camposProhibidos) {
        if (updateData[campo]) {
          return res.status(400).json({ 
            error: `No está permitido modificar el campo ${campo}` 
          });
        }
      }
  
      // Buscar el usuario
      const usuario = await Usuario.findOne({ 
        where: { cedula_usuario: cedula } 
      });
  
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
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
          return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
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
        mensaje: 'Usuario actualizado correctamente',
        usuario: usuarioActualizado
      });
  
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ error: 'Error al actualizar usuario' });
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