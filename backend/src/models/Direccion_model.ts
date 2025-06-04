import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Provincia from './Provincia_model';
import Espacio from './Espacio_model';
import Proveedor from './Proveedor_model';
import TransporteServicio from './TransporteServicio_model';

@Table({ tableName: 'direccion', timestamps: false })
export default class Direccion extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_direccion' })
  id_direccion!: number;

  @ForeignKey(() => Provincia)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'id_provincia' })
  id_provincia!: number;

  @BelongsTo(() => Provincia)
  provincia!: Provincia;

  @Column({ type: DataType.STRING(50), allowNull: false })
  sector!: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  calle!: string;

  @Column({ type: DataType.TEXT })
  detalles!: string;

  // Relación 1:N con Espacio
  @HasMany(() => Espacio)
  espacios!: Espacio[]; 

  @HasMany(() => Proveedor)
  proveedores!: Proveedor[]; 

  @HasMany(() => TransporteServicio)
  transportesServicio!: TransporteServicio[]; 
}