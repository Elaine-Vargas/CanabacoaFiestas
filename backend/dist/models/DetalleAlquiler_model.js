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
const Elemento_model_1 = __importDefault(require("./Elemento_model"));
const AlquilerServicio_model_1 = __importDefault(require("./AlquilerServicio_model"));
let DetalleAlquiler = class DetalleAlquiler extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], DetalleAlquiler.prototype, "id_detalquiler", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => AlquilerServicio_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_alquiler', allowNull: false }),
    __metadata("design:type", Number)
], DetalleAlquiler.prototype, "id_alquiler", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => AlquilerServicio_model_1.default),
    __metadata("design:type", AlquilerServicio_model_1.default)
], DetalleAlquiler.prototype, "alquiler", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Elemento_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_elemento', allowNull: false }),
    __metadata("design:type", Number)
], DetalleAlquiler.prototype, "id_elemento", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Elemento_model_1.default),
    __metadata("design:type", Elemento_model_1.default)
], DetalleAlquiler.prototype, "elemento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'cantidad_alquiler', allowNull: false }),
    __metadata("design:type", Number)
], DetalleAlquiler.prototype, "cantidad_alquiler", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), field: 'precio_unitario', allowNull: false }),
    __metadata("design:type", Number)
], DetalleAlquiler.prototype, "precio_unitario", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), field: 'total_alquiler', allowNull: false }),
    __metadata("design:type", Number)
], DetalleAlquiler.prototype, "total_alquiler", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Aceptado', 'Cancelado'),
        defaultValue: 'Aceptado',
        allowNull: false
    }),
    __metadata("design:type", String)
], DetalleAlquiler.prototype, "estado_detalquiler", void 0);
DetalleAlquiler = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'detalle_alquiler', timestamps: false })
], DetalleAlquiler);
exports.default = DetalleAlquiler;
