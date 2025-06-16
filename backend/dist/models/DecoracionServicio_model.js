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
const DetalleDecoracion_model_1 = __importDefault(require("./DetalleDecoracion_model"));
let DecoracionServicio = class DecoracionServicio extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_decoracion' }),
    __metadata("design:type", Number)
], DecoracionServicio.prototype, "id_decoracion", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Evento_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], DecoracionServicio.prototype, "id_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Evento_model_1.default),
    __metadata("design:type", Evento_model_1.default)
], DecoracionServicio.prototype, "evento", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => DetalleDecoracion_model_1.default),
    __metadata("design:type", Array)
], DecoracionServicio.prototype, "detalles_decoracion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: false }),
    __metadata("design:type", String)
], DecoracionServicio.prototype, "tema_decoracion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), allowNull: false }),
    __metadata("design:type", String)
], DecoracionServicio.prototype, "colores_decoracion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2) }),
    __metadata("design:type", Number)
], DecoracionServicio.prototype, "precioneto_decoracion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2) }),
    __metadata("design:type", Number)
], DecoracionServicio.prototype, "itbis_decoracion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2) }),
    __metadata("design:type", Number)
], DecoracionServicio.prototype, "total_decoracion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Solicitado', 'Aceptado', 'Completado', 'Cancelado'),
        allowNull: false,
        defaultValue: 'Solicitado'
    }),
    __metadata("design:type", String)
], DecoracionServicio.prototype, "estado_decoracion", void 0);
DecoracionServicio = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'decoracion_servicio', timestamps: false })
], DecoracionServicio);
exports.default = DecoracionServicio;
