import { Table, Model, Column, DataType, ForeignKey, PrimaryKey, BelongsTo, HasMany, DefaultScope } from 'sequelize-typescript';

import Rol from './Rol';

@Table({
  tableName: 'usuario',
  timestamps: false,
  validate: {
  validarFormatoLogin(this: Usuario) {
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(this.usuario_login)) {
      throw new Error('Formato de usuario inválido');
    }
  }
}
})
export default class Usuario extends Model {
  @PrimaryKey
  @Column({
    type: DataType.CHAR(13),
    field: 'cedula_usuario'
  })
  cedula_usuario!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'nombre_usuario'
  })
  nombre_usuario!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'apellido_usuario'
  })
  apellido_usuario!: string;

  @ForeignKey(() => Rol)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_rol'
  })
  id_rol!: number;

  @BelongsTo(() => Rol)
  rol!: Rol;

  @Column({
    type: DataType.STRING(25),
    allowNull: false,
    unique: true,
    field: 'usuario_login',
    validate: {
      is: /^[a-zA-Z][a-zA-Z0-9_]*$/
    }
  })
  usuario_login!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'contrasena_login'
  })
  contrasena_login!: string;

  @Column({
    type: DataType.CHAR(12),
    allowNull: false,
    field: 'tel_usuario'
  })
  tel_usuario!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'correo_usuario',
    validate: {
      isEmail: true
    }
  })
  correo_usuario!: string;

  @Column({
    type: DataType.ENUM('Activo', 'Inactivo', 'Eliminado'),
    allowNull: false,
    defaultValue: 'Activo',
    field: 'estado_usuario'
  })
  estado_usuario!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'creacion_usuario'
  })
  creacion_usuario!: Date;

  // Relaciones
  // @HasMany(() => Evento)
  // eventos!: Evento[];

  // Otras relaciones (DetalleTransporte, Comentario, etc.)...
}

