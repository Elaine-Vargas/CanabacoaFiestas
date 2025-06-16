"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProveedorEstado = exports.deleteProveedor = exports.editProveedor = exports.createProveedor = exports.searchProveedores = exports.getProveedores = void 0;
const sequelize_1 = require("sequelize");
const Proveedor_model_1 = __importDefault(require("../models/Proveedor_model"));
const Direccion_model_1 = __importDefault(require("../models/Direccion_model"));
const Ciudad_model_1 = __importDefault(require("../models/Ciudad_model"));
const Provincia_model_1 = __importDefault(require("../models/Provincia_model"));
// Obtener todos los proveedores
const getProveedores = async (req, res) => {
    try {
        const proveedores = await Proveedor_model_1.default.findAll({
            include: [
                {
                    model: Direccion_model_1.default,
                    attributes: ['id_direccion', 'sector', 'calle', 'detalles'],
                    include: [
                        {
                            model: Ciudad_model_1.default,
                            attributes: ['nombre_ciudad'],
                            include: [
                                {
                                    model: Provincia_model_1.default,
                                    attributes: ['nombre_provincia']
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['nombre_proveedor', 'ASC']]
        });
        if (!proveedores || proveedores.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron proveedores',
                mensaje: 'No hay proveedores registrados'
            });
        }
        res.json(proveedores);
    }
    catch (error) {
        console.error('Error al obtener proveedores:', error);
        res.status(500).json({
            error: 'Error al obtener los proveedores',
            mensaje: 'Ocurrió un error al cargar los proveedores'
        });
    }
};
exports.getProveedores = getProveedores;
// Buscar proveedores por nombre
const searchProveedores = async (req, res) => {
    try {
        const { nombre, tipo } = req.query;
        const whereClause = {};
        if (nombre) {
            whereClause.nombre_proveedor = {
                [sequelize_1.Op.like]: `%${nombre}%`
            };
        }
        if (tipo && ['Catering', 'Elementos'].includes(tipo)) {
            whereClause.tipo_proveedor = tipo;
        }
        const proveedores = await Proveedor_model_1.default.findAll({
            where: whereClause,
            include: [
                {
                    model: Direccion_model_1.default,
                    attributes: ['id_direccion', 'sector', 'calle', 'detalles'],
                    include: [
                        {
                            model: Ciudad_model_1.default,
                            attributes: ['nombre_ciudad'],
                            include: [
                                {
                                    model: Provincia_model_1.default,
                                    attributes: ['nombre_provincia']
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['nombre_proveedor', 'ASC']]
        });
        if (!proveedores || proveedores.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron proveedores',
                mensaje: 'No hay proveedores que coincidan con la búsqueda'
            });
        }
        res.json(proveedores);
    }
    catch (error) {
        console.error('Error al buscar proveedores:', error);
        res.status(500).json({
            error: 'Error al buscar proveedores',
            mensaje: 'Ocurrió un error al realizar la búsqueda'
        });
    }
};
exports.searchProveedores = searchProveedores;
// Crear un nuevo proveedor
const createProveedor = async (req, res) => {
    try {
        const { tipo_proveedor, nombre_proveedor, tel_proveedor, correo_proveedor, id_direccion } = req.body;
        // Validar tipo de proveedor
        if (!['Catering', 'Elementos'].includes(tipo_proveedor)) {
            return res.status(400).json({ error: 'Tipo de proveedor inválido' });
        }
        // Verificar que la dirección existe
        const direccion = await Direccion_model_1.default.findByPk(id_direccion);
        if (!direccion) {
            return res.status(404).json({ error: 'Dirección no encontrada' });
        }
        // Crear el proveedor
        const proveedor = await Proveedor_model_1.default.create({
            tipo_proveedor,
            nombre_proveedor,
            tel_proveedor,
            correo_proveedor,
            id_direccion,
            estado_proveedor: 'Activo'
        });
        // Obtener el proveedor con sus relaciones
        const proveedorCompleto = await Proveedor_model_1.default.findByPk(proveedor.id_proveedor, {
            include: [
                {
                    model: Direccion_model_1.default,
                    attributes: ['id_direccion', 'sector', 'calle', 'detalles']
                }
            ]
        });
        res.status(201).json(proveedorCompleto);
    }
    catch (error) {
        console.error('Error al crear proveedor:', error);
        res.status(500).json({
            error: 'Error al crear proveedor',
            mensaje: 'Ocurrió un error al crear el proveedor'
        });
    }
};
exports.createProveedor = createProveedor;
// Editar un proveedor
const editProveedor = async (req, res) => {
    try {
        const { id_proveedor } = req.params;
        const { tipo_proveedor, nombre_proveedor, tel_proveedor, correo_proveedor, id_direccion, estado_proveedor } = req.body;
        const proveedor = await Proveedor_model_1.default.findByPk(id_proveedor);
        if (!proveedor) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        // Validar tipo de proveedor si se proporciona
        if (tipo_proveedor && !['Catering', 'Elementos'].includes(tipo_proveedor)) {
            return res.status(400).json({ error: 'Tipo de proveedor inválido' });
        }
        // Verificar que la dirección existe si se proporciona
        if (id_direccion) {
            const direccion = await Direccion_model_1.default.findByPk(id_direccion);
            if (!direccion) {
                return res.status(404).json({ error: 'Dirección no encontrada' });
            }
        }
        // Validar estado si se proporciona
        if (estado_proveedor && !['Activo', 'Inactivo', 'Eliminado'].includes(estado_proveedor)) {
            return res.status(400).json({ error: 'Estado de proveedor inválido' });
        }
        // Actualizar el proveedor
        await proveedor.update({
            tipo_proveedor: tipo_proveedor || proveedor.tipo_proveedor,
            nombre_proveedor: nombre_proveedor || proveedor.nombre_proveedor,
            tel_proveedor: tel_proveedor || proveedor.tel_proveedor,
            correo_proveedor: correo_proveedor || proveedor.correo_proveedor,
            id_direccion: id_direccion || proveedor.id_direccion,
            estado_proveedor: estado_proveedor || proveedor.estado_proveedor
        });
        // Obtener el proveedor actualizado con sus relaciones
        const proveedorActualizado = await Proveedor_model_1.default.findByPk(id_proveedor, {
            include: [
                {
                    model: Direccion_model_1.default,
                    attributes: ['id_direccion', 'sector', 'calle', 'detalles']
                }
            ]
        });
        res.json(proveedorActualizado);
    }
    catch (error) {
        console.error('Error al editar proveedor:', error);
        res.status(500).json({
            error: 'Error al editar proveedor',
            mensaje: 'Ocurrió un error al actualizar el proveedor'
        });
    }
};
exports.editProveedor = editProveedor;
// Eliminar lógicamente un proveedor
const deleteProveedor = async (req, res) => {
    try {
        const { id_proveedor } = req.params;
        const proveedor = await Proveedor_model_1.default.findByPk(id_proveedor);
        if (!proveedor) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        // Verificar si el proveedor ya está eliminado
        if (proveedor.estado_proveedor === 'Eliminado') {
            return res.status(400).json({
                error: 'Proveedor ya eliminado',
                mensaje: 'El proveedor ya ha sido eliminado anteriormente'
            });
        }
        // Actualizar el estado a 'Eliminado'
        await proveedor.update({ estado_proveedor: 'Eliminado' });
        const proveedorActualizado = await Proveedor_model_1.default.findByPk(id_proveedor, {
            include: [
                {
                    model: Direccion_model_1.default,
                    attributes: ['id_direccion', 'sector', 'calle', 'detalles']
                }
            ]
        });
        res.json({
            mensaje: 'Proveedor eliminado exitosamente',
            proveedor: proveedorActualizado
        });
    }
    catch (error) {
        console.error('Error al eliminar proveedor:', error);
        res.status(500).json({
            error: 'Error al eliminar proveedor',
            mensaje: 'Ocurrió un error al eliminar el proveedor'
        });
    }
};
exports.deleteProveedor = deleteProveedor;
// Actualizar estado de un proveedor
const updateProveedorEstado = async (req, res) => {
    try {
        const { id_proveedor } = req.params;
        const { estado_proveedor } = req.body;
        const proveedor = await Proveedor_model_1.default.findByPk(id_proveedor);
        if (!proveedor) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        // Validar estado
        if (!['Activo', 'Inactivo', 'Eliminado'].includes(estado_proveedor)) {
            return res.status(400).json({ error: 'Estado de proveedor inválido' });
        }
        // Actualizar el estado
        await proveedor.update({ estado_proveedor });
        res.json({
            mensaje: 'Estado del proveedor actualizado exitosamente',
            proveedor
        });
    }
    catch (error) {
        console.error('Error al actualizar estado del proveedor:', error);
        res.status(500).json({
            error: 'Error al actualizar estado del proveedor',
            mensaje: 'Ocurrió un error al actualizar el estado'
        });
    }
};
exports.updateProveedorEstado = updateProveedorEstado;
