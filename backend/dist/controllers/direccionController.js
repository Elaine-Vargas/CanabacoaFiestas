"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCiudadesByProvincia = exports.getCiudades = exports.getProvincias = exports.deleteDireccion = exports.editDireccion = exports.createDireccion = exports.searchDirecciones = exports.getDireccionById = exports.getDirecciones = void 0;
const sequelize_1 = require("sequelize");
const Direccion_model_1 = __importDefault(require("../models/Direccion_model"));
const Ciudad_model_1 = __importDefault(require("../models/Ciudad_model"));
const Provincia_model_1 = __importDefault(require("../models/Provincia_model"));
// Obtener todas las direcciones
const getDirecciones = async (req, res) => {
    try {
        const direcciones = await Direccion_model_1.default.findAll({
            include: [
                {
                    model: Ciudad_model_1.default,
                    attributes: ['id_ciudad', 'nombre_ciudad'],
                    include: [
                        {
                            model: Provincia_model_1.default,
                            attributes: ['id_provincia', 'nombre_provincia']
                        }
                    ]
                }
            ]
        });
        if (!direcciones || direcciones.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron direcciones',
                mensaje: 'No hay direcciones registradas en el sistema'
            });
        }
        res.json(direcciones);
    }
    catch (error) {
        console.error('Error al obtener direcciones:', error);
        res.status(500).json({
            error: 'Error al obtener las direcciones',
            mensaje: 'Ocurrió un error al cargar las direcciones'
        });
    }
};
exports.getDirecciones = getDirecciones;
// Obtener una dirección por ID
const getDireccionById = async (req, res) => {
    try {
        const { id_direccion } = req.params;
        const direccion = await Direccion_model_1.default.findByPk(id_direccion, {
            include: [
                {
                    model: Ciudad_model_1.default,
                    attributes: ['id_ciudad', 'nombre_ciudad'],
                    include: [
                        {
                            model: Provincia_model_1.default,
                            attributes: ['id_provincia', 'nombre_provincia']
                        }
                    ]
                }
            ]
        });
        if (!direccion) {
            return res.status(404).json({
                error: 'Dirección no encontrada',
                mensaje: 'No se encontró la dirección solicitada'
            });
        }
        res.json(direccion);
    }
    catch (error) {
        console.error('Error al buscar dirección:', error);
        res.status(500).json({
            error: 'Error al buscar dirección',
            mensaje: 'Ocurrió un error al buscar la dirección'
        });
    }
};
exports.getDireccionById = getDireccionById;
// Buscar direcciones
const searchDirecciones = async (req, res) => {
    try {
        const { sector, calle, ciudad } = req.query;
        const whereClause = {};
        if (sector) {
            whereClause.sector = {
                [sequelize_1.Op.like]: `%${sector}%`
            };
        }
        if (calle) {
            whereClause.calle = {
                [sequelize_1.Op.like]: `%${calle}%`
            };
        }
        if (ciudad) {
            whereClause['$ciudad.nombre_ciudad$'] = {
                [sequelize_1.Op.like]: `%${ciudad}%`
            };
        }
        const direcciones = await Direccion_model_1.default.findAll({
            where: whereClause,
            include: [
                {
                    model: Ciudad_model_1.default,
                    attributes: ['id_ciudad', 'nombre_ciudad'],
                    include: [
                        {
                            model: Provincia_model_1.default,
                            attributes: ['id_provincia', 'nombre_provincia']
                        }
                    ]
                }
            ]
        });
        if (!direcciones || direcciones.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron direcciones',
                mensaje: 'No hay direcciones que coincidan con los criterios de búsqueda'
            });
        }
        res.json(direcciones);
    }
    catch (error) {
        console.error('Error al buscar direcciones:', error);
        res.status(500).json({
            error: 'Error al buscar direcciones',
            mensaje: 'Ocurrió un error al realizar la búsqueda'
        });
    }
};
exports.searchDirecciones = searchDirecciones;
// Crear una nueva dirección
const createDireccion = async (req, res) => {
    try {
        const { id_ciudad, sector, calle, detalles } = req.body;
        // Verificar que la ciudad existe
        const ciudad = await Ciudad_model_1.default.findByPk(id_ciudad);
        if (!ciudad) {
            return res.status(404).json({ error: 'Ciudad no encontrada' });
        }
        // Crear la dirección
        const direccion = await Direccion_model_1.default.create({
            id_ciudad,
            sector,
            calle,
            detalles: detalles || null
        });
        // Obtener la dirección con sus relaciones
        const direccionCompleta = await Direccion_model_1.default.findByPk(direccion.id_direccion, {
            include: [
                {
                    model: Ciudad_model_1.default,
                    attributes: ['id_ciudad', 'nombre_ciudad'],
                    include: [
                        {
                            model: Provincia_model_1.default,
                            attributes: ['id_provincia', 'nombre_provincia']
                        }
                    ]
                }
            ]
        });
        res.status(201).json(direccionCompleta);
    }
    catch (error) {
        console.error('Error al crear dirección:', error);
        res.status(500).json({
            error: 'Error al crear dirección',
            mensaje: 'Ocurrió un error al crear la dirección'
        });
    }
};
exports.createDireccion = createDireccion;
// Editar una dirección
const editDireccion = async (req, res) => {
    try {
        const { id_direccion } = req.params;
        const { id_ciudad, sector, calle, detalles } = req.body;
        const direccion = await Direccion_model_1.default.findByPk(id_direccion);
        if (!direccion) {
            return res.status(404).json({ error: 'Dirección no encontrada' });
        }
        // Verificar que la ciudad existe si se proporciona
        if (id_ciudad) {
            const ciudad = await Ciudad_model_1.default.findByPk(id_ciudad);
            if (!ciudad) {
                return res.status(404).json({ error: 'Ciudad no encontrada' });
            }
        }
        // Actualizar la dirección
        await direccion.update({
            id_ciudad: id_ciudad || direccion.id_ciudad,
            sector: sector || direccion.sector,
            calle: calle || direccion.calle,
            detalles: detalles || direccion.detalles
        });
        // Obtener la dirección actualizada con sus relaciones
        const direccionActualizada = await Direccion_model_1.default.findByPk(id_direccion, {
            include: [
                {
                    model: Ciudad_model_1.default,
                    attributes: ['id_ciudad', 'nombre_ciudad'],
                    include: [
                        {
                            model: Provincia_model_1.default,
                            attributes: ['id_provincia', 'nombre_provincia']
                        }
                    ]
                }
            ]
        });
        res.json(direccionActualizada);
    }
    catch (error) {
        console.error('Error al editar dirección:', error);
        res.status(500).json({
            error: 'Error al editar dirección',
            mensaje: 'Ocurrió un error al actualizar la dirección'
        });
    }
};
exports.editDireccion = editDireccion;
// Eliminar lógicamente una dirección
const deleteDireccion = async (req, res) => {
    try {
        const { id_direccion } = req.params;
        const direccion = await Direccion_model_1.default.findByPk(id_direccion);
        if (!direccion) {
            return res.status(404).json({ error: 'Dirección no encontrada' });
        }
        // Eliminar lógicamente la dirección
        await direccion.destroy();
        res.json({ mensaje: 'Dirección eliminada correctamente' });
    }
    catch (error) {
        console.error('Error al eliminar dirección:', error);
        res.status(500).json({
            error: 'Error al eliminar dirección',
            mensaje: 'Ocurrió un error al eliminar la dirección'
        });
    }
};
exports.deleteDireccion = deleteDireccion;
// Obtener todas las provincias
const getProvincias = async (req, res) => {
    try {
        const provincias = await Provincia_model_1.default.findAll({
            attributes: ['id_provincia', 'nombre_provincia']
        });
        if (!provincias || provincias.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron provincias',
                mensaje: 'No hay provincias registradas en el sistema'
            });
        }
        res.json(provincias);
    }
    catch (error) {
        console.error('Error al obtener provincias:', error);
        res.status(500).json({
            error: 'Error al obtener las provincias',
            mensaje: 'Ocurrió un error al cargar las provincias'
        });
    }
};
exports.getProvincias = getProvincias;
// Obtener todas las ciudades
const getCiudades = async (req, res) => {
    try {
        const ciudades = await Ciudad_model_1.default.findAll({
            include: [
                {
                    model: Provincia_model_1.default,
                    attributes: ['id_provincia', 'nombre_provincia']
                }
            ],
            order: [['nombre_ciudad', 'ASC']]
        });
        if (!ciudades || ciudades.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron ciudades',
                mensaje: 'No hay ciudades registradas en el sistema'
            });
        }
        res.json(ciudades);
    }
    catch (error) {
        console.error('Error al obtener ciudades:', error);
        res.status(500).json({
            error: 'Error al obtener las ciudades',
            mensaje: 'Ocurrió un error al cargar las ciudades'
        });
    }
};
exports.getCiudades = getCiudades;
// Obtener ciudades por provincia
const getCiudadesByProvincia = async (req, res) => {
    try {
        const { id_provincia } = req.params;
        // Verificar que la provincia existe
        const provincia = await Provincia_model_1.default.findByPk(id_provincia);
        if (!provincia) {
            return res.status(404).json({ error: 'Provincia no encontrada' });
        }
        const ciudades = await Ciudad_model_1.default.findAll({
            where: { id_provincia },
            include: [
                {
                    model: Provincia_model_1.default,
                    attributes: ['id_provincia', 'nombre_provincia']
                }
            ],
            order: [['nombre_ciudad', 'ASC']]
        });
        if (!ciudades || ciudades.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron ciudades',
                mensaje: 'No hay ciudades registradas para esta provincia'
            });
        }
        res.json(ciudades);
    }
    catch (error) {
        console.error('Error al obtener ciudades de la provincia:', error);
        res.status(500).json({
            error: 'Error al obtener las ciudades de la provincia',
            mensaje: 'Ocurrió un error al cargar las ciudades'
        });
    }
};
exports.getCiudadesByProvincia = getCiudadesByProvincia;
