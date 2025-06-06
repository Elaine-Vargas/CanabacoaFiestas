import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Evento from './Evento_model';

@Table({ tableName: 'factura', timestamps: false })
export default class Factura extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_factura' })
  id_factura!: number;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_evento!: number;

  @BelongsTo(() => Evento)
  evento!: Evento;

  @Column({ 
    type: DataType.DATEONLY, 
    allowNull: false,
    defaultValue: DataType.NOW
  })
  fecha_factura!: Date;

  @Column({ 
    type: DataType.TIME, 
    allowNull: false,
    defaultValue: DataType.NOW
  })
  hora_factura!: Date;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  subtotal!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  itbis!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  total!: number;

  @Column({
    type: DataType.ENUM('Pendiente', 'Pagada', 'Anulada'),
    allowNull: false,
    defaultValue: 'Pendiente'
  })
  estado_factura!: string;
}