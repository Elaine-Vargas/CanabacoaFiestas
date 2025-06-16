"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSupervision = exports.editSupervision = exports.getSupervisiones = exports.createSupervision = void 0;
const SupervisionServicio_model_1 = __importDefault(require("../models/SupervisionServicio_model"));
const Evento_model_1 = __importDefault(require("../models/Evento_model"));
const Usuario_model_1 = __importDefault(require("../models/Usuario_model"));
// Crear un nuevo servicio de supervisión
const createSupervision = async (req, res) => {
    try {
        const { id_evento, tarifa_hora, precioneto_supervision, itbis_supervision, total_supervision, estado_supervision } = req.body;
        // Verificar que el evento existe
        const evento = await Evento_model_1.default.findByPk(id_evento);
        if (!evento) {
            return res.status(404).json({
                error: 'Evento no encontrado',
                mensaje: 'No se encontró el evento solicitado'
            });
        }
        // Crear el servicio de supervisión
        const supervision = await SupervisionServicio_model_1.default.create({
            id_evento,
            tarifa_hora,
            precioneto_supervision,
            itbis_supervision,
            total_supervision,
            estado_supervision: estado_supervision || 'Aceptado'
        });
        // Obtener el servicio con el evento
        const supervisionCompleta = await SupervisionServicio_model_1.default.findByPk(supervision.id_supervision, {
            include: [
                {
                    model: Evento_model_1.default,
                    include: [
                        { model: Usuario_model_1.default, as: 'cliente' },
                        { model: Usuario_model_1.default, as: 'asesor' }
                    ]
                }
            ]
        });
        res.status(201).json(supervisionCompleta);
    }
    catch (error) {
        console.error('Error al crear servicio de supervisión:', error);
        res.status(500).json({
            error: 'Error al crear servicio de supervisión',
            mensaje: 'Ocurrió un error al crear el servicio de supervisión'
        });
    }
};
exports.createSupervision = createSupervision;
// Obtener todos los servicios de supervisión
const getSupervisiones = async (req, res) => {
    try {
        const supervisiones = await SupervisionServicio_model_1.default.findAll({
            include: [
                {
                    model: Evento_model_1.default,
                    include: [
                        { model: Usuario_model_1.default, as: 'cliente' },
                        { model: Usuario_model_1.default, as: 'asesor' }
                    ]
                }
            ],
            order: [['id_supervision', 'DESC']]
        });
        if (!supervisiones || supervisiones.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron supervisiones',
                mensaje: 'No hay servicios de supervisión registrados en el sistema'
            });
        }
        res.json(supervisiones);
    }
    catch (error) {
        console.error('Error al obtener servicios de supervisión:', error);
        res.status(500).json({
            error: 'Error al obtener servicios de supervisión',
            mensaje: 'Ocurrió un error al cargar los servicios de supervisión'
        });
    }
};
exports.getSupervisiones = getSupervisiones;
// Editar un servicio de supervisión
const editSupervision = async (req, res) => {
    try {
        const { id_supervision } = req.params;
        const { tarifa_hora, precioneto_supervision, itbis_supervision, total_supervision, estado_supervision } = req.body;
        const supervision = await SupervisionServicio_model_1.default.findByPk(id_supervision);
        if (!supervision) {
            return res.status(404).json({
                error: 'Servicio de supervisión no encontrado',
                mensaje: 'No se encontró el servicio de supervisión solicitado'
            });
        }
        // Actualizar el servicio
        await supervision.update({
            tarifa_hora: tarifa_hora || supervision.tarifa_hora,
            precioneto_supervision: precioneto_supervision || supervision.precioneto_supervision,
            itbis_supervision: itbis_supervision || supervision.itbis_supervision,
            total_supervision: total_supervision || supervision.total_supervision,
            estado_supervision: estado_supervision || supervision.estado_supervision
        });
        // Obtener el servicio actualizado con el evento
        const supervisionActualizada = await SupervisionServicio_model_1.default.findByPk(id_supervision, {
            include: [
                {
                    model: Evento_model_1.default,
                    include: [
                        { model: Usuario_model_1.default, as: 'cliente' },
                        { model: Usuario_model_1.default, as: 'asesor' }
                    ]
                }
            ]
        });
        res.json(supervisionActualizada);
    }
    catch (error) {
        console.error('Error al editar servicio de supervisión:', error);
        res.status(500).json({
            error: 'Error al editar servicio de supervisión',
            mensaje: 'Ocurrió un error al actualizar el servicio de supervisión'
        });
    }
};
exports.editSupervision = editSupervision;
// Eliminar lógicamente un servicio de supervisión
const deleteSupervision = async (req, res) => {
    try {
        const { id_supervision } = req.params;
        const supervision = await SupervisionServicio_model_1.default.findByPk(id_supervision);
        if (!supervision) {
            return res.status(404).json({
                error: 'Servicio de supervisión no encontrado',
                mensaje: 'No se encontró el servicio de supervisión solicitado'
            });
        }
        // Actualizar el estado a Cancelado
        await supervision.update({
            estado_supervision: 'Cancelado'
        });
        res.json({
            error: null,
            mensaje: 'Servicio de supervisión cancelado correctamente'
        });
    }
    catch (error) {
        console.error('Error al cancelar servicio de supervisión:', error);
        res.status(500).json({
            error: 'Error al cancelar servicio de supervisión',
            mensaje: 'Ocurrió un error al cancelar el servicio de supervisión'
        });
    }
};
exports.deleteSupervision = deleteSupervision;
