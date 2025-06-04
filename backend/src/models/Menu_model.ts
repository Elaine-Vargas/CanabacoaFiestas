import { Table, Model, Column, PrimaryKey, ForeignKey, AutoIncrement, DataType, HasMany, BelongsTo } from 'sequelize-typescript';
import PlatoMenu from './PlatoMenu_model';
import Proveedor from './Proveedor_model';

@Table({ tableName: 'menu', timestamps: false })
export default class Menu extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_menu' })
  id_menu!: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  desc_menu!: string;

  @ForeignKey(() => Proveedor)
  @Column({ type: DataType.INTEGER })
  id_proveedor!: number;

  @BelongsTo(() => Proveedor)
  proveedor!: Proveedor;
  
  @HasMany(() => PlatoMenu)
  platos_menu!: PlatoMenu[];
}