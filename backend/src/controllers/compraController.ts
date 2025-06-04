import { Request, Response } from 'express';
import Compra from '../models/Compra_model';
import DetalleCompra from '../models/DetalleCompra_model';
import Proveedor from '../models/Proveedor_model';
import Elemento from '../models/Elemento_model';
import { Op } from 'sequelize';

// Crear una nueva compra con sus detalles
export const createCompra = async (req: Request, res: Response) => {
  try {
    const {
      id_proveedor,
      detalles, // Array de detalles de compra
      costo_compra,
      estado_compra = 'En proceso'
    } = req.body;

    // Verificar que el proveedor existe
    const proveedor = await Proveedor.findByPk(id_proveedor);
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    // Crear la compra
    const compra = await Compra.create({
      id_proveedor,
      fecha_compra: new Date(),
      hora_compra: new Date().toTimeString().split(' ')[0],
      costo_compra,
      estado_compra
    });

    // Crear los detalles de compra
    if (detalles && detalles.length > 0) {
      const detallesPromises = detalles.map((detalle: any) => 
        DetalleCompra.create({
          id_compra: compra.id_compra,
          id_elemento: detalle.id_elemento,
          cantidad_compra: detalle.cantidad_compra,
          precio_unitario: detalle.precio_unitario,
          precio_total: detalle.precio_unitario * detalle.cantidad_compra
        })
      );
      await Promise.all(detallesPromises);
    }

    // Obtener la compra con sus detalles
    const compraCompleta = await Compra.findByPk(compra.id_compra, {
      include: [
        {
          model: DetalleCompra,
          include: [
            {
              model: Elemento
            }
          ]
        },
        {
          model: Proveedor
        }
      ]
    });

    res.status(201).json(compraCompleta);
  } catch (error) {
    console.error('Error al crear compra:', error);
    res.status(500).json({ error: 'Error al crear compra' });
  }
};

// Obtener todas las compras
export const getCompras = async (req: Request, res: Response) => {
  try {
    const compras = await Compra.findAll({
      where: {
        estado_compra: {
          [Op.ne]: 'Cancelada'
        }
      },
      include: [
        {
          model: DetalleCompra,
          include: [
            {
              model: Elemento
            }
          ]
        },
        {
          model: Proveedor
        }
      ],
      order: [['fecha_compra', 'DESC'], ['hora_compra', 'DESC']]
    });

    res.json(compras);
  } catch (error) {
    console.error('Error al obtener compras:', error);
    res.status(500).json({ error: 'Error al obtener compras' });
  }
};

// Obtener detalles de una compra específica
export const getDetallesByCompra = async (req: Request, res: Response) => {
  try {
    const { id_compra } = req.params;

    const detalles = await DetalleCompra.findAll({
      where: { id_compra },
      include: [
        {
          model: Elemento
        }
      ]
    });

    if (!detalles || detalles.length === 0) {
      return res.status(404).json({ error: 'No se encontraron detalles para esta compra' });
    }

    res.json(detalles);
  } catch (error) {
    console.error('Error al obtener detalles de la compra:', error);
    res.status(500).json({ error: 'Error al obtener detalles de la compra' });
  }
};

// Obtener compras por elemento
export const getComprasByElemento = async (req: Request, res: Response) => {
  try {
    const { id_elemento } = req.params;

    const detalles = await DetalleCompra.findAll({
      where: { id_elemento },
      include: [
        {
          model: Compra,
          where: {
            estado_compra: {
              [Op.ne]: 'Cancelada'
            }
          },
          include: [
            {
              model: Proveedor
            }
          ]
        },
        {
          model: Elemento
        }
      ]
    });

    if (!detalles || detalles.length === 0) {
      return res.status(404).json({ error: 'No se encontraron compras para este elemento' });
    }

    res.json(detalles);
  } catch (error) {
    console.error('Error al obtener compras del elemento:', error);
    res.status(500).json({ error: 'Error al obtener compras del elemento' });
  }
};

