import { Table, Model, Column, DataType, PrimaryKey, AutoIncrement, HasMany } from 'sequelize-typescript';
import Usuario from './Usuario_model';

@Table({
  tableName: 'rol',
  timestamps: false
})
export default class Rol extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    field: 'id_rol'
  })
  id_rol!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'nombre_rol'
  })
  nombre_rol!: string;

  // Relación con usuario 1:N
  @HasMany(() => Usuario, { foreignKey: 'id_rol' })
  usuario!: Usuario[];
}

