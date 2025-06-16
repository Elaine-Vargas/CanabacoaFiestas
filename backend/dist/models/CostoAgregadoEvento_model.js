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
let CostoAgregadoEvento = class CostoAgregadoEvento extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_costo_agregado' }),
    __metadata("design:type", Number)
], CostoAgregadoEvento.prototype, "id_costo_agregado", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Evento_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], CostoAgregadoEvento.prototype, "id_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Evento_model_1.default),
    __metadata("design:type", Evento_model_1.default)
], CostoAgregadoEvento.prototype, "evento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: false }),
    __metadata("design:type", String)
], CostoAgregadoEvento.prototype, "desc_costo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }),
    __metadata("design:type", Number)
], CostoAgregadoEvento.prototype, "monto", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Extra', 'Descuento', 'Penalidad', 'Otro'),
        allowNull: false
    }),
    __metadata("design:type", String)
], CostoAgregadoEvento.prototype, "tipo_costo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Activo', 'Eliminado'),
        allowNull: false,
        defaultValue: 'Activo'
    }),
    __metadata("design:type", String)
], CostoAgregadoEvento.prototype, "estado_costo_agregado", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW
    }),
    __metadata("design:type", Date)
], CostoAgregadoEvento.prototype, "fecha_registro", void 0);
CostoAgregadoEvento = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'costo_agregado_evento', timestamps: false })
], CostoAgregadoEvento);
exports.default = CostoAgregadoEvento;
