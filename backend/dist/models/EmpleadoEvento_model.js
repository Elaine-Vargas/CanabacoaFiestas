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
const Usuario_model_1 = __importDefault(require("./Usuario_model"));
let EmpleadoEvento = class EmpleadoEvento extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Evento_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_evento', allowNull: false }),
    __metadata("design:type", Number)
], EmpleadoEvento.prototype, "id_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Evento_model_1.default),
    __metadata("design:type", Evento_model_1.default)
], EmpleadoEvento.prototype, "evento", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => Usuario_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.CHAR(13), field: 'empleado_evento', allowNull: false }),
    __metadata("design:type", String)
], EmpleadoEvento.prototype, "empleado_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Usuario_model_1.default, {
        foreignKey: 'empleado_evento',
        targetKey: 'cedula_usuario',
        as: 'empleado'
    }),
    __metadata("design:type", Usuario_model_1.default)
], EmpleadoEvento.prototype, "empleado", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Decorador', 'Camarero', 'Conductor', 'Supervisor', 'Encargado de Logística', 'Encargado de Limpieza'),
        field: 'puesto_evento',
        allowNull: false
    }),
    __metadata("design:type", String)
], EmpleadoEvento.prototype, "puesto_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Activo', 'Eliminado', 'Completado'),
        field: 'estado_empevento',
        allowNull: false
    }),
    __metadata("design:type", String)
], EmpleadoEvento.prototype, "estado_empevento", void 0);
EmpleadoEvento = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'empleado_evento',
        timestamps: false,
        modelName: 'EmpleadoEvento'
    })
], EmpleadoEvento);
exports.default = EmpleadoEvento;
