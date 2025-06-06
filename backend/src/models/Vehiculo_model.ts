import { Table, Model, Column, PrimaryKey, DataType, HasMany } from 'sequelize-typescript';
import DetalleTransporte from './DetalleTransporte_model';

@Table({ tableName: 'vehiculo', timestamps: false })
export default class Vehiculo extends Model {
  @PrimaryKey
  @Column({ type: DataType.CHAR(7) })
  matricula_vehiculo!: string;

  @Column({ type: DataType.STRING(25), allowNull: false })
  marca_vehiculo!: string;

  @Column({ type: DataType.STRING(25), allowNull: false })
  modelo_vehiculo!: string;

  @Column({
    type: DataType.ENUM('Automóvil', 'Remolque', 'Máquinas pesadas', 'Montacargas'),
    allowNull: false
  })
  tipo_vehiculo!: 'Automóvil'| 'Remolque' | 'Máquinas pesadas' | 'Montacargas';


  @Column({ type: DataType.DECIMAL(10,2), allowNull: false })
  capacidad_vehiculo_lb!: number;


  @Column({
    type: DataType.ENUM('Activo', 'Inactivo', 'Eliminado'),
    defaultValue: 'Activo'
  })
  estado_vehiculo!: 'Activo' | 'Inactivo' | 'Eliminado';

  @HasMany(() => DetalleTransporte)
  detallestransportes!: DetalleTransporte[];
}