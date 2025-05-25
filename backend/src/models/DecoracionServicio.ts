import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Evento from './Evento';
import Espacio from './Espacio';

@Table({ tableName: 'decoracion_servicio', timestamps: false })
export default class DecoracionServicio extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_decoracion' })
  id_decoracion!: number;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_evento!: number;

  @BelongsTo(() => Evento)
  evento!: Evento;

  @Column({ type: DataType.TEXT, allowNull: false })
  tema_decoracion!: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precioneto_decor!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  itbis_decoracion!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  total_decoracion!: number;
}