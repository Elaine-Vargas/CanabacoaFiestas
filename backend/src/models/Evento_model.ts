import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany, HasOne } from 'sequelize-typescript';
import Usuario from './Usuario_model';
import TipoEvento from './TipoEvento_model';
import Espacio from './Espacio_model';
import Comentario from './Comentario_model';
import AlquilerServicio from './AlquilerServicio_model';
import DecoracionServicio from './DecoracionServicio_model';
import CateringServicio from './CateringServicio_model';
import MontajeDesmontajeServicio from './MontajeDesmontajeServicio_model';
import TransporteServicio from './TransporteServicio_model';
import CostoAgregadoEvento from './CostoAgregadoEvento_model';
import Pago from './Pago_model';
import Factura from './Factura_model';
import SupervisionServicio from './SupervisionServicio_model';

@Table({ tableName: 'evento', timestamps: false })
export default class Evento extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_evento' })
  id_evento!: number;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.CHAR(13), field: 'cedula_cliente' })
  cedula_cliente!: string;

  @BelongsTo(() => Usuario, { 
    foreignKey: 'cedula_cliente',
    targetKey: 'cedula_usuario',
    as: 'cliente'
  })
  cliente!: Usuario;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.CHAR(13), field: 'cedula_asesor' })
  cedula_asesor!: string;

  @BelongsTo(() => Usuario, { 
    foreignKey: 'cedula_asesor',
    targetKey: 'cedula_usuario',
    as: 'asesor'
  })
  asesor!: Usuario;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  fecha_evento!: Date;

  @Column({ type: DataType.TIME, allowNull: false })
  hora_evento!: string;

  @ForeignKey(() => Espacio)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_espacio!: number;

  @BelongsTo(() => Espacio)
  espacio!: Espacio;

  @Column({
    type: DataType.ENUM('Pendiente', 'Confirmado', 'Cancelado', 'Completado'),
    defaultValue: 'Pendiente'
  })
  estado_evento!: string;

  @ForeignKey(() => TipoEvento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_tipo_evento!: number;

  @BelongsTo(() => TipoEvento)
  tipo_evento!: TipoEvento;

  
  @Column({ type: DataType.TINYINT, allowNull: false, defaultValue: 0})
  desea_supervision!: boolean;


  @Column({ type: DataType.TEXT })
  nota_cliente!: string;

  @Column({ 
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  creacion_evento!: Date;

  @Column({
    type: DataType.ENUM('Pendiente', 'Completada', 'Aceptada', 'Rechazada', 'Cancelada', 'Eliminada'),
    defaultValue: 'Pendiente'
  })
  estado_cotizacion!: string;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  subtotal_evento!: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  itbis_evento!: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  total_evento!: number;

  // Relaciones
  @HasMany(() => Comentario, { 
    foreignKey: 'id_evento',
    as: 'comentarios'
  })
  comentarios!: Comentario[];

  @HasMany(() => CostoAgregadoEvento)
  costos_agregados_evento!: CostoAgregadoEvento[];

  @HasMany(() => AlquilerServicio)
  alquileres_servicio!: AlquilerServicio[];

  @HasOne(() => DecoracionServicio)
  decoracion_servicio!: DecoracionServicio;

  @HasOne(() => CateringServicio)
  catering_servicio!: CateringServicio;

  @HasOne(() => MontajeDesmontajeServicio)
  montaje_desmontaje_servicio!: MontajeDesmontajeServicio;

  @HasOne(() => TransporteServicio)
  transporte_servicio!: TransporteServicio;

  @HasOne(() => SupervisionServicio)
  supervision_servicio!: SupervisionServicio;

  @HasMany(() => Pago)
  pagos!: Pago[];

  @HasMany(() => Factura)
  facturas!: Factura[];
}