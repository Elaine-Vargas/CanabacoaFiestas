import { Table, Model, Column, ForeignKey, DataType, BelongsTo, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import CateringServicio from './CateringServicio_model';
import Menu from './Menu_model';

@Table({ tableName: 'menu_catering', timestamps: false })
export default class MenuCatering extends Model {

  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id_menucatering!: number;

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