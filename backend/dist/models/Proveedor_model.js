"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Direccion_model_1 = __importDefault(require("./Direccion_model"));
const Compra_model_1 = __importDefault(require("./Compra_model"));
const Menu_model_1 = __importDefault(require("./Menu_model"));
let Proveedor = class Proveedor extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_proveedor' }),
    __metadata("design:type", Number)
], Proveedor.prototype, "id_proveedor", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Catering', 'Elementos'),
        allowNull: false
    }),
    __metadata("design:type", String)
], Proveedor.prototype, "tipo_proveedor", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), allowNull: false }),
    __metadata("design:type", String)
], Proveedor.prototype, "nombre_proveedor", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.CHAR(12), allowNull: false }),
    __metadata("design:type", String)
], Proveedor.prototype, "tel_proveedor", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), allowNull: false }),
    __metadata("design:type", String)
], Proveedor.prototype, "correo_proveedor", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Direccion_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Proveedor.prototype, "id_direccion", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Direccion_model_1.default),
    __metadata("design:type", Direccion_model_1.default)
], Proveedor.prototype, "direccion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Activo', 'Inactivo', 'Eliminado'),
        defaultValue: 'Activo'
    }),
    __metadata("design:type", String)
], Proveedor.prototype, "estado_proveedor", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Compra_model_1.default),
    __metadata("design:type", Array)
], Proveedor.prototype, "compras", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Menu_model_1.default),
    __metadata("design:type", Array)
], Proveedor.prototype, "menus", void 0);
Proveedor = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'proveedor', timestamps: false })
], Proveedor);
exports.default = Proveedor;
