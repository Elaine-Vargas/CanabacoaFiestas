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
const TransporteServicio_model_1 = __importDefault(require("./TransporteServicio_model"));
const Vehiculo_model_1 = __importDefault(require("./Vehiculo_model"));
const Usuario_model_1 = __importDefault(require("./Usuario_model"));
let DetalleTransporte = class DetalleTransporte extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], DetalleTransporte.prototype, "id_dettransporte", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => TransporteServicio_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], DetalleTransporte.prototype, "id_transporte", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => TransporteServicio_model_1.default),
    __metadata("design:type", TransporteServicio_model_1.default)
], DetalleTransporte.prototype, "transporteServicio", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Vehiculo_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.CHAR(7), allowNull: false }),
    __metadata("design:type", String)
], DetalleTransporte.prototype, "matricula_vehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Vehiculo_model_1.default),
    __metadata("design:type", Vehiculo_model_1.default)
], DetalleTransporte.prototype, "vehiculo", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Usuario_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.CHAR(13), allowNull: false }),
    __metadata("design:type", String)
], DetalleTransporte.prototype, "conductor", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Aceptado', 'Cancelado'),
        allowNull: false,
        defaultValue: 'Aceptado'
    }),
    __metadata("design:type", String)
], DetalleTransporte.prototype, "estado_dettransporte", void 0);
DetalleTransporte = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'detalle_transporte', timestamps: false })
], DetalleTransporte);
exports.default = DetalleTransporte;
