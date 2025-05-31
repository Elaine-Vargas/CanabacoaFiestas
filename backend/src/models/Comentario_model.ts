import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Evento from './Evento_model';

@Table({ tableName: 'comentario', timestamps: false })
export default class Comentario extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_comentario' })
  id_comentario!: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  comentario!: string;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_evento!: number;

  @BelongsTo(() => Evento)
  evento!: Evento;

  @Column({
    type: DataType.ENUM('Activo', 'Editado', 'Eliminado'),
    allowNull: true,
    defaultValue: 'Activo'
  })
  estado_comentario!: string;
}