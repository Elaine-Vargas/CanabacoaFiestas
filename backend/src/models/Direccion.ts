import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Sector from './Sector';
import Espacio from './Espacio';
import Proveedor from './Proveedor';
import TransporteServicio from './TransporteServicio';

@Table({ tableName: 'direccion', timestamps: false })
export default class Direccion extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_direccion' })
  id_direccion!: number;

  @ForeignKey(() => Sector)
  @Column({ type: DataType.INTEGER, field: 'id_sector' })
  id_sector!: number;

  @BelongsTo(() => Sector)
  sector!: Sector;

  @Column({ type: DataType.STRING(50) })
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