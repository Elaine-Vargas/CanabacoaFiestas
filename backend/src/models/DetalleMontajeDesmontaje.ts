import {Table, Model, Column, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo} from 'sequelize-typescript';
import MontajedesmontajeServicio from './MontajeDesmontajeServicio';
import Usuario from './Usuario';

@Table({
  tableName: 'detalle_montajedesmontaje',
  timestamps: false,
})
export default class DetalleMontajedesmontaje extends Model<DetalleMontajedesmontaje> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    field: 'id_detalle_montaje',
  })
  id_detalle_montaje!: number;

  @ForeignKey(() => MontajedesmontajeServicio)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_montdes',
  })
  id_montdes!: number;

  @BelongsTo(() => MontajedesmontajeServicio, {
    foreignKey: 'id_montdes',
    as: 'montajedesServicio',
  })
  montajedesServicio!: MontajedesmontajeServicio;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.CHAR(13),
    allowNull: false,
    field: 'cedula_usuariopersonal',
  })
  cedula_usuariopersonal!: string;

  @BelongsTo(() => Usuario, {
    foreignKey: 'cedula_usuariopersonal',
    as: 'usuarioPersonal',
  })
  usuarioPersonal!: Usuario;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'horas_trabajo',
  })
  horas_trabajo!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'precioneto_montaje',
  })
  precioneto_montaje!: number;
}
