import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Usuario from './Usuario';
import TipoEvento from './TipoEvento';

@Table({ tableName: 'evento', timestamps: false })
export default class Evento extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_evento' })
  id_evento!: number;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.CHAR(13), field: 'cedula_cliente' })
  cedula_cliente!: string;

  @BelongsTo(() => Usuario, 'cedula_cliente')
  cliente!: Usuario;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.CHAR(13), field: 'cedula_asesor' })
  cedula_asesor!: string;

  @BelongsTo(() => Usuario, 'cedula_asesor')
  asesor!: Usuario;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  fecha_evento!: Date;

  @Column({ type: DataType.TIME, allowNull: false })
  hora_evento!: string;

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
}