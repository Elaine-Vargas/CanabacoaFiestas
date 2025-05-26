import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, HasMany } from 'sequelize-typescript';
import RolPermiso from './RolPermiso';

@Table({ tableName: 'permiso', timestamps: false })
export default class Permiso extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_permiso' })
  id_permiso!: number;

  @Column({ 
    type: DataType.STRING(50),
    allowNull: false,
    field: 'permiso'
  })
  permiso!: string;

  //Relación 1:N con RolPermiso
  @HasMany(() => RolPermiso, { foreignKey: 'id_permiso' })
  rol_permisos!: RolPermiso[];
}
