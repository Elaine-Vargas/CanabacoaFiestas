import {
  Table,
  Model,
  Column,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany
} from 'sequelize-typescript';
import Provincia from './Provincia_model';
import Direccion from './Direccion_model';

@Table({ tableName: 'ciudad', timestamps: false })
export default class Ciudad extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_ciudad' })
  id_ciudad!: number;

  @ForeignKey(() => Provincia)
  @Column({ type: DataType.INTEGER, field: 'id_provincia', allowNull: false })
  id_provincia!: number;

  @BelongsTo(() => Provincia)
  provincia?: Provincia;

  @Column({ type: DataType.STRING(50), field: 'nombre_ciudad', allowNull: false })
  nombre_ciudad!: string;

  @HasMany(() => Direccion)
  direcciones?: Direccion[];
} 