import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, HasMany } from 'sequelize-typescript';
import Proveedor from './Proveedor_model';

@Table({ tableName: 'tipo_proveedor', timestamps: false })
export default class TipoProveedor extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_tipo_proveedor' })
  id_tipo_proveedor!: number;

  @Column({ type: DataType.STRING(50), allowNull: false })
  nombre_tipo!: string;

  // Relación 1:N con Proveedor  
  @HasMany(() => Proveedor)
  proveedores!: Proveedor[];
}