import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Evento from './Evento_model';
import DetalleAlquiler from './DetalleAlquiler_model';

@Table({ tableName: 'alquiler_servicio', timestamps: false })
export default class AlquilerServicio extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_alquiler' })
  id_alquiler!: number;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_evento!: number;

  @BelongsTo(() => Evento)
  evento!: Evento;

  @HasMany(() => DetalleAlquiler)
  detalles?: DetalleAlquiler[];

  @Column({ type: DataType.INTEGER})
  cant_elementos_alquiler!: number;

  @Column({ type: DataType.DECIMAL(10, 2)})
  precioneto_alquiler!: number;

  @Column({ type: DataType.DECIMAL(10, 2) })
  itbis_alquiler!: number;

  @Column({ type: DataType.DECIMAL(10, 2),})
  total_alquiler!: number;

  @Column({
    type: DataType.ENUM('Solicitado', 'Aceptado', 'Completado', 'Cancelado'),
    defaultValue: 'Solicitado'
  })
  estado_alquiler!: 'Solicitado' | 'Aceptado' | 'Completado' | 'Cancelado';
}