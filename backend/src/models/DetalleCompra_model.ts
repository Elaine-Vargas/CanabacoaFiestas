import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Compra from './Compra_model';
import Elemento from './Elemento_model';

@Table({ tableName: 'detalle_compra', timestamps: false })
export default class DetalleCompra extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_detcompra' })
  id_detcompra!: number;

  @ForeignKey(() => Compra)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_compra!: number;

  @BelongsTo(() => Compra)
  compra!: Compra;

  @ForeignKey(() => Elemento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_elemento!: number;

  @BelongsTo(() => Elemento)
  elemento!: Elemento;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  cantidad_compra!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precio_unitario!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precio_total!: number;

}