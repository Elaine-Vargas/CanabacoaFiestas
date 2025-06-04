import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Evento from './Evento_model';
import Direccion from './Direccion_model';
import DetalleTransporte from './DetalleTransporte_model';

@Table({ tableName: 'transporte_servicio', timestamps: false })
export default class TransporteServicio extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_transporte' })
  id_transporte!: number;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_evento!: number;

  @BelongsTo(() => Evento)
  evento!: Evento;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  distancia_km!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precioneto_transporte!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  itbis_transporte!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  total_transporte!: number;

  @HasMany(() => DetalleTransporte)
  detalles_transporte!: DetalleTransporte[];
}