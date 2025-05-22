import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, HasMany } from 'sequelize-typescript';
import Ciudad from './Ciudad';

@Table({ tableName: 'provincia', timestamps: false })
export default class Provincia extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_provincia' })
  id_provincia!: number;

  @Column({ 
    type: DataType.STRING(50),
    allowNull: false,
    field: 'nombre_provincia'
  })
  nombre_provincia!: string;

  @HasMany(() => Ciudad)
  ciudades!: Ciudad[];
}