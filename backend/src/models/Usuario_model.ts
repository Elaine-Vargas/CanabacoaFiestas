import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import Rol from './Rol_model';
import Evento from './Evento_model';
import * as bcrypt from 'bcryptjs';
import DetalleTransporte from './DetalleTransporte_model';
import DetalleMontajedesmontaje from './DetalleMontajeDesmontaje_model';
import DetalleSupervision from './DetalleSupervision_model';
import Comentario from './Comentario_model';

@Table({
  tableName: 'usuario',
  timestamps: false,
  validate: {
    validarFormatoLogin(this: Usuario) {
      if (!/^[a-zA-Z][a-zA-Z0-9_.]*$/.test(this.usuario_login)) {
        throw new Error('Formato de usuario inválido');
      }
    }
  }
})
export default class Usuario extends Model {
  @Column({
    type: DataType.CHAR(13),
    primaryKey: true,
    field: 'cedula_usuario',
      validate: {
        is: {
          args: [/^[0-9]{3}-[0-9]{7}-[0-9]{1}$/],
          msg: 'El teléfono debe tener el formato 000-0000000-0'
        }
    }
  })
  cedula_usuario!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'nombre_usuario',
    validate: {
      notEmpty: true,
      is: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/i
    }
  })
  nombre_usuario!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'apellido_usuario',
    validate: {
      notEmpty: true,
      is: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/i
    }
  })
  apellido_usuario!: string;


  @ForeignKey(() => Rol)
  @Column({ 
    type: DataType.INTEGER, 
    allowNull: false, 
    field: 'id_rol',
    validate: {
      min: 1
    } 
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
      is: {
        args: /^(?=.{5,25}$)^[a-zA-Z]([a-zA-Z0-9_.]*[a-zA-Z0-9])?$/,
        msg: 'Formato de usuario inválido: debe comenzar con una letra y tener entre 5-25 caracteres'
      }
    }
  })
  usuario_login!: string;

  @Column({
    type: DataType.STRING(60),
    allowNull: false,
    field: 'contrasena_login',
    validate: {
      is: {
        args: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*.?_-])[a-zA-Z0-9!@#$%^&*.?_-]{8,25}$/,
        msg: 'La contraseña debe tener entre 8-25 caracteres, al menos una mayúscula, un número y un carácter especial'
      }
    }
  })
  contrasena_login!: string;

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(usuario: Usuario) {
    if (usuario.changed('contrasena_login')) {
      usuario.contrasena_login = await bcrypt.hash(usuario.contrasena_login, 10);
    }
  }

  async compararContrasena(contrasena: string): Promise<boolean> {
    return bcrypt.compare(contrasena, this.contrasena_login);
  }
  
  @Column({
    type: DataType.STRING(12),
    allowNull: false,
    field: 'tel_usuario',
    validate: {
      is: {
        args: [/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/],
        msg: 'El teléfono debe tener el formato 000-000-0000'
      }
    }
  })
  tel_usuario!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'correo_usuario',
    validate: {
      isEmail: true,
      notEmpty: true,
      isLowercase: true
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

  /** Relaciones con Evento **/
  @HasMany(() => Evento, {
    foreignKey: 'cedula_cliente',
    sourceKey: 'cedula_usuario',
    as: 'eventosCliente'
  })
  eventosCliente!: Evento[];

  @HasMany(() => Evento, {
    foreignKey: 'cedula_asesor',
    sourceKey: 'cedula_usuario',
    as: 'eventosAsesor'
  })
  eventosAsesor!: Evento[];

  /** Relación con DetalleTransporte **/
  @HasMany(() => DetalleTransporte, {
    foreignKey: 'id_usuarioconductor',
    sourceKey: 'cedula_usuario',
    as: 'transportesConducidos'
  })
  transportesConducidos!: DetalleTransporte[];

  /** Relación con DetalleMontajedesmontaje **/
  @HasMany(() => DetalleMontajedesmontaje, {
    foreignKey: 'cedula_usuariopersonal',
    sourceKey: 'cedula_usuario',
    as: 'montajesRealizados'
  })
  montajesRealizados!: DetalleMontajedesmontaje[];

  /** Relación con DetalleSupervision **/
  @HasMany(() => DetalleSupervision, {
    foreignKey: 'cedula_usuariopersonal',
    sourceKey: 'cedula_usuario',
    as: 'supervisionesRealizadas'
  })
  supervisionesRealizadas!: DetalleSupervision[];

}