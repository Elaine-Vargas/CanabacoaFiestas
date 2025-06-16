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
const Usuario_model_1 = __importDefault(require("./Usuario_model"));
const TipoEvento_model_1 = __importDefault(require("./TipoEvento_model"));
const Comentario_model_1 = __importDefault(require("./Comentario_model"));
const AlquilerServicio_model_1 = __importDefault(require("./AlquilerServicio_model"));
const DecoracionServicio_model_1 = __importDefault(require("./DecoracionServicio_model"));
const CateringServicio_model_1 = __importDefault(require("./CateringServicio_model"));
const CostoAgregadoEvento_model_1 = __importDefault(require("./CostoAgregadoEvento_model"));
const Pago_model_1 = __importDefault(require("./Pago_model"));
const Factura_model_1 = __importDefault(require("./Factura_model"));
const SupervisionServicio_model_1 = __importDefault(require("./SupervisionServicio_model"));
const Direccion_model_1 = __importDefault(require("./Direccion_model"));
const EmpleadoEvento_model_1 = __importDefault(require("./EmpleadoEvento_model"));
let Evento = class Evento extends sequelize_typescript_1.Model {
    get nombre_cliente() {
        return this.cliente?.nombre_usuario;
    }
    get nombre_asesor() {
        return this.asesor?.nombre_usuario;
    }
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_evento' }),
    __metadata("design:type", Number)
], Evento.prototype, "id_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Usuario_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.CHAR(13), field: 'cedula_cliente', allowNull: false }),
    __metadata("design:type", String)
], Evento.prototype, "cedula_cliente", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Usuario_model_1.default, {
        foreignKey: 'cedula_cliente',
        targetKey: 'cedula_usuario',
        as: 'cliente'
    }),
    __metadata("design:type", Usuario_model_1.default)
], Evento.prototype, "cliente", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Usuario_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.CHAR(13), field: 'cedula_asesor', allowNull: true }),
    __metadata("design:type", String)
], Evento.prototype, "cedula_asesor", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Usuario_model_1.default, {
        foreignKey: 'cedula_asesor',
        targetKey: 'cedula_usuario',
        as: 'asesor'
    }),
    __metadata("design:type", Usuario_model_1.default)
], Evento.prototype, "asesor", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATEONLY, field: 'fecha_evento', allowNull: false }),
    __metadata("design:type", Date)
], Evento.prototype, "fecha_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TIME, field: 'hora_evento', allowNull: false }),
    __metadata("design:type", String)
], Evento.prototype, "hora_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => TipoEvento_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_tipo_evento', allowNull: false }),
    __metadata("design:type", Number)
], Evento.prototype, "id_tipo_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => TipoEvento_model_1.default, { as: 'tipo_evento' }),
    __metadata("design:type", TipoEvento_model_1.default)
], Evento.prototype, "tipo_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Direccion_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, field: 'id_direccion', allowNull: false }),
    __metadata("design:type", Number)
], Evento.prototype, "id_direccion", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Direccion_model_1.default),
    __metadata("design:type", Direccion_model_1.default)
], Evento.prototype, "direccion", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50), field: 'espacio_evento', allowNull: false }),
    __metadata("design:type", String)
], Evento.prototype, "espacio_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Pendiente', 'Aceptada', 'Rechazada', 'Completada', 'Cancelada'),
        field: 'estado_solicitud',
        allowNull: false,
        defaultValue: 'Pendiente'
    }),
    __metadata("design:type", String)
], Evento.prototype, "estado_solicitud", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, field: 'desea_supervision', defaultValue: false }),
    __metadata("design:type", Boolean)
], Evento.prototype, "desea_supervision", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, field: 'nota_cliente' }),
    __metadata("design:type", String)
], Evento.prototype, "nota_cliente", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'creacion_evento',
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW
    }),
    __metadata("design:type", Date)
], Evento.prototype, "creacion_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), field: 'subtotal_evento', defaultValue: 0 }),
    __metadata("design:type", Number)
], Evento.prototype, "subtotal_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), field: 'itbis_evento', defaultValue: 0 }),
    __metadata("design:type", Number)
], Evento.prototype, "itbis_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), field: 'total_evento', defaultValue: 0 }),
    __metadata("design:type", Number)
], Evento.prototype, "total_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), field: 'pagopendiente_evento', defaultValue: 0 }),
    __metadata("design:type", Number)
], Evento.prototype, "pagopendiente_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.VIRTUAL),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], Evento.prototype, "nombre_cliente", null);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.VIRTUAL),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], Evento.prototype, "nombre_asesor", null);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Comentario_model_1.default),
    __metadata("design:type", Array)
], Evento.prototype, "comentarios", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => CostoAgregadoEvento_model_1.default),
    __metadata("design:type", Array)
], Evento.prototype, "costos_agregados_evento", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => AlquilerServicio_model_1.default),
    __metadata("design:type", Array)
], Evento.prototype, "alquileres_servicio", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => DecoracionServicio_model_1.default),
    __metadata("design:type", DecoracionServicio_model_1.default)
], Evento.prototype, "decoracion_servicio", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => CateringServicio_model_1.default),
    __metadata("design:type", Array)
], Evento.prototype, "catering_servicios", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => SupervisionServicio_model_1.default),
    __metadata("design:type", Array)
], Evento.prototype, "supervision_servicios", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Pago_model_1.default),
    __metadata("design:type", Array)
], Evento.prototype, "pagos", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Factura_model_1.default),
    __metadata("design:type", Array)
], Evento.prototype, "facturas", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => EmpleadoEvento_model_1.default),
    __metadata("design:type", Array)
], Evento.prototype, "empleados_evento", void 0);
Evento = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'evento', timestamps: false })
], Evento);
exports.default = Evento;
