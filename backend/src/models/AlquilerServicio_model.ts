import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Evento from './Evento_model';
import Elemento from './Elemento_model';

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

  @ForeignKey(() => Elemento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_elemento!: number;

  @BelongsTo(() => Elemento)
  elemento!: Elemento;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precio_unitario!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  cantidad_alquiler!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precioneto_alquiler!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  itbis_alquiler!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  total_alquiler!: number;
}