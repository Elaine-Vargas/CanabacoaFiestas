import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Evento from './Evento_model';
import MenuCatering from './MenuCatering_model';

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

  @Column({ type: DataType.DECIMAL(10, 2)})
  precioneto_catering!: number;

  @Column({ type: DataType.DECIMAL(10, 2)})
  itbis_catering!: number;

  @Column({ type: DataType.DECIMAL(10, 2)})
  total_catering!: number;

  @HasMany (() => MenuCatering)
  menu_catering!: MenuCatering[];
}