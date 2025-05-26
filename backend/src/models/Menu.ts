import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, HasMany } from 'sequelize-typescript';
import PlatoMenu from './MenuCatering';

@Table({ tableName: 'menu', timestamps: false })
export default class Menu extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_menu' })
  id_menu!: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  desc_menu!: string;
  
  @HasMany (() => PlatoMenu)
  platos_menu!: PlatoMenu[];
}