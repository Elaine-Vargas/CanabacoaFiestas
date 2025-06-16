"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComentario = exports.editComentario = exports.getComentariosByUsuario = exports.getComentariosByEvento = exports.getComentarios = exports.createComentario = void 0;
const Comentario_model_1 = __importDefault(require("../models/Comentario_model"));
const Evento_model_1 = __importDefault(require("../models/Evento_model"));
const Usuario_model_1 = __importDefault(require("../models/Usuario_model"));
const sequelize_1 = require("sequelize");
// Crear un nuevo comentario
const createComentario = async (req, res) => {
    try {
        const { comentario, calificacion, id_evento } = req.body;
        // Verificar que el evento existe
        const evento = await Evento_model_1.default.findByPk(id_evento);
        if (!evento) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }
        const nuevoComentario = await Comentario_model_1.default.create({
            comentario,
            calificacion,
            id_evento,
            estado_comentario: 'Activo'
        });
        // Obtener el comentario con sus relaciones
        const comentarioCompleto = await Comentario_model_1.default.findByPk(nuevoComentario.id_comentario, {
            include: [
                {
                    model: Evento_model_1.default,
                    include: [
                        {
                            model: Usuario_model_1.default,
                            as: 'cliente',
                            attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
                        }
                    ]
                }
            ]
        });
        res.status(201).json(comentarioCompleto);
    }
    catch (error) {
        console.error('Error al crear comentario:', error);
        res.status(500).json({ error: 'Error al crear comentario' });
    }
};
exports.createComentario = createComentario;
// Obtener todos los comentarios
const getComentarios = async (req, res) => {
    try {
        const comentarios = await Comentario_model_1.default.findAll({
            where: {
                estado_comentario: {
                    [sequelize_1.Op.ne]: 'Eliminado'
                }
            },
            include: [
                {
                    model: Evento_model_1.default,
                    include: [
                        {
                            model: Usuario_model_1.default,
                            as: 'cliente',
                            attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
                        }
                    ]
                }
            ]
        });
        // 👇 Aquí puedes inspeccionar lo que trae directamente Sequelize
        console.log('Comentarios obtenidos desde la base de datos:');
        const comentariosTransformados = comentarios.map(comentario => ({
            id_comentario: comentario.id_comentario,
            comentario: comentario.comentario,
            calificacion: comentario.calificacion,
            estado_comentario: comentario.estado_comentario,
            id_evento: comentario.id_evento,
            evento: comentario.evento
                ? {
                    cliente: comentario.evento.cliente ?? null
                }
                : null
        }));
        res.json(comentariosTransformados);
    }
    catch (error) {
        console.error('Error al obtener comentarios:', error);
        res.status(500).json({ error: 'Error al obtener comentarios' });
    }
};
exports.getComentarios = getComentarios;
// Obtener comentarios por evento
const getComentariosByEvento = async (req, res) => {
    try {
        const { id_evento } = req.params;
        const comentarios = await Comentario_model_1.default.findAll({
            where: {
                id_evento,
                estado_comentario: {
                    [sequelize_1.Op.ne]: 'Eliminado'
                }
            },
            include: [
                {
                    model: Evento_model_1.default,
                    include: [
                        {
                            model: Usuario_model_1.default,
                            as: 'cliente',
                            attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
                        }
                    ]
                }
            ]
        });
        if (!comentarios || comentarios.length === 0) {
            return res.status(404).json({ error: 'No se encontraron comentarios para este evento' });
        }
        res.json(comentarios);
    }
    catch (error) {
        console.error('Error al obtener comentarios del evento:', error);
        res.status(500).json({ error: 'Error al obtener comentarios del evento' });
    }
};
exports.getComentariosByEvento = getComentariosByEvento;
// Obtener comentarios por usuario
const getComentariosByUsuario = async (req, res) => {
    try {
        const { cedula_usuario } = req.params;
        const comentarios = await Comentario_model_1.default.findAll({
            include: [
                {
                    model: Evento_model_1.default,
                    where: {
                        cedula_cliente: cedula_usuario
                    },
                    include: [
                        {
                            model: Usuario_model_1.default,
                            as: 'cliente',
                            attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
                        }
                    ]
                }
            ],
            where: {
                estado_comentario: {
                    [sequelize_1.Op.ne]: 'Eliminado'
                }
            }
        });
        // Cambiado: Si no hay comentarios, devolver array vacío y mensaje informativo
        if (!comentarios || comentarios.length === 0) {
            return res.status(200).json([]); // No error, solo array vacío
        }
        res.json(comentarios);
    }
    catch (error) {
        console.error('Error al obtener comentarios del usuario:', error);
        res.status(500).json({ error: 'Error al obtener comentarios del usuario' });
    }
};
exports.getComentariosByUsuario = getComentariosByUsuario;
// Editar un comentario
const editComentario = async (req, res) => {
    try {
        const { id_comentario } = req.params;
        const { comentario, calificacion } = req.body;
        const comentarioExistente = await Comentario_model_1.default.findByPk(id_comentario);
        if (!comentarioExistente) {
            return res.status(404).json({ error: 'Comentario no encontrado' });
        }
        await comentarioExistente.update({
            comentario: comentario || comentarioExistente.comentario,
            calificacion: calificacion || comentarioExistente.calificacion,
            estado_comentario: 'Editado'
        });
        // Obtener el comentario actualizado con sus relaciones
        const comentarioActualizado = await Comentario_model_1.default.findByPk(id_comentario, {
            include: [
                {
                    model: Evento_model_1.default,
                    include: [
                        {
                            model: Usuario_model_1.default,
                            as: 'cliente',
                            attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
                        }
                    ]
                }
            ]
        });
        res.json(comentarioActualizado);
    }
    catch (error) {
        console.error('Error al editar comentario:', error);
        res.status(500).json({ error: 'Error al editar comentario' });
    }
};
exports.editComentario = editComentario;
// Eliminar lógicamente un comentario
const deleteComentario = async (req, res) => {
    try {
        const { id_comentario } = req.params;
        const comentario = await Comentario_model_1.default.findByPk(id_comentario);
        if (!comentario) {
            return res.status(404).json({ error: 'Comentario no encontrado' });
        }
        await comentario.update({
            estado_comentario: 'Eliminado'
        });
        res.json({ message: 'Comentario eliminado correctamente' });
    }
    catch (error) {
        console.error('Error al eliminar comentario:', error);
        res.status(500).json({ error: 'Error al eliminar comentario' });
    }
};
exports.deleteComentario = deleteComentario;
