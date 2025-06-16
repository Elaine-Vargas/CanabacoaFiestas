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
const DetalleTransporte_model_1 = __importDefault(require("./DetalleTransporte_model"));
let Vehiculo = class Vehiculo extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.CHAR(7) }),
    __metadata("design:type", String)
], Vehiculo.prototype, "matricula_vehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(25), allowNull: false }),
    __metadata("design:type", String)
], Vehiculo.prototype, "marca_vehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(25), allowNull: false }),
    __metadata("design:type", String)
], Vehiculo.prototype, "modelo_vehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Automóvil', 'Remolque', 'Máquinas pesadas', 'Montacargas'),
        allowNull: false
    }),
    __metadata("design:type", String)
], Vehiculo.prototype, "tipo_vehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], Vehiculo.prototype, "capacidad_vehiculo_lb", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Activo', 'Inactivo', 'Eliminado'),
        defaultValue: 'Activo'
    }),
    __metadata("design:type", String)
], Vehiculo.prototype, "estado_vehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => DetalleTransporte_model_1.default),
    __metadata("design:type", Array)
], Vehiculo.prototype, "detallestransportes", void 0);
Vehiculo = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'vehiculo', timestamps: false })
], Vehiculo);
exports.default = Vehiculo;
