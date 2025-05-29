import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import TransporteServicio from './TransporteServicio_model';
import Vehiculo from './Vehiculo_model';
import Usuario from './Usuario_model';

@Table({ tableName: 'detalle_transporte', timestamps: false })
export default class DetalleTransporte extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_detalle_transporte' })
  id_detalle_transporte!: number;

  @ForeignKey(() => TransporteServicio)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_transporte!: number;

  @BelongsTo(() => TransporteServicio)
  transporte!: TransporteServicio;

  @ForeignKey(() => Vehiculo)
  @Column({ type: DataType.CHAR(7), allowNull: false })
  id_vehiculo!: string;

  @BelongsTo(() => Vehiculo)
  vehiculo!: Vehiculo;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.CHAR(13), allowNull: false })
  id_usuarioconductor!: string;

  @BelongsTo(() => Usuario)
  conductor!: Usuario;

  @Column({ type: DataType.INTEGER, allowNull: false })
  cantidad_elementos!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precioneto_transporte!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  itbis_transporte!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  total_transporte!: number;
}