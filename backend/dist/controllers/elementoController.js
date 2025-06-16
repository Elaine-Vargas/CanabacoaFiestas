"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteElemento = exports.editElemento = exports.searchElementos = exports.createElemento = exports.getSubcategoriasByCategoria = exports.getSubcategorias = exports.getMateriales = exports.getColores = exports.getCategorias = exports.getElementoById = exports.getElementos = void 0;
const sequelize_1 = require("sequelize");
const Elemento_model_1 = __importDefault(require("../models/Elemento_model"));
const SubcategoriaElemento_model_1 = __importDefault(require("../models/SubcategoriaElemento_model"));
const ColorElemento_model_1 = __importDefault(require("../models/ColorElemento_model"));
const CategoriaElemento_model_1 = __importDefault(require("../models/CategoriaElemento_model"));
const MaterialElemento_model_1 = __importDefault(require("../models/MaterialElemento_model"));
const getElementos = async (req, res) => {
    try {
        const { includeDeleted } = req.query;
        console.log('Obteniendo elementos, includeDeleted:', includeDeleted);
        const elementos = await Elemento_model_1.default.findAll({
            attributes: [
                'id_elemento',
                'nombre_elemento',
                'precio_elemento',
                'imagen_url',
                'cantidad_total',
                'cantidad_disponible',
                'estado_elemento'
            ],
            include: [
                {
                    model: SubcategoriaElemento_model_1.default,
                    as: 'subcategoria',
                    include: [{
                            model: CategoriaElemento_model_1.default,
                            as: 'categoria'
                        }]
                },
                {
                    model: ColorElemento_model_1.default,
                    as: 'color'
                },
                {
                    model: MaterialElemento_model_1.default,
                    as: 'material'
                }
            ],
            where: includeDeleted ? {} : {
                estado_elemento: {
                    [sequelize_1.Op.ne]: 'Eliminado'
                }
            }
        });
        console.log('Query ejecutada correctamente');
        console.log('Elementos encontrados:', elementos.length);
        const estadosPorElemento = elementos.reduce((acc, e) => {
            const estado = e.estado_elemento;
            acc[estado] = (acc[estado] || 0) + 1;
            return acc;
        }, {});
        console.log('Elementos por estado:', estadosPorElemento);
        if (elementos.length > 0) {
            console.log('Primer elemento:', JSON.stringify(elementos[0].toJSON(), null, 2));
        }
        if (!elementos || elementos.length === 0) {
            console.log('No se encontraron elementos');
            return res.status(404).json({
                error: 'No se encontraron elementos',
                mensaje: 'No hay elementos disponibles en el catálogo'
            });
        }
        console.log('Enviando respuesta con elementos...');
        res.json(elementos);
    }
    catch (error) {
        console.error('Error detallado al obtener elementos:', error);
        res.status(500).json({
            error: 'Error al obtener los elementos',
            mensaje: 'Ocurrió un error al cargar los elementos. Por favor, intente más tarde.'
        });
    }
};
exports.getElementos = getElementos;
const getElementoById = async (req, res) => {
    try {
        console.log('Buscando elemento con ID:', req.params.id);
        const elemento = await Elemento_model_1.default.findByPk(req.params.id, {
            attributes: [
                'id_elemento',
                'nombre_elemento',
                'precio_elemento',
                'imagen_url',
                'cantidad_total',
                'cantidad_disponible',
                'estado_elemento'
            ],
            include: [
                {
                    model: SubcategoriaElemento_model_1.default,
                    as: 'subcategoria',
                    include: [{
                            model: CategoriaElemento_model_1.default,
                            as: 'categoria'
                        }]
                },
                {
                    model: ColorElemento_model_1.default,
                    as: 'color'
                },
                {
                    model: MaterialElemento_model_1.default,
                    as: 'material'
                }
            ]
        });
        console.log('Elemento encontrado:', elemento);
        if (!elemento) {
            console.log('Elemento no encontrado');
            return res.status(404).json({
                error: 'Elemento no encontrado',
                mensaje: 'No se encontró el elemento solicitado'
            });
        }
        res.json(elemento);
    }
    catch (error) {
        console.error('Error al buscar elemento por ID:', error);
        res.status(500).json({
            error: 'Error al buscar elemento',
            mensaje: 'Ocurrió un error al buscar el elemento'
        });
    }
};
exports.getElementoById = getElementoById;
const getCategorias = async (req, res) => {
    try {
        console.log('Intentando obtener categorías...');
        const categorias = await CategoriaElemento_model_1.default.findAll({
            include: [{
                    model: SubcategoriaElemento_model_1.default,
                    as: 'subcategorias'
                }]
        });
        if (!categorias || categorias.length === 0) {
            console.log('No se encontraron categorías');
            return res.status(404).json({
                error: 'No se encontraron categorías',
                mensaje: 'No hay categorías disponibles'
            });
        }
        res.json(categorias);
    }
    catch (error) {
        console.error('Error detallado al obtener categorías:', error);
        res.status(500).json({
            error: 'Error al obtener las categorías',
            mensaje: 'Ocurrió un error al cargar las categorías. Por favor, intente más tarde.'
        });
    }
};
exports.getCategorias = getCategorias;
const getColores = async (req, res) => {
    try {
        console.log('Intentando obtener colores...');
        const colores = await ColorElemento_model_1.default.findAll();
        if (!colores || colores.length === 0) {
            console.log('No se encontraron colores');
            return res.status(404).json({
                error: 'No se encontraron colores',
                mensaje: 'No hay colores disponibles'
            });
        }
        res.json(colores);
    }
    catch (error) {
        console.error('Error detallado al obtener colores:', error);
        res.status(500).json({
            error: 'Error al obtener los colores',
            mensaje: 'Ocurrió un error al cargar los colores. Por favor, intente más tarde.'
        });
    }
};
exports.getColores = getColores;
const getMateriales = async (req, res) => {
    try {
        console.log('Intentando obtener materiales...');
        const materiales = await MaterialElemento_model_1.default.findAll({
            attributes: ['id_material', 'nombre_material']
        });
        if (!materiales || materiales.length === 0) {
            console.log('No se encontraron materiales');
            return res.status(404).json({
                error: 'No se encontraron materiales',
                mensaje: 'No hay materiales disponibles'
            });
        }
        res.json(materiales);
    }
    catch (error) {
        console.error('Error detallado al obtener materiales:', error);
        res.status(500).json({
            error: 'Error al obtener los materiales',
            mensaje: 'Ocurrió un error al cargar los materiales. Por favor, intente más tarde.'
        });
    }
};
exports.getMateriales = getMateriales;
// Obtener todas las subcategorías
const getSubcategorias = async (req, res) => {
    try {
        console.log('Intentando obtener subcategorías...');
        const subcategorias = await SubcategoriaElemento_model_1.default.findAll({
            include: [{
                    model: CategoriaElemento_model_1.default,
                    as: 'categoria'
                }]
        });
        if (!subcategorias || subcategorias.length === 0) {
            console.log('No se encontraron subcategorías');
            return res.status(404).json({
                error: 'No se encontraron subcategorías',
                mensaje: 'No hay subcategorías disponibles'
            });
        }
        res.json(subcategorias);
    }
    catch (error) {
        console.error('Error detallado al obtener subcategorías:', error);
        res.status(500).json({
            error: 'Error al obtener las subcategorías',
            mensaje: 'Ocurrió un error al cargar las subcategorías. Por favor, intente más tarde.'
        });
    }
};
exports.getSubcategorias = getSubcategorias;
// Obtener subcategorías por categoría
const getSubcategoriasByCategoria = async (req, res) => {
    try {
        const { id_categoria } = req.params;
        console.log('Intentando obtener subcategorías para la categoría:', id_categoria);
        const subcategorias = await SubcategoriaElemento_model_1.default.findAll({
            where: {
                id_categoria: id_categoria
            },
            include: [{
                    model: CategoriaElemento_model_1.default,
                    as: 'categoria'
                }]
        });
        if (!subcategorias || subcategorias.length === 0) {
            console.log('No se encontraron subcategorías para la categoría especificada');
            return res.status(404).json({
                error: 'No se encontraron subcategorías',
                mensaje: 'No hay subcategorías disponibles para esta categoría'
            });
        }
        res.json(subcategorias);
    }
    catch (error) {
        console.error('Error detallado al obtener subcategorías por categoría:', error);
        res.status(500).json({
            error: 'Error al obtener las subcategorías',
            mensaje: 'Ocurrió un error al cargar las subcategorías. Por favor, intente más tarde.'
        });
    }
};
exports.getSubcategoriasByCategoria = getSubcategoriasByCategoria;
// Crear un nuevo elemento
const createElemento = async (req, res) => {
    try {
        const { nombre_elemento, id_subcategoria, id_material, id_color, precio_elemento, cantidad_total, cantidad_disponible, imagen_url, estado_elemento } = req.body;
        // Verificar que la subcategoría existe
        const subcategoria = await SubcategoriaElemento_model_1.default.findByPk(id_subcategoria);
        if (!subcategoria) {
            return res.status(404).json({ error: 'Subcategoría no encontrada' });
        }
        // Verificar que el material existe
        const material = await MaterialElemento_model_1.default.findByPk(id_material);
        if (!material) {
            return res.status(404).json({ error: 'Material no encontrado' });
        }
        // Verificar que el color existe
        const color = await ColorElemento_model_1.default.findByPk(id_color);
        if (!color) {
            return res.status(404).json({ error: 'Color no encontrado' });
        }
        // Crear el elemento
        const elemento = await Elemento_model_1.default.create({
            nombre_elemento,
            id_subcategoria,
            id_material,
            id_color,
            precio_elemento,
            cantidad_total: cantidad_total || 0,
            cantidad_disponible: cantidad_disponible || cantidad_total || 0,
            imagen_url,
            estado_elemento: estado_elemento || 'Activo'
        });
        // Obtener el elemento con sus relaciones
        const elementoCompleto = await Elemento_model_1.default.findByPk(elemento.id_elemento, {
            include: [
                {
                    model: SubcategoriaElemento_model_1.default,
                    as: 'subcategoria',
                    include: [{
                            model: CategoriaElemento_model_1.default,
                            as: 'categoria'
                        }]
                },
                {
                    model: ColorElemento_model_1.default,
                    as: 'color'
                },
                {
                    model: MaterialElemento_model_1.default,
                    as: 'material'
                }
            ]
        });
        res.status(201).json(elementoCompleto);
    }
    catch (error) {
        console.error('Error al crear elemento:', error);
        res.status(500).json({ error: 'Error al crear elemento' });
    }
};
exports.createElemento = createElemento;
// Buscar elementos por nombre o categoría
const searchElementos = async (req, res) => {
    try {
        const { query, categoria, subcategoria, material, color } = req.query;
        const whereClause = {
            estado_elemento: {
                [sequelize_1.Op.ne]: 'Eliminado'
            }
        };
        if (query) {
            whereClause.nombre_elemento = {
                [sequelize_1.Op.like]: `%${query}%`
            };
        }
        if (categoria) {
            whereClause['$subcategoria.categoria.id_categoria$'] = categoria;
        }
        if (subcategoria) {
            whereClause.id_subcategoria = subcategoria;
        }
        if (material) {
            whereClause.id_material = material;
        }
        if (color) {
            whereClause.id_color = color;
        }
        const elementos = await Elemento_model_1.default.findAll({
            where: whereClause,
            include: [
                {
                    model: SubcategoriaElemento_model_1.default,
                    as: 'subcategoria',
                    include: [{
                            model: CategoriaElemento_model_1.default,
                            as: 'categoria'
                        }]
                },
                {
                    model: ColorElemento_model_1.default,
                    as: 'color'
                },
                {
                    model: MaterialElemento_model_1.default,
                    as: 'material'
                }
            ]
        });
        if (!elementos || elementos.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron elementos',
                mensaje: 'No hay elementos que coincidan con los criterios de búsqueda'
            });
        }
        res.json(elementos);
    }
    catch (error) {
        console.error('Error al buscar elementos:', error);
        res.status(500).json({ error: 'Error al buscar elementos' });
    }
};
exports.searchElementos = searchElementos;
// Editar un elemento
const editElemento = async (req, res) => {
    try {
        const { id_elemento } = req.params;
        const { nombre_elemento, id_subcategoria, id_material, id_color, precio_elemento, cantidad_total, cantidad_disponible, imagen_url, estado_elemento } = req.body;
        const elemento = await Elemento_model_1.default.findByPk(id_elemento);
        if (!elemento) {
            return res.status(404).json({ error: 'Elemento no encontrado' });
        }
        // Verificar que la subcategoría existe si se proporciona
        if (id_subcategoria) {
            const subcategoria = await SubcategoriaElemento_model_1.default.findByPk(id_subcategoria);
            if (!subcategoria) {
                return res.status(404).json({ error: 'Subcategoría no encontrada' });
            }
        }
        // Verificar que el material existe si se proporciona
        if (id_material) {
            const material = await MaterialElemento_model_1.default.findByPk(id_material);
            if (!material) {
                return res.status(404).json({ error: 'Material no encontrado' });
            }
        }
        // Verificar que el color existe si se proporciona
        if (id_color) {
            const color = await ColorElemento_model_1.default.findByPk(id_color);
            if (!color) {
                return res.status(404).json({ error: 'Color no encontrado' });
            }
        }
        // Preparar los datos de actualización
        const updateData = {
            nombre_elemento: nombre_elemento === undefined ? elemento.nombre_elemento : nombre_elemento,
            id_subcategoria: id_subcategoria === undefined ? elemento.id_subcategoria : id_subcategoria,
            id_material: id_material === undefined ? elemento.id_material : id_material,
            id_color: id_color === undefined ? elemento.id_color : id_color,
            precio_elemento: precio_elemento === undefined ? elemento.precio_elemento : precio_elemento,
            cantidad_total: cantidad_total === undefined ? elemento.cantidad_total : cantidad_total,
            cantidad_disponible: cantidad_disponible === undefined ? elemento.cantidad_disponible : cantidad_disponible,
            imagen_url: imagen_url === undefined ? elemento.imagen_url : imagen_url,
            estado_elemento: estado_elemento === undefined ? elemento.estado_elemento : estado_elemento
        };
        // Actualizar el elemento
        await elemento.update(updateData);
        // Obtener el elemento actualizado con sus relaciones
        const elementoActualizado = await Elemento_model_1.default.findByPk(id_elemento, {
            include: [
                {
                    model: SubcategoriaElemento_model_1.default,
                    as: 'subcategoria',
                    include: [{
                            model: CategoriaElemento_model_1.default,
                            as: 'categoria'
                        }]
                },
                {
                    model: ColorElemento_model_1.default,
                    as: 'color'
                },
                {
                    model: MaterialElemento_model_1.default,
                    as: 'material'
                }
            ]
        });
        res.json(elementoActualizado);
    }
    catch (error) {
        console.error('Error al editar elemento:', error);
        res.status(500).json({ error: 'Error al editar elemento' });
    }
};
exports.editElemento = editElemento;
// Eliminar lógicamente un elemento
const deleteElemento = async (req, res) => {
    try {
        const { id_elemento } = req.params;
        const elemento = await Elemento_model_1.default.findByPk(id_elemento);
        if (!elemento) {
            return res.status(404).json({ error: 'Elemento no encontrado' });
        }
        if (elemento.estado_elemento === 'Eliminado') {
            return res.status(404).json({ error: 'Elemento no encontrado' });
        }
        // Eliminar lógicamente el elemento
        await elemento.update({ estado_elemento: 'Eliminado' });
        res.json({ message: 'Elemento eliminado correctamente' });
    }
    catch (error) {
        console.error('Error al eliminar elemento:', error);
        res.status(500).json({ error: 'Error al eliminar elemento' });
    }
};
exports.deleteElemento = deleteElemento;
