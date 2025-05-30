import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, HasMany } from 'sequelize-typescript';
import Elemento from './Elemento_model';

@Table({ tableName: 'color_elemento', timestamps: false })
export default class ColorElemento extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_color' })
  id_color!: number;

  @Column({ type: DataType.STRING(50), allowNull: false })
  nombre_color!: string;

  // Relación 1:N con Elemento
  @HasMany(() => Elemento)
  elementos!: Elemento[];
}