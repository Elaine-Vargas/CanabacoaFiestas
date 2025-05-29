import { Table, Model, DataType, Column, PrimaryKey, ForeignKey } from 'sequelize-typescript';
import Menu from './Menu_model';
import CateringServicio from './CateringServicio_model';

@Table({ tableName: 'menu_catering', timestamps: false })
export default class MenuCatering extends Model {
  @PrimaryKey
  @ForeignKey(() => Menu)
  @Column({ type: DataType.INTEGER })
  id_plato!: number;

  @PrimaryKey
  @ForeignKey(() => CateringServicio)
  @Column({ type: DataType.INTEGER })
  id_menu!: number;
}