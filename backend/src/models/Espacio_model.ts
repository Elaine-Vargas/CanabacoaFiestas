import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Direccion from './Direccion_model';
import Evento from './Evento_model';

@Table({ tableName: 'espacio', timestamps: false })
export default class Espacio extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_espacio' })
  id_espacio!: number;

  @Column({ type: DataType.STRING(50), allowNull: false })
  nombre_espacio!: string;

  @Column({ type: DataType.CHAR(12), allowNull: false })
  tel_espacio!: string;

  @ForeignKey(() => Direccion)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_direccion!: number;

  @BelongsTo(() => Direccion)
  direccion!: Direccion;

  @Column({
    type: DataType.ENUM('Activo', 'Inactivo', 'Eliminado'),
    defaultValue: 'Activo'
  })
  estado_espacio!: string;

  // Relación 1:N con Evento
  @HasMany(() => Evento)
  eventos!: Evento[];
}