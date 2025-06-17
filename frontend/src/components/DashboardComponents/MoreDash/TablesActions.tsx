import React from 'react';
import { Button, Space, Tag } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// Tipos
type EstadoSolicitud = 'Pendiente' | 'Aceptada' | 'Rechazada' | 'Completada' | 'Cancelada';

interface TipoEvento {
  id_tipo_evento: number;
  tipo_evento: string;
}

interface Evento {
  id_evento: number;
  nombre_cliente: string;
  fecha_evento: string;
  hora_evento: string;
  tipo_evento: string | TipoEvento;
  espacio_evento: string;
  desea_supervision: boolean;
  estado_solicitud: EstadoSolicitud;
  total_evento: number;
  nombre_asesor: string | null;
  subtotal_evento: number;
  itbis_evento: number;
  nota_cliente: string;
  creacion_evento: string;
  direccion?: {
    calle: string;
    sector: string;
    ciudad: {
      nombre_ciudad: string;
      provincia: {
        nombre_provincia: string;
      };
    };
  };
  cliente?: Usuario;  
  asesor?: Usuario;   
}

interface Usuario {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
  usuario_login: string;
  correo_usuario: string;
  tel_usuario: string;
  estado_usuario: string;
  id_rol: number;
  rol_nombre: string;
  creacion_usuario: string;
  contrasena_login?: string;
}

interface Proveedor {
  id_proveedor: number;
  tipo_proveedor: string;
  nombre_proveedor: string;
  tel_proveedor: string;
  correo_proveedor: string;
  direccion: {
    calle: string;
    sector: string;
    ciudad: {
      nombre_ciudad: string;
      provincia: {
        nombre_provincia: string;
      };
    };
  };
  estado_proveedor: string;
  creacion_proveedor: string;
}

interface Empleado {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
}

interface AsignacionEmpleado {
  id_evento: number;
  empleado_evento: string;
  puesto_evento: string;
  evento?: {
    id_evento: number;
    fecha_evento: string;
    hora_evento: string;
    cliente?: {
      nombre_usuario: string;
      apellido_usuario: string;
    };
  };
  empleado?: {
    cedula_usuario: string;
    nombre_usuario: string;
    apellido_usuario: string;
  };
  estado_empevento: string;
}

interface Decoracion {
  id_decoracion: number;
  id_evento: number;
  tema_decoracion: string;
  colores_decoracion: string;
  precioneto_decoracion: number;
  itbis_decoracion: number;
  total_decoracion: number;
  estado_decoracion: string;
  detalle_decoracion?: {
    id_detdecoracion: number;
    elemento_decoracion: string;
    cantelemento_decoracion: number;
    precio_elemento: number;
    precio_decoracion: number;
    estado_detdecoracion: string;
  }[];
  evento?: {
    id_evento: number;
    fecha_evento: string;
    tipo_evento: {
      id_tipo_evento: number;
      tipo_evento: string;
    };
    cliente?: {
      nombre_usuario: string;
      apellido_usuario: string;
    };
  };
}

// Interfaces para las funciones de callback
interface TableActionsProps {
  onViewDetails: (record: any) => void;
  onEdit?: (record: any) => void;
  onDelete?: (record: any) => void;
}

