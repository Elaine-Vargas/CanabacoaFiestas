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
const Ciudad_model_1 = __importDefault(require("./Ciudad_model"));
const Evento_model_1 = __importDefault(require("./Evento_model"));
const Proveedor_model_1 = __importDefault(require("./Proveedor_model"));
let Direccion = class Direccion extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_direccion' }),
    __metadata("design:type", Number)
], Direccion.prototype, "id_direccion", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Ciudad_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_ciudad', allowNull: false }),
    __metadata("design:type", Number)
], Direccion.prototype, "id_ciudad", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Ciudad_model_1.default),
    __metadata("design:type", Ciudad_model_1.default)
], Direccion.prototype, "ciudad", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), field: 'sector', allowNull: false }),
    __metadata("design:type", String)
], Direccion.prototype, "sector", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), field: 'calle', allowNull: false }),
    __metadata("design:type", String)
], Direccion.prototype, "calle", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(200), field: 'detalles', allowNull: true }),
    __metadata("design:type", String)
], Direccion.prototype, "detalles", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Evento_model_1.default),
    __metadata("design:type", Array)
], Direccion.prototype, "eventos", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Proveedor_model_1.default),
    __metadata("design:type", Array)
], Direccion.prototype, "proveedores", void 0);
Direccion = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'direccion', timestamps: false })
], Direccion);
exports.default = Direccion;
