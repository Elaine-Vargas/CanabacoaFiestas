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
  tipo_vehiculo!: string;

  @Column({
    type: DataType.ENUM('Activo', 'Inactivo', 'Eliminado'),
    defaultValue: 'Activo'
  })
  estado_vehiculo!: string;

  @HasMany(() => DetalleTransporte)
  detallestransportes!: DetalleTransporte[];
}