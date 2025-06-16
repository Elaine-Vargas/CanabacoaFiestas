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
const CateringServicio_model_1 = __importDefault(require("./CateringServicio_model"));
const Menu_model_1 = __importDefault(require("./Menu_model"));
let MenuCatering = class MenuCatering extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], MenuCatering.prototype, "id_menucatering", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => CateringServicio_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], MenuCatering.prototype, "id_catering", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => CateringServicio_model_1.default),
    __metadata("design:type", CateringServicio_model_1.default)
], MenuCatering.prototype, "cateringServicio", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Menu_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], MenuCatering.prototype, "id_menu", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], MenuCatering.prototype, "personas_menucatering", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Menu_model_1.default),
    __metadata("design:type", Menu_model_1.default)
], MenuCatering.prototype, "menu", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Aceptado', 'Cancelado'),
        allowNull: false,
        defaultValue: 'Aceptado'
    }),
    __metadata("design:type", String)
], MenuCatering.prototype, "estado_menucatering", void 0);
MenuCatering = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'menu_catering', timestamps: false })
], MenuCatering);
exports.default = MenuCatering;
