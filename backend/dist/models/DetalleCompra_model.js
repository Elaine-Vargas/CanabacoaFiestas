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
const Compra_model_1 = __importDefault(require("./Compra_model"));
const Elemento_model_1 = __importDefault(require("./Elemento_model"));
let DetalleCompra = class DetalleCompra extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_detcompra' }),
    __metadata("design:type", Number)
], DetalleCompra.prototype, "id_detcompra", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Compra_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], DetalleCompra.prototype, "id_compra", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Compra_model_1.default),
    __metadata("design:type", Compra_model_1.default)
], DetalleCompra.prototype, "compra", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Elemento_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], DetalleCompra.prototype, "id_elemento", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Elemento_model_1.default),
    __metadata("design:type", Elemento_model_1.default)
], DetalleCompra.prototype, "elemento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 0 }),
    __metadata("design:type", Number)
], DetalleCompra.prototype, "cantidad_compra", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], DetalleCompra.prototype, "precio_unitario", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], DetalleCompra.prototype, "precio_total", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Activo', 'Eliminado')
    }),
    __metadata("design:type", String)
], DetalleCompra.prototype, "estado_detcompra", void 0);
DetalleCompra = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'detalle_compra', timestamps: false })
], DetalleCompra);
exports.default = DetalleCompra;
