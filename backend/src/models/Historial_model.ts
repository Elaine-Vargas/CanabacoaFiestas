import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType } from 'sequelize-typescript';

@Table({ tableName: 'historial', timestamps: false })
export default class Historial extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_historial' })
  id_historial!: number;

  @Column({ type: DataType.STRING(50), allowNull: false })
  tabla_afectada!: string;

  @Column({
    type: DataType.ENUM('INSERT', 'UPDATE', 'DELETE'),
    allowNull: false
  })
  tipo_accion!: string;

  @Column({ type: DataType.STRING(50) })
  id_registro!: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  usuario!: string;

  @Column({ 
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  fecha_accion!: Date;

  @Column({ type: DataType.TEXT })
  descripcion!: string;
}