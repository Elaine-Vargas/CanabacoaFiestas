"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegistration = exports.completeRegistration = exports.getCurrentUser = exports.UpdateUserData = exports.verifyUpdateEmail = exports.sendUpdateEmailVerification = exports.GetUserData = exports.RegisterUser = exports.RegisterClient = exports.Login = void 0;
const Usuario_model_1 = __importDefault(require("../models/Usuario_model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
const mailController_1 = require("./mailController");
// Define el tiempo de expiración para registros y actualizaciones pendientes (30 minutos)
const PENDING_REGISTRATION_EXPIRATION_MS = 30 * 60 * 1000;
const Login = async (req, res) => {
    const { usuario_login, contrasena } = req.body;
    // Validar campos requeridos
    if (!usuario_login || !contrasena) {
        return res.status(400).json({ error: 'Faltan credenciales' });
    }
    try {
        // Buscar primero por usuario_login
        let usuario = await Usuario_model_1.default.findOne({
            where: {
                usuario_login,
                estado_usuario: {
                    [sequelize_1.Op.in]: ['Activo', 'Pendiente'] // Permitir login si está activo o pendiente
                }
            },
            include: [{ association: 'rol' }]
        });
        // Si no encuentra por usuario_login, intenta por cedula_usuario
        if (!usuario) {
            usuario = await Usuario_model_1.default.findOne({
                where: {
                    cedula_usuario: usuario_login,
                    estado_usuario: {
                        [sequelize_1.Op.in]: ['Activo', 'Pendiente'] // Permitir login si está activo o pendiente
                    }
                },
                include: [{ association: 'rol' }]
            });
        }
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario o contraseña inválidos' });
        }
        // Validar contraseña
        const valido = await usuario.compararContrasena(contrasena);
        if (!valido) {
            return res.status(404).json({ error: 'Usuario o contraseña inválidos' });
        }
        // Verificar si el correo está verificado
        if (!usuario.estado_usuario) {
            return res.status(403).json({
                error: 'Correo no verificado',
                message: 'Por favor verifica tu correo electrónico antes de iniciar sesión'
            });
        }
        // Si el usuario está pendiente, actualizar a activo
        if (usuario.estado_usuario === 'Pendiente') {
            await usuario.update({ estado_usuario: 'Activo' });
        }
        // Generar token
        const token = jsonwebtoken_1.default.sign({
            usuario_login: usuario.usuario_login,
            cedula_usuario: usuario.cedula_usuario,
            rol: usuario.id_rol
        }, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy', { expiresIn: '24h' });
        // Mostrar token en consola
        console.log('Token generado:', token);
        // Respuesta exitosa
        res.json({
            mensaje: `Inicio de sesión exitoso, ¡Bienvenido/a ${usuario.nombre_usuario} ${usuario.apellido_usuario}!`,
            token,
            nombre_usuario: usuario.nombre_usuario,
            apellido_usuario: usuario.apellido_usuario,
            usuario_login: usuario.usuario_login,
            rol: usuario.id_rol
        });
    }
    catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};
exports.Login = Login;
const RegisterClient = async (req, res) => {
    const { nombre_usuario, apellido_usuario, cedula_usuario, correo_usuario, tel_usuario, contrasena_login, usuario_login, } = req.body;
    try {
        // Limpiar registros pendientes expirados (más de 15 minutos)
        if (global.pendingRegistrations) {
            const now = Date.now();
            for (const [email, registration] of global.pendingRegistrations.entries()) {
                if ((now - registration.timestamp) > 15 * 60 * 1000) { // 15 minutos en milisegundos
                    global.pendingRegistrations.delete(email);
                }
            }
        }
        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { usuario_login },
                    { cedula_usuario },
                    { correo_usuario }
                ]
            }
        });
        if (usuarioExistente) {
            let errorMessage = 'Ya existe un usuario con ';
            if (usuarioExistente.usuario_login === usuario_login) {
                errorMessage += 'ese nombre de usuario';
            }
            else if (usuarioExistente.cedula_usuario === cedula_usuario) {
                errorMessage += 'esa cédula';
            }
            else if (usuarioExistente.correo_usuario === correo_usuario) {
                errorMessage += 'ese correo electrónico';
            }
            return res.status(400).json({ error: errorMessage });
        }
        // Verificar si ya existe un registro pendiente para este correo
        if (global.pendingRegistrations?.has(correo_usuario.toLowerCase())) {
            const pendingRegistration = global.pendingRegistrations.get(correo_usuario.toLowerCase());
            const now = Date.now();
            // Si el registro pendiente no ha expirado, reenviar el código en vez de lanzar error
            if (pendingRegistration && (now - pendingRegistration.timestamp) < 15 * 60 * 1000) {
                try {
                    await (0, mailController_1.sendVerificationEmail)(correo_usuario, pendingRegistration.verificationCode, false);
                    return res.status(200).json({
                        mensaje: 'Ya existe un registro pendiente, se ha reenviado el código de verificación a tu correo.',
                        correo_usuario,
                        requiresVerification: true
                    });
                }
                catch (error) {
                    return res.status(500).json({ error: 'Error al reenviar el código de verificación' });
                }
            }
            // Si el registro pendiente ha expirado, lo eliminamos para crear uno nuevo
            global.pendingRegistrations.delete(correo_usuario.toLowerCase());
        }
        // Verificar si hay registros pendientes con los mismos datos únicos (después de limpiar expirados)
        for (const [email, registration] of global.pendingRegistrations?.entries() || []) {
            // Asegurarse de que el registro pendiente no haya expirado ya
            const now = Date.now();
            if ((now - registration.timestamp) > 15 * 60 * 1000) {
                global.pendingRegistrations.delete(email);
                continue;
            }
            if (registration.data.usuario_login === usuario_login) {
                return res.status(400).json({ error: 'Ya existe un registro pendiente con ese nombre de usuario' });
            }
            if (registration.data.cedula_usuario === cedula_usuario) {
                return res.status(400).json({ error: 'Ya existe un registro pendiente con esa cédula' });
            }
            // No es necesario verificar correo_usuario aquí, ya que se maneja arriba para registros pendientes.
        }
        // Si todas las validaciones pasan, proceder con el registro o re-registro
        global.pendingRegistrations = global.pendingRegistrations || new Map();
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        global.pendingRegistrations.set(correo_usuario.toLowerCase(), {
            data: {
                nombre_usuario,
                apellido_usuario,
                cedula_usuario,
                correo_usuario: correo_usuario.toLowerCase(),
                tel_usuario,
                contrasena_login,
                usuario_login,
                id_rol: 2 // Rol de cliente por defecto
            },
            verificationCode: verificationCode,
            timestamp: Date.now()
        });
        // Enviar correo de verificación
        try {
            await (0, mailController_1.sendVerificationEmail)(correo_usuario, verificationCode, false);
            res.status(200).json({
                mensaje: 'Por favor verifica tu correo electrónico para completar el registro.',
                correo_usuario,
                requiresVerification: true // Añadir esta bandera para el frontend
            });
        }
        catch (error) {
            // Si falla el envío del correo, eliminar el registro pendiente
            global.pendingRegistrations.delete(correo_usuario.toLowerCase());
            console.error('Error al enviar correo de verificación:', error);
            res.status(500).json({ error: 'Error al enviar correo de verificación' });
        }
    }
    catch (error) {
        console.error('Error en registro de cliente:', error);
        res.status(500).json({ error: 'Error al registrar cliente' });
    }
};
exports.RegisterClient = RegisterClient;
const RegisterUser = async (req, res) => {
    const { nombre_usuario, apellido_usuario, cedula_usuario, correo_usuario, tel_usuario, contrasena_login, usuario_login, id_rol } = req.body;
    try {
        // Verificar si el usuario_login ya existe
        const usuarioLoginExistente = await Usuario_model_1.default.findOne({
            where: { usuario_login }
        });
        if (usuarioLoginExistente) {
            return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
        }
        // Verificar si la cédula ya existe
        const cedulaExistente = await Usuario_model_1.default.findOne({
            where: { cedula_usuario }
        });
        if (cedulaExistente) {
            return res.status(400).json({ error: 'La cédula ya está registrada' });
        }
        // Verificar si el correo ya existe
        const correoExistente = await Usuario_model_1.default.findOne({
            where: { correo_usuario }
        });
        if (correoExistente) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }
        // Verificar que el rol sea válido
        if (!id_rol || (id_rol !== 1 && id_rol !== 2 && id_rol !== 3)) {
            return res.status(400).json({ error: 'Rol de usuario inválido' });
        }
        // Crear nuevo usuario
        const nuevoUsuario = await Usuario_model_1.default.create({
            nombre_usuario,
            apellido_usuario,
            cedula_usuario,
            correo_usuario,
            tel_usuario,
            contrasena_login,
            usuario_login,
            id_rol,
            estado_usuario: 'Activo'
        });
        res.status(201).json({
            mensaje: `¡Usuario ${nombre_usuario} ${apellido_usuario} registrado exitosamente!`,
            usuario: {
                nombre_usuario: nuevoUsuario.nombre_usuario,
                apellido_usuario: nuevoUsuario.apellido_usuario,
                usuario_login: nuevoUsuario.usuario_login,
                id_rol: nuevoUsuario.id_rol
            }
        });
    }
    catch (error) {
        console.error('Error en registro de usuario:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};
exports.RegisterUser = RegisterUser;
const GetUserData = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy');
        if (!decoded.usuario_login && !decoded.cedula_usuario) {
            return res.status(400).json({ error: 'Token inválido' });
        }
        const usuario = await Usuario_model_1.default.findOne({
            attributes: [
                'nombre_usuario',
                'apellido_usuario',
                'cedula_usuario',
                'correo_usuario',
                'tel_usuario',
                'usuario_login',
                'id_rol',
                'estado_usuario'
            ],
            where: {
                [sequelize_1.Op.or]: [
                    { usuario_login: decoded.usuario_login },
                    { cedula_usuario: decoded.cedula_usuario }
                ]
            },
            include: [{
                    association: 'rol',
                    attributes: ['nombre_rol']
                }]
        });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // Enviar datos del usuario
        res.json({
            nombre_usuario: usuario.nombre_usuario,
            apellido_usuario: usuario.apellido_usuario,
            cedula_usuario: usuario.cedula_usuario,
            correo_usuario: usuario.correo_usuario,
            tel_usuario: usuario.tel_usuario,
            usuario_login: usuario.usuario_login,
            id_rol: usuario.id_rol,
            estado_usuario: usuario.estado_usuario,
            rol_nombre: usuario.rol?.nombre_rol
        });
    }
    catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        res.status(500).json({ error: 'Error al obtener datos del usuario' });
    }
};
exports.GetUserData = GetUserData;
const sendUpdateEmailVerification = async (req, res) => {
    const { correo_usuario } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    try {
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy');
        if (!decoded.usuario_login && !decoded.cedula_usuario) {
            return res.status(400).json({ error: 'Token inválido' });
        }
        // Buscar usuario actual
        const usuario = await Usuario_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { usuario_login: decoded.usuario_login },
                    { cedula_usuario: decoded.cedula_usuario }
                ]
            }
        });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // Si el correo no cambió, no hacer nada
        if (correo_usuario.toLowerCase() === usuario.correo_usuario.toLowerCase()) {
            return res.status(200).json({
                mensaje: 'El correo electrónico no ha cambiado, no es necesario verificar.',
                correo_usuario,
                requiresVerification: false
            });
        }
        // Limpiar registros pendientes expirados para este correo
        if (global.pendingRegistrations?.has(correo_usuario.toLowerCase())) {
            const pendingRegistration = global.pendingRegistrations.get(correo_usuario.toLowerCase());
            const now = Date.now();
            if (pendingRegistration && (now - pendingRegistration.timestamp) > 15 * 60 * 1000) { // 15 minutos en milisegundos
                global.pendingRegistrations.delete(correo_usuario.toLowerCase());
            }
        }
        // Verificar si el nuevo correo ya existe en la base de datos
        const correoExistente = await Usuario_model_1.default.findOne({
            where: { correo_usuario }
        });
        if (correoExistente) {
            return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
        }
        // Generar código de verificación
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Almacenar datos de actualización pendientes
        global.pendingRegistrations = global.pendingRegistrations || new Map();
        global.pendingRegistrations.set(correo_usuario.toLowerCase(), {
            data: {
                correo_usuario: correo_usuario.toLowerCase(),
                usuario_login: decoded.usuario_login || '',
                cedula_usuario: decoded.cedula_usuario || '',
                nombre_usuario: '', // Placeholder
                apellido_usuario: '', // Placeholder
                tel_usuario: '', // Placeholder
                contrasena_login: '', // Placeholder
                id_rol: 2 // Default rol for pending updates
            },
            verificationCode,
            timestamp: Date.now()
        });
        // Enviar correo de verificación (la función sendVerificationEmail ya no maneja res directamente)
        try {
            await (0, mailController_1.sendVerificationEmail)(correo_usuario, verificationCode, true);
            res.status(200).json({
                mensaje: 'Por favor verifica tu nuevo correo electrónico para completar la actualización.',
                correo_usuario,
                requiresVerification: true
            });
        }
        catch (emailError) {
            global.pendingRegistrations.delete(correo_usuario.toLowerCase()); // Eliminar el registro pendiente si falla el envío
            console.error('Error al enviar correo de verificación:', emailError);
            res.status(500).json({ error: 'Error al enviar correo de verificación' });
        }
    }
    catch (error) {
        console.error('Error en verificación de correo:', error);
        res.status(500).json({ error: 'Error al verificar correo' });
    }
};
exports.sendUpdateEmailVerification = sendUpdateEmailVerification;
const verifyUpdateEmail = async (req, res) => {
    const { correo_usuario, codigo } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    try {
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy');
        if (!decoded.usuario_login && !decoded.cedula_usuario) {
            return res.status(400).json({ error: 'Token inválido' });
        }
        // Verificar que exista un registro pendiente
        const pendingRegistration = global.pendingRegistrations?.get(correo_usuario.toLowerCase());
        if (!pendingRegistration) {
            return res.status(400).json({
                error: 'No hay actualización pendiente para este correo',
                details: 'Por favor solicita una nueva verificación'
            });
        }
        // Verificar el código
        if (pendingRegistration.verificationCode !== codigo) {
            return res.status(400).json({
                error: 'Código de verificación incorrecto',
                details: 'Por favor verifica el código e intenta nuevamente'
            });
        }
        // Verificar si el código ha expirado (30 minutos)
        const now = Date.now();
        if ((now - pendingRegistration.timestamp) > 15 * 60 * 1000) {
            global.pendingRegistrations.delete(correo_usuario.toLowerCase());
            return res.status(400).json({
                error: 'Código de verificación expirado',
                details: 'Por favor solicita un nuevo código'
            });
        }
        // Buscar usuario (usando los datos del token original para asegurar que el usuario que inició la solicitud es quien actualiza)
        const usuario = await Usuario_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { usuario_login: decoded.usuario_login },
                    { cedula_usuario: decoded.cedula_usuario }
                ]
            }
        });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // Actualizar correo
        await usuario.update({ correo_usuario });
        // Eliminar el registro pendiente
        global.pendingRegistrations.delete(correo_usuario.toLowerCase());
        return res.json({
            success: true,
            message: 'Correo electrónico actualizado exitosamente',
            usuario: {
                correo_usuario: usuario.correo_usuario
            }
        });
    }
    catch (error) {
        console.error('Error al verificar actualización de correo:', error);
        return res.status(500).json({
            error: 'Error al verificar actualización de correo',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.verifyUpdateEmail = verifyUpdateEmail;
const UpdateUserData = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy');
        if (!decoded.usuario_login && !decoded.cedula_usuario) {
            return res.status(400).json({ error: 'Token inválido' });
        }
        const { tel_usuario, usuario_login, contrasena_login, contrasena_actual, correo_usuario } = req.body;
        // Buscar usuario
        const usuario = await Usuario_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { usuario_login: decoded.usuario_login },
                    { cedula_usuario: decoded.cedula_usuario }
                ]
            }
        });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        // Verificar contraseña actual
        const contrasenaValida = await usuario.compararContrasena(contrasena_actual);
        if (!contrasenaValida) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }
        // Verificar si el nuevo nombre de usuario ya existe (si se está cambiando)
        if (usuario_login && usuario_login !== usuario.usuario_login) {
            const usuarioExistente = await Usuario_model_1.default.findOne({
                where: { usuario_login }
            });
            if (usuarioExistente) {
                return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
            }
        }
        // Verificar si el correo cambia y si ya existe en otro usuario
        let updateData = {};
        if (tel_usuario)
            updateData.tel_usuario = tel_usuario;
        if (usuario_login)
            updateData.usuario_login = usuario_login;
        if (contrasena_login)
            updateData.contrasena_login = contrasena_login;
        if (correo_usuario && correo_usuario !== usuario.correo_usuario) {
            const correoExistente = await Usuario_model_1.default.findOne({
                where: {
                    correo_usuario,
                    cedula_usuario: { [sequelize_1.Op.ne]: usuario.cedula_usuario }
                }
            });
            if (correoExistente) {
                return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
            }
            updateData.correo_usuario = correo_usuario;
        }
        await usuario.update(updateData);
        res.json({
            mensaje: 'Datos actualizados exitosamente',
            usuario: {
                nombre_usuario: usuario.nombre_usuario,
                apellido_usuario: usuario.apellido_usuario,
                correo_usuario: updateData.correo_usuario || usuario.correo_usuario,
                tel_usuario: usuario.tel_usuario,
                usuario_login: usuario.usuario_login
            }
        });
    }
    catch (error) {
        console.error('Error al actualizar datos del usuario:', error);
        res.status(500).json({ error: 'Error al actualizar datos del usuario' });
    }
};
exports.UpdateUserData = UpdateUserData;
const getCurrentUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy');
        if (!decoded.usuario_login && !decoded.cedula_usuario) {
            return res.status(400).json({ error: 'Token inválido' });
        }
        const usuario = await Usuario_model_1.default.findOne({
            attributes: [
                'nombre_usuario',
                'apellido_usuario',
                'cedula_usuario',
                'correo_usuario',
                'tel_usuario',
                'usuario_login',
                'id_rol',
                'estado_usuario'
            ],
            where: {
                [sequelize_1.Op.or]: [
                    { usuario_login: decoded.usuario_login },
                    { cedula_usuario: decoded.cedula_usuario }
                ]
            },
            include: [{
                    association: 'rol',
                    attributes: ['nombre_rol']
                }]
        });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({
            nombre_usuario: usuario.nombre_usuario,
            apellido_usuario: usuario.apellido_usuario,
            cedula_usuario: usuario.cedula_usuario,
            correo_usuario: usuario.correo_usuario,
            tel_usuario: usuario.tel_usuario,
            usuario_login: usuario.usuario_login,
            id_rol: usuario.id_rol,
            estado_usuario: usuario.estado_usuario,
            rol_nombre: usuario.rol?.nombre_rol
        });
    }
    catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        res.status(500).json({ error: 'Error al obtener datos del usuario' });
    }
};
exports.getCurrentUser = getCurrentUser;
const completeRegistration = async (req, res) => {
    const { correo_usuario, codigo } = req.body;
    console.log('[CompleteRegistration] Completando registro para:', correo_usuario);
    try {
        // Verificar que exista un registro pendiente
        const pendingRegistration = global.pendingRegistrations?.get(correo_usuario.toLowerCase());
        if (!pendingRegistration) {
            return res.status(400).json({
                error: 'No hay registro pendiente para este correo',
                details: 'Por favor comienza el proceso de registro nuevamente'
            });
        }
        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { usuario_login: pendingRegistration.data.usuario_login },
                    { cedula_usuario: pendingRegistration.data.cedula_usuario },
                    { correo_usuario: pendingRegistration.data.correo_usuario }
                ]
            }
        });
        if (usuarioExistente) {
            // Limpiar el registro pendiente
            global.pendingRegistrations.delete(correo_usuario.toLowerCase());
            let errorMessage = 'Ya existe un usuario con ';
            if (usuarioExistente.usuario_login === pendingRegistration.data.usuario_login) {
                errorMessage += 'ese nombre de usuario';
            }
            else if (usuarioExistente.cedula_usuario === pendingRegistration.data.cedula_usuario) {
                errorMessage += 'esa cédula';
            }
            else if (usuarioExistente.correo_usuario === pendingRegistration.data.correo_usuario) {
                errorMessage += 'ese correo electrónico';
            }
            return res.status(400).json({ error: errorMessage });
        }
        // Verificar el código
        if (pendingRegistration.verificationCode !== codigo) {
            return res.status(400).json({
                error: 'Código de verificación incorrecto',
                details: 'Por favor verifica el código e intenta nuevamente'
            });
        }
        // Verificar si el código ha expirado (30 minutos)
        const now = Date.now();
        if ((now - pendingRegistration.timestamp) > 15 * 60 * 1000) {
            global.pendingRegistrations.delete(correo_usuario.toLowerCase());
            return res.status(400).json({
                error: 'Código de verificación expirado',
                details: 'Por favor solicita un nuevo código'
            });
        }
        // Asegurarse de que id_rol esté presente
        if (!pendingRegistration.data.id_rol) {
            pendingRegistration.data.id_rol = 2; // Establecer rol de cliente por defecto
        }
        // Crear el usuario con los datos guardados
        const usuario = await Usuario_model_1.default.create({
            ...pendingRegistration.data,
            estado_usuario: 'Activo'
        });
        // Eliminar el registro pendiente
        global.pendingRegistrations.delete(correo_usuario.toLowerCase());
        // Generar token JWT
        const token = jsonwebtoken_1.default.sign({
            id: usuario.cedula_usuario,
            correo: usuario.correo_usuario,
            rol: usuario.id_rol
        }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.json({
            success: true,
            message: 'Registro completado exitosamente',
            token,
            usuario: {
                nombre_usuario: usuario.nombre_usuario,
                apellido_usuario: usuario.apellido_usuario,
                usuario_login: usuario.usuario_login,
                rol: usuario.id_rol,
                cedula_usuario: usuario.cedula_usuario,
                correo_usuario: usuario.correo_usuario,
                tel_usuario: usuario.tel_usuario
            }
        });
    }
    catch (error) {
        console.error('[CompleteRegistration] Error:', error);
        return res.status(500).json({
            error: 'Error al completar el registro',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.completeRegistration = completeRegistration;
const validateRegistration = async (req, res) => {
    const { usuario_login, cedula_usuario, correo_usuario } = req.body;
    try {
        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { usuario_login },
                    { cedula_usuario },
                    { correo_usuario }
                ]
            }
        });
        if (usuarioExistente) {
            let errorMessage = 'Ya existe un usuario con ';
            if (usuarioExistente.usuario_login === usuario_login) {
                errorMessage += 'ese nombre de usuario';
            }
            else if (usuarioExistente.cedula_usuario === cedula_usuario) {
                errorMessage += 'esa cédula';
            }
            else if (usuarioExistente.correo_usuario === correo_usuario) {
                errorMessage += 'ese correo electrónico';
            }
            return res.status(400).json({ error: errorMessage });
        }
        // Verificar si ya existe un registro pendiente para este correo
        if (global.pendingRegistrations?.has(correo_usuario.toLowerCase())) {
            return res.status(400).json({
                error: 'Ya existe un registro pendiente para este correo',
                details: 'Por favor verifica tu correo electrónico o espera 15 minutos para intentar nuevamente'
            });
        }
        // Verificar si hay registros pendientes con los mismos datos únicos
        for (const [email, registration] of global.pendingRegistrations?.entries() || []) {
            if (registration.data.usuario_login === usuario_login) {
                return res.status(400).json({ error: 'Ya existe un registro pendiente con ese nombre de usuario' });
            }
            if (registration.data.cedula_usuario === cedula_usuario) {
                return res.status(400).json({ error: 'Ya existe un registro pendiente con esa cédula' });
            }
            if (registration.data.correo_usuario === correo_usuario.toLowerCase()) {
                return res.status(400).json({ error: 'Ya existe un registro pendiente con ese correo electrónico' });
            }
        }
        // Si todas las validaciones pasan
        res.status(200).json({ message: 'Datos válidos para registro' });
    }
    catch (error) {
        console.error('Error en validación de registro:', error);
        res.status(500).json({ error: 'Error al validar datos de registro' });
    }
};
exports.validateRegistration = validateRegistration;
exports.default = exports.Login;
