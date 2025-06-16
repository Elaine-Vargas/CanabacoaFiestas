import React, { useState, useEffect } from 'react';
import '../../../styles/dashboard/ServicesSubpages.scss';
import { Card, Button, Table, Tag, Space, Typography, Input, Select, Modal, Descriptions, message, Rate, Form, InputNumber, List, Dropdown, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FilterOutlined } from '@ant-design/icons';
import type { ColumnGroupType, ColumnType } from 'antd/es/table';
import EventoForm from '../FormService/EventoForm';
import UsuarioForm from '../FormService/UsuarioForm';
import ProveedorForm from '../FormService/ProveedorForm';
import AsignacionEmpleadoForm from '../FormService/AsignacionEmpleadoForm';
import DecoracionForm from '../FormService/DecoracionForm';
import PagoForm from '../FormService/PagoForm';
import TableFilters from '../MoreDash/TableFilters';
import { 
  getEventoColumns, 
  getUsuarioColumns, 
  getProveedorColumns, 
  getDecoracionColumns 
} from '../MoreDash/TablesActions';
import { 
  updateEventoEstado, 
  updateUsuarioEstado, 
  updateProveedorEstado, 
  updateDecoracionEstado 
} from '../MoreDash/TableUpdateActions';
import dayjs from 'dayjs';
import { apiUrl } from '../../../config';
import axios from 'axios';

// Definición de tipos
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
  tipo_evento: {
    id_tipo_evento: number;
    tipo_evento: string;
  };
  espacio_evento: string;
  desea_supervision: boolean;
  estado_solicitud: EstadoSolicitud;
  total_evento: number;
  nombre_asesor: string | null;
  subtotal_evento: number;
  itbis_evento: number;
  nota_cliente: string;
  creacion_evento: string;
  id_direccion: number;
  id_tipo_evento: number;
  direccion: {
    id_direccion: number;
    calle: string;
    sector: string;
    ciudad: {
      id_ciudad: number;
      nombre_ciudad: string;
      provincia: {
        id_provincia: number;
        nombre_provincia: string;
      };
    };
  };
  cliente: Usuario;
  asesor: Usuario;
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
  codigo_recuperacion?: string | null;
  expiracion_codigo?: string | null;
}

interface Proveedor {
  id_proveedor: number;
  tipo_proveedor: string;
  nombre_proveedor: string;
  tel_proveedor: string;
  correo_proveedor: string;
  id_direccion: number;
  direccion: {
    id_direccion: number;
    calle: string;
    sector: string;
    detalles?: string;
    ciudad: {
      id_ciudad: number;
      nombre_ciudad: string;
      provincia: {
        id_provincia: number;
        nombre_provincia: string;
      };
    };
  };
  estado_proveedor: 'Activo' | 'Eliminado' | 'Inactivo';
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
  estado_empevento: string;
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

interface Provincia {
  id_provincia: number;
  nombre_provincia: string;
}

interface Ciudad {
  id_ciudad: number;
  nombre_ciudad: string;
  id_provincia: number;
}

interface Pago {
  id_pago: number;
  id_evento: number;
  monto: number;
  fecha_pago: string;
  hora_pago: string;
  tipo_pago: 'Inicial' | 'Final' | 'Adicional';
  estado_pago: 'Pendiente' | 'Recibido' | 'Rechazado';
  modo_pago: 'Efectivo' | 'Transferencia';
  evento?: {
    id_evento: number;
    cliente?: {
      nombre_usuario: string;
      apellido_usuario: string;
    };
  };
}

interface Comentario {
  id_comentario: number;
  id_evento: number;
  comentario: string;
  calificacion: number;
  estado_comentario: 'Activo' | 'Editado' | 'Eliminado';
  fecha_creacion: string;
  evento?: {
    id_evento: number;
    cliente?: {
      nombre_usuario: string;
      apellido_usuario: string;
    };
  };
}

interface ProveedorFormValues extends Omit<Proveedor, 'direccion'> {
  id_provincia?: number;
  id_ciudad?: number;
  sector?: string;
  calle?: string;
  detalles?: string;
}

interface ProveedorFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: ProveedorFormValues) => Promise<void>;
  loading: boolean;
  initialValues?: ProveedorFormValues;
  provincias: Provincia[];
  ciudades: Ciudad[];
}

interface AsignacionEmpleadoFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: AsignacionEmpleado) => Promise<void>;
  loading: boolean;
  initialValues?: AsignacionEmpleado;
}

interface DecoracionFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading: boolean;
  initialValues?: any;
  eventosCliente: Evento[];
  userCedula: string;
}

const { Title } = Typography;

