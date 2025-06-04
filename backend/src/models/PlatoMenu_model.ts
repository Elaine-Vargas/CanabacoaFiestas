import { Table, Model, DataType, Column, PrimaryKey, ForeignKey, AutoIncrement, BelongsTo } from 'sequelize-typescript';
import Plato from './Plato_model';
import Menu from './Menu_model';

@Table({ tableName: 'plato_menu', timestamps: false })
export default class PlatoMenu extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id!: number;

  @ForeignKey(() => Plato)
  @Column({ type: DataType.INTEGER })
  id_plato!: number;

  @ForeignKey(() => Menu)
  @Column({ type: DataType.INTEGER })
  id_menu!: number;

  @BelongsTo(() => Plato, 'id_plato')
  plato!: Plato;
}