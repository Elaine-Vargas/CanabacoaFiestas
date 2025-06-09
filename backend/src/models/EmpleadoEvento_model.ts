import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Evento from './Evento_model';
import Usuario from './Usuario_model';

@Table({ tableName: 'empleado_evento', timestamps: false })
export default class EmpleadoEvento extends Model {
 
  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, field: 'id_evento', allowNull: false })
  id_evento!: number;

  @BelongsTo(() => Evento)
  evento?: Evento;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.CHAR(13), field: 'empleado_evento', allowNull: false })
  empleado_evento!: string;

  @BelongsTo(() => Usuario, { 
    foreignKey: 'empleado_evento',
    targetKey: 'cedula_usuario',
    as: 'empleado'
  })
  empleado?: Usuario;

  @Column({
    type: DataType.ENUM('Decorador', 'Camarero', 'Conductor', 'Supervisor', 'Encargado de Logística', 'Encargado de Limpieza'),
    field: 'puesto_evento',
    allowNull: false
  })
  puesto_evento!: 'Decorador' | 'Camarero' | 'Conductor' | 'Supervisor' | 'Encargado de Logística' | 'Encargado de Limpieza';
} 