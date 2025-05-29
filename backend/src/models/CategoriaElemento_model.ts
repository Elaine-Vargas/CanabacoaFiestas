import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, HasMany } from 'sequelize-typescript';
import SubcategoriaElemento from './SubcategoriaElemento_model';

@Table({ tableName: 'categoria_elemento', timestamps: false })
export default class CategoriaElemento extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_categoria' })
  id_categoria!: number;

  @Column({ type: DataType.STRING(50), allowNull: false })
  nombre_categoria!: string;

  // Relación 1:N con SubcategoriaElemento 
  @HasMany(() => SubcategoriaElemento)
  subcategorias!: SubcategoriaElemento[];
}