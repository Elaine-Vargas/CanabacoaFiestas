import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, HasMany } from 'sequelize-typescript';
import PlatoMenu from './PlatoMenu_model';

@Table({ tableName: 'plato', timestamps: false })
export default class Plato extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_plato' })
  id_plato!: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  desc_plato!: string;

  @HasMany (() => PlatoMenu)
  platos_menu!: PlatoMenu[];
}