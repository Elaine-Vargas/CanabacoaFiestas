"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCostosAgregados = exports.deleteCostoAgregado = exports.editCostoAgregado = exports.getCostosByEvento = exports.createCostoAgregado = void 0;
const CostoAgregadoEvento_model_1 = __importDefault(require("../models/CostoAgregadoEvento_model"));
const Evento_model_1 = __importDefault(require("../models/Evento_model"));
// Crear un nuevo costo agregado
const createCostoAgregado = async (req, res) => {
    try {
        const { id_evento, desc_costo, monto, tipo_costo, estado_costo_agregado } = req.body;
        // Validar campos requeridos
        if (!id_evento || !desc_costo || !monto) {
            return res.status(400).json({
                error: 'Campos incompletos',
                mensaje: 'El evento, descripción y monto son campos obligatorios'
            });
        }
        // Validar tipo_costo y estado_costo_agregado
        const tiposValidos = ['Extra', 'Descuento', 'Penalidad', 'Otro'];
        const estadosValidos = ['Activo', 'Eliminado'];
        if (tipo_costo && !tiposValidos.includes(tipo_costo)) {
            return res.status(400).json({
                error: 'Tipo de costo inválido',
                mensaje: 'El tipo de costo debe ser Extra, Descuento, Penalidad u Otro'
            });
        }
        if (estado_costo_agregado && !estadosValidos.includes(estado_costo_agregado)) {
            return res.status(400).json({
                error: 'Estado inválido',
                mensaje: 'El estado debe ser Activo o Eliminado'
            });
        }
        if (isNaN(monto) || parseFloat(monto) <= 0) {
            return res.status(400).json({
                error: 'Monto inválido',
                mensaje: 'El monto debe ser un número positivo'
            });
        }
        const evento = await Evento_model_1.default.findByPk(id_evento);
        if (!evento) {
            return res.status(404).json({
                error: 'No se encontró el evento',
                mensaje: 'El evento especificado no existe'
            });
        }
        const costoAgregado = await CostoAgregadoEvento_model_1.default.create({
            id_evento,
            desc_costo,
            monto: parseFloat(monto),
            tipo_costo: tipo_costo || 'Otro',
            estado_costo_agregado: estado_costo_agregado || 'Activo',
        });
        const costoCompleto = await CostoAgregadoEvento_model_1.default.findByPk(costoAgregado.id_costo_agregado, {
            include: [{ model: Evento_model_1.default, as: 'evento' }]
        });
        res.status(201).json({
            mensaje: 'Costo agregado creado exitosamente',
            costo: costoCompleto
        });
    }
    catch (error) {
        console.error('Error al crear costo agregado:', error);
        res.status(500).json({
            error: 'Error al crear el costo agregado',
            mensaje: 'Ocurrió un error al registrar el costo agregado'
        });
    }
};
exports.createCostoAgregado = createCostoAgregado;
// Obtener todos los costos agregados de un evento
const getCostosByEvento = async (req, res) => {
    try {
        const { id_evento } = req.params;
        if (isNaN(Number(id_evento))) {
            return res.status(400).json({
                error: 'ID de evento inválido',
                mensaje: 'El ID del evento debe ser un número'
            });
        }
        const evento = await Evento_model_1.default.findByPk(id_evento);
        if (!evento) {
            return res.status(404).json({
                error: 'No se encontró el evento',
                mensaje: 'El evento especificado no existe'
            });
        }
        const costos = await CostoAgregadoEvento_model_1.default.findAll({
            where: {
                id_evento,
                estado_costo_agregado: 'Activo'
            },
            include: [{ model: Evento_model_1.default, as: 'evento' }],
            order: [['fecha_registro', 'DESC']]
        });
        if (!costos || costos.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron costos',
                mensaje: 'No hay costos agregados registrados para este evento'
            });
        }
        res.json({
            mensaje: 'Costos agregados obtenidos exitosamente',
            costos
        });
    }
    catch (error) {
        console.error('Error al obtener costos agregados:', error);
        res.status(500).json({
            error: 'Error al obtener los costos agregados',
            mensaje: 'Ocurrió un error al cargar los costos agregados'
        });
    }
};
exports.getCostosByEvento = getCostosByEvento;
// Editar un costo agregado
const editCostoAgregado = async (req, res) => {
    try {
        const { id_costo_agregado } = req.params;
        const { desc_costo, monto, tipo_costo, estado_costo_agregado } = req.body;
        if (isNaN(Number(id_costo_agregado))) {
            return res.status(400).json({
                error: 'ID de costo inválido',
                mensaje: 'El ID del costo debe ser un número'
            });
        }
        if (monto && (isNaN(monto) || parseFloat(monto) <= 0)) {
            return res.status(400).json({
                error: 'Monto inválido',
                mensaje: 'El monto debe ser un número positivo'
            });
        }
        const tiposValidos = ['Extra', 'Descuento', 'Penalidad', 'Otro'];
        const estadosValidos = ['Activo', 'Eliminado'];
        if (tipo_costo && !tiposValidos.includes(tipo_costo)) {
            return res.status(400).json({
                error: 'Tipo de costo inválido',
                mensaje: 'El tipo de costo debe ser Extra, Descuento, Penalidad u Otro'
            });
        }
        if (estado_costo_agregado && !estadosValidos.includes(estado_costo_agregado)) {
            return res.status(400).json({
                error: 'Estado inválido',
                mensaje: 'El estado debe ser Activo o Eliminado'
            });
        }
        const costo = await CostoAgregadoEvento_model_1.default.findByPk(id_costo_agregado);
        if (!costo) {
            return res.status(404).json({
                error: 'No se encontró el costo',
                mensaje: 'El costo agregado especificado no existe'
            });
        }
        if (costo.estado_costo_agregado === 'Eliminado') {
            return res.status(400).json({
                error: 'Costo eliminado',
                mensaje: 'No se puede editar un costo que ha sido eliminado'
            });
        }
        await costo.update({
            desc_costo: desc_costo ?? costo.desc_costo,
            monto: monto ? parseFloat(monto) : costo.monto,
            tipo_costo: tipo_costo ?? costo.tipo_costo,
            estado_costo_agregado: estado_costo_agregado ?? costo.estado_costo_agregado
        });
        const costoActualizado = await CostoAgregadoEvento_model_1.default.findByPk(id_costo_agregado, {
            include: [{ model: Evento_model_1.default, as: 'evento' }]
        });
        res.json({
            mensaje: 'Costo agregado actualizado exitosamente',
            costo: costoActualizado
        });
    }
    catch (error) {
        console.error('Error al editar costo agregado:', error);
        res.status(500).json({
            error: 'Error al editar el costo agregado',
            mensaje: 'Ocurrió un error al actualizar el costo agregado'
        });
    }
};
exports.editCostoAgregado = editCostoAgregado;
// Eliminar un costo agregado (soft delete)
const deleteCostoAgregado = async (req, res) => {
    try {
        const { id_costo_agregado } = req.params;
        if (isNaN(Number(id_costo_agregado))) {
            return res.status(400).json({
                error: 'ID de costo inválido',
                mensaje: 'El ID del costo debe ser un número'
            });
        }
        const costo = await CostoAgregadoEvento_model_1.default.findByPk(id_costo_agregado);
        if (!costo) {
            return res.status(404).json({
                error: 'No se encontró el costo',
                mensaje: 'El costo agregado especificado no existe'
            });
        }
        if (costo.estado_costo_agregado === 'Eliminado') {
            return res.status(400).json({
                error: 'Costo ya eliminado',
                mensaje: 'Este costo ya ha sido eliminado anteriormente'
            });
        }
        await costo.update({
            estado_costo_agregado: 'Eliminado'
        });
        res.json({
            mensaje: 'Costo agregado eliminado correctamente',
            error: null
        });
    }
    catch (error) {
        console.error('Error al eliminar costo agregado:', error);
        res.status(500).json({
            error: 'Error al eliminar el costo agregado',
            mensaje: 'Ocurrió un error al eliminar el costo agregado'
        });
    }
};
exports.deleteCostoAgregado = deleteCostoAgregado;
// Obtener todos los costos agregados
const getAllCostosAgregados = async (req, res) => {
    try {
        const costos = await CostoAgregadoEvento_model_1.default.findAll({
            attributes: [
                'id_costo_agregado',
                'id_evento',
                'desc_costo',
                'monto',
                'tipo_costo',
                'estado_costo_agregado',
                'fecha_registro'
            ],
            where: {
                estado_costo_agregado: 'Activo'
            },
            include: [
                {
                    model: Evento_model_1.default,
                    as: 'evento',
                    attributes: ['id_evento', 'fecha_evento']
                }
            ],
            order: [
                ['fecha_registro', 'DESC'],
                ['id_costo_agregado', 'DESC']
            ]
        });
        if (!costos || costos.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron costos',
                mensaje: 'No hay costos agregados registrados en el sistema'
            });
        }
        res.json({
            mensaje: 'Costos agregados obtenidos exitosamente',
            total: costos.length,
            costos
        });
    }
    catch (error) {
        console.error('Error al obtener todos los costos agregados:', error);
        res.status(500).json({
            error: 'Error al obtener los costos agregados',
            mensaje: 'Ocurrió un error al cargar los costos agregados'
        });
    }
};
exports.getAllCostosAgregados = getAllCostosAgregados;
