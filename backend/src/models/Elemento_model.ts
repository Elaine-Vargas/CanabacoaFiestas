import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import SubcategoriaElemento from './SubcategoriaElemento_model';
import MaterialElemento from './MaterialElemento_model';
import ColorElemento from './ColorElemento_model';
import DetalleCompra from './DetalleCompra_model';

@Table({ tableName: 'elemento', timestamps: false })
export default class Elemento extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_elemento' })
  id_elemento!: number;

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

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  cantidad_total!: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  cantidad_disponible!: number;

  @Column({
    type: DataType.ENUM('Activo', 'Inactivo', 'Eliminado'),
    defaultValue: 'Activo'
  })
  estado_elemento!: string;

  //Relación 1:N con Compra
  @HasMany(() => DetalleCompra)
  detallecompras!: DetalleCompra[];
}