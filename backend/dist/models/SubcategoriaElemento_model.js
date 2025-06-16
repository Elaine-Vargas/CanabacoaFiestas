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
const CategoriaElemento_model_1 = __importDefault(require("./CategoriaElemento_model"));
const Elemento_model_1 = __importDefault(require("./Elemento_model"));
let SubcategoriaElemento = class SubcategoriaElemento extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_subcategoria' }),
    __metadata("design:type", Number)
], SubcategoriaElemento.prototype, "id_subcategoria", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => CategoriaElemento_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], SubcategoriaElemento.prototype, "id_categoria", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => CategoriaElemento_model_1.default),
    __metadata("design:type", CategoriaElemento_model_1.default)
], SubcategoriaElemento.prototype, "categoria", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), allowNull: false }),
    __metadata("design:type", String)
], SubcategoriaElemento.prototype, "nombre_subcategoria", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Elemento_model_1.default),
    __metadata("design:type", Array)
], SubcategoriaElemento.prototype, "elementos", void 0);
SubcategoriaElemento = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'subcategoria_elemento', timestamps: false })
], SubcategoriaElemento);
exports.default = SubcategoriaElemento;
