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
const Evento_model_1 = __importDefault(require("./Evento_model"));
const Pago_model_1 = __importDefault(require("./Pago_model"));
let Factura = class Factura extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_factura' }),
    __metadata("design:type", Number)
], Factura.prototype, "id_factura", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Evento_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false, field: 'id_evento' }),
    __metadata("design:type", Number)
], Factura.prototype, "id_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Evento_model_1.default),
    __metadata("design:type", Evento_model_1.default)
], Factura.prototype, "evento", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Pago_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false, field: 'id_pago' }),
    __metadata("design:type", Number)
], Factura.prototype, "id_pago", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Pago_model_1.default),
    __metadata("design:type", Pago_model_1.default)
], Factura.prototype, "pago", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATEONLY,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW,
        field: 'fecha_factura'
    }),
    __metadata("design:type", Date)
], Factura.prototype, "fecha_factura", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TIME,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW,
        field: 'hora_factura'
    }),
    __metadata("design:type", Date)
], Factura.prototype, "hora_factura", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0, field: 'total' }),
    __metadata("design:type", Number)
], Factura.prototype, "total", void 0);
Factura = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'factura', timestamps: false })
], Factura);
exports.default = Factura;
