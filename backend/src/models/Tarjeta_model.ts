import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Usuario from './Usuario_model';
import Banco from './Banco_model';

@Table({ tableName: 'tarjeta', timestamps: false })
export default class Tarjeta extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_tarjeta' })
  id_tarjeta!: number;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.CHAR(13), allowNull: false, field: 'usuario_creador' })
  usuario_creador!: string;

  @BelongsTo(() => Usuario)
  usuario!: Usuario;

  @Column({
    type: DataType.ENUM('Crédito', 'Débito'),
    allowNull: false,
    field: 'tipo_tarjeta'
  })
  tipo_tarjeta!: string;

  @ForeignKey(() => Banco)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'banco_tarjeta' })
  banco_tarjeta!: number;

  @BelongsTo(() => Banco)
  banco!: Banco;

  @Column({ type: DataType.CHAR(16), allowNull: false, field: 'num_tarjeta' })
  num_tarjeta!: string;

  @Column({ type: DataType.STRING(100), allowNull: false, field: 'titular_tarjeta' })
  titular_tarjeta!: string;

  @Column({ type: DataType.CHAR(5), allowNull: false, field: 'venc_tarjeta' })
  venc_tarjeta!: string;

  @Column({ type: DataType.CHAR(3), allowNull: false, field: 'cvv_tarjeta' })
  cvv_tarjeta!: string;

  @Column({
    type: DataType.ENUM('Activa', 'Vencida', 'Eliminada'),
    allowNull: false,
    defaultValue: 'Activa',
    field: 'estado_tarjeta'
  })
  estado_tarjeta!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'creacion_tarjeta'
  })
  creacion_tarjeta!: Date;
} 