// Editar una compra
export const editCompra = async (req: Request, res: Response) => {
  try {
    const { id_compra } = req.params;
    const {
      id_proveedor,
      estado_compra,
      detalles // Array de detalles actualizados
    } = req.body;

    const compra = await Compra.findByPk(id_compra);
    if (!compra) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    // Verificar que el proveedor existe si se está actualizando
    if (id_proveedor) {
      const proveedor = await Proveedor.findByPk(id_proveedor);
      if (!proveedor) {
        return res.status(404).json({ error: 'Proveedor no encontrado' });
      }
    }

    // Actualizar la compra
    await compra.update({
      id_proveedor: id_proveedor || compra.id_proveedor,
      estado_compra: estado_compra || compra.estado_compra
    });

    // Si se proporcionaron nuevos detalles, actualizarlos
    if (detalles) {
      // Eliminar detalles existentes
      await DetalleCompra.destroy({
        where: { id_compra }
      });

      // Crear nuevos detalles
      if (detalles.length > 0) {
        const detallesPromises = detalles.map((detalle: any) => 
          DetalleCompra.create({
            id_compra,
            id_elemento: detalle.id_elemento,
            cantidad_compra: detalle.cantidad_compra,
            precio_unitario: detalle.precio_unitario,
            precio_total: detalle.precio_unitario * detalle.cantidad_compra
          })
        );
        await Promise.all(detallesPromises);
      }
    }

    // Obtener la compra actualizada con sus detalles
    const compraActualizada = await Compra.findByPk(id_compra, {
      include: [
        {
          model: DetalleCompra,
          include: [
            {
              model: Elemento
            }
          ]
        },
        {
          model: Proveedor
        }
      ]
    });

    res.json(compraActualizada);
  } catch (error) {
    console.error('Error al editar compra:', error);
    res.status(500).json({ error: 'Error al editar compra' });
  }
};

// Eliminar lógicamente una compra
export const deleteCompra = async (req: Request, res: Response) => {
  try {
    const { id_compra } = req.params;

    const compra = await Compra.findByPk(id_compra);
    if (!compra) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    await compra.update({
      estado_compra: 'Cancelada'
    });

    res.json({ message: 'Compra cancelada correctamente' });
  } catch (error) {
    console.error('Error al cancelar compra:', error);
    res.status(500).json({ error: 'Error al cancelar compra' });
  }
};

// Eliminar lógicamente un detalle de compra
export const deleteDetalleCompra = async (req: Request, res: Response) => {
  try {
    const { id_detalle_compra } = req.params;

    const detalle = await DetalleCompra.findByPk(id_detalle_compra);
    if (!detalle) {
      return res.status(404).json({ error: 'Detalle de compra no encontrado' });
    }

    // Obtener la compra asociada
    const compra = await Compra.findByPk(detalle.id_compra);
    if (!compra) {
      return res.status(404).json({ error: 'Compra asociada no encontrada' });
    }

    // Actualizar el costo total de la compra
    const nuevoCosto = compra.costo_compra - detalle.precio_total;
    await compra.update({ costo_compra: nuevoCosto });

    // Eliminar el detalle
    await detalle.destroy();

    res.json({ message: 'Detalle de compra eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar detalle de compra:', error);
    res.status(500).json({ error: 'Error al eliminar detalle de compra' });
  }
};

// Crear un detalle de compra individual
export const createDetalleCompra = async (req: Request, res: Response) => {
  try {
    const {
      id_compra,
      id_elemento,
      cantidad_compra,
      precio_unitario
    } = req.body;

    // Verificar que la compra existe
    const compra = await Compra.findByPk(id_compra);
    if (!compra) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    // Verificar que el elemento existe
    const elemento = await Elemento.findByPk(id_elemento);
    if (!elemento) {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }

    // Calcular el precio total
    const precio_total = precio_unitario * cantidad_compra;

    // Crear el detalle de compra
    const detalleCompra = await DetalleCompra.create({
      id_compra,
      id_elemento,
      cantidad_compra,
      precio_unitario,
      precio_total
    });

    // Actualizar el costo total de la compra
    const nuevoCosto = compra.costo_compra + precio_total;
    await compra.update({ costo_compra: nuevoCosto });

    // Obtener el detalle con sus relaciones
    const detalleCompleto = await DetalleCompra.findByPk(detalleCompra.id_detalle_compra, {
      include: [
        {
          model: Elemento
        },
        {
          model: Compra,
          include: [
            {
              model: Proveedor
            }
          ]
        }
      ]
    });

    res.status(201).json(detalleCompleto);
  } catch (error) {
    console.error('Error al crear detalle de compra:', error);
    res.status(500).json({ error: 'Error al crear detalle de compra' });
  }
}; 