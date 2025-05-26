import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Evento from './Evento';
import DetalleMontajeDesmontaje from './DetalleMontajeDesmontaje';

@Table({ tableName: 'montajedesmontaje_servicio', timestamps: false })
export default class MontajeDesmontajeServicio extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_montdes' })
  id_montdes!: number;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_evento!: number;

  @BelongsTo(() => Evento)
  evento!: Evento;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precio_neto!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  itbis!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  total!: number;

  @HasMany (() => DetalleMontajeDesmontaje)
  detalles_montaje_desmontaje!: DetalleMontajeDesmontaje[];
}