import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, HasMany } from 'sequelize-typescript';
import Evento from './Evento_model';

@Table({ tableName: 'tipo_evento', timestamps: false })
export default class TipoEvento extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_tipo_evento' })
  id_tipo_evento!: number;

  @Column({ type: DataType.STRING(50), allowNull: false })
  tipo_evento!: string;

  // Relación 1:N con Evento
  @HasMany(() => Evento)
  eventos!: Evento[];
}