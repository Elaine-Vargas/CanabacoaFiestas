import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType } from 'sequelize-typescript';

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
}