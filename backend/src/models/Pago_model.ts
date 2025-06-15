import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Evento from './Evento_model';

@Table({ tableName: 'pago', timestamps: false })
export default class Pago extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_pago' })
  id_pago!: number;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER })
  id_evento!: number;

  @BelongsTo(() => Evento)
  evento!: Evento;

  @Column({
    type: DataType.ENUM('Efectivo', 'Transferencia'),
    allowNull: false
  })
  modo_pago!: string;

  @Column({ 
    type: DataType.DATEONLY, 
    allowNull: false,
    defaultValue: DataType.NOW
  })
  fecha_pago!: Date;

  @Column({ 
    type: DataType.TIME, 
    allowNull: false,
    defaultValue: DataType.NOW
  })
  hora_pago!: Date;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  monto!: number;

  @Column({
    type: DataType.ENUM('Inicial', 'Final', 'Adicional'),
    allowNull: false
  })
  tipo_pago!: string;

  @Column({
    type: DataType.ENUM('Recibido', 'Rechazado'),
    allowNull: false
  })
  estado_pago!: string;
}