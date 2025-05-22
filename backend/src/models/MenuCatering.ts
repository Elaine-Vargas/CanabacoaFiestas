import { Table, Model, DataType, Column, PrimaryKey, ForeignKey } from 'sequelize-typescript';
import Plato from './Plato';
import Menu from './Menu';

@Table({ tableName: 'plato_menu', timestamps: false })
export default class PlatoMenu extends Model {
  @PrimaryKey
  @ForeignKey(() => Plato)
  @Column({ type: DataType.INTEGER })
  id_plato!: number;

  @PrimaryKey
  @ForeignKey(() => Menu)
  @Column({ type: DataType.INTEGER })
  id_menu!: number;
}