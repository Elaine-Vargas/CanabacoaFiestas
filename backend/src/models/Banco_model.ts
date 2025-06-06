import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, HasMany } from 'sequelize-typescript';
import Tarjeta from './Tarjeta_model';

@Table({ tableName: 'banco', timestamps: false })
export default class Banco extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_banco' })
  id_banco!: number;

  @Column({ type: DataType.STRING(25), allowNull: false })
  banco!: string;

  @HasMany(() => Tarjeta)
  tarjetas!: Tarjeta[];
} 