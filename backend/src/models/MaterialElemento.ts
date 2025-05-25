import { Table, Model, Column, PrimaryKey, AutoIncrement, DataType, HasMany} from 'sequelize-typescript';
import Elemento from './Elemento';

@Table({ tableName: 'material_elemento', timestamps: false })
export default class MaterialElemento extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id_material' })
  id_material!: number;

  @Column({ type: DataType.STRING(50), allowNull: false })
  nombre_material!: string;
    // Relación 1:N con Elemento
    @HasMany(() => Elemento)
    elementos!: Elemento[];
}