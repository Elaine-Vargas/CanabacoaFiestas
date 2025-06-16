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
let Pago = class Pago extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_pago' }),
    __metadata("design:type", Number)
], Pago.prototype, "id_pago", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Evento_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], Pago.prototype, "id_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Evento_model_1.default),
    __metadata("design:type", Evento_model_1.default)
], Pago.prototype, "evento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Efectivo', 'Transferencia'),
        allowNull: false
    }),
    __metadata("design:type", String)
], Pago.prototype, "modo_pago", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATEONLY,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW
    }),
    __metadata("design:type", Date)
], Pago.prototype, "fecha_pago", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TIME,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW
    }),
    __metadata("design:type", Date)
], Pago.prototype, "hora_pago", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], Pago.prototype, "monto", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Inicial', 'Final', 'Adicional'),
        allowNull: false
    }),
    __metadata("design:type", String)
], Pago.prototype, "tipo_pago", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Recibido', 'Rechazado'),
        allowNull: false
    }),
    __metadata("design:type", String)
], Pago.prototype, "estado_pago", void 0);
Pago = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'pago', timestamps: false })
], Pago);
exports.default = Pago;
