import { Request, Response } from 'express';
import Factura from '../models/Factura_model';
import Evento from '../models/Evento_model';
import Pago from '../models/Pago_model';

// Obtener una factura por ID
export const getFacturaById = async (req: Request, res: Response) => {
  try {
    const { id_factura } = req.params;
    const factura = await Factura.findByPk(id_factura, {
      include: [
        {
          model: Evento,
          attributes: ['id_evento', 'fecha_evento']
        },
        {
          model: Pago
        }
      ]
    });

    if (!factura) {
      return res.status(404).json({
        error: 'Factura no encontrada',
        mensaje: 'No se encontró la factura solicitada'
      });
    }

    res.json(factura);
  } catch (error) {
    console.error('Error al buscar factura:', error);
    res.status(500).json({
      error: 'Error al buscar factura',
      mensaje: 'Ocurrió un error al buscar la factura'
    });
  }
};
