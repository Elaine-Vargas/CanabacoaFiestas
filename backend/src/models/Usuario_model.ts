import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  BeforeCreate,
  BeforeUpdate,
  Index
} from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';
import Rol from './Rol_model';
import Evento from './Evento_model';
import DetalleTransporte from './DetalleTransporte_model';

@Table({
  tableName: 'usuario',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['usuario_login'],
      name: 'usuario_login'
    },
    {
      unique: true,
      fields: ['correo_usuario'],
      name: 'correo_usuario'
    },
    // No necesitas índice único para cedula_usuario porque es PK
  ]
})
export default class Usuario extends Model {
  @Column({
    type: DataType.CHAR(13),
    primaryKey: true,
    field: 'cedula_usuario',
    validate: {
      is: {
        args: [/^[0-9]{3}-[0-9]{7}-[0-9]{1}$/],
        msg: 'La cédula debe tener el formato 000-0000000-0'
      }
    }
  })
  cedula_usuario!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'nombre_usuario',
    validate: {
      notEmpty: {
        msg: 'El nombre no puede estar vacío'
      },
      is: {
        args: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/i,
        msg: 'El nombre solo puede contener letras y espacios'
      }
    }
  })
  nombre_usuario!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'apellido_usuario',
    validate: {
      notEmpty: {
        msg: 'El apellido no puede estar vacío'
      },
      is: {
        args: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/i,
        msg: 'El apellido solo puede contener letras y espacios'
      }
    }
  })
  apellido_usuario!: string;

  @ForeignKey(() => Rol)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'id_rol',
    validate: {
      min: {
        args: [1],
        msg: 'El ID de rol debe ser mayor que 0'
      }
    }
  })
  id_rol!: number;

  @BelongsTo(() => Rol)
  rol!: Rol;

  @Column({
    type: DataType.STRING(25),
    allowNull: false,
    field: 'usuario_login',
    validate: {
      notEmpty: {
        msg: 'El nombre de usuario no puede estar vacío'
      },
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
      notEmpty: {
        msg: 'La contraseña no puede estar vacía'
      }
    }
  })
  contrasena_login!: string;

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(usuario: Usuario) {
    if (usuario.changed('contrasena_login')) {
      const password = usuario.contrasena_login;

      // Validación de longitud
      if (password.length < 8 || password.length > 25) {
        throw new Error('La contraseña debe tener entre 8 y 25 caracteres');
      }

      // Validación de mayúscula
      if (!/[A-Z]/.test(password)) {
        throw new Error('Debe contener al menos una mayúscula');
      }

      // Validación de número
      if (!/[0-9]/.test(password)) {
        throw new Error('Debe contener al menos un número');
      }

      // Validación de carácter especial
      if (!/[!@#$%^&*]/.test(password)) {
        throw new Error('Debe contener al menos un carácter especial (!@#$%^&*)');
      }

      // Si pasa todas las validaciones, hashear la contraseña
      usuario.contrasena_login = await bcrypt.hash(password, 10);
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

  @Index({
    name: 'correo_usuario_idx',
    unique: true
  })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'correo_usuario',
    validate: {
      isEmail: {
        msg: 'Debe proporcionar un correo electrónico válido'
      },
      notEmpty: {
        msg: 'El correo electrónico no puede estar vacío'
      },
      isLowercase: true
    }
  })
  correo_usuario!: string;

  @Column({
    type: DataType.STRING(6),
    allowNull: true,
    field: 'codigo_recuperacion'
  })
  codigo_recuperacion?: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
    field: 'expiracion_codigo'
  })
  expiracion_codigo?: number;

  @Column({
    type: DataType.ENUM('Activo', 'Inactivo', 'Eliminado', 'Pendiente'),
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

  @HasMany(() => DetalleTransporte, {
    foreignKey: 'id_usuarioconductor',
    sourceKey: 'cedula_usuario',
    as: 'transportesConducidos'
  })
  transportesConducidos!: DetalleTransporte[];

}