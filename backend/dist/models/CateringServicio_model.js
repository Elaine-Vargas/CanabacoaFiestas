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
const MenuCatering_model_1 = __importDefault(require("./MenuCatering_model"));
let CateringServicio = class CateringServicio extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_catering' }),
    __metadata("design:type", Number)
], CateringServicio.prototype, "id_catering", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Evento_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], CateringServicio.prototype, "id_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Evento_model_1.default),
    __metadata("design:type", Evento_model_1.default)
], CateringServicio.prototype, "evento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], CateringServicio.prototype, "precioneto_catering", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], CateringServicio.prototype, "itbis_catering", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], CateringServicio.prototype, "total_catering", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Solicitado', 'Aceptado', 'Cancelado'),
        allowNull: false,
        defaultValue: 'Solicitado'
    }),
    __metadata("design:type", String)
], CateringServicio.prototype, "estado_catering", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => MenuCatering_model_1.default),
    __metadata("design:type", Array)
], CateringServicio.prototype, "menus_catering", void 0);
CateringServicio = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'catering_servicio', timestamps: false })
], CateringServicio);
exports.default = CateringServicio;
