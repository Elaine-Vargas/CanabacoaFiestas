import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Provincia from './Provincia';
import Sector from './Sector';

@Table({ tableName: 'ciudad', timestamps: false })
export default class Ciudad extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_ciudad' })
  id_ciudad!: number;

  @Column({ 
    type: DataType.STRING(50),
    allowNull: false,
    field: 'nombre_ciudad'
  })
  nombre_ciudad!: string;

  @ForeignKey(() => Provincia)
  @Column({ type: DataType.INTEGER, field: 'id_provincia' })
  id_provincia!: number;

  @BelongsTo(() => Provincia)
  provincia!: Provincia;

  @HasMany(() => Sector)
  sectores!: Sector[];
}