// Columnas para la tabla de Eventos
export const getEventoColumns = ({ onViewDetails, onEdit, onDelete }: TableActionsProps): ColumnsType<Evento> => [
  {
    title: 'Cliente',
    dataIndex: ['cliente', 'nombre_usuario'],
    key: 'nombre_cliente',
    width: 'fit-content',
    render: (_: any, record: any) => 
      `${record.cliente?.nombre_usuario || ''} ${record.cliente?.apellido_usuario || ''}`
  },
  {
    title: 'Asesor',
    dataIndex: ['asesor', 'nombre_usuario'],
    key: 'nombre_asesor',
    width: 'fit-content',
    render: (_: any, record: any) => 
      `${record.asesor?.nombre_usuario || ''} ${record.asesor?.apellido_usuario || ''}`
  },
  {
    title: 'Fecha',
    dataIndex: 'fecha_evento',
    key: 'fecha_evento',
    width: 'fit-content',
  },
  {
    title: 'Hora',
    dataIndex: 'hora_evento',
    key: 'hora_evento',
    width: 'fit-content',
  },
  {
    title: 'Tipo',
    dataIndex: 'tipo_evento',
    key: 'tipo_evento',
    width: 'fit-content',
    render: (_: any, record: any) => record.tipo_evento?.tipo_evento || ''
  },
  {
    title: 'Espacio',
    dataIndex: 'espacio_evento',
    key: 'espacio_evento',
    width: 'fit-content',
  },
  {
    title: 'Supervisión',
    dataIndex: 'desea_supervision',
    key: 'desea_supervision',
    width: 'fit-content',
    render: (desea_supervision: boolean) => (
      <Tag color={desea_supervision ? 'green' : 'default'}>
        {desea_supervision ? 'Sí' : 'No'}
      </Tag>
    )
  },
  {
    title: 'Estado Solicitud',
    dataIndex: 'estado_solicitud',
    key: 'estado_solicitud',
    width: 'fit-content',
    render: (estado: EstadoSolicitud) => {
      const colors: Record<EstadoSolicitud, string> = {
        'Pendiente': 'gold',
        'Aceptada': 'green',
        'Rechazada': 'red',
        'Completada': 'blue',
        'Cancelada': 'gray'
      };
      return <Tag color={colors[estado]}>{estado}</Tag>;
    }
  },
  {
    title: 'Total',
    dataIndex: 'total_evento',
    key: 'total_evento',
    width: 'fit-content',
    render: (total: number) => `RD$ ${total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 'fit-content',
    fixed: 'right' as const,
    render: (_: unknown, record: Evento) => (
      <Space>
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          onClick={() => onViewDetails(record)} 
        />
        {onEdit && (
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => onEdit(record)} 
          />
        )}
        {onDelete && (
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => onDelete(record)} 
          />
        )}
      </Space>
    ),
  },
];

// Columnas para la tabla de Usuarios
export const getUsuarioColumns = ({ onViewDetails, onEdit, onDelete }: TableActionsProps): ColumnsType<Usuario> => [
  {
    title: 'Cédula',
    dataIndex: 'cedula_usuario',
    key: 'cedula_usuario',
    width: 'fit-content',
  },
  {
    title: 'Nombre',
    dataIndex: 'nombre_usuario',
    key: 'nombre_usuario',
    width: 'fit-content',
  },
  {
    title: 'Apellido',
    dataIndex: 'apellido_usuario',
    key: 'apellido_usuario',
    width: 'fit-content',
  },
  {
    title: 'Usuario',
    dataIndex: 'usuario_login',
    key: 'usuario_login',
    width: 'fit-content',
  },
  {
    title: 'Correo',
    dataIndex: 'correo_usuario',
    key: 'correo_usuario',
    width: 'fit-content',
  },
  {
    title: 'Teléfono',
    dataIndex: 'tel_usuario',
    key: 'tel_usuario',
    width: 'fit-content',
  },
  {
    title: 'Estado',
    dataIndex: 'estado_usuario',
    key: 'estado_usuario',
    width: 'fit-content',
    render: (estado: string) => {
      const colors: Record<string, string> = {
        'Activo': 'green',
        'Inactivo': 'orange',
        'Eliminado': 'red'
      };
      return <Tag color={colors[estado]}>{estado}</Tag>;
    }
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 'fit-content',
    fixed: 'right' as const,
    render: (_: unknown, record: Usuario) => (
      <Space>
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          onClick={() => onViewDetails(record)} 
        />
        {onEdit && (
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => onEdit(record)} 
          />
        )}
        {onDelete && (
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => onDelete(record)} 
          />
        )}
      </Space>
    ),
  },
];

// Columnas para la tabla de Proveedores
export const getProveedorColumns = ({ onViewDetails, onEdit, onDelete }: TableActionsProps): ColumnsType<Proveedor> => [
  {
    title: 'Nombre',
    dataIndex: 'nombre_proveedor',
    key: 'nombre_proveedor',
    width: 'fit-content',
  },
  {
    title: 'Tipo',
    dataIndex: 'tipo_proveedor',
    key: 'tipo_proveedor',
    width: 'fit-content',
  },
  {
    title: 'Teléfono',
    dataIndex: 'tel_proveedor',
    key: 'tel_proveedor',
    width: 'fit-content',
  },
  {
    title: 'Correo',
    dataIndex: 'correo_proveedor',
    key: 'correo_proveedor',
    width: 'fit-content',
  },
  {
    title: 'Dirección',
    key: 'direccion',
    width: 'fit-content',
    render: (_: unknown, record: any) => (
      <span>
        {(() => {
          if (!record.direccion) {
            return 'No especificada';
          }
          const { calle, sector, ciudad } = record.direccion;
          return (
            <>
              {calle}, {sector}
              <br />
              {ciudad?.nombre_ciudad}, {ciudad?.provincia?.nombre_provincia}
            </>
          );
        })()}
      </span>
    ),
  },
  {
    title: 'Estado',
    dataIndex: 'estado_proveedor',
    key: 'estado_proveedor',
    width: 'fit-content',
    render: (estado: string) => {
      const colors: Record<string, string> = {
        'Activo': 'green',
        'Inactivo': 'orange',
        'Eliminado': 'red'
      };
      return <Tag color={colors[estado]}>{estado}</Tag>;
    }
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 'fit-content',
    fixed: 'right' as const,
    render: (_: unknown, record: Proveedor) => (
      <Space>
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          onClick={() => onViewDetails(record)} 
        />
        {onEdit && (
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => onEdit(record)} 
          />
        )}
        {onDelete && (
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => onDelete(record)} 
          />
        )}
      </Space>
    ),
  },
];

// Columnas para la tabla de Asignaciones
export const getAsignacionColumns = ({ onViewDetails, onEdit, onDelete }: TableActionsProps): ColumnsType<AsignacionEmpleado> => [
  {
    title: 'Evento',
    key: 'evento',
    render: (_: unknown, record: AsignacionEmpleado) => (
      <span>
        {record.evento?.id_evento} - {record.evento?.cliente?.nombre_usuario || ''} {record.evento?.cliente?.apellido_usuario || ''}
      </span>
    ),
  },
  {
    title: 'Empleado',
    key: 'empleado_evento',
    render: (_: unknown, record: AsignacionEmpleado) => (
      <span>
        {record.empleado?.nombre_usuario} {record.empleado?.apellido_usuario}
      </span>
    ),
  },
  {
    title: 'Puesto',
    dataIndex: 'puesto_evento',
    key: 'puesto_evento',
    render: (puesto: string) => (
      <Tag color="blue">{puesto}</Tag>
    )
  },
  {
    title: 'Estado',
    dataIndex: 'estado_empevento',
    key: 'estado_empevento',
    render: (estado: string) => {
      const colors: Record<string, string> = {
        'Activo': 'green',
        'Completado': 'blue',
        'Eliminado': 'red'
      };
      return <Tag color={colors[estado] || 'default'}>{estado}</Tag>;
    }
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 'fit-content',
    fixed: 'right' as const,
    render: (_: unknown, record: AsignacionEmpleado) => (
      <Space>
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          onClick={() => onViewDetails(record)} 
        />
        {onEdit && (
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => onEdit(record)} 
          />
        )}
        {onDelete && (
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => onDelete({ ...record, estado_empevento: 'Eliminado' })} 
          />
        )}
      </Space>
    ),
  },
];

// Columnas para la tabla de Decoraciones
export const getDecoracionColumns = ({ onViewDetails, onEdit, onDelete }: TableActionsProps): ColumnsType<Decoracion> => [
  {
    title: 'Evento',
    key: 'evento',
    width: 'fit-content',
    render: (_: any, record: Decoracion) => (
      <span>
        ID: {record.evento?.id_evento} - Tipo: {record.evento?.tipo_evento?.tipo_evento || 'No especificado'}
      </span>
    )
  },
  {
    title: 'Tema',
    dataIndex: 'tema_decoracion',
    key: 'tema_decoracion',
    width: 'fit-content',
    ellipsis: true
  },
  {
    title: 'Colores',
    dataIndex: 'colores_decoracion',
    key: 'colores_decoracion',
    width: 'fit-content'
  },
  {
    title: 'Total',
    dataIndex: 'total_decoracion',
    key: 'total_decoracion',
    width: 'fit-content',
    render: (total: number) => `RD$ ${total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`
  },
  {
    title: 'Estado',
    dataIndex: 'estado_decoracion',
    key: 'estado_decoracion',
    width: 'fit-content',
    render: (estado: string) => {
      const colors: Record<string, string> = {
        'Solicitado': 'gold',
        'Aceptado': 'blue',
        'Completado': 'green',
        'Cancelado': 'red'
      };
      return <Tag color={colors[estado]}>{estado}</Tag>;
    }
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 'fit-content',
    fixed: 'right' as const,
    render: (_: unknown, record: Decoracion) => (
      <Space>
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          onClick={() => onViewDetails(record)} 
        />
        {onEdit && (
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => onEdit(record)} 
          />
        )}
        {onDelete && (
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => onDelete(record)} 
          />
        )}
      </Space>
    ),
  },
]; 