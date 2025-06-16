"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usersController_1 = require("../controllers/usersController");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        await (0, usersController_1.getAllUsers)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/estado/:estado_usuario', async (req, res, next) => {
    try {
        await (0, usersController_1.getUsersByStatus)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/rol/:id_rol', async (req, res, next) => {
    try {
        await (0, usersController_1.getUsersByRole)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/buscar', async (req, res, next) => {
    try {
        await (0, usersController_1.searchUsers)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/roles', async (req, res, next) => {
    try {
        await (0, usersController_1.getAllRoles)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:cedula', async (req, res, next) => {
    try {
        await (0, usersController_1.updateUser)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:cedula', async (req, res, next) => {
    try {
        await (0, usersController_1.deleteUser)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:cedula/estado', async (req, res, next) => {
    try {
        await (0, usersController_1.updateUserStatus)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
