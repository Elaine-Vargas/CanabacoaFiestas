import { Table, Model, DataType, Column, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Rol from './Rol_model';
import Permiso from './Permiso_model';

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

  //Relaciones
  @BelongsTo(() => Rol)
  rol!: Rol;

  @BelongsTo(() => Permiso)
  permiso!: Permiso;
}
