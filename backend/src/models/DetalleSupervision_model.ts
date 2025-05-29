import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import SupervisionServicio from './SupervisionServicio_model';
import Usuario from './Usuario_model';

@Table({ tableName: 'detalle_supervision', timestamps: false })
export default class DetalleSupervision extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_detalle_supervision' })
  id_detalle_supervision!: number;

  @ForeignKey(() => SupervisionServicio)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_supervision!: number;

  @BelongsTo(() => SupervisionServicio)
  supervision!: SupervisionServicio;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.CHAR(13), allowNull: false })
  cedula_usuariopersonal!: string;

  @BelongsTo(() => Usuario)
  supervisor!: Usuario;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  horas_trabajo!: number;

  @Column({ type: DataType.DECIMAL(10, 2) })
  precioneto_supervision!: number;
}