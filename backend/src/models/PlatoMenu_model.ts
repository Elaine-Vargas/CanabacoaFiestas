import { Table, Model, Column, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript';
import Plato from './Plato_model';
import Menu from './Menu_model';

@Table({ tableName: 'plato_menu', timestamps: false })
export default class PlatoMenu extends Model {
  @ForeignKey(() => Plato)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_plato!: number;

  @BelongsTo(() => Plato)
  plato!: Plato;

  @ForeignKey(() => Menu)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_menu!: number;

  @BelongsTo(() => Menu)
  menu!: Menu;
}