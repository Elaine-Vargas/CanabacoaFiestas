import { Table, Model, Column, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript';
import CateringServicio from './CateringServicio_model';
import Menu from './Menu_model';

@Table({ tableName: 'menu_catering', timestamps: false })
export default class MenuCatering extends Model {
  @ForeignKey(() => CateringServicio)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_catering!: number;

  @BelongsTo(() => CateringServicio)
  cateringServicio!: CateringServicio;

  @ForeignKey(() => Menu)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_menu!: number;

  @BelongsTo(() => Menu)
  menu!: Menu;

  @Column({
    type: DataType.ENUM('Aceptado', 'Cancelado'),
    allowNull: false,
    defaultValue: 'Aceptado'
  })
  estado_menucatering!: string;
}