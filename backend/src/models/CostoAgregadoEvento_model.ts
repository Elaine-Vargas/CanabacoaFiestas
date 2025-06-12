import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Evento from './Evento_model';

@Table({ tableName: 'costo_agregado_evento', timestamps: false })
export default class CostoAgregadoEvento extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_costo_agregado' })
  id_costo_agregado!: number;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_evento!: number;

  @BelongsTo(() => Evento)
  evento!: Evento;

  @Column({ type: DataType.TEXT, allowNull: false })
  desc_costo!: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0 })
  monto!: number;

  @Column({
    type: DataType.ENUM('Extra', 'Descuento', 'Penalidad', 'Otro'),
    allowNull: false
  })
  tipo_costo!: 'Extra' | 'Descuento' | 'Penalidad' | 'Otro';

  @Column({
    type: DataType.ENUM('Activo', 'Eliminado'),
    allowNull: false,
    defaultValue: 'Activo'
  })
  estado_costo_agregado!: 'Activo' | 'Eliminado';

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  fecha_registro!: Date;
}
