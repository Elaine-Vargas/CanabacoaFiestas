import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType } from 'sequelize-typescript';

@Table({ tableName: 'color_elemento', timestamps: false })
export default class ColorElemento extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_color' })
  id_color!: number;

  @Column({ type: DataType.STRING(50), allowNull: false })
  nombre_color!: string;
}