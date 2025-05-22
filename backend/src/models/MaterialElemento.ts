import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType } from 'sequelize-typescript';

@Table({ tableName: 'material_elemento', timestamps: false })
export default class MaterialElemento extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_material' })
  id_material!: number;

  @Column({ type: DataType.STRING(50), allowNull: false })
  nombre_material!: string;
}