import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Evento from './Evento';

@Table({ tableName: 'catering_servicio', timestamps: false })
export default class CateringServicio extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_catering' })
  id_catering!: number;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_evento!: number;

  @BelongsTo(() => Evento)
  evento!: Evento;

  @Column({ type: DataType.INTEGER, allowNull: false })
  personas_catering!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precioneto_catering!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  itbis_catering!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  total_catering!: number;
}