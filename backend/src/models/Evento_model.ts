import {
  Table,
  Model,
  Column,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  HasOne
} from 'sequelize-typescript';
import Usuario from './Usuario_model';
import TipoEvento from './TipoEvento_model';
import Comentario from './Comentario_model';
import AlquilerServicio from './AlquilerServicio_model';
import DecoracionServicio from './DecoracionServicio_model';
import CateringServicio from './CateringServicio_model';
import TransporteServicio from './TransporteServicio_model';
import CostoAgregadoEvento from './CostoAgregadoEvento_model';
import Pago from './Pago_model';
import Factura from './Factura_model';
import SupervisionServicio from './SupervisionServicio_model';
import Direccion from './Direccion_model';
import EmpleadoEvento from './EmpleadoEvento_model';

@Table({ tableName: 'evento', timestamps: false })
export default class Evento extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, field: 'id_evento' })
  id_evento!: number;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.CHAR(13), field: 'cedula_cliente', allowNull: false })
  cedula_cliente!: string;

  @BelongsTo(() => Usuario, { 
    foreignKey: 'cedula_cliente',
    targetKey: 'cedula_usuario',
    as: 'cliente'
  })
  cliente?: Usuario;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.CHAR(13), field: 'cedula_asesor', allowNull: true })
  cedula_asesor?: string;

  @BelongsTo(() => Usuario, { 
    foreignKey: 'cedula_asesor',
    targetKey: 'cedula_usuario',
    as: 'asesor'
  })
  asesor?: Usuario;

  @Column({ type: DataType.DATEONLY, field: 'fecha_evento', allowNull: false })
  fecha_evento!: Date;

  @Column({ type: DataType.TIME, field: 'hora_evento', allowNull: false })
  hora_evento!: string;

  @ForeignKey(() => TipoEvento)
  @Column({ type: DataType.INTEGER, field: 'id_tipo_evento', allowNull: false })
  id_tipo_evento!: number;

  @BelongsTo(() => TipoEvento)
  tipo_evento?: TipoEvento;

  @ForeignKey(() => Direccion)
  @Column({ type: DataType.INTEGER, field: 'id_direccion', allowNull: false })
  id_direccion!: number;

  @BelongsTo(() => Direccion)
  direccion?: Direccion;

  @Column({ type: DataType.STRING(50), field: 'espacio_evento', allowNull: false })
  espacio_evento!: string;

  @Column({
    type: DataType.ENUM('Pendiente', 'Aceptada', 'Rechazada', 'Completada', 'Cancelada'),
    field: 'estado_solicitud',
    allowNull: false,
    defaultValue: 'Pendiente'
  })
  estado_solicitud!: 'Pendiente' | 'Aceptada' | 'Rechazada' | 'Completada' | 'Cancelada';

  @Column({
    type: DataType.ENUM('Pendiente', 'Completado', 'Cancelado'),
    field: 'estado_evento',
    allowNull: false,
    defaultValue: 'Pendiente'
  })
  estado_evento!: 'Pendiente' | 'Completado' | 'Cancelado';

  @Column({ type: DataType.BOOLEAN, field: 'desea_supervision', defaultValue: false })
  desea_supervision!: boolean;

  @Column({ type: DataType.TEXT, field: 'nota_cliente' })
  nota_cliente?: string;

  @Column({ 
    type: DataType.DATE,
    field: 'creacion_evento',
    allowNull: false,
    defaultValue: DataType.NOW
  })
  creacion_evento!: Date;

  @Column({ type: DataType.DECIMAL(10, 2), field: 'subtotal_evento', defaultValue: 0 })
  subtotal_evento!: number;

  @Column({ type: DataType.DECIMAL(10, 2), field: 'itbis_evento', defaultValue: 0 })
  itbis_evento!: number;

  @Column({ type: DataType.DECIMAL(10, 2), field: 'total_evento', defaultValue: 0 })
  total_evento!: number;

  // Relaciones
  @HasMany(() => Comentario)
  comentarios?: Comentario[];

  @HasMany(() => CostoAgregadoEvento)
  costos_agregados_evento?: CostoAgregadoEvento[];

  @HasMany(() => AlquilerServicio)
  alquileres_servicio?: AlquilerServicio[];

  @HasOne(() => DecoracionServicio)
  decoracion_servicio?: DecoracionServicio;

  @HasMany(() => CateringServicio)
  catering_servicios!: CateringServicio[];

  @HasOne(() => TransporteServicio)
  transporte_servicio?: TransporteServicio;

  @HasMany(() => SupervisionServicio)
  supervision_servicios!: SupervisionServicio[];

  @HasMany(() => Pago)
  pagos?: Pago[];

  @HasMany(() => Factura)
  facturas!: Factura[];

  @HasMany(() => EmpleadoEvento)
  empleados_evento?: EmpleadoEvento[];
}