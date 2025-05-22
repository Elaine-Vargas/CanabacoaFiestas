import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Ciudad from './Ciudad';
import Direccion from './Direccion';

@Table({ tableName: 'sector', timestamps: false })
export default class Sector extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_sector' })
  id_sector!: number;

  @Column({ 
    type: DataType.STRING(50),
    allowNull: false,
    field: 'nombre_sector'
  })
  nombre_sector!: string;

  @ForeignKey(() => Ciudad)
  @Column({ type: DataType.INTEGER, field: 'id_ciudad' })
  id_ciudad!: number;

  @BelongsTo(() => Ciudad)
  ciudad!: Ciudad;

  @HasMany(() => Direccion)
  direcciones!: Direccion[];
}