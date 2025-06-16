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
const Proveedor_model_1 = __importDefault(require("./Proveedor_model"));
const PlatoMenu_model_1 = __importDefault(require("./PlatoMenu_model"));
const MenuCatering_model_1 = __importDefault(require("./MenuCatering_model"));
let Menu = class Menu extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_menu' }),
    __metadata("design:type", Number)
], Menu.prototype, "id_menu", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: false }),
    __metadata("design:type", String)
], Menu.prototype, "desc_menu", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Proveedor_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Menu.prototype, "id_proveedor", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Proveedor_model_1.default),
    __metadata("design:type", Proveedor_model_1.default)
], Menu.prototype, "proveedor", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), allowNull: false }),
    __metadata("design:type", Number)
], Menu.prototype, "precio_menu", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Activo', 'Inactivo'),
        defaultValue: 'Activo',
        allowNull: false
    }),
    __metadata("design:type", String)
], Menu.prototype, "estado_menu", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => PlatoMenu_model_1.default),
    __metadata("design:type", Array)
], Menu.prototype, "platos_menu", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => MenuCatering_model_1.default),
    __metadata("design:type", Array)
], Menu.prototype, "menus_catering", void 0);
Menu = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'menu', timestamps: false })
], Menu);
exports.default = Menu;
