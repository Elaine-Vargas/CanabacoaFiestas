import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Evento from './Evento_model';

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

  @Column({ type: DataType.STRING(100), allowNull: false })
  colores_decoracion!: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  tematica_decoracion!: string;

  @Column({ type: DataType.DECIMAL(10, 2)})
  precioneto_decoracion!: number;

  @Column({ type: DataType.DECIMAL(10, 2)})
  itbis_decoracion!: number;

  @Column({ type: DataType.DECIMAL(10, 2)})
  total_decoracion!: number;

  @Column({
    type: DataType.ENUM('Solicitado', 'Aceptado', 'Completado', 'Cancelado'),
    allowNull: false,
    defaultValue: 'Solicitado'
  })
  estado_decoracion!: string;
}