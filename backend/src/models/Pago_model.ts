import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Evento from './Evento_model';
import Tarjeta from './Tarjeta_model';

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
    type: DataType.DATEONLY,
    defaultValue: DataType.NOW
  })
  fecha_pago!: Date;

  @Column({
    type: DataType.TIME,
    defaultValue: DataType.NOW
  })
  hora_pago!: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  monto!: number;
  
  @ForeignKey(() => Tarjeta)
  @Column({ type: DataType.INTEGER })
  id_tarjeta!: number;

  @BelongsTo(() => Tarjeta)
  tarjeta!: Tarjeta;

  @Column({
    type: DataType.ENUM('Inicial', 'Final', 'Adicional'),
    allowNull: false
  })
  tipo_pago!: string;

  @Column({
    type: DataType.ENUM('Pendiente', 'Recibido', 'Rechazado'),
    allowNull: false
  })
  estado_pago!: string;
}