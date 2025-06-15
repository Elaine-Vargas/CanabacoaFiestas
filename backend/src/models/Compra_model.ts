import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Proveedor from './Proveedor_model';
import DetalleCompra from './DetalleCompra_model';

@Table({ tableName: 'compra', timestamps: false })
export default class Compra extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_compra' })
  id_compra!: number;

  @ForeignKey(() => Proveedor)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_proveedor!: number;

  @BelongsTo(() => Proveedor)
  proveedor!: Proveedor;

  @Column({ 
    type: DataType.DATEONLY,
    defaultValue: DataType.NOW
  })
  fecha_compra!: Date;

  @Column({
    type: DataType.TIME,
    defaultValue: DataType.NOW
  })
  hora_compra!: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  costo_compra!: number;

  @Column({
    type: DataType.ENUM('Completada', 'Cancelada')
  })
  estado_compra!: 'Completada'|'Cancelada';

  @HasMany(() => DetalleCompra)
  detalles!: DetalleCompra[];
}