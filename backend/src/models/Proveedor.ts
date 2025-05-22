import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import TipoProveedor from './TipoProveedor';
import Direccion from './Direccion';

@Table({ tableName: 'proveedor', timestamps: false })
export default class Proveedor extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_proveedor' })
  id_proveedor!: number;

  @ForeignKey(() => TipoProveedor)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_tipo_proveedor!: number;

  @BelongsTo(() => TipoProveedor)
  tipo_proveedor!: TipoProveedor;

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
  estado_proveedor!: string;
}