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
import Ciudad from './Ciudad_model';
import Evento from './Evento_model';
import Proveedor from './Proveedor_model';

@Table({ tableName: 'direccion', timestamps: false })
export default class Direccion extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_direccion' })
  id_direccion!: number;

  @ForeignKey(() => Ciudad)
  @Column({ type: DataType.INTEGER, field: 'id_ciudad', allowNull: false })
  id_ciudad!: number;

  @BelongsTo(() => Ciudad)
  ciudad?: Ciudad;

  @Column({ type: DataType.STRING(50), field: 'sector', allowNull: false })
  sector!: string;

  @Column({ type: DataType.STRING(50), field: 'calle', allowNull: false })
  calle?: string;

  @Column({ type: DataType.STRING(200), field: 'detalles', allowNull: true })
  detalles!: string;


  @HasMany(() => Evento)
  eventos?: Evento[];

  
  @HasMany(() => Proveedor)
  proveedores?: Proveedor[];
}