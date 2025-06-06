import {
  Table,
  Model,
  Column,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import DecoracionServicio from './DecoracionServicio_model';

@Table({ tableName: 'detalle_decoracion', timestamps: false })
export default class DetalleDecoracion extends Model {
  @ForeignKey(() => DecoracionServicio)
  @Column({ type: DataType.INTEGER, field: 'id_decoracion', allowNull: false })
  id_decoracion!: number;

  @BelongsTo(() => DecoracionServicio)
  decoracionServicio?: DecoracionServicio;

  @Column({ type: DataType.STRING(50), allowNull: false })
  elemento_decoracion!: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  cantelemento_decoracion!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precio_elemento!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precio_decoracion!: number;

  @Column({
    type: DataType.ENUM('Aceptado', 'Cancelado'),
    allowNull: false,
    defaultValue: 'Aceptado'
  })
  estado_detdecoracion!: string;
}