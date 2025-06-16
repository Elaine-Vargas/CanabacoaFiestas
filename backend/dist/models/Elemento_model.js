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
const SubcategoriaElemento_model_1 = __importDefault(require("./SubcategoriaElemento_model"));
const ColorElemento_model_1 = __importDefault(require("./ColorElemento_model"));
const MaterialElemento_model_1 = __importDefault(require("./MaterialElemento_model"));
const DetalleCompra_model_1 = __importDefault(require("./DetalleCompra_model"));
const DetalleAlquiler_model_1 = __importDefault(require("./DetalleAlquiler_model"));
let Elemento = class Elemento extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_elemento' }),
    __metadata("design:type", Number)
], Elemento.prototype, "id_elemento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), allowNull: false }),
    __metadata("design:type", String)
], Elemento.prototype, "nombre_elemento", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => SubcategoriaElemento_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Elemento.prototype, "id_subcategoria", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => SubcategoriaElemento_model_1.default),
    __metadata("design:type", SubcategoriaElemento_model_1.default)
], Elemento.prototype, "subcategoria", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => MaterialElemento_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Elemento.prototype, "id_material", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => MaterialElemento_model_1.default),
    __metadata("design:type", MaterialElemento_model_1.default)
], Elemento.prototype, "material", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => ColorElemento_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Elemento.prototype, "id_color", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => ColorElemento_model_1.default),
    __metadata("design:type", ColorElemento_model_1.default)
], Elemento.prototype, "color", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], Elemento.prototype, "precio_elemento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true, defaultValue: 0 }),
    __metadata("design:type", Number)
], Elemento.prototype, "cantidad_total", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true, defaultValue: 0 }),
    __metadata("design:type", Number)
], Elemento.prototype, "cantidad_disponible", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(255), allowNull: true }),
    __metadata("design:type", String)
], Elemento.prototype, "imagen_url", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Activo', 'Inactivo', 'Eliminado'),
        allowNull: true,
        defaultValue: 'Activo'
    }),
    __metadata("design:type", String)
], Elemento.prototype, "estado_elemento", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => DetalleCompra_model_1.default),
    __metadata("design:type", Array)
], Elemento.prototype, "detallecompras", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => DetalleAlquiler_model_1.default),
    __metadata("design:type", Array)
], Elemento.prototype, "detallealquileres", void 0);
Elemento = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'elemento', timestamps: false })
], Elemento);
exports.default = Elemento;
