import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Proveedor from './Proveedor_model';
import PlatoMenu from './PlatoMenu_model';
import MenuCatering from './MenuCatering_model';

@Table({ tableName: 'menu', timestamps: false })
export default class Menu extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_menu' })
  id_menu!: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  desc_menu!: string;

  @ForeignKey(() => Proveedor)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_proveedor!: number;

  @BelongsTo(() => Proveedor)
  proveedor!: Proveedor;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precio_menu!: number;

  @HasMany(() => PlatoMenu)
  platos_menu!: PlatoMenu[];

  @HasMany(() => MenuCatering)
  menus_catering!: MenuCatering[];
}