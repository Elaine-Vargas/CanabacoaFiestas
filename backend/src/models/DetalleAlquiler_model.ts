import {
  Table,
  Model,
  Column,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import Elemento from './Elemento_model';
import AlquilerServicio from './AlquilerServicio_model';

@Table({ tableName: 'id_detalquiler', timestamps: false })
export default class DetalleAlquiler extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id_detalquiler!: number;

  @ForeignKey(() => AlquilerServicio)
  @Column({ type: DataType.INTEGER, field: 'id_alquiler', allowNull: false })
  id_alquiler!: number;

  @BelongsTo(() => AlquilerServicio)
  alquiler?: AlquilerServicio;

  @ForeignKey(() => Elemento)
  @Column({ type: DataType.INTEGER, field: 'id_elemento', allowNull: false })
  id_elemento!: number;

  @BelongsTo(() => Elemento)
  elemento?: Elemento;

  @Column({ type: DataType.INTEGER, field: 'cantidad_alquiler', allowNull: false })
  cantidad_alquiler!: number;

  @Column({ type: DataType.DECIMAL(10, 2), field: 'precio_unitario', allowNull: false })
  precio_unitario!: number;

  @Column({ type: DataType.DECIMAL(10, 2), field: 'total_alquiler', allowNull: false })
  total_alquiler!: number;

  @Column({
    type: DataType.ENUM('Aceptado', 'Cancelado'),
    defaultValue: 'Aceptado',
    allowNull: false
  })
  estado_detalquiler!: 'Aceptado' | 'Cancelado';
} 