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
const Proveedor_model_1 = __importDefault(require("./Proveedor_model"));
const DetalleCompra_model_1 = __importDefault(require("./DetalleCompra_model"));
let Compra = class Compra extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_compra' }),
    __metadata("design:type", Number)
], Compra.prototype, "id_compra", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Proveedor_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Compra.prototype, "id_proveedor", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Proveedor_model_1.default),
    __metadata("design:type", Proveedor_model_1.default)
], Compra.prototype, "proveedor", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATEONLY,
        defaultValue: sequelize_typescript_1.DataType.NOW
    }),
    __metadata("design:type", Date)
], Compra.prototype, "fecha_compra", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TIME,
        defaultValue: sequelize_typescript_1.DataType.NOW
    }),
    __metadata("design:type", String)
], Compra.prototype, "hora_compra", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], Compra.prototype, "costo_compra", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Completada', 'Cancelada')
    }),
    __metadata("design:type", String)
], Compra.prototype, "estado_compra", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => DetalleCompra_model_1.default),
    __metadata("design:type", Array)
], Compra.prototype, "detalles", void 0);
Compra = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'compra', timestamps: false })
], Compra);
exports.default = Compra;
