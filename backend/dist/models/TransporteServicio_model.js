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
const AlquilerServicio_model_1 = __importDefault(require("./AlquilerServicio_model"));
const DetalleTransporte_model_1 = __importDefault(require("./DetalleTransporte_model"));
let TransporteServicio = class TransporteServicio extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_transporte' }),
    __metadata("design:type", Number)
], TransporteServicio.prototype, "id_transporte", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => AlquilerServicio_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], TransporteServicio.prototype, "id_alquiler", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => AlquilerServicio_model_1.default),
    __metadata("design:type", AlquilerServicio_model_1.default)
], TransporteServicio.prototype, "alquilerServicio", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], TransporteServicio.prototype, "distancia_km", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], TransporteServicio.prototype, "tarifa_km", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], TransporteServicio.prototype, "precioneto_transporte", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], TransporteServicio.prototype, "itbis_transporte", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], TransporteServicio.prototype, "total_transporte", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Solicitado', 'Aceptado', 'Completado', 'Cancelado'),
        allowNull: false,
        defaultValue: 'Solicitado'
    }),
    __metadata("design:type", String)
], TransporteServicio.prototype, "estado_transporte", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => DetalleTransporte_model_1.default),
    __metadata("design:type", Array)
], TransporteServicio.prototype, "detalles_transporte", void 0);
TransporteServicio = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'transporte_servicio', timestamps: false })
], TransporteServicio);
exports.default = TransporteServicio;
