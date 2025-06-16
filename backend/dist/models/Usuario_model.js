"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const bcrypt = __importStar(require("bcryptjs"));
const Rol_model_1 = __importDefault(require("./Rol_model"));
const Evento_model_1 = __importDefault(require("./Evento_model"));
const DetalleTransporte_model_1 = __importDefault(require("./DetalleTransporte_model"));
const EmpleadoEvento_model_1 = __importDefault(require("./EmpleadoEvento_model"));
let Usuario = class Usuario extends sequelize_typescript_1.Model {
    static async hashPassword(usuario) {
        if (usuario.changed('contrasena_login')) {
            const password = usuario.contrasena_login;
            // Validación de longitud
            if (password.length < 8 || password.length > 25) {
                throw new Error('La contraseña debe tener entre 8 y 25 caracteres');
            }
            // Validación de mayúscula
            if (!/[A-Z]/.test(password)) {
                throw new Error('Debe contener al menos una mayúscula');
            }
            // Validación de número
            if (!/[0-9]/.test(password)) {
                throw new Error('Debe contener al menos un número');
            }
            // Validación de carácter especial
            if (!/[!@#$%^&*]/.test(password)) {
                throw new Error('Debe contener al menos un carácter especial (!@#$%^&*)');
            }
            // Si pasa todas las validaciones, hashear la contraseña
            usuario.contrasena_login = await bcrypt.hash(password, 10);
        }
    }
    async compararContrasena(contrasena) {
        return bcrypt.compare(contrasena, this.contrasena_login);
    }
};
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.CHAR(13),
        primaryKey: true,
        field: 'cedula_usuario',
        validate: {
            is: {
                args: [/^[0-9]{3}-[0-9]{7}-[0-9]{1}$/],
                msg: 'La cédula debe tener el formato 000-0000000-0'
            }
        }
    }),
    __metadata("design:type", String)
], Usuario.prototype, "cedula_usuario", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        field: 'nombre_usuario',
        validate: {
            notEmpty: {
                msg: 'El nombre no puede estar vacío'
            },
            is: {
                args: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/i,
                msg: 'El nombre solo puede contener letras y espacios'
            }
        }
    }),
    __metadata("design:type", String)
], Usuario.prototype, "nombre_usuario", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        field: 'apellido_usuario',
        validate: {
            notEmpty: {
                msg: 'El apellido no puede estar vacío'
            },
            is: {
                args: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/i,
                msg: 'El apellido solo puede contener letras y espacios'
            }
        }
    }),
    __metadata("design:type", String)
], Usuario.prototype, "apellido_usuario", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Rol_model_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'id_rol',
        validate: {
            min: {
                args: [1],
                msg: 'El ID de rol debe ser mayor que 0'
            }
        }
    }),
    __metadata("design:type", Number)
], Usuario.prototype, "id_rol", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Rol_model_1.default),
    __metadata("design:type", Rol_model_1.default)
], Usuario.prototype, "rol", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(25),
        allowNull: false,
        field: 'usuario_login',
        validate: {
            notEmpty: {
                msg: 'El nombre de usuario no puede estar vacío'
            },
            is: {
                args: /^(?=.{5,25}$)^[a-zA-Z]([a-zA-Z0-9_.]*[a-zA-Z0-9])?$/,
                msg: 'Formato de usuario inválido: debe comenzar con una letra y tener entre 5-25 caracteres'
            }
        }
    }),
    __metadata("design:type", String)
], Usuario.prototype, "usuario_login", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(60),
        allowNull: false,
        field: 'contrasena_login',
        validate: {
            notEmpty: {
                msg: 'La contraseña no puede estar vacía'
            }
        }
    }),
    __metadata("design:type", String)
], Usuario.prototype, "contrasena_login", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(12),
        allowNull: false,
        field: 'tel_usuario',
        validate: {
            is: {
                args: [/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/],
                msg: 'El teléfono debe tener el formato 000-000-0000'
            }
        }
    }),
    __metadata("design:type", String)
], Usuario.prototype, "tel_usuario", void 0);
__decorate([
    (0, sequelize_typescript_1.Index)({
        name: 'correo_usuario_idx',
        unique: true
    }),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
        field: 'correo_usuario',
        validate: {
            isEmail: {
                msg: 'Debe proporcionar un correo electrónico válido'
            },
            notEmpty: {
                msg: 'El correo electrónico no puede estar vacío'
            },
            isLowercase: true
        }
    }),
    __metadata("design:type", String)
], Usuario.prototype, "correo_usuario", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(6),
        allowNull: true,
        field: 'codigo_recuperacion'
    }),
    __metadata("design:type", String)
], Usuario.prototype, "codigo_recuperacion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BIGINT,
        allowNull: true,
        field: 'expiracion_codigo'
    }),
    __metadata("design:type", Number)
], Usuario.prototype, "expiracion_codigo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Activo', 'Inactivo', 'Eliminado', 'Pendiente'),
        allowNull: false,
        defaultValue: 'Activo',
        field: 'estado_usuario'
    }),
    __metadata("design:type", String)
], Usuario.prototype, "estado_usuario", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW,
        field: 'creacion_usuario'
    }),
    __metadata("design:type", Date)
], Usuario.prototype, "creacion_usuario", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Evento_model_1.default, {
        foreignKey: 'cedula_cliente',
        sourceKey: 'cedula_usuario',
        as: 'eventosCliente'
    }),
    __metadata("design:type", Array)
], Usuario.prototype, "eventosCliente", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Evento_model_1.default, {
        foreignKey: 'cedula_asesor',
        sourceKey: 'cedula_usuario',
        as: 'eventosAsesor'
    }),
    __metadata("design:type", Array)
], Usuario.prototype, "eventosAsesor", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => DetalleTransporte_model_1.default, {
        foreignKey: 'id_usuarioconductor',
        sourceKey: 'cedula_usuario',
        as: 'transportesConducidos'
    }),
    __metadata("design:type", Array)
], Usuario.prototype, "transportesConducidos", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => EmpleadoEvento_model_1.default, {
        foreignKey: 'empleado_evento',
        sourceKey: 'cedula_usuario',
        as: 'empleadosAsignados'
    }),
    __metadata("design:type", Array)
], Usuario.prototype, "empleadosAsignados", void 0);
__decorate([
    sequelize_typescript_1.BeforeCreate,
    sequelize_typescript_1.BeforeUpdate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Usuario]),
    __metadata("design:returntype", Promise)
], Usuario, "hashPassword", null);
Usuario = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'usuario',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['usuario_login'],
                name: 'usuario_login'
            },
            {
                unique: true,
                fields: ['correo_usuario'],
                name: 'correo_usuario'
            },
            // No necesitas índice único para cedula_usuario porque es PK
        ]
    })
], Usuario);
exports.default = Usuario;
