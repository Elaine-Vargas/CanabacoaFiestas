import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType } from 'sequelize-typescript';

@Table({ tableName: 'plato', timestamps: false })
export default class Plato extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_plato' })
  id_plato!: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  desc_plato!: string;
}