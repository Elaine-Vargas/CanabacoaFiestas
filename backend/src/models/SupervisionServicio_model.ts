import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Evento from './Evento_model';
import DetalleSupervision from './DetalleSupervision_model';

@Table({ tableName: 'supervision_servicio', timestamps: false })
export default class SupervisionServicio extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_supervision' })
  id_supervision!: number;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_evento!: number;

  @BelongsTo(() => Evento)
  evento!: Evento;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  tarifa_hora!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precioneto_supervision!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  itbis_supervision!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  total_supervision!: number;

  @HasMany (() => DetalleSupervision)
  detalles_supervision!: DetalleSupervision[];
}