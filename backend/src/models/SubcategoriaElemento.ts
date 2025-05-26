import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo, HasMany} from 'sequelize-typescript';
import CategoriaElemento from './CategoriaElemento';
import Elemento from './Elemento';

@Table({ tableName: 'subcategoria_elemento', timestamps: false })
export default class SubcategoriaElemento extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_subcategoria' })
  id_subcategoria!: number;

  @ForeignKey(() => CategoriaElemento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_categoria!: number;

  @BelongsTo(() => CategoriaElemento)
  categoria!: CategoriaElemento;

  @Column({ type: DataType.STRING(50), allowNull: false })
  nombre_subcategoria!: string;

  // Relación 1:N con Elemento
  @HasMany(() => Elemento)
  elementos!: Elemento[];
}