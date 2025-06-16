"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlato = exports.updatePlato = exports.createPlato = exports.getPlatoById = exports.getAllPlatos = exports.getMenuCatalog = exports.getMenusByCatering = exports.removeMenuFromCatering = exports.addMenuToCatering = exports.deleteMenu = exports.editMenu = exports.getMenuByCatering = exports.getMenuById = exports.getAllMenus = exports.createMenu = exports.deleteCatering = exports.editCatering = exports.getCateringById = exports.getAllCaterings = exports.createCatering = void 0;
const CateringServicio_model_1 = __importDefault(require("../models/CateringServicio_model"));
const Evento_model_1 = __importDefault(require("../models/Evento_model"));
const MenuCatering_model_1 = __importDefault(require("../models/MenuCatering_model"));
const Menu_model_1 = __importDefault(require("../models/Menu_model"));
const PlatoMenu_model_1 = __importDefault(require("../models/PlatoMenu_model"));
const Plato_model_1 = __importDefault(require("../models/Plato_model"));
const Proveedor_model_1 = __importDefault(require("../models/Proveedor_model"));
const database_1 = require("../database/database");
// Catering Controllers
const createCatering = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_evento, precioneto_catering, itbis_catering, total_catering, menus // Array de IDs de menús
         } = req.body;
        // Verificar que el evento existe
        const evento = await Evento_model_1.default.findByPk(id_evento);
        if (!evento) {
            await t.rollback();
            return res.status(404).json({
                error: 'Evento no encontrado',
                mensaje: 'No se encontró el evento solicitado'
            });
        }
        // Crear el servicio de catering
        const catering = await CateringServicio_model_1.default.create({
            id_evento,
            precioneto_catering: precioneto_catering || 0,
            itbis_catering: itbis_catering || 0,
            total_catering: total_catering || 0,
            estado_catering: 'Solicitado'
        }, { transaction: t });
        // Si se proporcionaron menús, crearlos
        if (menus && menus.length > 0) {
            // Validar que todos los menús existen
            for (const menuId of menus) {
                const menu = await Menu_model_1.default.findByPk(menuId);
                if (!menu) {
                    await t.rollback();
                    return res.status(404).json({
                        error: 'Menú no encontrado',
                        mensaje: `No se encontró el menú con ID ${menuId}`
                    });
                }
            }
            await Promise.all(menus.map((menuId) => MenuCatering_model_1.default.create({
                id_catering: catering.id_catering,
                id_menu: menuId,
                estado_menucatering: 'Aceptado'
            }, { transaction: t })));
        }
        await t.commit();
        // Obtener el catering con sus menús
        const cateringConMenus = await CateringServicio_model_1.default.findByPk(catering.id_catering, {
            include: [
                {
                    model: MenuCatering_model_1.default,
                    as: 'menus_catering',
                    where: {
                        estado_menucatering: 'Aceptado'
                    },
                    required: false,
                    include: [
                        {
                            model: Menu_model_1.default,
                            as: 'menu',
                            include: [
                                {
                                    model: PlatoMenu_model_1.default,
                                    as: 'platos_menu',
                                    include: [
                                        {
                                            model: Plato_model_1.default,
                                            as: 'plato'
                                        }
                                    ]
                                },
                                {
                                    model: Proveedor_model_1.default,
                                    as: 'proveedor'
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        res.status(201).json(cateringConMenus);
    }
    catch (error) {
        await t.rollback();
        console.error('Error al crear servicio de catering:', error);
        res.status(500).json({
            error: 'Error al crear servicio de catering',
            mensaje: 'Ocurrió un error al crear el servicio de catering'
        });
    }
};
exports.createCatering = createCatering;
const getAllCaterings = async (req, res) => {
    try {
        const caterings = await CateringServicio_model_1.default.findAll({
            include: [
                {
                    model: Evento_model_1.default,
                    as: 'evento'
                },
                {
                    model: MenuCatering_model_1.default,
                    as: 'menus_catering',
                    include: [
                        {
                            model: Menu_model_1.default,
                            as: 'menu',
                            include: [
                                {
                                    model: PlatoMenu_model_1.default,
                                    as: 'platos_menu',
                                    include: [
                                        {
                                            model: Plato_model_1.default,
                                            as: 'plato'
                                        }
                                    ]
                                },
                                {
                                    model: Proveedor_model_1.default,
                                    as: 'proveedor'
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        if (!caterings || caterings.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron servicios de catering',
                mensaje: 'No hay servicios de catering registrados'
            });
        }
        res.json(caterings);
    }
    catch (error) {
        console.error('Error al obtener servicios de catering:', error);
        res.status(500).json({
            error: 'Error al obtener los servicios de catering',
            mensaje: 'Ocurrió un error al cargar los servicios de catering'
        });
    }
};
exports.getAllCaterings = getAllCaterings;
const getCateringById = async (req, res) => {
    try {
        const { id_catering } = req.params;
        const catering = await CateringServicio_model_1.default.findByPk(id_catering, {
            include: [
                {
                    model: Evento_model_1.default,
                    as: 'evento'
                },
                {
                    model: MenuCatering_model_1.default,
                    as: 'menus_catering',
                    where: {
                        estado_menucatering: 'Aceptado'
                    },
                    required: false,
                    include: [
                        {
                            model: Menu_model_1.default,
                            as: 'menu',
                            include: [
                                {
                                    model: PlatoMenu_model_1.default,
                                    as: 'platos_menu',
                                    include: [
                                        {
                                            model: Plato_model_1.default,
                                            as: 'plato'
                                        }
                                    ]
                                },
                                {
                                    model: Proveedor_model_1.default,
                                    as: 'proveedor'
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        if (!catering) {
            return res.status(404).json({
                error: 'Servicio de catering no encontrado',
                mensaje: 'No se encontró el servicio de catering solicitado'
            });
        }
        res.json(catering);
    }
    catch (error) {
        console.error('Error al obtener servicio de catering:', error);
        res.status(500).json({
            error: 'Error al obtener servicio de catering',
            mensaje: 'Ocurrió un error al cargar el servicio de catering'
        });
    }
};
exports.getCateringById = getCateringById;
const editCatering = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_catering } = req.params;
        const { precioneto_catering, itbis_catering, total_catering, menus, estado_catering } = req.body;
        console.log('Datos recibidos:', {
            id_catering,
            precioneto_catering,
            itbis_catering,
            total_catering,
            menus,
            estado_catering
        });
        // Validar que el ID es un número
        const cateringId = parseInt(id_catering);
        if (isNaN(cateringId)) {
            await t.rollback();
            return res.status(400).json({
                error: 'ID inválido',
                mensaje: 'El ID del catering debe ser un número'
            });
        }
        const catering = await CateringServicio_model_1.default.findByPk(cateringId);
        if (!catering) {
            await t.rollback();
            return res.status(404).json({
                error: 'Servicio de catering no encontrado',
                mensaje: 'No se encontró el servicio de catering solicitado'
            });
        }
        console.log('Catering encontrado:', catering.toJSON());
        // Validar el estado
        const estadosValidos = ['Solicitado', 'Aceptado', 'Completado', 'Cancelado'];
        if (!estado_catering || !estadosValidos.includes(estado_catering)) {
            await t.rollback();
            return res.status(400).json({
                error: 'Estado inválido',
                mensaje: `El estado debe ser uno de: ${estadosValidos.join(', ')}`
            });
        }
        // Actualizar el servicio de catering
        const updateData = {
            precioneto_catering: precioneto_catering || catering.precioneto_catering,
            itbis_catering: itbis_catering || catering.itbis_catering,
            total_catering: total_catering || catering.total_catering,
            estado_catering: estado_catering
        };
        console.log('Datos a actualizar:', updateData);
        await catering.update(updateData, { transaction: t });
        // Si se proporcionaron nuevos menús, actualizar la lista
        if (menus && Array.isArray(menus)) {
            // Marcar menús existentes como cancelados
            await MenuCatering_model_1.default.update({ estado_menucatering: 'Cancelado' }, {
                where: { id_catering: cateringId },
                transaction: t
            });
            // Crear nuevos menús
            if (menus.length > 0) {
                // Validar que todos los menús existen
                for (const menuId of menus) {
                    const menu = await Menu_model_1.default.findByPk(menuId);
                    if (!menu) {
                        await t.rollback();
                        return res.status(404).json({
                            error: 'Menú no encontrado',
                            mensaje: `No se encontró el menú con ID ${menuId}`
                        });
                    }
                }
                await Promise.all(menus.map((menuId) => MenuCatering_model_1.default.create({
                    id_catering: cateringId,
                    id_menu: menuId,
                    estado_menucatering: 'Aceptado'
                }, { transaction: t })));
            }
        }
        await t.commit();
        // Obtener el catering actualizado con sus menús
        const cateringActualizado = await CateringServicio_model_1.default.findByPk(cateringId, {
            include: [
                {
                    model: MenuCatering_model_1.default,
                    as: 'menus_catering',
                    include: [
                        {
                            model: Menu_model_1.default,
                            as: 'menu',
                            include: [
                                {
                                    model: PlatoMenu_model_1.default,
                                    as: 'platos_menu',
                                    include: [
                                        {
                                            model: Plato_model_1.default,
                                            as: 'plato'
                                        }
                                    ]
                                },
                                {
                                    model: Proveedor_model_1.default,
                                    as: 'proveedor'
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        console.log('Catering actualizado:', cateringActualizado?.toJSON());
        res.json(cateringActualizado);
    }
    catch (error) {
        await t.rollback();
        console.error('Error detallado al editar servicio de catering:', error);
        res.status(500).json({
            error: 'Error al editar servicio de catering',
            mensaje: 'Ocurrió un error al actualizar el servicio de catering',
            detalles: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.editCatering = editCatering;
const deleteCatering = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_catering } = req.params;
        const catering = await CateringServicio_model_1.default.findByPk(id_catering);
        if (!catering) {
            await t.rollback();
            return res.status(404).json({
                error: 'Servicio de catering no encontrado',
                mensaje: 'No se encontró el servicio de catering solicitado'
            });
        }
        // Marcar el catering como cancelado
        await catering.update({
            estado_catering: 'Cancelado'
        }, { transaction: t });
        // Marcar todos los menús como cancelados
        await MenuCatering_model_1.default.update({ estado_menucatering: 'Cancelado' }, {
            where: { id_catering },
            transaction: t
        });
        await t.commit();
        // Obtener el catering actualizado
        const cateringActualizado = await CateringServicio_model_1.default.findByPk(id_catering, {
            include: [
                {
                    model: MenuCatering_model_1.default,
                    include: [
                        {
                            model: Menu_model_1.default,
                            as: 'menu'
                        }
                    ]
                }
            ]
        });
        res.json({
            mensaje: 'Servicio de catering cancelado correctamente',
            catering: cateringActualizado
        });
    }
    catch (error) {
        await t.rollback();
        console.error('Error al eliminar servicio de catering:', error);
        res.status(500).json({
            error: 'Error al eliminar servicio de catering',
            mensaje: 'Ocurrió un error al cancelar el servicio de catering'
        });
    }
};
exports.deleteCatering = deleteCatering;
// Menu Controllers
const createMenu = async (req, res) => {
    try {
        const { desc_menu, precio_menu, id_proveedor, platos // Array de IDs de platos
         } = req.body;
        // Verificar que el proveedor existe
        const proveedor = await Proveedor_model_1.default.findByPk(id_proveedor);
        if (!proveedor) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        // Crear el menú
        const menu = await Menu_model_1.default.create({
            desc_menu,
            precio_menu,
            id_proveedor
        });
        // Si se proporcionaron platos, crearlos
        if (platos && platos.length > 0) {
            const platoPromises = platos.map((platoId) => PlatoMenu_model_1.default.create({
                id_menu: menu.id_menu,
                id_plato: platoId
            }));
            await Promise.all(platoPromises);
        }
        // Obtener el menú con sus platos
        const menuConPlatos = await Menu_model_1.default.findByPk(menu.id_menu, {
            include: [
                {
                    model: PlatoMenu_model_1.default,
                    as: 'platos_menu',
                    include: [
                        {
                            model: Plato_model_1.default,
                            as: 'plato'
                        }
                    ]
                },
                {
                    model: Proveedor_model_1.default,
                    as: 'proveedor'
                }
            ]
        });
        res.status(201).json(menuConPlatos);
    }
    catch (error) {
        console.error('Error al crear menú:', error);
        res.status(500).json({ error: 'Error al crear menú' });
    }
};
exports.createMenu = createMenu;
const getAllMenus = async (req, res) => {
    try {
        const menus = await Menu_model_1.default.findAll({
            include: [
                {
                    model: PlatoMenu_model_1.default,
                    as: 'platos_menu',
                    include: [
                        {
                            model: Plato_model_1.default,
                            as: 'plato'
                        }
                    ]
                },
                {
                    model: Proveedor_model_1.default,
                    as: 'proveedor'
                }
            ]
        });
        if (!menus || menus.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron menús',
                mensaje: 'No hay menús registrados'
            });
        }
        res.json(menus);
    }
    catch (error) {
        console.error('Error al obtener menús:', error);
        res.status(500).json({
            error: 'Error al obtener los menús',
            mensaje: 'Ocurrió un error al cargar los menús'
        });
    }
};
exports.getAllMenus = getAllMenus;
const getMenuById = async (req, res) => {
    try {
        const { id_menu } = req.params;
        const menu = await Menu_model_1.default.findByPk(id_menu, {
            include: [
                {
                    model: PlatoMenu_model_1.default,
                    as: 'platos_menu',
                    include: [
                        {
                            model: Plato_model_1.default,
                            as: 'plato'
                        }
                    ]
                },
                {
                    model: Proveedor_model_1.default,
                    as: 'proveedor'
                }
            ]
        });
        if (!menu) {
            return res.status(404).json({
                error: 'Menú no encontrado',
                mensaje: 'No existe un menú con el ID proporcionado'
            });
        }
        res.json(menu);
    }
    catch (error) {
        console.error('Error al obtener menú:', error);
        res.status(500).json({
            error: 'Error al obtener el menú',
            mensaje: 'Ocurrió un error al cargar el menú'
        });
    }
};
exports.getMenuById = getMenuById;
const getMenuByCatering = async (req, res) => {
    try {
        const { id_catering } = req.params;
        // Obtener los menús asociados al catering
        const menuCaterings = await MenuCatering_model_1.default.findAll({
            where: { id_catering },
            include: [
                {
                    model: Menu_model_1.default,
                    as: 'menu',
                    attributes: ['id_menu', 'desc_menu', 'precio_menu', 'id_proveedor'],
                    include: [
                        {
                            model: PlatoMenu_model_1.default,
                            as: 'platos_menu',
                            include: [
                                {
                                    model: Plato_model_1.default,
                                    as: 'plato'
                                }
                            ]
                        },
                        {
                            model: Proveedor_model_1.default,
                            as: 'proveedor'
                        }
                    ]
                }
            ]
        });
        if (!menuCaterings || menuCaterings.length === 0) {
            return res.status(404).json({ error: 'No se encontraron menús para este catering' });
        }
        res.json(menuCaterings);
    }
    catch (error) {
        console.error('Error al obtener menús del catering:', error);
        res.status(500).json({ error: 'Error al obtener menús del catering' });
    }
};
exports.getMenuByCatering = getMenuByCatering;
const editMenu = async (req, res) => {
    try {
        const { id_menu } = req.params;
        const { desc_menu, precio_menu, id_proveedor, platos // Array de IDs de platos
         } = req.body;
        const menu = await Menu_model_1.default.findByPk(id_menu);
        if (!menu) {
            return res.status(404).json({ error: 'Menú no encontrado' });
        }
        // Actualizar el menú
        await menu.update({
            desc_menu: desc_menu || menu.desc_menu,
            precio_menu: precio_menu || menu.precio_menu,
            id_proveedor: id_proveedor || menu.id_proveedor
        });
        // Si se proporcionaron nuevos platos, actualizar la lista
        if (platos) {
            // Eliminar platos existentes
            await PlatoMenu_model_1.default.destroy({
                where: { id_menu: id_menu }
            });
            // Crear nuevos platos
            if (platos.length > 0) {
                const platoPromises = platos.map((platoId) => PlatoMenu_model_1.default.create({
                    id_menu: menu.id_menu,
                    id_plato: platoId
                }));
                await Promise.all(platoPromises);
            }
        }
        // Obtener el menú actualizado con sus platos
        const menuActualizado = await Menu_model_1.default.findByPk(id_menu, {
            include: [
                {
                    model: PlatoMenu_model_1.default,
                    as: 'platos_menu',
                    include: [
                        {
                            model: Plato_model_1.default,
                            as: 'plato'
                        }
                    ]
                },
                {
                    model: Proveedor_model_1.default,
                    as: 'proveedor'
                }
            ]
        });
        res.json(menuActualizado);
    }
    catch (error) {
        console.error('Error al editar menú:', error);
        res.status(500).json({ error: 'Error al editar menú' });
    }
};
exports.editMenu = editMenu;
const deleteMenu = async (req, res) => {
    try {
        const { id_menu } = req.params;
        const menu = await Menu_model_1.default.findByPk(id_menu);
        if (!menu) {
            return res.status(404).json({ error: 'Menú no encontrado' });
        }
        // Borrado lógico - marcar como eliminado
        await menu.update({
            estado: 'Eliminado'
        });
        res.json({ message: 'Menú eliminado correctamente' });
    }
    catch (error) {
        console.error('Error al eliminar menú:', error);
        res.status(500).json({ error: 'Error al eliminar menú' });
    }
};
exports.deleteMenu = deleteMenu;
// MenuCatering Controllers
const addMenuToCatering = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_catering, id_menu } = req.body;
        // Verificar que el catering existe
        const catering = await CateringServicio_model_1.default.findByPk(id_catering);
        if (!catering) {
            await t.rollback();
            return res.status(404).json({
                error: 'Servicio de catering no encontrado',
                mensaje: 'No se encontró el servicio de catering solicitado'
            });
        }
        // Verificar que el menú existe
        const menu = await Menu_model_1.default.findByPk(id_menu);
        if (!menu) {
            await t.rollback();
            return res.status(404).json({
                error: 'Menú no encontrado',
                mensaje: 'No se encontró el menú solicitado'
            });
        }
        // Verificar si el menú ya está asignado al catering
        const menuExistente = await MenuCatering_model_1.default.findOne({
            where: {
                id_catering,
                id_menu,
                estado_menucatering: 'Aceptado'
            }
        });
        if (menuExistente) {
            await t.rollback();
            return res.status(400).json({
                error: 'Menú ya asignado',
                mensaje: 'Este menú ya está asignado al catering'
            });
        }
        // Crear la relación
        const menuCatering = await MenuCatering_model_1.default.create({
            id_catering,
            id_menu,
            estado_menucatering: 'Aceptado'
        }, { transaction: t });
        await t.commit();
        // Obtener el menú con sus detalles
        const menuCompleto = await Menu_model_1.default.findByPk(id_menu, {
            include: [
                {
                    model: PlatoMenu_model_1.default,
                    as: 'platos_menu',
                    include: [
                        {
                            model: Plato_model_1.default,
                            as: 'plato'
                        }
                    ]
                },
                {
                    model: Proveedor_model_1.default,
                    as: 'proveedor'
                }
            ]
        });
        res.status(201).json({
            mensaje: 'Menú agregado al catering correctamente',
            menuCatering,
            menu: menuCompleto
        });
    }
    catch (error) {
        await t.rollback();
        console.error('Error al agregar menú al catering:', error);
        res.status(500).json({
            error: 'Error al agregar menú al catering',
            mensaje: 'Ocurrió un error al agregar el menú al catering'
        });
    }
};
exports.addMenuToCatering = addMenuToCatering;
const removeMenuFromCatering = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_catering, id_menu } = req.params;
        const menuCatering = await MenuCatering_model_1.default.findOne({
            where: {
                id_catering,
                id_menu,
                estado_menucatering: 'Aceptado'
            }
        });
        if (!menuCatering) {
            await t.rollback();
            return res.status(404).json({
                error: 'Relación menú-catering no encontrada',
                mensaje: 'No se encontró la relación entre el menú y el catering'
            });
        }
        // Marcar como cancelado en lugar de eliminar
        await menuCatering.update({
            estado_menucatering: 'Cancelado'
        }, { transaction: t });
        await t.commit();
        res.json({
            mensaje: 'Menú removido del catering correctamente',
            menuCatering
        });
    }
    catch (error) {
        await t.rollback();
        console.error('Error al remover menú del catering:', error);
        res.status(500).json({
            error: 'Error al remover menú del catering',
            mensaje: 'Ocurrió un error al remover el menú del catering'
        });
    }
};
exports.removeMenuFromCatering = removeMenuFromCatering;
const getMenusByCatering = async (req, res) => {
    try {
        const { id_catering } = req.params;
        // Verificar que el catering existe
        const catering = await CateringServicio_model_1.default.findByPk(id_catering);
        if (!catering) {
            return res.status(404).json({
                error: 'Servicio de catering no encontrado',
                mensaje: 'No se encontró el servicio de catering solicitado'
            });
        }
        const menus = await MenuCatering_model_1.default.findAll({
            where: {
                id_catering,
                estado_menucatering: 'Aceptado'
            },
            include: [
                {
                    model: Menu_model_1.default,
                    as: 'menu',
                    include: [
                        {
                            model: PlatoMenu_model_1.default,
                            as: 'platos_menu',
                            include: [
                                {
                                    model: Plato_model_1.default,
                                    as: 'plato'
                                }
                            ]
                        },
                        {
                            model: Proveedor_model_1.default,
                            as: 'proveedor'
                        }
                    ]
                }
            ]
        });
        if (!menus || menus.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron menús',
                mensaje: 'No hay menús asignados a este catering'
            });
        }
        res.json(menus);
    }
    catch (error) {
        console.error('Error al obtener menús del catering:', error);
        res.status(500).json({
            error: 'Error al obtener menús del catering',
            mensaje: 'Ocurrió un error al cargar los menús del catering'
        });
    }
};
exports.getMenusByCatering = getMenusByCatering;
const getMenuCatalog = async (req, res) => {
    try {
        console.log('Iniciando búsqueda de menús para catálogo');
        const menus = await Menu_model_1.default.findAll({
            where: {
                estado_menu: 'Activo'
            },
            attributes: ['id_menu', 'desc_menu', 'precio_menu', 'estado_menu'],
            include: [
                {
                    model: PlatoMenu_model_1.default,
                    as: 'platos_menu',
                    include: [
                        {
                            model: Plato_model_1.default,
                            as: 'plato',
                            attributes: ['id_plato', 'desc_plato']
                        }
                    ]
                },
                {
                    model: Proveedor_model_1.default,
                    as: 'proveedor',
                    attributes: ['id_proveedor', 'nombre_proveedor']
                }
            ]
        });
        console.log(`Se encontraron ${menus.length} menús activos`);
        if (!menus || menus.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron menús',
                mensaje: 'No hay menús disponibles en el catálogo'
            });
        }
        const menuCatalog = menus.map(menu => ({
            id_menu: menu.id_menu,
            desc_menu: menu.desc_menu,
            precio_menu: parseFloat(menu.precio_menu.toString()),
            estado_menu: menu.estado_menu,
            proveedor: menu.proveedor?.nombre_proveedor || 'Sin proveedor',
            platos: menu.platos_menu?.map(pm => ({
                id: pm.plato?.id_plato,
                nombre: pm.plato?.desc_plato
            })) || []
        }));
        console.log('Enviando catálogo de menús');
        res.json(menuCatalog);
    }
    catch (error) {
        console.error('Error al obtener catálogo de menús:', error);
        res.status(500).json({
            error: 'Error al obtener catálogo de menús',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getMenuCatalog = getMenuCatalog;
// Plato Controllers
const getAllPlatos = async (req, res) => {
    try {
        const platos = await Plato_model_1.default.findAll({
            include: [
                {
                    model: PlatoMenu_model_1.default,
                    as: 'platos_menu',
                    include: [
                        {
                            model: Menu_model_1.default,
                            as: 'menu'
                        }
                    ]
                }
            ]
        });
        if (!platos || platos.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron platos',
                mensaje: 'No hay platos registrados'
            });
        }
        res.json(platos);
    }
    catch (error) {
        console.error('Error al obtener platos:', error);
        res.status(500).json({
            error: 'Error al obtener los platos',
            mensaje: 'Ocurrió un error al cargar los platos'
        });
    }
};
exports.getAllPlatos = getAllPlatos;
const getPlatoById = async (req, res) => {
    try {
        const plato = await Plato_model_1.default.findByPk(req.params.id, {
            include: [
                {
                    model: PlatoMenu_model_1.default,
                    as: 'platos_menu',
                    include: [
                        {
                            model: Menu_model_1.default,
                            as: 'menu'
                        }
                    ]
                }
            ]
        });
        if (!plato) {
            return res.status(404).json({
                error: 'Plato no encontrado',
                mensaje: 'No se encontró el plato solicitado'
            });
        }
        res.json(plato);
    }
    catch (error) {
        console.error('Error al obtener plato:', error);
        res.status(500).json({
            error: 'Error al obtener plato',
            mensaje: 'Ocurrió un error al cargar el plato'
        });
    }
};
exports.getPlatoById = getPlatoById;
const createPlato = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { desc_plato, menus } = req.body;
        // Crear el plato
        const plato = await Plato_model_1.default.create({
            desc_plato
        }, { transaction: t });
        // Si se proporcionaron menús, crear las relaciones
        if (menus && menus.length > 0) {
            // Validar que todos los menús existen
            for (const menuId of menus) {
                const menu = await Menu_model_1.default.findByPk(menuId);
                if (!menu) {
                    await t.rollback();
                    return res.status(404).json({
                        error: 'Menú no encontrado',
                        mensaje: `No se encontró el menú con ID ${menuId}`
                    });
                }
            }
            // Crear las relaciones plato-menú
            await Promise.all(menus.map((menuId) => PlatoMenu_model_1.default.create({
                id_plato: plato.id_plato,
                id_menu: menuId
            }, { transaction: t })));
        }
        await t.commit();
        // Obtener el plato con sus menús
        const platoCompleto = await Plato_model_1.default.findByPk(plato.id_plato, {
            include: [
                {
                    model: PlatoMenu_model_1.default,
                    as: 'platos_menu',
                    include: [
                        {
                            model: Menu_model_1.default,
                            as: 'menu'
                        }
                    ]
                }
            ]
        });
        res.status(201).json({
            mensaje: 'Plato creado correctamente',
            plato: platoCompleto
        });
    }
    catch (error) {
        await t.rollback();
        console.error('Error al crear plato:', error);
        res.status(500).json({
            error: 'Error al crear plato',
            mensaje: 'Ocurrió un error al crear el plato'
        });
    }
};
exports.createPlato = createPlato;
const updatePlato = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id } = req.params;
        const { desc_plato, menus } = req.body;
        const plato = await Plato_model_1.default.findByPk(id);
        if (!plato) {
            await t.rollback();
            return res.status(404).json({
                error: 'Plato no encontrado',
                mensaje: 'No se encontró el plato solicitado'
            });
        }
        // Actualizar el plato
        await plato.update({
            desc_plato: desc_plato || plato.desc_plato
        }, { transaction: t });
        // Si se proporcionaron nuevos menús, actualizar las relaciones
        if (menus) {
            // Eliminar relaciones existentes
            await PlatoMenu_model_1.default.destroy({
                where: { id_plato: id },
                transaction: t
            });
            // Crear nuevas relaciones
            if (menus.length > 0) {
                // Validar que todos los menús existen
                for (const menuId of menus) {
                    const menu = await Menu_model_1.default.findByPk(menuId);
                    if (!menu) {
                        await t.rollback();
                        return res.status(404).json({
                            error: 'Menú no encontrado',
                            mensaje: `No se encontró el menú con ID ${menuId}`
                        });
                    }
                }
                await Promise.all(menus.map((menuId) => PlatoMenu_model_1.default.create({
                    id_plato: plato.id_plato,
                    id_menu: menuId
                }, { transaction: t })));
            }
        }
        await t.commit();
        // Obtener el plato actualizado con sus menús
        const platoActualizado = await Plato_model_1.default.findByPk(id, {
            include: [
                {
                    model: PlatoMenu_model_1.default,
                    as: 'platos_menu',
                    include: [
                        {
                            model: Menu_model_1.default,
                            as: 'menu'
                        }
                    ]
                }
            ]
        });
        res.json({
            mensaje: 'Plato actualizado correctamente',
            plato: platoActualizado
        });
    }
    catch (error) {
        await t.rollback();
        console.error('Error al actualizar plato:', error);
        res.status(500).json({
            error: 'Error al actualizar plato',
            mensaje: 'Ocurrió un error al actualizar el plato'
        });
    }
};
exports.updatePlato = updatePlato;
const deletePlato = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id } = req.params;
        const plato = await Plato_model_1.default.findByPk(id);
        if (!plato) {
            await t.rollback();
            return res.status(404).json({
                error: 'Plato no encontrado',
                mensaje: 'No se encontró el plato solicitado'
            });
        }
        // Eliminar las relaciones plato-menú
        await PlatoMenu_model_1.default.destroy({
            where: { id_plato: id },
            transaction: t
        });
        // Eliminar el plato
        await plato.destroy({ transaction: t });
        await t.commit();
        res.json({
            mensaje: 'Plato eliminado correctamente',
            plato
        });
    }
    catch (error) {
        await t.rollback();
        console.error('Error al eliminar plato:', error);
        res.status(500).json({
            error: 'Error al eliminar plato',
            mensaje: 'Ocurrió un error al eliminar el plato'
        });
    }
};
exports.deletePlato = deletePlato;