const WelcomeAdmin: React.FC = () => {
  const [formDecoracion] = Form.useForm();
  const [formElementosDecoracion] = Form.useForm();
  const [formEditarAsignacion] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionEmpleado[]>([]);
  const [selectedEventoForDetails, setSelectedEventoForDetails] = useState<Evento | null>(null);
  const [showEventoDetailsInTable, setShowEventoDetailsInTable] = useState(false);
  const [decoraciones, setDecoraciones] = useState<Decoracion[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState('');
  
  // Estados para los modales
  const [modalEventoVisible, setModalEventoVisible] = useState(false);
  const [modalUsuarioVisible, setModalUsuarioVisible] = useState(false);
  const [modalProveedorVisible, setModalProveedorVisible] = useState(false);
  const [modalAsignacionVisible, setModalAsignacionVisible] = useState(false);
  const [modalDecoracionVisible, setModalDecoracionVisible] = useState(false);
  const [modalPagoVisible, setModalPagoVisible] = useState(false);

  // Estados para los modales de detalles
  const [modalDetallesEventoVisible, setModalDetallesEventoVisible] = useState(false);
  const [modalDetallesUsuarioVisible, setModalDetallesUsuarioVisible] = useState(false);
  const [modalDetallesProveedorVisible, setModalDetallesProveedorVisible] = useState(false);
  const [modalDetallesDecoracionVisible, setModalDetallesDecoracionVisible] = useState(false);
  const [modalDetallesAsignacionVisible, setModalDetallesAsignacionVisible] = useState(false);

  // Estados para los datos seleccionados
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [decoracionSeleccionada, setDecoracionSeleccionada] = useState<any>(null);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState<AsignacionEmpleado | null>(null);

  // Estados para los filtros de búsqueda individuales
  const [searchTextEventos, setSearchTextEventos] = useState('');
  const [searchTextUsuarios, setSearchTextUsuarios] = useState('');
  const [searchTextProveedores, setSearchTextProveedores] = useState('');
  const [searchTextAsignaciones, setSearchTextAsignaciones] = useState('');
  const [searchTextDecoraciones, setSearchTextDecoraciones] = useState('');

  // Estados para los filtros
  const [selectedEstadoEventos, setSelectedEstadoEventos] = useState('todos');
  const [selectedEstadoUsuarios, setSelectedEstadoUsuarios] = useState('todos');
  const [selectedEstadoProveedores, setSelectedEstadoProveedores] = useState('todos');
  const [selectedEstadoDecoraciones, setSelectedEstadoDecoraciones] = useState('todos');
  const [selectedRol, setSelectedRol] = useState('');
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedAsesor, setSelectedAsesor] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedEvento, setSelectedEvento] = useState('');
  const [selectedCargo, setSelectedCargo] = useState('');

  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [asesores, setAsesores] = useState<Usuario[]>([]);
  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);

  // Estados de carga
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingAsesores, setLoadingAsesores] = useState(false);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingCiudades, setLoadingCiudades] = useState(false);

  // Estados para los formularios de edición
  const [showEventoForm, setShowEventoForm] = useState(false);
  const [showUsuarioForm, setShowUsuarioForm] = useState(false);
  const [showProveedorForm, setShowProveedorForm] = useState(false);
  const [showAsignacionEmpleadoForm, setShowAsignacionEmpleadoForm] = useState(false);
  const [showDecoracionForm, setShowDecoracionForm] = useState(false);

  const [pagos, setPagos] = useState<Pago[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [filtrosPagos, setFiltrosPagos] = useState({
    estado: '',
    evento: '',
    metodo: '',
    tipo: ''
  });
  const [filtrosComentarios, setFiltrosComentarios] = useState({
    estado: '',
    calificacion: ''
  });

  const [showPagosFilters, setShowPagosFilters] = useState(false);
  const [showComentariosFilters, setShowComentariosFilters] = useState(false);

  const [modalEditarAsignacionVisible, setModalEditarAsignacionVisible] = useState(false);

  // Estados para el manejo de elementos de decoración
  const [modalElementosDecoracionVisible, setModalElementosDecoracionVisible] = useState(false);

  const [loadingPago, setLoadingPago] = useState(false);

  const [user, setUser] = useState<Usuario | null>(null);

  const [modalSeleccionEventoVisible, setModalSeleccionEventoVisible] = useState(false);
  const [eventoSeleccionadoParaElementos, setEventoSeleccionadoParaElementos] = useState<Evento | null>(null);

  const [pagoSeleccionado, setPagoSeleccionado] = useState<Pago | null>(null);
  const [modalDetallesPagoVisible, setModalDetallesPagoVisible] = useState(false);
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState<Comentario | null>(null);
  const [modalDetallesComentarioVisible, setModalDetallesComentarioVisible] = useState(false);

  const [filtroComentarioEstado, setFiltroComentarioEstado] = useState<string>('');
  const [filtroComentarioCalificacion, setFiltroComentarioCalificacion] = useState<number | null>(null);
  const [filtroComentarioCliente, setFiltroComentarioCliente] = useState<string>('');
  const [busquedaComentario, setBusquedaComentario] = useState<string>('');

  // Estados para filtros de Asignación
  const [filtroAsignacionEstado, setFiltroAsignacionEstado] = useState<string>('');
  const [filtroAsignacionCargo, setFiltroAsignacionCargo] = useState<string>('');
  const [filtroAsignacionEvento, setFiltroAsignacionEvento] = useState<string>('');
  const [filtroAsignacionEmpleado, setFiltroAsignacionEmpleado] = useState<string>('');
  const [busquedaAsignacion, setBusquedaAsignacion] = useState<string>('');

  // Estados para filtros de Decoraciones
  const [filtroDecoracionEstado, setFiltroDecoracionEstado] = useState<string>('');
  const [busquedaDecoracion, setBusquedaDecoracion] = useState<string>('');

  // Estados para filtros de Pagos
  const [filtroPagoEstado, setFiltroPagoEstado] = useState<string>('');
  const [filtroPagoTipo, setFiltroPagoTipo] = useState<string>('');
  const [filtroPagoMetodo, setFiltroPagoMetodo] = useState<string>('');
  const [busquedaPago, setBusquedaPago] = useState<string>('');

  const handleSubmitDecoracion = async (values: any) => {
    try {
      setLoading(true);
      const url = decoracionSeleccionada 
        ? `http://localhost:3001/api/decoraciones/${decoracionSeleccionada.id_decoracion}`
        : 'http://localhost:3001/api/decoraciones';
      
      const method = decoracionSeleccionada ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la decoración');
      }

      message.success(decoracionSeleccionada ? 'Decoración actualizada exitosamente' : 'Decoración creada exitosamente');
      setModalDecoracionVisible(false);
      formDecoracion.resetFields();
      setDecoracionSeleccionada(null);
      fetchDecoraciones();
    } catch (error) {
      console.error('Error:', error);
      message.error('Error al guardar la decoración');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDecoracion = (record: any) => {
    setDecoracionSeleccionada(record);
    formDecoracion.setFieldsValue({
      tema_decoracion: record.tema_decoracion,
      descripcion_decoracion: record.descripcion_decoracion,
      precio_decoracion: record.precio_decoracion
    });
    setModalDecoracionVisible(true);
  };

  const handleDeleteDecoracion = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/decoraciones/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la decoración');
      }

      message.success('Decoración eliminada exitosamente');
      fetchDecoraciones();
    } catch (error) {
      console.error('Error:', error);
      message.error('Error al eliminar la decoración');
    } finally {
      setLoading(false);
    }
  };

  const fetchDecoraciones = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/decoraciones');
      if (!response.ok) {
        throw new Error('Error al cargar las decoraciones');
      }
      const data = await response.json();
      setDecoraciones(data);
    } catch (error) {
      console.error('Error:', error);
      message.error('Error al cargar las decoraciones');
    } finally {
      setLoading(false);
    }
  };

  const handleEmpleadoChange = (value: string) => {
    setSelectedEmpleado(value);
  };

  const fetchClientesYAsesores = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Clientes (rol 2)
      setLoadingClientes(true);
      const resClientes = await fetch(`${apiUrl}/usuario?rol=2`, { headers });
      if (resClientes.ok) {
        const data = await resClientes.json();
        setClientes(data.usuarios);
      }

      // Asesores (rol 3)
      setLoadingAsesores(true);
      const resAsesores = await fetch(`${apiUrl}/usuario?rol=3`, { headers });
      if (resAsesores.ok) {
        const data = await resAsesores.json();
        setAsesores(data.usuarios);
      }
    } catch (error) {
      console.error("Error al cargar clientes o asesores", error);
    } finally {
      setLoadingClientes(false);
      setLoadingAsesores(false);
    }
  };
  
  useEffect(() => {
    fetchClientesYAsesores();
  }, []);
  

  // Función para cargar los datos
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Cargar eventos con dirección y detalles
      const eventosResponse = await fetch(`${apiUrl}/evento?include=direccion.ciudad.provincia,cliente,asesor,tipo_evento`, {
        method: 'GET',
        headers
      });
      
      if (!eventosResponse.ok) {
        throw new Error('Error al cargar eventos');
      }
      
      const eventosData = await eventosResponse.json();
      console.log('Datos de eventos:', eventosData);
      setEventos(eventosData);

      // Cargar usuarios
      const usuariosResponse = await fetch(`${apiUrl}/usuario?include=rol`, {
        method: 'GET',
        headers
      });
      
      if (!usuariosResponse.ok) {
        throw new Error('Error al cargar usuarios');
      }
      
      const usuariosData = await usuariosResponse.json();
      console.log('Datos de usuarios recibidos del backend:', usuariosData);
      console.log('Primer usuario de ejemplo:', usuariosData.usuarios?.[0]);
      setUsuarios(usuariosData.usuarios || []);

      // Cargar proveedores con dirección
      const proveedoresResponse = await fetch(`${apiUrl}/proveedor?include=direccion.ciudad.provincia`, {
        headers
      });
      
      if (!proveedoresResponse.ok) {
        throw new Error('Error al cargar proveedores');
      }
      
      const proveedoresData = await proveedoresResponse.json();
      console.log('Datos de proveedores recibidos:', proveedoresData);
      setProveedores(proveedoresData);

      // Cargar asignaciones con detalles del evento y cliente
      const asignacionesResponse = await fetch(`${apiUrl}/evento/asignar-empleados?include=evento.cliente,empleado`, { 
        headers 
      });
      
      if (!asignacionesResponse.ok) {
        throw new Error('Error al cargar asignaciones');
      }
      
      const asignacionesData = await asignacionesResponse.json();
      console.log('Datos de asignaciones:', asignacionesData);
      setAsignaciones(asignacionesData);

      // Cargar decoraciones with detalles
      const decoracionesResponse = await fetch(`${apiUrl}/decoracion?include=evento.cliente,evento.tipo_evento,detalle_decoracion`, {
        headers
      });

      if (!decoracionesResponse.ok) {
        const errorText = await decoracionesResponse.text();
        let errorMessage = 'Error al cargar decoraciones';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.mensaje || errorJson.error || errorMessage;
        } catch (parseError) {
          console.warn('No se pudo parsear el error de decoraciones como JSON:', errorText);
        }
        console.error('Error al cargar decoraciones:', errorText);
        throw new Error(errorMessage);
      }

      const decoracionesData = await decoracionesResponse.json();
      console.log('Datos de decoraciones recibidos:', decoracionesData);

      // Asegurarse de que decoracionesData sea un array
      if (!Array.isArray(decoracionesData)) {
        console.error('Los datos de decoraciones no son un array:', decoracionesData);
        setDecoraciones([]);
      } else {
        setDecoraciones(decoracionesData);
      }

    } catch (error) {
      console.error('Error al cargar los datos:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchTiposEvento = async () => {
    try {
      setLoadingTipos(true);
      const response = await fetch(`${apiUrl}/evento/tipo-eventos/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar los tipos de evento');
      }
      const data = await response.json();
      setTiposEvento(data);
    } catch (error) {
      console.error('Error al cargar tipos de evento:', error);
    } finally {
      setLoadingTipos(false);
    }
  };

  const fetchProvincias = async () => {
    try {
      setLoadingProvincias(true);
      const response = await fetch(`${apiUrl}/direccion/provincias`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar las provincias');
      }
      const data = await response.json();
      setProvincias(data);
    } catch (error) {
      console.error('Error al cargar provincias:', error);
    } finally {
      setLoadingProvincias(false);
    }
  };

  const fetchCiudades = async () => {
    try {
      setLoadingCiudades(true);
      const response = await fetch(`${apiUrl}/direccion/ciudades`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar las ciudades');
      }
      const data = await response.json();
      setCiudades(data);
    } catch (error) {
      console.error('Error al cargar ciudades:', error);
    } finally {
      setLoadingCiudades(false);
    }
  };

  const fetchPagos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${apiUrl}/pago?include=evento.cliente`, { headers });
      if (!response.ok) {
        throw new Error('Error al obtener pagos');
      }

      const data = await response.json();
      setPagos(data);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
      message.error('Error al cargar los pagos');
    }
  };

  const fetchComentarios = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${apiUrl}/comentario`, { headers });
      if (!response.ok) {
        throw new Error('Error al obtener comentarios');
      }

      const data = await response.json();
      setComentarios(data);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      message.error('Error al cargar los comentarios');
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchData();
      fetchClientesYAsesores();
      fetchTiposEvento();
      fetchProvincias();
      fetchCiudades();
      fetchPagos();
      fetchComentarios();
    } else {
      setError('No hay token de autenticación');
      setLoading(false);
    }
  }, []);

  const handleCreateEvento = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/evento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          cedula_cliente: values.cedula_cliente,
          cedula_asesor: values.cedula_asesor,
          fecha_evento: values.fecha_evento.format('YYYY-MM-DD'),
          hora_evento: values.hora_evento.format('HH:mm:ss'),
          id_tipo_evento: values.id_tipo_evento,
          id_provincia: values.id_provincia,
          id_ciudad: values.id_ciudad,
          sector: values.sector,
          calle: values.calle,
          detalles: values.detalles,
          espacio_evento: values.espacio_evento,
          desea_supervision: values.desea_supervision,
          nota_cliente: values.nota_cliente
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al crear el evento');
      }

      const data = await response.json();
      message.success('Evento creado exitosamente');
      setModalEventoVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error al crear evento:', error);
      message.error(error instanceof Error ? error.message : 'Error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsignacion = async (values: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('No hay sesión activa');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/evento/asignar-empleados`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_evento: values.id_evento,
          empleado_evento: values.empleado_evento,
          puesto_evento: values.puesto_evento,
          estado_empevento: 'Activo'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Si es un error de asignación duplicada, mostrar un mensaje más amigable
        if (data.error === 'Asignación duplicada') {
          message.warning(data.mensaje);
          setModalAsignacionVisible(false);
          return;
        }
        throw new Error(data.mensaje || 'Error al crear la asignación');
      }

      message.success('Asignación creada exitosamente');
      setModalAsignacionVisible(false);
      
      // Actualizar la tabla de asignaciones
      const asignacionesResponse = await fetch(`${apiUrl}/evento/asignar-empleados?include=evento.cliente,empleado`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!asignacionesResponse.ok) {
        throw new Error('Error al actualizar la lista de asignaciones');
      }
      const asignacionesData = await asignacionesResponse.json();
      setAsignaciones(asignacionesData);
    } catch (error) {
      console.error('Error al crear asignación:', error);
      message.error(`Error al crear asignación: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDecoracion = async (values: any) => {
    try {
      setLoading(true);
      setModalDecoracionVisible(false);
      await fetchData();
      message.success('Decoración creada exitosamente');
    } catch (error) {
      console.error('Error al crear decoración:', error);
      message.error(error instanceof Error ? error.message : 'Ocurrió un error al crear la decoración');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUsuario = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/usuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Error al crear el usuario');
      }

      setModalUsuarioVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error al crear usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProveedor = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/proveedor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Error al crear el proveedor');
      }

      setModalProveedorVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error al crear proveedor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearPago = async (values: any) => {
    setLoadingPago(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }
      const response = await fetch(`${apiUrl}/pago`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_evento: values.id_evento,
          monto: values.monto,
          tipo_pago: values.tipo_pago,
          modo_pago: values.modo_pago,
          fecha_pago: values.fecha_pago.format('YYYY-MM-DD'),
          hora_pago: values.hora_pago.format('HH:mm:ss')
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al crear el pago');
      }
      setModalPagoVisible(false);
      message.success('Pago creado exitosamente');
      fetchPagos();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Error al crear el pago');
    } finally {
      setLoadingPago(false);
    }
  };

  const handleUpdatePago = async (values: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${apiUrl}/pago/${pagoSeleccionado?.id_pago}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el pago');
      }

      message.success('Pago actualizado exitosamente');
      setModalPagoVisible(false);
      fetchPagos();
    } catch (error) {
      console.error('Error al actualizar pago:', error);
      message.error('Error al actualizar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePago = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${apiUrl}/pago/${id}/estado`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ estado_pago: 'Rechazado' })
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el pago');
      }

      message.success('Pago eliminado exitosamente');
      fetchPagos();
    } catch (error) {
      console.error('Error al eliminar pago:', error);
      message.error('Error al eliminar el pago');
    }
  };

  // Funciones para manejar los filtros
  const handleEstadoEventosChange = (value: string) => {
    setSelectedEstadoEventos(value);
  };

  const handleEstadoUsuariosChange = (value: string) => {
    setSelectedEstadoUsuarios(value);
  };

  const handleEstadoProveedoresChange = (value: string) => {
    setSelectedEstadoProveedores(value);
  };

  const handleEstadoDecoracionesChange = (value: string) => {
    setSelectedEstadoDecoraciones(value);
  };

  const handleRolChange = (value: string) => {
    setSelectedRol(value);
  };

  const handleClienteChange = (value: string) => {
    setSelectedCliente(value);
  };

  const handleAsesorChange = (value: string) => {
    setSelectedAsesor(value);
  };

  const handleTipoChange = (value: string) => {
    setSelectedTipo(value);
  };

  const handleEventoChange = (value: string) => {
    setSelectedEvento(value);
  };

  const handleCargoChange = (value: string) => {
    setSelectedCargo(value);
  };

  const fetchEmpleados = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
  
      const response = await fetch(`${apiUrl}/usuario/rol/3`, { headers });
      if (response.ok) {
        const data = await response.json();
        setEmpleados(data.usuarios);
      }
    } catch (error) {
      console.error("Error al cargar empleados", error);
    }
  };
  
  useEffect(() => {
    fetchEmpleados();
  }, []);

  // Funciones de filtrado actualizadas
  const getFilteredEventos = () => {
    return eventos.filter(evento => {
      const searchLower = searchTextEventos.toLowerCase();
      const tipoEventoStr = typeof evento.tipo_evento === 'string' 
        ? evento.tipo_evento 
        : evento.tipo_evento.tipo_evento;
      
      // Formatear la fecha para búsqueda
      const fechaEvento = new Date(evento.fecha_evento);
      const fechaFormateada = fechaEvento.toLocaleDateString('es-DO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      // Convertir supervisión a texto para búsqueda
      const supervisionStr = evento.desea_supervision ? 'Sí' : 'No';
      
      const matchesSearch = searchTextEventos === '' || 
        (evento.cliente?.nombre_usuario || '').toLowerCase().includes(searchLower) ||
        (evento.cliente?.apellido_usuario || '').toLowerCase().includes(searchLower) ||
        (evento.asesor?.nombre_usuario || '').toLowerCase().includes(searchLower) ||
        (evento.asesor?.apellido_usuario || '').toLowerCase().includes(searchLower) ||
        tipoEventoStr.toLowerCase().includes(searchLower) ||
        (evento.espacio_evento || '').toLowerCase().includes(searchLower) ||
        evento.id_evento.toString().includes(searchTextEventos) ||
        evento.total_evento.toString().includes(searchTextEventos) ||
        fechaFormateada.includes(searchTextEventos) ||
        evento.hora_evento.includes(searchTextEventos) ||
        supervisionStr.includes(searchTextEventos);
      
      const matchesEstado = selectedEstadoEventos === 'todos' || 
        evento.estado_solicitud === selectedEstadoEventos;
      
      const matchesCliente = !selectedCliente || selectedCliente === '' || 
        `${evento.cliente?.nombre_usuario || ''} ${evento.cliente?.apellido_usuario || ''}` === selectedCliente;
      
      const matchesAsesor = !selectedAsesor || selectedAsesor === '' || 
        `${evento.asesor?.nombre_usuario || ''} ${evento.asesor?.apellido_usuario || ''}` === selectedAsesor;

      return matchesSearch && matchesEstado && matchesCliente && matchesAsesor;
    });
  };

  const getFilteredUsuarios = () => {
    if (!Array.isArray(usuarios)) return [];
    
    return usuarios.filter(usuario => {
      const searchLower = searchTextUsuarios.toLowerCase();
      const matchesSearch = searchTextUsuarios === '' || 
        usuario.nombre_usuario.toLowerCase().includes(searchLower) ||
        usuario.apellido_usuario.toLowerCase().includes(searchLower) ||
        usuario.usuario_login.toLowerCase().includes(searchLower) ||
        usuario.cedula_usuario.includes(searchTextUsuarios) ||
        usuario.tel_usuario.includes(searchTextUsuarios) ||
        usuario.correo_usuario.toLowerCase().includes(searchLower);
      
      const matchesEstado = selectedEstadoUsuarios === 'todos' || 
        usuario.estado_usuario === selectedEstadoUsuarios;
      
      const matchesRol = selectedRol === '' || 
        usuario.rol_nombre === selectedRol;

      return matchesSearch && matchesEstado && matchesRol;
    });
  };

  const getFilteredProveedores = () => {
    return proveedores.filter(proveedor => {
      const searchLower = searchTextProveedores.toLowerCase();
      const matchesSearch = searchTextProveedores === '' || 
        proveedor.nombre_proveedor.toLowerCase().includes(searchLower) ||
        proveedor.tipo_proveedor.toLowerCase().includes(searchLower) ||
        proveedor.id_proveedor.toString().includes(searchTextProveedores) ||
        proveedor.tel_proveedor.includes(searchTextProveedores) ||
        proveedor.correo_proveedor.toLowerCase().includes(searchLower);
      
      const matchesEstado = selectedEstadoProveedores === 'todos' || 
        proveedor.estado_proveedor === selectedEstadoProveedores;
      
      const matchesTipo = selectedTipo === '' || 
        proveedor.tipo_proveedor === selectedTipo;

      return matchesSearch && matchesEstado && matchesTipo;
    });
  };

  const getFilteredAsignaciones = () => {
    return asignaciones.filter(asignacion => {
      const matchEstado = !filtroAsignacionEstado || asignacion.estado_empevento === filtroAsignacionEstado;
      const matchCargo = !filtroAsignacionCargo || asignacion.puesto_evento.toLowerCase().includes(filtroAsignacionCargo.toLowerCase());
      const matchEvento = !filtroAsignacionEvento || asignacion.evento?.id_evento.toString().includes(filtroAsignacionEvento);
      const matchEmpleado = !filtroAsignacionEmpleado || 
        (asignacion.empleado && 
          `${asignacion.empleado.nombre_usuario} ${asignacion.empleado.apellido_usuario}`
            .toLowerCase()
            .includes(filtroAsignacionEmpleado.toLowerCase()));
      const matchBusqueda = !busquedaAsignacion || 
        asignacion.puesto_evento.toLowerCase().includes(busquedaAsignacion.toLowerCase()) ||
        (asignacion.empleado && 
          `${asignacion.empleado.nombre_usuario} ${asignacion.empleado.apellido_usuario}`
            .toLowerCase()
            .includes(busquedaAsignacion.toLowerCase()));

      return matchEstado && matchCargo && matchEvento && matchEmpleado && matchBusqueda;
    });
  };

  const getFilteredDecoraciones = () => {
    return decoraciones.filter(decoracion => {
      const matchEstado = !filtroDecoracionEstado || decoracion.estado_decoracion === filtroDecoracionEstado;
      const matchBusqueda = !busquedaDecoracion || 
        decoracion.tema_decoracion.toLowerCase().includes(busquedaDecoracion.toLowerCase()) ||
        decoracion.colores_decoracion.toLowerCase().includes(busquedaDecoracion.toLowerCase());

      return matchEstado && matchBusqueda;
    });
  };

  const getFilteredPagos = () => {
    return pagos.filter(pago => {
      const matchEstado = !filtroPagoEstado || pago.estado_pago === filtroPagoEstado;
      const matchTipo = !filtroPagoTipo || pago.tipo_pago === filtroPagoTipo;
      const matchMetodo = !filtroPagoMetodo || pago.modo_pago === filtroPagoMetodo;
      const matchBusqueda = !busquedaPago || 
        pago.modo_pago.toLowerCase().includes(busquedaPago.toLowerCase()) ||
        pago.tipo_pago.toLowerCase().includes(busquedaPago.toLowerCase());

      return matchEstado && matchTipo && matchMetodo && matchBusqueda;
    });
  };

  const getFilteredComentarios = () => {
    return comentarios.filter(comentario => {
      const matchEstado = !filtroComentarioEstado || comentario.estado_comentario === filtroComentarioEstado;
      const matchCalificacion = !filtroComentarioCalificacion || comentario.calificacion === filtroComentarioCalificacion;
      const matchCliente = !filtroComentarioCliente || 
        (comentario.evento?.cliente && 
          `${comentario.evento.cliente.nombre_usuario} ${comentario.evento.cliente.apellido_usuario}`
            .toLowerCase()
            .includes(filtroComentarioCliente.toLowerCase()));
      const matchBusqueda = !busquedaComentario || 
        comentario.comentario.toLowerCase().includes(busquedaComentario.toLowerCase());

      return matchEstado && matchCalificacion && matchCliente && matchBusqueda;
    });
  };

  const getActiveFiltersCount = (filtros: any) => {
    return Object.values(filtros).filter((value: any) => value !== '').length;
  };

  const handleViewEvento = (record: Evento) => {
    setEventoSeleccionado(record);
    setModalDetallesEventoVisible(true);
  };

  const handleViewUsuario = (record: Usuario) => {
    setUsuarioSeleccionado(record);
    setModalDetallesUsuarioVisible(true);
  };

  const handleViewProveedor = (record: Proveedor) => {
    setProveedorSeleccionado(record);
    setModalDetallesProveedorVisible(true);
  };

  const handleEditEvento = (record: Evento) => {
    setEventoSeleccionado(record);
    setModalEventoVisible(true);
  };

  const handleEditUsuario = (record: Usuario) => {
    setUsuarioSeleccionado(record);
    setModalUsuarioVisible(true);
  };

  const handleEditProveedor = (record: Proveedor) => {
    setProveedorSeleccionado(record);
    setModalProveedorVisible(true);
  };

  const handleDeleteUsuario = async (record: Usuario) => {
    try {
      await updateUsuarioEstado(record.cedula_usuario);
      fetchData();
    } catch (error) {
      message.error('Error al eliminar el usuario');
    }
  };

  const handleDeleteProveedor = async (record: Proveedor) => {
    try {
      await updateProveedorEstado(record.id_proveedor);
      fetchData();
    } catch (error) {
      message.error('Error al eliminar el proveedor');
    }
  };

  const handleCancelarEvento = async (record: Evento) => {
    try {
      await updateEventoEstado(record.id_evento);
      fetchData();
    } catch (error) {
      message.error('Error al cancelar el evento');
    }
  };

  const handleEditAsignacion = async (values: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('No hay sesión activa');
      return;
    }
    try {
      setLoading(true);
      
      // Primero eliminamos la asignación actual
      const deleteResponse = await fetch(`${apiUrl}/evento/${asignacionSeleccionada?.id_evento}/empleados/${asignacionSeleccionada?.empleado_evento}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.mensaje || 'Error al eliminar la asignación actual');
      }

      // Luego creamos la nueva asignación
      const response = await fetch(`${apiUrl}/evento/asignar-empleados`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_evento: values.id_evento,
          empleado_evento: values.empleado_evento,
          puesto_evento: values.puesto_evento,
          estado_empevento: values.estado_empevento
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al crear la nueva asignación');
      }

      message.success('Asignación actualizada exitosamente');
      setModalEditarAsignacionVisible(false);
      
      // Actualizar la tabla de asignaciones
      const asignacionesResponse = await fetch(`${apiUrl}/evento/asignar-empleados?include=evento.cliente,empleado`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!asignacionesResponse.ok) {
        throw new Error('Error al actualizar la lista de asignaciones');
      }
      const asignacionesData = await asignacionesResponse.json();
      setAsignaciones(asignacionesData);
    } catch (error) {
      console.error('Error al actualizar asignación:', error);
      message.error(`Error al actualizar asignación: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record: any) => {
    console.log('Datos de la asignación seleccionada:', record);
    setAsignacionSeleccionada(record);
    setModalEditarAsignacionVisible(true);
  };

  // Efecto para cargar los datos en el formulario cuando cambia la asignación seleccionada
  useEffect(() => {
    if (asignacionSeleccionada && modalEditarAsignacionVisible) {
      console.log('Intentando cargar datos en el formulario:', asignacionSeleccionada);
      const formData = {
        id_evento: asignacionSeleccionada.evento?.id_evento,
        empleado_evento: asignacionSeleccionada.empleado?.cedula_usuario,
        puesto_evento: asignacionSeleccionada.puesto_evento,
        estado_empevento: asignacionSeleccionada.estado_empevento
      };
      console.log('Datos a cargar en el formulario:', formData);
      formEditarAsignacion.setFieldsValue(formData);
    }
  }, [asignacionSeleccionada, modalEditarAsignacionVisible]);

  // Función para manejar la selección de decoración
  const handleSelectDecoracion = (decoracion: any) => {
    setDecoracionSeleccionada(decoracion);
    setModalElementosDecoracionVisible(true);
  };

  // Función para manejar el envío de elementos de decoración
  const handleSubmitElementosDecoracion = async (values: any) => {
    if (!eventoSeleccionadoParaElementos) {
      message.error('Por favor seleccione un evento primero');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/decoraciones/elementos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          id_evento: eventoSeleccionadoParaElementos.id_evento
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar los elementos');
      }

      message.success('Elementos agregados exitosamente');
      setModalElementosDecoracionVisible(false);
      setEventoSeleccionadoParaElementos(null);
      formElementosDecoracion.resetFields();
      fetchDecoraciones();
    } catch (error) {
      console.error('Error:', error);
      message.error('Error al guardar los elementos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${apiUrl}/auth/current`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener datos del usuario');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleEditPago = (record: Pago) => {
    setPagoSeleccionado(record);
    setModalPagoVisible(true);
  };

  const handleEditComentario = (record: Comentario) => {
    setComentarioSeleccionado(record);
    setModalDetallesComentarioVisible(true);
  };

  const handleDeleteComentario = async (id: number) => {
    try {
      await axios.delete(`${apiUrl}/comentarios/${id}`);
      message.success('Comentario eliminado exitosamente');
      fetchComentarios();
    } catch (error) {
      message.error('Error al eliminar el comentario');
    }
  };

  // Definir las columnas para la tabla de eventos
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id_evento',
      key: 'id_evento',
      render: (text: string) => <span className="column-id">{text}</span>,
    },
    {
      title: 'Cliente',
      dataIndex: ['cliente', 'nombre_usuario'],
      key: 'cliente',
      render: (_: any, record: Evento) => 
        `${record.cliente.nombre_usuario} ${record.cliente.apellido_usuario}`,
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_evento',
      key: 'fecha_evento',
    },
    {
      title: 'Tipo',
      dataIndex: ['tipo_evento', 'tipo_evento'],
      key: 'tipo_evento',
    },
    {
      title: 'Estado',
      dataIndex: 'estado_solicitud',
      key: 'estado_solicitud',
      render: (estado: EstadoSolicitud) => (
        <Tag color={
          estado === 'Aceptada' ? 'green' :
          estado === 'Pendiente' ? 'orange' :
          estado === 'Rechazada' ? 'red' :
          estado === 'Completada' ? 'blue' :
          'default'
        }>
          {estado}
        </Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total_evento',
      key: 'total_evento',
      render: (total: number) => `RD$ ${total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Evento) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setEventoSeleccionado(record);
              setModalDetallesEventoVisible(true);
            }}
            title="Ver Detalles"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEventoSeleccionado(record);
              setModalEventoVisible(true);
            }}
            title="Editar"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleCancelarEvento(record)}
            title="Cancelar Evento"
          />
        </Space>
      ),
    }
  ];

  // Definir las columnas para la tabla de usuarios
  const usuarioColumns = [
    {
      title: 'Cédula',
      dataIndex: 'cedula_usuario',
      key: 'cedula_usuario',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre_usuario',
      key: 'nombre_usuario',
    },
    {
      title: 'Apellido',
      dataIndex: 'apellido_usuario',
      key: 'apellido_usuario',
    },
    {
      title: 'Rol',
      dataIndex: 'rol_nombre',
      key: 'rol_nombre',
    },
    {
      title: 'Estado',
      dataIndex: 'estado_usuario',
      key: 'estado_usuario',
      render: (estado: string) => (
        <Tag color={estado === 'Activo' ? 'green' : 'red'}>
          {estado}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Usuario) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setUsuarioSeleccionado(record);
              setModalDetallesUsuarioVisible(true);
            }}
            title="Ver Detalles"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setUsuarioSeleccionado(record);
              setModalUsuarioVisible(true);
            }}
            title="Editar"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUsuario(record)}
            title="Eliminar"
          />
        </Space>
      ),
    }
  ];

  // Definir las columnas para la tabla de proveedores
  const proveedorColumns = [
    {
      title: 'ID',
      dataIndex: 'id_proveedor',
      key: 'id_proveedor',
      render: (text: string) => <span className="column-id">{text}</span>,
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre_proveedor',
      key: 'nombre_proveedor',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_proveedor',
      key: 'tipo_proveedor',
    },
    {
      title: 'Estado',
      dataIndex: 'estado_proveedor',
      key: 'estado_proveedor',
      render: (estado: string) => (
        <Tag color={
          estado === 'Activo' ? 'green' :
          estado === 'Inactivo' ? 'orange' :
          'red'
        }>
          {estado}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Proveedor) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setProveedorSeleccionado(record);
              setModalDetallesProveedorVisible(true);
            }}
            title="Ver Detalles"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setProveedorSeleccionado(record);
              setModalProveedorVisible(true);
            }}
            title="Editar"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteProveedor(record)}
            title="Eliminar"
          />
        </Space>
      ),
    }
  ];

  // Agregar la función handleDeleteAsignacion
  const handleDeleteAsignacion = async (record: AsignacionEmpleado) => {
    try {
      await axios.delete(`${apiUrl}/asignaciones/${record.id_evento}/${record.empleado_evento}`);
      message.success('Asignación eliminada exitosamente');
      fetchData();
    } catch (error) {
      message.error('Error al eliminar la asignación');
    }
  };

  const pagosColumns = [
    {
      title: 'ID',
      dataIndex: 'id_pago',
      key: 'id_pago',
    },
    {
      title: 'Cliente',
      dataIndex: ['evento', 'cliente'],
      key: 'cliente',
      render: (_: any, record: Pago) => {
        const eventoCorrespondiente = eventos.find(e => e.id_evento === record.id_evento);
        console.log('Evento correspondiente encontrado para pago:', eventoCorrespondiente);
        if (eventoCorrespondiente && eventoCorrespondiente.cliente) {
          return `${eventoCorrespondiente.cliente.nombre_usuario} ${eventoCorrespondiente.cliente.apellido_usuario}`;
        }
        return 'N/A';
      }
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      render: (monto: number) => `RD$ ${monto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_pago',
      key: 'tipo_pago',
    },
    {
      title: 'Estado',
      dataIndex: 'estado_pago',
      key: 'estado_pago',
      render: (estado: string) => (
        <Tag color={
          estado === 'Recibido' ? 'green' :
          estado === 'Pendiente' ? 'orange' :
          'red'
        }>
          {estado}
        </Tag>
      ),
    },
    {
      title: 'Método',
      dataIndex: 'modo_pago',
      key: 'modo_pago',
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_pago',
      key: 'fecha_pago',
      render: (fecha: string) => new Date(fecha).toLocaleDateString(),
    },
    {
      title: 'Hora',
      dataIndex: 'hora_pago',
      key: 'hora_pago',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right' as const,
      width: 'fit-content',
      render: (_: any, record: Pago) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setPagoSeleccionado(record);
              setModalDetallesPagoVisible(true);
            }}
            title="Ver Detalles"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditPago(record)}
            title="Editar"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePago(record.id_pago)}
            title="Eliminar"
          />
        </Space>
      ),
    },
  ];

  const comentariosColumns = [
    {
      title: 'Cliente',
      dataIndex: ['evento', 'cliente'],
      key: 'cliente',
      render: (cliente: any) => 
        cliente ? `${cliente.nombre_usuario} ${cliente.apellido_usuario}` : 'N/A'
    },
    {
      title: 'Comentario',
      dataIndex: 'comentario',
      key: 'comentario',
    },
    {
      title: 'Calificación',
      dataIndex: 'calificacion',
      key: 'calificacion',
      render: (calificacion: number) => <Rate disabled defaultValue={calificacion} />,
    },
    {
      title: 'Estado',
      dataIndex: 'estado_comentario',
      key: 'estado_comentario',
      render: (estado: string) => (
        <Tag color={
          estado === 'Activo' ? 'green' :
          estado === 'Editado' ? 'blue' :
          'red'
        }>
          {estado}
        </Tag>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_creacion',
      key: 'fecha_creacion',
    }
  ];

  const filterContentComentarios = (
    <div style={{ padding: '8px', minWidth: '300px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: 4 }}>Estado del comentario:</div>
          <Select
            placeholder="Filtrar por estado"
            style={{ width: '100%' }}
            onChange={value => setFiltroComentarioEstado(value)}
            value={filtroComentarioEstado}
            options={[
              { value: '', label: 'Todos' },
              { value: 'Activo', label: 'Activo' },
              { value: 'Editado', label: 'Editado' },
              { value: 'Eliminado', label: 'Eliminado' }
            ]}
          />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>Calificación:</div>
          <Select
            placeholder="Filtrar por calificación"
            style={{ width: '100%' }}
            onChange={value => setFiltroComentarioCalificacion(value)}
            value={filtroComentarioCalificacion}
            options={[
              { value: null, label: 'Todas' },
              { value: 5, label: '5 estrellas' },
              { value: 4, label: '4 estrellas' },
              { value: 3, label: '3 estrellas' },
              { value: 2, label: '2 estrellas' },
              { value: 1, label: '1 estrella' }
            ]}
          />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>Cliente:</div>
          <Select
            placeholder="Filtrar por cliente"
            style={{ width: '100%' }}
            onChange={value => setFiltroComentarioCliente(value)}
            value={filtroComentarioCliente}
            showSearch
            optionFilterProp="children"
          >
            <Select.Option value="">Todos los clientes</Select.Option>
            {clientes.map(cliente => (
              <Select.Option key={cliente.cedula_usuario} value={cliente.cedula_usuario}>
                {`${cliente.nombre_usuario} ${cliente.apellido_usuario} - ${cliente.cedula_usuario}`}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Space>
    </div>
  );

  const handleUpdateEvento = async (values: any) => {
    try {
      if (!eventoSeleccionado) return;

      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const response = await fetch(`${apiUrl}/eventos/${eventoSeleccionado.id_evento}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_evento: eventoSeleccionado.id_evento,
          cedula_cliente: values.cedula_cliente,
          cedula_asesor: values.cedula_asesor,
          id_tipo_evento: values.id_tipo_evento,
          fecha_evento: values.fecha_evento,
          hora_evento: values.hora_evento,
          espacio_evento: values.espacio_evento,
          desea_supervision: values.desea_supervision,
          estado_solicitud: values.estado_solicitud,
          total_evento: values.total_evento,
          subtotal_evento: values.subtotal_evento,
          itbis_evento: values.itbis_evento,
          nota_cliente: values.nota_cliente || '',
          id_direccion: values.id_direccion
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el evento');
      }

      message.success('Evento actualizado exitosamente');
      setModalEventoVisible(false);
      setEventoSeleccionado(null);
      fetchData();
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      message.error('Error al actualizar el evento');
    }
  };

  return (
    <div className="welcome-container">
      <Card className="welcome-card">
        <Title level={2} className="welcome-title">
          ¡Te damos la bienvenida a tu panel de Administrador!
        </Title>
        <p className="welcome-subtitle">
          Desde aquí podrás gestionar todos los aspectos de Canabacoa Fiestas
        </p>
      </Card>

      <div className="dashboard-container">
  <div className="dashboard-grid">
    {/* Primera fila: Eventos */}
    <div className="dashboard-row">
      <Card
        title="EVENTOS"
        className="dashboard-card full-width"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="action-button primary"
            onClick={() => setModalEventoVisible(true)}
          >
            Nuevo Evento
          </Button>
        }
      >
        <TableFilters
  type="eventos"
  searchText={searchTextEventos}
  onSearchChange={setSearchTextEventos}
  clearFilters={() => {
    setSearchTextEventos('');
    setSelectedEstadoEventos('todos');
    setSelectedCliente('');
    setSelectedAsesor('');
  }}
  activeFiltersCount={
    (selectedEstadoEventos !== 'todos' ? 1 : 0) +
    (selectedCliente ? 1 : 0) +
    (selectedAsesor ? 1 : 0)
  }
  filterContent={
    <div style={{ padding: '8px', minWidth: '300px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: 4 }}>Estado del evento:</div>
          <Select
            placeholder="Filtrar por estado"
            style={{ width: '100%' }}
            onChange={handleEstadoEventosChange}
            value={selectedEstadoEventos}
            options={[
              { value: 'todos', label: 'Todos' },
              { value: 'Pendiente', label: 'Pendiente' },
              { value: 'Confirmada', label: 'Confirmada' },
              { value: 'Cancelada', label: 'Cancelada' },
              { value: 'Completada', label: 'Completada' }
            ]}
          />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>Cliente:</div>
          <Select
            placeholder="Filtrar por cliente"
            style={{ width: '100%' }}
            onChange={handleClienteChange}
            value={selectedCliente}
            options={[
              { value: '', label: 'Todos' },
              ...clientes.map(cliente => ({
                value: `${cliente.nombre_usuario} ${cliente.apellido_usuario}`,
                label: `${cliente.nombre_usuario} ${cliente.apellido_usuario} (${cliente.cedula_usuario})`
              }))
            ]}
          />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>Asesor:</div>
          <Select
            placeholder="Filtrar por asesor"
            style={{ width: '100%' }}
            onChange={handleAsesorChange}
            value={selectedAsesor}
            options={[
              { value: '', label: 'Todos' },
              ...asesores.map(asesor => ({
                value: `${asesor.nombre_usuario} ${asesor.apellido_usuario}`,
                label: `${asesor.nombre_usuario} ${asesor.apellido_usuario} (${asesor.cedula_usuario})`
              }))
            ]}
          />
        </div>
      </Space>
    </div>
  }
/>
        <Table
          className="dashboard-table"
          columns={columns}
          dataSource={getFilteredEventos()}
          loading={loading}
          pagination={{ pageSize: 3 }}
          rowKey="id_evento"
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: <span style={{ color: '#999', fontWeight: 500, fontSize: 16 }}>No hay Registros</span> }}
        />
      </Card>
    </div>

    {/* Segunda fila: Usuarios y Proveedores */}
    <div className="dashboard-row">
      <Card
        title="USUARIOS"
        className="dashboard-card"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="action-button primary"
            onClick={() => setModalUsuarioVisible(true)}
          >
            Nuevo Usuario
          </Button>
        }
      >
        <TableFilters
  type="usuarios"
  searchText={searchTextUsuarios}
  onSearchChange={setSearchTextUsuarios}
  clearFilters={() => {
    setSearchTextUsuarios('');
    setSelectedEstadoUsuarios('todos');
    setSelectedRol('');
  }}
  activeFiltersCount={
    (selectedEstadoUsuarios !== 'todos' ? 1 : 0) +
    (selectedRol ? 1 : 0)
  }
  filterContent={
    <div style={{ padding: '8px', minWidth: '300px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: 4 }}>Estado del usuario:</div>
          <Select
            placeholder="Filtrar por estado"
            style={{ width: '100%' }}
            onChange={handleEstadoUsuariosChange}
            value={selectedEstadoUsuarios}
            options={[
              { value: 'todos', label: 'Todos' },
              { value: 'Activo', label: 'Activo' },
              { value: 'Inactivo', label: 'Inactivo' },
              { value: 'Eliminado', label: 'Eliminado' }
            ]}
          />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>Rol del usuario:</div>
          <Select
            placeholder="Filtrar por rol"
            style={{ width: '100%' }}
            onChange={handleRolChange}
            value={selectedRol}
            options={[
              { value: '', label: 'Todos' },
              { value: 'Administrador', label: 'Administrador' },
              { value: 'Cliente', label: 'Cliente' },
              { value: 'Empleado', label: 'Empleado' }
            ]}
          />
        </div>
      </Space>
    </div>
  }
/>
        <Table
          className="dashboard-table"
          columns={usuarioColumns}
          dataSource={getFilteredUsuarios()}
          loading={loading}
          pagination={{ pageSize: 3 }}
          rowKey="cedula_usuario"
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: <span style={{ color: '#999', fontWeight: 500, fontSize: 16 }}>No hay Registros</span> }}
        />
      </Card>

      <Card
        title="PROVEEDORES"
        className="dashboard-card"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="action-button primary"
            onClick={() => setModalProveedorVisible(true)}
          >
            Nuevo Proveedor
          </Button>
        }
      >
        <TableFilters
  type="proveedores"
  searchText={searchTextProveedores}
  onSearchChange={setSearchTextProveedores}
  clearFilters={() => {
    setSearchTextProveedores('');
    setSelectedEstadoProveedores('todos');
    setSelectedTipo('');
  }}
  activeFiltersCount={
    (selectedEstadoProveedores !== 'todos' ? 1 : 0) +
    (selectedTipo ? 1 : 0)
  }
  filterContent={
    <div style={{ padding: '8px', minWidth: '300px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: 4 }}>Estado del proveedor:</div>
          <Select
            placeholder="Filtrar por estado"
            style={{ width: '100%' }}
            onChange={handleEstadoProveedoresChange}
            value={selectedEstadoProveedores}
            options={[
              { value: 'todos', label: 'Todos' },
              { value: 'Activo', label: 'Activo' },
              { value: 'Inactivo', label: 'Inactivo' },
              { value: 'Eliminado', label: 'Eliminado' }
            ]}
          />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>Tipo de proveedor:</div>
          <Select
            placeholder="Filtrar por tipo"
            style={{ width: '100%' }}
            onChange={handleTipoChange}
            value={selectedTipo}
            options={[
              { value: '', label: 'Todos' },
              { value: 'Catering', label: 'Catering' },
              { value: 'Elementos', label: 'Elementos' }
            ]}
          />
        </div>
      </Space>
    </div>
  }
/>
        <Table
          className="dashboard-table"
          columns={proveedorColumns}
          dataSource={getFilteredProveedores()}
          loading={loading}
          pagination={{ pageSize: 3 }}
          rowKey="id_proveedor"
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: <span style={{ color: '#999', fontWeight: 500, fontSize: 16 }}>No hay Registros</span> }}
        />
      </Card>
    </div>

    {/* Tercera fila: Asignación y Decoración */}
    <div className="dashboard-row">
      {/* Tarjeta de Asignación de Equipo */}
      <Card
        title="ASIGNACIÓN DE EQUIPO"
        className="dashboard-card"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalAsignacionVisible(true)}
              className="action-button primary"
            >
              Nueva Asignación
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Input.Search
            placeholder="Buscar en asignaciones..."
            allowClear
            onSearch={value => setBusquedaAsignacion(value)}
            onChange={e => setBusquedaAsignacion(e.target.value)}
            style={{ width: '100%' }}
          />
          <Space>
            <Dropdown
              trigger={['click']}
              overlay={
                <div style={{ padding: '8px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderRadius: '4px' }}>
                  <Space direction="vertical" style={{ width: 300 }}>
                    <Select
                      placeholder="Filtrar por estado"
                      allowClear
                      style={{ width: '100%' }}
                      onChange={value => setFiltroAsignacionEstado(value)}
                    >
                      <Select.Option value="Activo">Activo</Select.Option>
                      <Select.Option value="Pendiente">Pendiente</Select.Option>
                      <Select.Option value="Cancelado">Cancelado</Select.Option>
                    </Select>
                    <Input
                      placeholder="Filtrar por cargo"
                      allowClear
                      style={{ width: '100%' }}
                      onChange={e => setFiltroAsignacionCargo(e.target.value)}
                    />
                    <Input
                      placeholder="Filtrar por ID evento"
                      allowClear
                      style={{ width: '100%' }}
                      onChange={e => setFiltroAsignacionEvento(e.target.value)}
                    />
                    <Input
                      placeholder="Filtrar por empleado"
                      allowClear
                      style={{ width: '100%' }}
                      onChange={e => setFiltroAsignacionEmpleado(e.target.value)}
                    />
                    <Button 
                      type="primary" 
                      onClick={() => {
                        setFiltroAsignacionEstado('');
                        setFiltroAsignacionCargo('');
                        setFiltroAsignacionEvento('');
                        setFiltroAsignacionEmpleado('');
                      }}
                      style={{ width: '100%' }}
                    >
                      Limpiar Filtros
                    </Button>
                  </Space>
                </div>
              }
            >
              <Button>
                <Space>
                  <FilterOutlined />
                  Filtros
                  {getActiveFiltersCount({
                    estado: filtroAsignacionEstado,
                    cargo: filtroAsignacionCargo,
                    evento: filtroAsignacionEvento,
                    empleado: filtroAsignacionEmpleado
                  }) > 0 && (
                    <Badge count={getActiveFiltersCount({
                      estado: filtroAsignacionEstado,
                      cargo: filtroAsignacionCargo,
                      evento: filtroAsignacionEvento,
                      empleado: filtroAsignacionEmpleado
                    })} style={{ marginLeft: 8 }} />
                  )}
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Space>
        <Table
          dataSource={getFilteredAsignaciones()}
          columns={[
            {
              title: 'ID Evento',
              dataIndex: ['evento', 'id_evento'],
              key: 'id_evento',
              render: (text: string) => <span className="column-id">{text}</span>,
            },
            {
              title: 'Empleado',
              dataIndex: 'empleado',
              key: 'empleado',
              render: (empleado) => empleado ? `${empleado.nombre_usuario} ${empleado.apellido_usuario}` : 'N/A',
            },
            {
              title: 'Puesto',
              dataIndex: 'puesto_evento',
              key: 'puesto_evento',
            },
            {
              title: 'Estado',
              dataIndex: 'estado_empevento',
              key: 'estado_empevento',
              render: (estado) => (
                <Tag color={
                  estado === 'Activo' ? 'green' :
                  estado === 'Pendiente' ? 'orange' :
                  estado === 'Cancelado' ? 'red' : 'default'
                }>
                  {estado}
                </Tag>
              ),
            },
            {
              title: 'Acciones',
              key: 'acciones',
              fixed: 'right' as const,
              width: 'fit-content',
              render: (_: any, record: AsignacionEmpleado) => (
                <Space>
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setAsignacionSeleccionada(record);
                      setModalDetallesAsignacionVisible(true);
                    }}
                    title="Ver Detalles"
                  />
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditClick(record)}
                    title="Editar"
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteAsignacion(record)}
                    title="Eliminar"
                  />
                </Space>
              ),
            },
          ]}
          rowKey={record => `${record.id_evento}_${record.empleado_evento}`}
          className="dashboard-table"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 3 }}
          loading={loading}
          locale={{ emptyText: <span style={{ color: '#999', fontWeight: 500, fontSize: 16 }}>No hay Registros</span> }}
        />
      </Card>

      <Card
        title="DECORACIONES"
        className="dashboard-card"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalDecoracionVisible(true)}
              className="action-button primary"
            >
              Nueva Decoración
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalSeleccionEventoVisible(true)}
              className="action-button primary"
            >
              Agregar Elementos
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Input.Search
            placeholder="Buscar en decoraciones..."
            allowClear
            onSearch={value => setBusquedaDecoracion(value)}
            onChange={e => setBusquedaDecoracion(e.target.value)}
            style={{ width: '100%' }}
          />
          <Space>
            <Dropdown
              trigger={['click']}
              overlay={
                <div style={{ padding: '8px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderRadius: '4px' }}>
                  <Space direction="vertical" style={{ width: 300 }}>
                    <Select
                      placeholder="Filtrar por estado"
                      allowClear
                      style={{ width: '100%' }}
                      onChange={value => setFiltroDecoracionEstado(value)}
                    >
                      <Select.Option value="Activo">Activo</Select.Option>
                      <Select.Option value="Pendiente">Pendiente</Select.Option>
                      <Select.Option value="Completada">Completada</Select.Option>
                      <Select.Option value="Cancelada">Cancelada</Select.Option>
                    </Select>
                    <Button 
                      type="primary" 
                      onClick={() => {
                        setFiltroDecoracionEstado('');
                      }}
                      style={{ width: '100%' }}
                    >
                      Limpiar Filtros
                    </Button>
                  </Space>
                </div>
              }
            >
              <Button>
                <Space>
                  <FilterOutlined />
                  Filtros
                  {getActiveFiltersCount({
                    estado: filtroDecoracionEstado
                  }) > 0 && (
                    <Badge count={getActiveFiltersCount({
                      estado: filtroDecoracionEstado
                    })} style={{ marginLeft: 8 }} />
                  )}
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Space>
        <Table
          dataSource={getFilteredDecoraciones()}
          columns={[
            {
              title: 'Evento',
              key: 'evento',
              render: (_, record) => (
                <span>
                  ID: {record.id_evento} - 
                  {record.evento?.cliente ? 
                    `${record.evento.cliente.nombre_usuario} ${record.evento.cliente.apellido_usuario}` : 
                    'Cliente no disponible'}
                </span>
              ),
            },
            {
              title: 'Tema',
              dataIndex: 'tema_decoracion',
              key: 'tema_decoracion',
            },
            {
              title: 'Colores',
              dataIndex: 'colores_decoracion',
              key: 'colores_decoracion',
            },
            {
              title: 'Total $',
              dataIndex: 'total_decoracion',
              key: 'total_decoracion',
              render: (total) => total ? `RD$ ${total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}` : 'N/A',
            },
            {
              title: 'Estado',
              dataIndex: 'estado_decoracion',
              key: 'estado_decoracion',
              render: (estado: string) => {
                let color;
                switch (estado) {
                  case 'Activo':
                    color = 'green';
                    break;
                  case 'Pendiente':
                    color = 'gold';
                    break;
                  case 'Completada':
                    color = 'blue';
                    break;
                  case 'Cancelada':
                    color = 'red';
                    break;
                  default:
                    color = 'default';
                }
                return <Tag color={color}>{estado}</Tag>;
              },
            },
            {
              title: 'Acciones',
              key: 'acciones',
              fixed: 'right',
              width: 100,
              render: (_, record) => (
                <Space>
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setDecoracionSeleccionada(record);
                      setModalDetallesDecoracionVisible(true);
                    }}
                  />
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditDecoracion(record)}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteDecoracion(record.id_decoracion)}
                  />
                </Space>
              ),
            },
          ]}
          rowKey="id_decoracion"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: <span style={{ color: '#999', fontWeight: 500, fontSize: 16 }}>No hay Registros</span> }}
          className="dashboard-table"
        />
      </Card>
    </div>

    {/* Cuarta fila: Pagos y Comentarios */}
    <div className="dashboard-row">
      <Card
        title="PAGOS"
        className="dashboard-card"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalPagoVisible(true)}
              className="action-button primary"
            >
              Nuevo Pago
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Input.Search
            placeholder="Buscar en pagos..."
            allowClear
            onSearch={value => setBusquedaPago(value)}
            onChange={e => setBusquedaPago(e.target.value)}
            style={{ width: '100%' }}
          />
          <Space>
            <Dropdown
              trigger={['click']}
              overlay={
                <div style={{ padding: '8px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderRadius: '4px' }}>
                  <Space direction="vertical" style={{ width: 300 }}>
                    <Select
                      placeholder="Filtrar por estado"
                      allowClear
                      style={{ width: '100%' }}
                      onChange={value => setFiltroPagoEstado(value)}
                    >
                      <Select.Option value="Recibido">Recibido</Select.Option>
                      <Select.Option value="Pendiente">Pendiente</Select.Option>
                      <Select.Option value="Rechazado">Rechazado</Select.Option>
                    </Select>
                    <Select
                      placeholder="Filtrar por tipo de pago"
                      allowClear
                      style={{ width: '100%' }}
                      onChange={value => setFiltroPagoTipo(value)}
                    >
                      <Select.Option value="Inicial">Inicial</Select.Option>
                      <Select.Option value="Final">Final</Select.Option>
                      <Select.Option value="Adicional">Adicional</Select.Option>
                    </Select>
                    <Select
                      placeholder="Filtrar por método de pago"
                      allowClear
                      style={{ width: '100%' }}
                      onChange={value => setFiltroPagoMetodo(value)}
                    >
                      <Select.Option value="Efectivo">Efectivo</Select.Option>
                      <Select.Option value="Transferencia">Transferencia</Select.Option>
                    </Select>
                    <Button 
                      type="primary" 
                      onClick={() => {
                        setFiltroPagoEstado('');
                        setFiltroPagoTipo('');
                        setFiltroPagoMetodo('');
                      }}
                      style={{ width: '100%' }}
                    >
                      Limpiar Filtros
                    </Button>
                  </Space>
                </div>
              }
            >
              <Button>
                <Space>
                  <FilterOutlined />
                  Filtros
                  {getActiveFiltersCount({
                    estado: filtroPagoEstado,
                    tipo: filtroPagoTipo,
                    metodo: filtroPagoMetodo
                  }) > 0 && (
                    <Badge count={getActiveFiltersCount({
                      estado: filtroPagoEstado,
                      tipo: filtroPagoTipo,
                      metodo: filtroPagoMetodo
                    })} style={{ marginLeft: 8 }} />
                  )}
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Space>
        <Table
          dataSource={getFilteredPagos()}
          columns={pagosColumns}
          rowKey="id_pago"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: <span style={{ color: '#999', fontWeight: 500, fontSize: 16 }}>No hay Registros</span> }}
          className="dashboard-table"
        />
      </Card>

      <Card
        title="COMENTARIOS"
        className="dashboard-card"
      >
        <TableFilters
          type="comentarios"
          searchText={busquedaComentario}
          onSearchChange={setBusquedaComentario}
          clearFilters={() => {
            setBusquedaComentario('');
            setFiltroComentarioEstado('');
            setFiltroComentarioCalificacion(null);
            setFiltroComentarioCliente('');
          }}
          activeFiltersCount={
            (filtroComentarioEstado ? 1 : 0) +
            (filtroComentarioCalificacion ? 1 : 0) +
            (filtroComentarioCliente ? 1 : 0)
          }
          filterContent={
            <div style={{ padding: '8px', minWidth: '300px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <div style={{ marginBottom: 4 }}>Estado del comentario:</div>
                    <Select
                      placeholder="Filtrar por estado"
                      style={{ width: '100%' }}
                      onChange={value => setFiltroComentarioEstado(value)}
                    value={filtroComentarioEstado}
                    options={[
                      { value: '', label: 'Todos' },
                      { value: 'Activo', label: 'Activo' },
                      { value: 'Editado', label: 'Editado' },
                      { value: 'Eliminado', label: 'Eliminado' }
                    ]}
                  />
                </div>
                <div>
                  <div style={{ marginBottom: 4 }}>Calificación:</div>
                    <Select
                      placeholder="Filtrar por calificación"
                      style={{ width: '100%' }}
                      onChange={value => setFiltroComentarioCalificacion(value)}
                    value={filtroComentarioCalificacion}
                    options={[
                      { value: null, label: 'Todas' },
                      { value: 5, label: '5 estrellas' },
                      { value: 4, label: '4 estrellas' },
                      { value: 3, label: '3 estrellas' },
                      { value: 2, label: '2 estrellas' },
                      { value: 1, label: '1 estrella' }
                    ]}
                  />
                </div>
                <div>
                  <div style={{ marginBottom: 4 }}>Cliente:</div>
                  <Select
                      placeholder="Filtrar por cliente"
                      style={{ width: '100%' }}
                    onChange={value => setFiltroComentarioCliente(value)}
                    value={filtroComentarioCliente}
                    showSearch
                    optionFilterProp="children"
                  >
                    <Select.Option value="">Todos los clientes</Select.Option>
                    {clientes.map(cliente => (
                      <Select.Option key={cliente.cedula_usuario} value={cliente.cedula_usuario}>
                        {`${cliente.nombre_usuario} ${cliente.apellido_usuario} - ${cliente.cedula_usuario}`}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                  </Space>
                </div>
              }
        />
        <Table
          dataSource={getFilteredComentarios()}
          columns={comentariosColumns}
          rowKey="id_comentario"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: <span style={{ color: '#999', fontWeight: 500, fontSize: 16 }}>No hay Registros</span> }}
          className="dashboard-table"
        />
      </Card>
    </div>

  </div>
</div>


      <Modal
        title="Nuevo Evento"
        open={modalEventoVisible}
        onCancel={() => {
          setModalEventoVisible(false);
          setEventoSeleccionado(null);
        }}
        footer={null}
        width={800}
      >
        <EventoForm
          visible={modalEventoVisible}
          onCancel={() => {
            setModalEventoVisible(false);
            setEventoSeleccionado(null);
          }}
          onSubmit={handleCreateEvento}
          loading={loading}
          clientes={clientes}
          asesores={asesores}
          tiposEvento={tiposEvento}
          provincias={provincias}
          ciudades={ciudades}
          initialValues={eventoSeleccionado}
        />
      </Modal>

      <Modal
        title="Nuevo Usuario"
        open={modalUsuarioVisible}
        onCancel={() => setModalUsuarioVisible(false)}
        footer={null}
        width={800}
      >
      <UsuarioForm
        visible={modalUsuarioVisible}
        onCancel={() => setModalUsuarioVisible(false)}
          onSubmit={async (values) => {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                message.error('No hay sesión activa');
                return;
              }

              const response = await fetch(`${apiUrl}/auth/register-user`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
              });

              if (!response.ok) {
                throw new Error('Error al crear el usuario');
              }

              message.success('Usuario creado exitosamente');
              setModalUsuarioVisible(false);
              fetchData(); // Actualizar la lista de usuarios
            } catch (error) {
              console.error('Error al crear el usuario:', error);
              message.error('Error al crear el usuario');
            }
          }}
        loading={loading}
      />
      </Modal>

      <ProveedorForm
        visible={modalProveedorVisible}
        onCancel={() => setModalProveedorVisible(false)}
        onSubmit={handleCreateProveedor}
        loading={loading}
        initialValues={proveedorSeleccionado ? {
          ...proveedorSeleccionado,
          id_provincia: proveedorSeleccionado.direccion?.ciudad?.provincia?.id_provincia,
          id_ciudad: proveedorSeleccionado.direccion?.ciudad?.id_ciudad,
          sector: proveedorSeleccionado.direccion?.sector,
          calle: proveedorSeleccionado.direccion?.calle,
          detalles: proveedorSeleccionado.direccion?.detalles
        } as ProveedorFormValues : undefined}
        //@ts-ignore
        provincias={provincias}
        ciudades={ciudades}
      />

      <Modal
        title="Nueva Asignación"
        open={modalAsignacionVisible}
        onCancel={() => {
          setModalAsignacionVisible(false);
          setAsignacionSeleccionada(null);
        }}
        footer={null}
        width={800}
      >
        <AsignacionEmpleadoForm
          visible={modalAsignacionVisible}
          onCancel={() => {
            setModalAsignacionVisible(false);
            setAsignacionSeleccionada(null);
          }}
          onSubmit={handleCreateAsignacion}
          loading={loading}
          //@ts-ignore
          initialValues={asignacionSeleccionada}
        />
      </Modal>

      <DecoracionForm
        visible={modalDecoracionVisible}
        onCancel={() => {
          setModalDecoracionVisible(false);
          setDecoracionSeleccionada(null);
        }}
        onSubmit={handleCreateDecoracion}
        loading={loading}
        initialValues={decoracionSeleccionada}
        //@ts-ignore
        eventosCliente={eventos}
        userCedula={user?.cedula_usuario || ''}
      />

      <PagoForm
        visible={modalPagoVisible}
        onCancel={() => {
          setModalPagoVisible(false);
          setPagoSeleccionado(null);
        }}
        onSubmit={pagoSeleccionado ? handleUpdatePago : handleCrearPago}
        loading={loadingPago}
        eventos={eventos}
        initialValues={pagoSeleccionado}
      />

      <Modal
        title="Detalles del Evento"
        open={modalDetallesEventoVisible}
        onCancel={() => setModalDetallesEventoVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalDetallesEventoVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {eventoSeleccionado && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID">{eventoSeleccionado.id_evento}</Descriptions.Item>
            <Descriptions.Item label="Cliente">{`${eventoSeleccionado.cliente.nombre_usuario} ${eventoSeleccionado.cliente.apellido_usuario}`}</Descriptions.Item>
            <Descriptions.Item label="Fecha">{eventoSeleccionado.fecha_evento}</Descriptions.Item>
            <Descriptions.Item label="Hora">{eventoSeleccionado.hora_evento}</Descriptions.Item>
            <Descriptions.Item label="Tipo">{eventoSeleccionado.tipo_evento.tipo_evento}</Descriptions.Item>
            <Descriptions.Item label="Espacio">{eventoSeleccionado.espacio_evento}</Descriptions.Item>
            <Descriptions.Item label="Supervisión">{eventoSeleccionado.desea_supervision ? 'Sí' : 'No'}</Descriptions.Item>
            <Descriptions.Item label="Estado">{eventoSeleccionado.estado_solicitud}</Descriptions.Item>
            <Descriptions.Item label="Total">RD$ {eventoSeleccionado.total_evento.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Descriptions.Item>
            <Descriptions.Item label="Subtotal">RD$ {eventoSeleccionado.subtotal_evento.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Descriptions.Item>
            <Descriptions.Item label="ITBIS">RD$ {eventoSeleccionado.itbis_evento.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Descriptions.Item>
            <Descriptions.Item label="Nota" span={2}>{eventoSeleccionado.nota_cliente}</Descriptions.Item>
            <Descriptions.Item label="Dirección" span={2}>
                  {eventoSeleccionado.direccion.calle}, {eventoSeleccionado.direccion.sector}
                  <br />
                  {eventoSeleccionado.direccion.ciudad.nombre_ciudad}, {eventoSeleccionado.direccion.ciudad.provincia.nombre_provincia}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal de Detalles de Usuario */}
      <Modal
        title="Detalles del Usuario"
        open={modalDetallesUsuarioVisible}
        onCancel={() => setModalDetallesUsuarioVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalDetallesUsuarioVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {usuarioSeleccionado && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Cédula">{usuarioSeleccionado.cedula_usuario}</Descriptions.Item>
            <Descriptions.Item label="Nombre">{usuarioSeleccionado.nombre_usuario}</Descriptions.Item>
            <Descriptions.Item label="Apellido">{usuarioSeleccionado.apellido_usuario}</Descriptions.Item>
            <Descriptions.Item label="Usuario">{usuarioSeleccionado.usuario_login}</Descriptions.Item>
            <Descriptions.Item label="Correo">{usuarioSeleccionado.correo_usuario}</Descriptions.Item>
            <Descriptions.Item label="Teléfono">{usuarioSeleccionado.tel_usuario}</Descriptions.Item>
            <Descriptions.Item label="Rol">{usuarioSeleccionado.rol_nombre}</Descriptions.Item>
            <Descriptions.Item label="Estado">{usuarioSeleccionado.estado_usuario}</Descriptions.Item>
            <Descriptions.Item label="Fecha de Creación">{usuarioSeleccionado.creacion_usuario}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal de Detalles de Proveedor */}
      <Modal
        title="Detalles del Proveedor"
        open={modalDetallesProveedorVisible}
        onCancel={() => setModalDetallesProveedorVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalDetallesProveedorVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {proveedorSeleccionado && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID">{proveedorSeleccionado.id_proveedor}</Descriptions.Item>
            <Descriptions.Item label="Nombre">{proveedorSeleccionado.nombre_proveedor}</Descriptions.Item>
            <Descriptions.Item label="Tipo">{proveedorSeleccionado.tipo_proveedor}</Descriptions.Item>
            <Descriptions.Item label="Teléfono">{proveedorSeleccionado.tel_proveedor}</Descriptions.Item>
            <Descriptions.Item label="Correo">{proveedorSeleccionado.correo_proveedor}</Descriptions.Item>
            <Descriptions.Item label="Estado">{proveedorSeleccionado.estado_proveedor}</Descriptions.Item>
            <Descriptions.Item label="Dirección" span={2}>
              {proveedorSeleccionado.direccion.calle}, {proveedorSeleccionado.direccion.sector}
                    <br />
              {proveedorSeleccionado.direccion.ciudad.nombre_ciudad}, {proveedorSeleccionado.direccion.ciudad.provincia.nombre_provincia}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de Creación">{proveedorSeleccionado.creacion_proveedor}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal de Detalles de Decoración */}
      <Modal
        title="Detalles de la Decoración"
        open={modalDetallesDecoracionVisible}
        onCancel={() => setModalDetallesDecoracionVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalDetallesDecoracionVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={1000}
      >
        {decoracionSeleccionada && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="ID de Decoración" span={2}>{decoracionSeleccionada.id_decoracion}</Descriptions.Item>
              <Descriptions.Item label="Evento" span={2}>
                ID: {decoracionSeleccionada.evento?.id_evento} - 
                Tipo: {decoracionSeleccionada.evento?.tipo_evento?.tipo_evento || 'No especificado'}
                <br />
                Cliente: {decoracionSeleccionada.evento?.cliente?.nombre_usuario} {decoracionSeleccionada.evento?.cliente?.apellido_usuario}
              </Descriptions.Item>
              <Descriptions.Item label="Tema" span={2}>{decoracionSeleccionada.tema_decoracion}</Descriptions.Item>
              <Descriptions.Item label="Colores" span={2}>{decoracionSeleccionada.colores_decoracion}</Descriptions.Item>
              <Descriptions.Item label="Precio Neto">RD$ {decoracionSeleccionada.precioneto_decoracion?.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Descriptions.Item>
              <Descriptions.Item label="ITBIS">RD$ {decoracionSeleccionada.itbis_decoracion?.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Descriptions.Item>
              <Descriptions.Item label="Total" span={2}>RD$ {decoracionSeleccionada.total_decoracion?.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Descriptions.Item>
              <Descriptions.Item label="Estado" span={2}>{decoracionSeleccionada.estado_decoracion}</Descriptions.Item>
            </Descriptions>

            {decoracionSeleccionada.detalle_decoracion && decoracionSeleccionada.detalle_decoracion.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3>Elementos de Decoración</h3>
                <Table
                  dataSource={decoracionSeleccionada.detalle_decoracion}
                  columns={[
                    {
                      title: 'Elemento',
                      dataIndex: 'elemento_decoracion',
                      key: 'elemento_decoracion',
                    },
                    {
                      title: 'Cantidad',
                      dataIndex: 'cantelemento_decoracion',
                      key: 'cantelemento_decoracion',
                    },
                    {
                      title: 'Precio Unitario',
                      dataIndex: 'precio_elemento',
                      key: 'precio_elemento',
                      render: (precio) => `RD$ ${precio?.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`,
                    },
                    {
                      title: 'Precio Total',
                      dataIndex: 'precio_decoracion',
                      key: 'precio_decoracion',
                      render: (precio) => `RD$ ${precio?.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`,
                    },
                    {
                      title: 'Estado',
                      dataIndex: 'estado_detdecoracion',
                      key: 'estado_detdecoracion',
                    },
                  ]}
                  rowKey="id_detdecoracion"
                  pagination={false}
                />
              </div>
            )}
          </>
        )}
      </Modal>

      {/* Modal de Detalles de Asignación */}
      <Modal
        title="Detalles de la Asignación"
        open={modalDetallesAsignacionVisible}
        onCancel={() => setModalDetallesAsignacionVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalDetallesAsignacionVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {asignacionSeleccionada && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID del Evento" span={2}>
              {asignacionSeleccionada.evento?.id_evento}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha del Evento">
              {asignacionSeleccionada.evento?.fecha_evento && new Date(asignacionSeleccionada.evento.fecha_evento).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Hora del Evento">
              {asignacionSeleccionada.evento?.hora_evento}
            </Descriptions.Item>
            <Descriptions.Item label="Cliente" span={2}>
              {asignacionSeleccionada.evento?.cliente 
                ? `${asignacionSeleccionada.evento.cliente.nombre_usuario} ${asignacionSeleccionada.evento.cliente.apellido_usuario}`
                : 'No especificado'}
            </Descriptions.Item>
            <Descriptions.Item label="Empleado" span={2}>
              {asignacionSeleccionada.empleado 
                ? `${asignacionSeleccionada.empleado.nombre_usuario} ${asignacionSeleccionada.empleado.apellido_usuario}`
                : 'No asignado'}
            </Descriptions.Item>
            <Descriptions.Item label="ID del Empleado">
              {asignacionSeleccionada.empleado?.cedula_usuario}
            </Descriptions.Item>
            <Descriptions.Item label="Puesto">
              {asignacionSeleccionada.puesto_evento}
            </Descriptions.Item>
            <Descriptions.Item label="Estado" span={2}>
              <Tag color={
                asignacionSeleccionada.estado_empevento === 'Activo' ? 'green' :
                asignacionSeleccionada.estado_empevento === 'Pendiente' ? 'orange' :
                asignacionSeleccionada.estado_empevento === 'Cancelado' ? 'red' : 'default'
              }>
                {asignacionSeleccionada.estado_empevento}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Formulario de Edición de Evento */}
      <Modal
        title="Editar Evento"
        open={showEventoForm}
        onCancel={() => {
          setShowEventoForm(false);
          setEventoSeleccionado(null);
        }}
        footer={null}
        width={800}
      >
        <EventoForm
          visible={showEventoForm}
          onCancel={() => {
            setShowEventoForm(false);
            setEventoSeleccionado(null);
          }}
          onSubmit={handleUpdateEvento}
          loading={loading}
          clientes={clientes}
          asesores={asesores}
          tiposEvento={tiposEvento}
          provincias={provincias}
          ciudades={ciudades}
          initialValues={eventoSeleccionado}
          userCedula={user?.cedula_usuario || ''}
          userRole={user?.rol_nombre || ''}
        />
      </Modal>

      {/* Formulario de Edición de Usuario */}
      <UsuarioForm
        visible={showUsuarioForm}
        onCancel={() => {
          setShowUsuarioForm(false);
          setUsuarioSeleccionado(null);
        }}
        onSubmit={async (values) => {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              message.error('No hay sesión activa');
              return;
            }

            const response = await fetch(`${apiUrl}/usuario/${usuarioSeleccionado?.cedula_usuario}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(values)
            });

            if (!response.ok) {
              throw new Error('Error al actualizar el usuario');
            }

            message.success('Usuario actualizado exitosamente');
            setShowUsuarioForm(false);
            setUsuarioSeleccionado(null);
            fetchData();
          } catch (error) {
            console.error('Error al actualizar el usuario:', error);
            message.error('Error al actualizar el usuario');
          }
        }}
        loading={loading}
        initialValues={usuarioSeleccionado}
      />

      {/* Formulario de Edición de Proveedor */}
      <ProveedorForm
        visible={showProveedorForm}
        onCancel={() => {
          setShowProveedorForm(false);
          setProveedorSeleccionado(null);
        }}
        onSubmit={async (values) => {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              message.error('No hay sesión activa');
              return;
            }

            // Preparar los datos de la dirección
            const direccionData = {
              id_provincia: values.id_provincia,
              id_ciudad: values.id_ciudad,
              sector: values.sector,
              calle: values.calle,
              detalles: values.detalles || null
            };

            // Actualizar la dirección
            const direccionResponse = await fetch(`${apiUrl}/direccion/${proveedorSeleccionado?.id_direccion}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(direccionData)
            });

            if (!direccionResponse.ok) {
              throw new Error('Error al actualizar la dirección');
            }

            // Preparar los datos del proveedor
            const proveedorData = {
              tipo_proveedor: values.tipo_proveedor,
              nombre_proveedor: values.nombre_proveedor,
              tel_proveedor: values.telefono_proveedor,
              correo_proveedor: values.correo_proveedor,
              id_direccion: proveedorSeleccionado?.id_direccion,
              estado_proveedor: values.estado_proveedor
            };

            // Actualizar el proveedor
            const proveedorResponse = await fetch(`${apiUrl}/proveedor/${proveedorSeleccionado?.id_proveedor}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(proveedorData)
            });

            if (!proveedorResponse.ok) {
              throw new Error('Error al actualizar el proveedor');
            }

            message.success('Proveedor actualizado exitosamente');
            setShowProveedorForm(false);
            setProveedorSeleccionado(null);
            fetchData();
          } catch (error) {
            console.error('Error al actualizar el proveedor:', error);
            message.error('Error al actualizar el proveedor');
          }
        }}
        loading={loading}
        initialValues={proveedorSeleccionado}
      />

      {/* Formulario de Edición de Asignación */}
      <Modal
        title="Editar Asignación"
        open={modalEditarAsignacionVisible}
        onCancel={() => {
          setModalEditarAsignacionVisible(false);
          setAsignacionSeleccionada(null);
          formEditarAsignacion.resetFields();
        }}
        footer={null}
        width={800}
      >
        <AsignacionEmpleadoForm
          visible={modalEditarAsignacionVisible}
          onCancel={() => {
            setModalEditarAsignacionVisible(false);
            setAsignacionSeleccionada(null);
          }}
          onSubmit={handleEditAsignacion}
          loading={loading}
          //@ts-ignore
          initialValues={asignacionSeleccionada}
          form={formEditarAsignacion}
          eventos={eventos}
          empleados={empleados}
        />
      </Modal>

      {/* Formulario de Edición de Decoración */}
      <DecoracionForm
        visible={modalDecoracionVisible}
        onCancel={() => {
          setModalDecoracionVisible(false);
          setDecoracionSeleccionada(null);
        }}
        onSubmit={handleCreateDecoracion}
        loading={loading}
        initialValues={decoracionSeleccionada}
        //@ts-ignore
        eventosCliente={eventos}
        userCedula={user?.cedula_usuario || ''}
      />

      {/* Modal para seleccionar evento antes de agregar elementos */}
      <Modal
        title="Seleccionar Evento"
        open={modalSeleccionEventoVisible}
        onCancel={() => {
          setModalSeleccionEventoVisible(false);
          setEventoSeleccionadoParaElementos(null);
        }}
        footer={null}
      >
        <List
          dataSource={eventos}
          renderItem={(evento) => (
            <List.Item>
              <Button
                type="link"
                onClick={() => {
                  setEventoSeleccionadoParaElementos(evento);
                  setModalSeleccionEventoVisible(false);
                  setModalElementosDecoracionVisible(true);
                }}
              >
                {`ID: ${evento.id_evento} - ${evento.cliente?.nombre_usuario} ${evento.cliente?.apellido_usuario} - ${evento.tipo_evento.tipo_evento}`}
              </Button>
            </List.Item>
          )}
        />
      </Modal>

      {/* Modal para agregar elementos de decoración */}
      <Modal
        title={`Agregar Elementos - Evento: ${eventoSeleccionadoParaElementos?.id_evento}`}
        open={modalElementosDecoracionVisible}
        onCancel={() => {
          setModalElementosDecoracionVisible(false);
          setEventoSeleccionadoParaElementos(null);
          formElementosDecoracion.resetFields();
        }}
        footer={null}
      >
        <Form
          form={formElementosDecoracion}
          layout="vertical"
          onFinish={handleSubmitElementosDecoracion}
        >
          <Form.Item
            name="nombre_elemento"
            label="Nombre del Elemento"
            rules={[{ required: true, message: 'Por favor ingrese el nombre del elemento' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="cantidad_elemento"
            label="Cantidad"
            rules={[{ required: true, message: 'Por favor ingrese la cantidad' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="precio_elemento"
            label="Precio Unitario"
            rules={[{ required: true, message: 'Por favor ingrese el precio unitario' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              formatter={value => `RD$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              //@ts-ignore      
              parser={value => value!.replace(/RD\$\s?|(,*)/g, '')}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="proveedor_elemento"
            label="Proveedor"
            rules={[{ required: true, message: 'Por favor ingrese el proveedor' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Guardar Elementos
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Detalles del Pago"
        open={modalDetallesPagoVisible}
        onCancel={() => setModalDetallesPagoVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalDetallesPagoVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {pagoSeleccionado && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID del Pago" span={2}>{pagoSeleccionado.id_pago}</Descriptions.Item>
            <Descriptions.Item label="Evento" span={2}>
              ID: {pagoSeleccionado.evento?.id_evento} - 
              {pagoSeleccionado.evento?.cliente ? 
                `${pagoSeleccionado.evento.cliente.nombre_usuario} ${pagoSeleccionado.evento.cliente.apellido_usuario}` : 
                'Cliente no disponible'}
            </Descriptions.Item>
            <Descriptions.Item label="Monto">RD$ {pagoSeleccionado.monto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Descriptions.Item>
            <Descriptions.Item label="Tipo">
              {pagoSeleccionado.tipo_pago === 'Inicial' ? 'Inicial' : pagoSeleccionado.tipo_pago === 'Final' ? 'Final' : 'Adicional'}
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              {pagoSeleccionado.estado_pago === 'Recibido' ? 'Recibido' : pagoSeleccionado.estado_pago === 'Pendiente' ? 'Pendiente' : 'Rechazado'}
            </Descriptions.Item>
            <Descriptions.Item label="Método de Pago">{pagoSeleccionado.modo_pago}</Descriptions.Item>
            <Descriptions.Item label="Fecha">
              {new Date(pagoSeleccionado.fecha_pago).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Hora">{pagoSeleccionado.hora_pago}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="Detalles del Comentario"
        open={modalDetallesComentarioVisible}
        onCancel={() => setModalDetallesComentarioVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalDetallesComentarioVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {comentarioSeleccionado && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID del Comentario" span={2}>{comentarioSeleccionado.id_comentario}</Descriptions.Item>
            <Descriptions.Item label="Evento" span={2}>
              ID: {comentarioSeleccionado.evento?.id_evento} - 
              {comentarioSeleccionado.evento?.cliente ? 
                `${comentarioSeleccionado.evento.cliente.nombre_usuario} ${comentarioSeleccionado.evento.cliente.apellido_usuario}` : 
                'Cliente no disponible'}
            </Descriptions.Item>
            <Descriptions.Item label="Comentario">{comentarioSeleccionado.comentario}</Descriptions.Item>
            <Descriptions.Item label="Calificación">{comentarioSeleccionado.calificacion}</Descriptions.Item>
            <Descriptions.Item label="Estado">
              {comentarioSeleccionado.estado_comentario === 'Activo' ? 'Activo' : comentarioSeleccionado.estado_comentario === 'Editado' ? 'Editado' : 'Eliminado'}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de Creación">
              {new Date(comentarioSeleccionado.fecha_creacion).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

    </div>
  );
};

export default WelcomeAdmin;