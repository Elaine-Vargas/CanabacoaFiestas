import { Table, Model, DataType, Column, PrimaryKey, ForeignKey } from 'sequelize-typescript';
import Rol from './Rol';
import Permiso from './Permiso';

@Table({ tableName: 'rol_permiso', timestamps: false })
export default class RolPermiso extends Model {
  @PrimaryKey
  @ForeignKey(() => Rol)
  @Column({ type: DataType.INTEGER, field: 'id_rol' })
  id_rol!: number;

  @PrimaryKey
  @ForeignKey(() => Permiso)
  @Column({ type: DataType.INTEGER, field: 'id_permiso' })
  id_permiso!: number;
}