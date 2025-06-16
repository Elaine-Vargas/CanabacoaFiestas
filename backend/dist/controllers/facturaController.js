"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFacturaById = void 0;
const Factura_model_1 = __importDefault(require("../models/Factura_model"));
const Evento_model_1 = __importDefault(require("../models/Evento_model"));
const Pago_model_1 = __importDefault(require("../models/Pago_model"));
// Obtener una factura por ID
const getFacturaById = async (req, res) => {
    try {
        const { id_factura } = req.params;
        const factura = await Factura_model_1.default.findByPk(id_factura, {
            include: [
                {
                    model: Evento_model_1.default,
                    attributes: ['id_evento', 'fecha_evento']
                },
                {
                    model: Pago_model_1.default
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
    }
    catch (error) {
        console.error('Error al buscar factura:', error);
        res.status(500).json({
            error: 'Error al buscar factura',
            mensaje: 'Ocurrió un error al buscar la factura'
        });
    }
};
exports.getFacturaById = getFacturaById;
