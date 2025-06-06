import { Table, Model, Column, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript';
import TransporteServicio from './TransporteServicio_model';
import Vehiculo from './Vehiculo_model';

@Table({ tableName: 'detalle_transporte', timestamps: false })
export default class DetalleTransporte extends Model {
  @ForeignKey(() => TransporteServicio)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_transporte!: number;

  @BelongsTo(() => TransporteServicio)
  transporteServicio!: TransporteServicio;

  @ForeignKey(() => Vehiculo)
  @Column({ type: DataType.CHAR(7), allowNull: false })
  matricula_vehiculo!: string;

  @BelongsTo(() => Vehiculo)
  vehiculo!: Vehiculo;

  @Column({ type: DataType.INTEGER, allowNull: false })
  conductor!: number;

  @Column({
    type: DataType.ENUM('Aceptado', 'Cancelado'),
    allowNull: false,
    defaultValue: 'Aceptado'
  })
  estado_dettransporte!: string;
}