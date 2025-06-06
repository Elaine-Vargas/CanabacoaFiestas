import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Direccion from './Direccion_model';
import Compra from './Compra_model';
import Menu from './Menu_model';

@Table({ tableName: 'proveedor', timestamps: false })
export default class Proveedor extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_proveedor' })
  id_proveedor!: number;
  @Column({
    type: DataType.ENUM('Catering', 'Elementos'),
    allowNull: false
  })
  tipo_proveedor!: 'Catering' | 'Elementos';

  @Column({ type: DataType.STRING(50), allowNull: false })
  nombre_proveedor!: string;

  @Column({ type: DataType.CHAR(12), allowNull: false })
  tel_proveedor!: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  correo_proveedor!: string;

  @ForeignKey(() => Direccion)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_direccion!: number;

  @BelongsTo(() => Direccion)
  direccion!: Direccion;

  @Column({
    type: DataType.ENUM('Activo', 'Inactivo', 'Eliminado'),
    defaultValue: 'Activo'
  })
  estado_proveedor!: 'Activo'|'Inactivo'|'Eliminado';

  //Relaciones
  @HasMany(() => Compra)
  compras!: Compra[];

  @HasMany(() => Menu)
  menus!: Menu[];
}