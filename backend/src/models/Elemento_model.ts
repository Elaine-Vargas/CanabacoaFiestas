import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import SubcategoriaElemento from './SubcategoriaElemento_model';
import ColorElemento from './ColorElemento_model';
import MaterialElemento from './MaterialElemento_model';
import DetalleCompra from './DetalleCompra_model';
import DetalleAlquiler from './DetalleAlquiler_model';

@Table({ tableName: 'elemento', timestamps: false })
export default class Elemento extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_elemento' })
  id_elemento!: number;

  @Column({ type: DataType.STRING(50), allowNull: false })
  nombre_elemento!: string;

  @ForeignKey(() => SubcategoriaElemento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_subcategoria!: number;

  @BelongsTo(() => SubcategoriaElemento)
  subcategoria!: SubcategoriaElemento;

  @ForeignKey(() => MaterialElemento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_material!: number;

  @BelongsTo(() => MaterialElemento)
  material!: MaterialElemento;

  @ForeignKey(() => ColorElemento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_color!: number;

  @BelongsTo(() => ColorElemento)
  color!: ColorElemento;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precio_elemento!: number;

  @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 0 })
  cantidad_total!: number;

  @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 0 })
  cantidad_disponible!: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  imagen_url!: string;

  @Column({
    type: DataType.ENUM('Activo', 'Inactivo', 'Eliminado'),
    allowNull: true,
    defaultValue: 'Activo'
  })
  estado_elemento!: 'Activo' | 'Inactivo' | 'Eliminado';

  @HasMany(() => DetalleCompra)
  detallecompras!: DetalleCompra[];
  
  @HasMany(() => DetalleAlquiler)
  detallealquileres!: DetalleAlquiler[];
}