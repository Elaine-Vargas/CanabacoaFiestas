import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Evento from './Evento_model';
import Pago from './Pago_model';

@Table({ tableName: 'factura', timestamps: false })
export default class Factura extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_factura' })
  id_factura!: number;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'id_evento' })
  id_evento!: number;

  @BelongsTo(() => Evento)
  evento!: Evento;

  @ForeignKey(() => Pago)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'id_pago' })
  id_pago!: number;

  @BelongsTo(() => Pago)
  pago!: Pago;

  @Column({ 
    type: DataType.DATEONLY, 
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'fecha_factura'
  })
  fecha_factura!: Date;

  @Column({ 
    type: DataType.TIME, 
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'hora_factura'
  })
  hora_factura!: Date;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0, field: 'total' })
  total!: number;
}