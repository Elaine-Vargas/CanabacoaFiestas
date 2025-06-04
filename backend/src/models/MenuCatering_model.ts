import { Table, Model, DataType, Column, PrimaryKey, ForeignKey } from 'sequelize-typescript';
import Menu from './Menu_model';
import CateringServicio from './CateringServicio_model';

@Table({ tableName: 'menu_catering', timestamps: false })
export default class MenuCatering extends Model {
  @ForeignKey(() => Menu)
  @Column({ type: DataType.INTEGER })
  id_plato!: number;

  @ForeignKey(() => CateringServicio)
  @Column({ type: DataType.INTEGER })
  id_menu!: number;
}