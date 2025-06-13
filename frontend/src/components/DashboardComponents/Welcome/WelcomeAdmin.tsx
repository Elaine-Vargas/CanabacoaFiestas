import React, { useState, useEffect } from 'react';
import '../../../styles/dashboard/ServicesSubpages.scss';
import { Card, Button, Table, Tag, Space, Typography, Input, Select, Dropdown, Modal, Descriptions, message, Rate } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import EventoForm from '../FormService/EventoForm';
import UsuarioForm from '../FormService/UsuarioForm';
import ProveedorForm from '../FormService/ProveedorForm';
import AsignacionEmpleadoForm from '../FormService/AsignacionEmpleadoForm';
import DecoracionForm from '../FormService/DecoracionForm';
import TableFilters from '../MoreDash/TableFilters';
import { 
  getEventoColumns, 
  getUsuarioColumns, 
  getProveedorColumns, 
  getAsignacionColumns, 
  getDecoracionColumns 
} from '../MoreDash/TablesActions';
import { 
  updateEventoEstado, 
  updateUsuarioEstado, 
  updateProveedorEstado, 
  updateDecoracionEstado 
} from '../MoreDash/TableUpdateActions';


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
  monto_pago: number;
  fecha_pago: string;
  hora_pago: string;
  tipo_pago: 'Inicial' | 'Final' | 'Adicional';
  estado_pago: 'Pendiente' | 'Recibido' | 'Rechazado';
  metodo_pago: string;
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
  estado: 'Activo' | 'Editado' | 'Eliminado';
  fecha_creacion: string;
  evento?: {
    id_evento: number;
    cliente?: {
      nombre_usuario: string;
      apellido_usuario: string;
    };
  };
}

const { Title } = Typography;

const WelcomeAdmin: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

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
  const [decoracionSeleccionada, setDecoracionSeleccionada] = useState<Decoracion | null>(null);
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
  const [showAsignacionForm, setShowAsignacionForm] = useState(false);
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

      // Cargar decoraciones con detalles
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

      const response = await fetch(`${apiUrl}/pagos`, { headers });
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
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/empleado-evento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Error al crear la asignación');
      }

      setModalAsignacionVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error al crear asignación:', error);
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
      const searchLower = searchTextAsignaciones.toLowerCase();
      const matchesSearch = searchTextAsignaciones === '' || 
        asignacion.empleado_evento.toLowerCase().includes(searchLower) ||
        asignacion.id_evento.toString().includes(searchTextAsignaciones) ||
        asignacion.empleado?.cedula_usuario.includes(searchTextAsignaciones) ||
        asignacion.empleado?.nombre_usuario.toLowerCase().includes(searchLower) ||
        asignacion.empleado?.apellido_usuario.toLowerCase().includes(searchLower);
      
      const matchesEvento = selectedEvento === '' || 
        asignacion.id_evento.toString() === selectedEvento;
      
      const matchesCargo = selectedCargo === '' || 
        asignacion.puesto_evento === selectedCargo;

      const matchesEmpleado = selectedEmpleado === '' ||
        asignacion.empleado_evento === selectedEmpleado;

      return matchesSearch && matchesEvento && matchesCargo && matchesEmpleado;
    });
  };

  const getFilteredDecoraciones = () => {
    return decoraciones.filter(decoracion => {
      const searchLower = searchTextDecoraciones.toLowerCase();
      const tipoEvento = typeof decoracion.evento?.tipo_evento === 'object' 
        ? decoracion.evento.tipo_evento.tipo_evento 
        : decoracion.evento?.tipo_evento;
      
      const matchesSearch = searchTextDecoraciones === '' || 
        decoracion.tema_decoracion.toLowerCase().includes(searchLower) ||
        decoracion.colores_decoracion.toLowerCase().includes(searchLower) ||
        (tipoEvento || '').toLowerCase().includes(searchLower) ||
        decoracion.id_decoracion.toString().includes(searchTextDecoraciones) ||
        decoracion.id_evento.toString().includes(searchTextDecoraciones) ||
        decoracion.precioneto_decoracion.toString().includes(searchTextDecoraciones) ||
        decoracion.total_decoracion.toString().includes(searchTextDecoraciones);
      
      const matchesEstado = selectedEstadoDecoraciones === 'todos' || 
        decoracion.estado_decoracion === selectedEstadoDecoraciones;

      const matchesEvento = selectedEvento === '' ||
        decoracion.id_evento?.toString() === selectedEvento;

      return matchesSearch && matchesEstado && matchesEvento;
    });
  };

  // Obtener las columnas con las acciones correspondientes
  const columns = getEventoColumns({
    onViewDetails: (record) => {
      setEventoSeleccionado(record);
      setModalDetallesEventoVisible(true);
    },
    onEdit: (record) => {
      setEventoSeleccionado(record);
      setShowEventoForm(true);
    },
    onDelete: async (record) => {
      const success = await updateEventoEstado(record.id_evento);
      if (success) {
        fetchData(); // Recargar los datos después de eliminar
      }
    }
  });

  const usuarioColumns = getUsuarioColumns({
    onViewDetails: (record) => {
      setUsuarioSeleccionado(record);
      setModalDetallesUsuarioVisible(true);
    },
    onEdit: (record) => {
      setUsuarioSeleccionado(record);
      setShowUsuarioForm(true);
    },
    onDelete: async (record) => {
      const success = await updateUsuarioEstado(record.cedula_usuario);
      if (success) {
        fetchData(); // Recargar los datos después de eliminar
      }
    }
  });

  const proveedorColumns = getProveedorColumns({
    onViewDetails: (record) => {
      setProveedorSeleccionado(record);
      setModalDetallesProveedorVisible(true);
    },
    onEdit: (record) => {
      setProveedorSeleccionado(record);
      setShowProveedorForm(true);
    },
    onDelete: async (record) => {
      const success = await updateProveedorEstado(record.id_proveedor);
      if (success) {
        fetchData(); // Recargar los datos después de eliminar
      }
    }
  });

  const handleDeleteAsignacion = async (record: AsignacionEmpleado) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('No hay sesión activa');
      return;
    }
    console.log('Eliminando asignación:', record);
    try {
      const response = await fetch(`${apiUrl}/evento/${record.id_evento}/empleados/${record.empleado_evento}/estado`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado_empevento: 'Eliminado' })
      });
      const data = await response.json();
      console.log('Respuesta del backend al eliminar asignación:', data);
      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al eliminar asignación');
      }
      message.success('Asignación eliminada exitosamente');
      fetchData(); // Recargar datos para reflejar el cambio
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      message.error(`Error al eliminar asignación: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const asignacionColumns = getAsignacionColumns({
    onViewDetails: (record) => {
      setAsignacionSeleccionada(record);
      setModalDetallesAsignacionVisible(true);
    },
    onEdit: (record) => {
      setAsignacionSeleccionada(record);
      setShowAsignacionForm(true);
    },
    onDelete: handleDeleteAsignacion
  });

  const decoracionColumns = getDecoracionColumns({
    onViewDetails: (record) => {
      setDecoracionSeleccionada(record);
      setModalDetallesDecoracionVisible(true);
    },
    onEdit: (record) => {
      setDecoracionSeleccionada(record);
      setShowDecoracionForm(true);
    },
    onDelete: async (record) => {
      const success = await updateDecoracionEstado(record.id_decoracion);
      if (success) {
        fetchData(); // Recargar los datos después de eliminar
      }
    }
  });

  // Funciones para filtrar pagos y comentarios
  const getFilteredPagos = () => {
    return pagos.filter(pago => {
      const matchEstado = !filtrosPagos.estado || pago.estado_pago === filtrosPagos.estado;
      const matchEvento = !filtrosPagos.evento || pago.id_evento.toString() === filtrosPagos.evento;
      const matchMetodo = !filtrosPagos.metodo || pago.metodo_pago === filtrosPagos.metodo;
      const matchTipo = !filtrosPagos.tipo || pago.tipo_pago === filtrosPagos.tipo;
      return matchEstado && matchEvento && matchMetodo && matchTipo;
    });
  };

  const getFilteredComentarios = () => {
    return comentarios.filter(comentario => {
      const matchEstado = !filtrosComentarios.estado || comentario.estado_comentario === filtrosComentarios.estado;
      const matchCalificacion = !filtrosComentarios.calificacion || comentario.calificacion?.toString() === filtrosComentarios.calificacion;
      return matchEstado && matchCalificacion;
    });
  };

  const getActiveFiltersCount = (filtros: any) => {
    return Object.values(filtros).filter((value: any) => value !== '').length;
  };

  const handleEditEvento = (evento: Evento) => {
    setEventoSeleccionado(evento);
    setShowEventoForm(true);
  };

  const handleUpdateEvento = async (values: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      // Validar que las fechas sean válidas
      if (!values.fecha_evento || !values.hora_evento) {
        throw new Error('La fecha y hora del evento son requeridas');
      }

      // Primero actualizar la dirección
      const direccionResponse = await fetch(`${apiUrl}/direccion/${eventoSeleccionado?.direccion?.id_direccion}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_ciudad: values.id_ciudad,
          sector: values.sector,
          calle: values.calle,
          detalles: values.detalles || ''
        })
      });

      if (!direccionResponse.ok) {
        const errorData = await direccionResponse.json();
        throw new Error(errorData.message || 'Error al actualizar la dirección');
      }

      // Formatear la fecha y hora correctamente
      const fechaEvento = values.fecha_evento.format('YYYY-MM-DD');
      const horaEvento = values.hora_evento.format('HH:mm:ss');

      // Luego actualizar el evento
      const eventoResponse = await fetch(`${apiUrl}/evento/${eventoSeleccionado?.id_evento}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cedula_cliente: values.cedula_cliente,
          cedula_asesor: values.cedula_asesor,
          fecha_evento: fechaEvento,
          hora_evento: horaEvento,
          id_tipo_evento: values.id_tipo_evento,
          espacio_evento: values.espacio_evento,
          desea_supervision: values.desea_supervision,
          estado_solicitud: values.estado_solicitud,
          nota_cliente: values.nota_cliente || ''
        })
      });

      if (!eventoResponse.ok) {
        const errorData = await eventoResponse.json();
        throw new Error(errorData.message || 'Error al actualizar el evento');
      }

      message.success('Evento actualizado exitosamente');
      setShowEventoForm(false);
      setEventoSeleccionado(null);
      fetchData();
    } catch (error) {
      console.error('Error al actualizar el evento:', error);
      message.error(error instanceof Error ? error.message : 'Error al actualizar el evento');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar datos cuando se cierra el modal de usuario
  useEffect(() => {
    if (!modalUsuarioVisible) {
      fetchData();
    }
  }, [modalUsuarioVisible]);

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
        />
      </Card>
    </div>

    {/* Tercera fila: Asignación y Decoración */}
    <div className="dashboard-row">
      <Card
        title="ASIGNACIÓN DE EQUIPO"
        className="dashboard-card"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="action-button primary"
            onClick={() => setModalAsignacionVisible(true)}
          >
            Asignar Empleado
          </Button>
        }
      >
        <TableFilters
  type="asignaciones"
  searchText={searchTextAsignaciones}
  onSearchChange={setSearchTextAsignaciones}
  clearFilters={() => {
    setSearchTextAsignaciones('');
    setSelectedEvento('');
    setSelectedCargo('');
    setSelectedEmpleado('');
  }}
  activeFiltersCount={
    (selectedEvento ? 1 : 0) +
    (selectedCargo ? 1 : 0) +
    (selectedEmpleado ? 1 : 0)
  }
  filterContent={
    <div style={{ padding: '8px', minWidth: '300px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: 4 }}>Evento:</div>
          <Select
            placeholder="Filtrar por evento"
            style={{ width: '100%' }}
            onChange={handleEventoChange}
            value={selectedEvento}
            options={[
              { value: '', label: 'Todos' },
              ...eventos.map(evento => ({
                value: evento.id_evento.toString(),
                label: `ID: ${evento.id_evento} - ${evento.cliente?.nombre_usuario || ''} ${evento.cliente?.apellido_usuario || ''}`
              }))
            ]}
          />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>Empleado:</div>
          <Select
            placeholder="Filtrar por empleado"
            style={{ width: '100%' }}
            onChange={handleEmpleadoChange}
            value={selectedEmpleado}
            options={[
              { value: '', label: 'Todos' },
              ...empleados.map(empleado => ({
                value: empleado.cedula_usuario,
                label: `${empleado.nombre_usuario} ${empleado.apellido_usuario} (${empleado.cedula_usuario})`
              }))
            ]}
          />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>Cargo del empleado:</div>
          <Select
            placeholder="Filtrar por cargo"
            style={{ width: '100%' }}
            onChange={handleCargoChange}
            value={selectedCargo}
            options={[
              { value: '', label: 'Todos' },
              { value: 'Decorador', label: 'Decorador' },
              { value: 'Camarero', label: 'Camarero' },
              { value: 'Conductor', label: 'Conductor' },
              { value: 'Supervisor', label: 'Supervisor' },
              { value: 'Encargado de Logística', label: 'Encargado de Logística' },
              { value: 'Encargado de Limpieza', label: 'Encargado de Limpieza' }
            ]}
          />
        </div>
      </Space>
    </div>
  }
/>
        <Table
          className="dashboard-table"
          columns={asignacionColumns}
          dataSource={getFilteredAsignaciones()}
          loading={loading}
          pagination={{ pageSize: 3 }}
          rowKey={(record) => `${record.id_evento}-${record.empleado_evento}`}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Card
        title="DECORACIONES"
        className="dashboard-card"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="action-button primary"
            onClick={() => setModalDecoracionVisible(true)}
          >
            Nueva Decoración
          </Button>
        }
      >
        <TableFilters
  type="decoraciones"
  searchText={searchTextDecoraciones}
  onSearchChange={setSearchTextDecoraciones}
  clearFilters={() => {
    setSearchTextDecoraciones('');
    setSelectedEstadoDecoraciones('todos');
    setSelectedEvento('');
  }}
  activeFiltersCount={
    (selectedEstadoDecoraciones !== 'todos' ? 1 : 0) +
    (selectedEvento ? 1 : 0)
  }
  filterContent={
    <div style={{ padding: '8px', minWidth: '300px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: 4 }}>Estado de la decoración:</div>
          <Select
            placeholder="Filtrar por estado"
            style={{ width: '100%' }}
            onChange={handleEstadoDecoracionesChange}
            value={selectedEstadoDecoraciones}
            options={[
              { value: 'todos', label: 'Todos' },
              { value: 'Solicitado', label: 'Solicitado' },
              { value: 'Aceptado', label: 'Aceptado' },
              { value: 'Completado', label: 'Completado' },
              { value: 'Cancelado', label: 'Cancelado' }
            ]}
          />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>Evento:</div>
          <Select
            placeholder="Filtrar por evento"
            style={{ width: '100%' }}
            onChange={handleEventoChange}
            value={selectedEvento}
            options={[
              { value: '', label: 'Todos' },
              ...eventos.map(evento => ({
                value: evento.id_evento.toString(),
                label: `ID: ${evento.id_evento} - ${evento.cliente?.nombre_usuario || ''} ${evento.cliente?.apellido_usuario || ''}`
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
          columns={decoracionColumns}
          dataSource={getFilteredDecoraciones()}
          loading={loading}
          pagination={{ pageSize: 3 }}
          rowKey="id_decoracion"
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  </div>
</div>


      <EventoForm
        visible={modalEventoVisible}
        onCancel={() => setModalEventoVisible(false)}
        onSubmit={handleCreateEvento}
        loading={loading}
        clientes={clientes}
        asesores={asesores}
        tiposEvento={tiposEvento}
        provincias={provincias}
        ciudades={ciudades}
        loadingClientes={loadingClientes}
        loadingAsesores={loadingAsesores}
        loadingTipos={loadingTipos}
        loadingProvincias={loadingProvincias}
        loadingCiudades={loadingCiudades}
      />

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
      />

      <AsignacionEmpleadoForm
        visible={modalAsignacionVisible}
        onCancel={() => setModalAsignacionVisible(false)}
        onSubmit={handleCreateAsignacion}
        loading={loading}
      />

      <DecoracionForm
        visible={modalDecoracionVisible}
        onCancel={() => setModalDecoracionVisible(false)}
        onSubmit={handleCreateDecoracion}
        loading={loading}
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
            <Descriptions.Item label="ID del Evento" span={2}>{eventoSeleccionado.id_evento}</Descriptions.Item>
            <Descriptions.Item label="Cliente" span={2}>
              {`${eventoSeleccionado.cliente?.nombre_usuario || ''} ${eventoSeleccionado.cliente?.apellido_usuario || ''}`}
            </Descriptions.Item>
            <Descriptions.Item label="Asesor" span={2}>
              {eventoSeleccionado.asesor 
                ? `${eventoSeleccionado.asesor.nombre_usuario} ${eventoSeleccionado.asesor.apellido_usuario}`
                : 'No asignado'}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha">{new Date(eventoSeleccionado.fecha_evento).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Hora">{eventoSeleccionado.hora_evento}</Descriptions.Item>
            <Descriptions.Item label="Tipo de Evento" span={2}>
              {typeof eventoSeleccionado.tipo_evento === 'string'
                ? eventoSeleccionado.tipo_evento
                : eventoSeleccionado.tipo_evento.tipo_evento}
            </Descriptions.Item>
            <Descriptions.Item label="Dirección" span={2}>
              {eventoSeleccionado.direccion ? (
                <>
                  {eventoSeleccionado.direccion.calle}, {eventoSeleccionado.direccion.sector}
                  <br />
                  {eventoSeleccionado.direccion.ciudad.nombre_ciudad}, {eventoSeleccionado.direccion.ciudad.provincia.nombre_provincia}
                </>
              ) : 'No especificada'}
            </Descriptions.Item>
            <Descriptions.Item label="Espacio" span={2}>{eventoSeleccionado.espacio_evento}</Descriptions.Item>
            <Descriptions.Item label="Supervisión">{eventoSeleccionado.desea_supervision ? 'Sí' : 'No'}</Descriptions.Item>
            <Descriptions.Item label="Estado">{eventoSeleccionado.estado_solicitud}</Descriptions.Item>
            <Descriptions.Item label="Subtotal">RD$ {eventoSeleccionado.subtotal_evento?.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Descriptions.Item>
            <Descriptions.Item label="ITBIS">RD$ {eventoSeleccionado.itbis_evento?.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Descriptions.Item>
            <Descriptions.Item label="Total" span={2}>RD$ {eventoSeleccionado.total_evento?.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Descriptions.Item>
            <Descriptions.Item label="Notas del Cliente" span={2}>{eventoSeleccionado.nota_cliente || 'Sin notas'}</Descriptions.Item>
            <Descriptions.Item label="Fecha de Creación" span={2}>
              {new Date(eventoSeleccionado.creacion_evento).toLocaleString()}
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
        width={600}
      >
        {usuarioSeleccionado && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Cédula">{usuarioSeleccionado.cedula_usuario}</Descriptions.Item>
            <Descriptions.Item label="Nombre">{usuarioSeleccionado.nombre_usuario}</Descriptions.Item>
            <Descriptions.Item label="Apellido">{usuarioSeleccionado.apellido_usuario}</Descriptions.Item>
            <Descriptions.Item label="Usuario">{usuarioSeleccionado.usuario_login}</Descriptions.Item>
            <Descriptions.Item label="Correo">{usuarioSeleccionado.correo_usuario}</Descriptions.Item>
            <Descriptions.Item label="Teléfono">{usuarioSeleccionado.tel_usuario}</Descriptions.Item>
            <Descriptions.Item label="Rol">{usuarioSeleccionado.rol_nombre}</Descriptions.Item>
            <Descriptions.Item label="Estado">{usuarioSeleccionado.estado_usuario}</Descriptions.Item>
            <Descriptions.Item label="Fecha de Creación">
              {(() => {
                if (!usuarioSeleccionado.creacion_usuario) {
                  return 'No disponible';
                }
                try {
                  const fecha = new Date(usuarioSeleccionado.creacion_usuario);
                  if (isNaN(fecha.getTime())) {
                    return 'Formato de fecha inválido';
                  }
                  return fecha.toLocaleString('es-DO', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                  });
                } catch (error) {
                  console.error('Error al procesar la fecha:', error);
                  return 'Error al procesar la fecha';
                }
              })()}
            </Descriptions.Item>
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
        width={600}
      >
        {proveedorSeleccionado && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="ID">{proveedorSeleccionado.id_proveedor}</Descriptions.Item>
            <Descriptions.Item label="Tipo">{proveedorSeleccionado.tipo_proveedor}</Descriptions.Item>
            <Descriptions.Item label="Nombre">{proveedorSeleccionado.nombre_proveedor}</Descriptions.Item>
            <Descriptions.Item label="Teléfono">{proveedorSeleccionado.tel_proveedor}</Descriptions.Item>
            <Descriptions.Item label="Correo">{proveedorSeleccionado.correo_proveedor}</Descriptions.Item>
            <Descriptions.Item label="Dirección" span={2}>
              {(() => {
                if (!proveedorSeleccionado.direccion) {
                  return 'No especificada';
                }
                const { calle, sector, ciudad } = proveedorSeleccionado.direccion;
                return (
                  <>
                    {calle}, {sector}
                    <br />
                    {ciudad?.nombre_ciudad}, {ciudad?.provincia?.nombre_provincia}
                  </>
                );
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Estado">{proveedorSeleccionado.estado_proveedor}</Descriptions.Item>
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
                <Title level={4}>Elementos de Decoración</Title>
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
                      render: (precio: number) => `RD$ ${precio.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`,
                    },
                    {
                      title: 'Precio Total',
                      dataIndex: 'precio_decoracion',
                      key: 'precio_decoracion',
                      render: (precio: number) => `RD$ ${precio.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`,
                    },
                    {
                      title: 'Estado',
                      dataIndex: 'estado_detdecoracion',
                      key: 'estado_detdecoracion',
                      render: (estado: string) => (
                        <Tag color={estado === 'Aceptado' ? 'green' : 'red'}>
                          {estado}
                        </Tag>
                      ),
                    },
                    {
                      title: 'Acciones',
                      key: 'acciones',
                      render: (_, record) => (
                        <Space>
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => {
                              // Aquí irá la lógica para editar el elemento
                              console.log('Editar elemento:', record);
                            }}
                          />
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              // Aquí irá la lógica para eliminar el elemento
                              console.log('Eliminar elemento:', record);
                            }}
                          />
                        </Space>
                      ),
                    },
                  ]}
                  pagination={false}
                  rowKey="id_detdecoracion"
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
        width={600}
      >
        {asignacionSeleccionada && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Evento">
              ID: {asignacionSeleccionada.evento?.id_evento}
              <br />
              Cliente: {asignacionSeleccionada.evento?.cliente?.nombre_usuario} {asignacionSeleccionada.evento?.cliente?.apellido_usuario}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha del Evento">
              {asignacionSeleccionada.evento?.fecha_evento} {asignacionSeleccionada.evento?.hora_evento}
            </Descriptions.Item>
            <Descriptions.Item label="Empleado">
              {asignacionSeleccionada.empleado?.nombre_usuario} {asignacionSeleccionada.empleado?.apellido_usuario}
            </Descriptions.Item>
            <Descriptions.Item label="Cédula del Empleado">
              {asignacionSeleccionada.empleado?.cedula_usuario}
            </Descriptions.Item>
            <Descriptions.Item label="Puesto">{asignacionSeleccionada.puesto_evento}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Formulario de Edición de Evento */}
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
      />

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

            const response = await fetch(`${apiUrl}/proveedor/${proveedorSeleccionado?.id_proveedor}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(values)
            });

            if (!response.ok) {
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
      <AsignacionEmpleadoForm
        visible={showAsignacionForm}
        onCancel={() => {
          setShowAsignacionForm(false);
          setAsignacionSeleccionada(null);
        }}
        onSubmit={async (values) => {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              message.error('No hay sesión activa');
              return;
            }

            const response = await fetch(`${apiUrl}/asignacion/${asignacionSeleccionada?.id_evento}/${asignacionSeleccionada?.empleado_evento}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(values)
            });

            if (!response.ok) {
              throw new Error('Error al actualizar la asignación');
            }

            message.success('Asignación actualizada exitosamente');
            setShowAsignacionForm(false);
            setAsignacionSeleccionada(null);
            fetchData();
          } catch (error) {
            console.error('Error al actualizar la asignación:', error);
            message.error('Error al actualizar la asignación');
          }
        }}
        loading={loading}
      />

      {/* Formulario de Edición de Decoración */}
      <DecoracionForm
        visible={showDecoracionForm}
        onCancel={() => {
          setShowDecoracionForm(false);
          setDecoracionSeleccionada(null);
        }}
        onSubmit={async (values) => {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              message.error('No hay sesión activa');
              return;
            }

            const response = await fetch(`${apiUrl}/decoracion/${decoracionSeleccionada?.id_decoracion}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(values)
            });

            if (!response.ok) {
              throw new Error('Error al actualizar la decoración');
            }

            message.success('Decoración actualizada exitosamente');
            setShowDecoracionForm(false);
            setDecoracionSeleccionada(null);
            fetchData();
          } catch (error) {
            console.error('Error al actualizar la decoración:', error);
            message.error('Error al actualizar la decoración');
          }
        }}
        loading={loading}
        initialValues={decoracionSeleccionada}
      />

      {/* Tarjeta de Pagos y Comentarios en formato dashboard */}
      <div className="dashboard-row">
        <Card
          title="PAGOS"
          className="dashboard-card"
          extra={
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => setShowPagosFilters(!showPagosFilters)}
              className="action-button primary"
            >
              Filtros {getActiveFiltersCount(filtrosPagos) > 0 && `(${getActiveFiltersCount(filtrosPagos)})`}
            </Button>
          }
        >
          <TableFilters
            type="pagos"
            searchText={filtrosPagos.evento}
            onSearchChange={e => setFiltrosPagos({ ...filtrosPagos, evento: e.target.value })}
            clearFilters={() => setFiltrosPagos({ estado: '', evento: '', metodo: '', tipo: '' })}
            activeFiltersCount={getActiveFiltersCount(filtrosPagos)}
            filterContent={
              <div style={{ padding: '8px', minWidth: '300px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <div style={{ marginBottom: 4 }}>Estado del pago:</div>
                    <Select
                      placeholder="Filtrar por estado"
                      style={{ width: '100%' }}
                      onChange={value => setFiltrosPagos({ ...filtrosPagos, estado: value })}
                      value={filtrosPagos.estado}
                      allowClear
                    >
                      <Select.Option value="">Todos</Select.Option>
                      <Select.Option value="Pendiente">Pendiente</Select.Option>
                      <Select.Option value="Recibido">Recibido</Select.Option>
                      <Select.Option value="Rechazado">Rechazado</Select.Option>
                    </Select>
                  </div>
                  <div>
                    <div style={{ marginBottom: 4 }}>Tipo de pago:</div>
                    <Select
                      placeholder="Filtrar por tipo"
                      style={{ width: '100%' }}
                      onChange={value => setFiltrosPagos({ ...filtrosPagos, tipo: value })}
                      value={filtrosPagos.tipo}
                      allowClear
                    >
                      <Select.Option value="">Todos</Select.Option>
                      <Select.Option value="Inicial">Inicial</Select.Option>
                      <Select.Option value="Final">Final</Select.Option>
                      <Select.Option value="Adicional">Adicional</Select.Option>
                    </Select>
                  </div>
                  <div>
                    <div style={{ marginBottom: 4 }}>Método de pago:</div>
                    <Select
                      placeholder="Filtrar por método"
                      style={{ width: '100%' }}
                      onChange={value => setFiltrosPagos({ ...filtrosPagos, metodo: value })}
                      value={filtrosPagos.metodo}
                      allowClear
                    >
                      <Select.Option value="">Todos</Select.Option>
                      <Select.Option value="Efectivo">Efectivo</Select.Option>
                      <Select.Option value="Tarjeta">Tarjeta</Select.Option>
                      <Select.Option value="Transferencia">Transferencia</Select.Option>
                    </Select>
                  </div>
                  <div>
                    <div style={{ marginBottom: 4 }}>ID de evento:</div>
                    <Input
                      placeholder="Buscar por ID de evento"
                      value={filtrosPagos.evento}
                      onChange={e => setFiltrosPagos({ ...filtrosPagos, evento: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </Space>
              </div>
            }
          />
          <Table
            className="dashboard-table"
            dataSource={getFilteredPagos()}
            columns={[
              {
                title: 'Evento',
                dataIndex: 'evento',
                key: 'evento',
                render: (evento) => evento ? `${evento.id_evento} - ${evento.cliente?.nombre_usuario} ${evento.cliente?.apellido_usuario}` : 'N/A'
              },
              {
                title: 'Método de Pago',
                dataIndex: 'metodo_pago',
                key: 'metodo_pago'
              },
              {
                title: 'Fecha y Hora',
                dataIndex: 'fecha_pago',
                key: 'fecha_pago',
                render: (fecha, record) => `${fecha} ${record.hora_pago}`
              },
              {
                title: 'Monto',
                dataIndex: 'monto_pago',
                key: 'monto_pago',
                render: (monto) => `RD$ ${monto.toFixed(2)}`
              },
              {
                title: 'Tipo',
                dataIndex: 'tipo_pago',
                key: 'tipo_pago'
              },
              {
                title: 'Estado',
                dataIndex: 'estado_pago',
                key: 'estado_pago',
                render: (estado) => (
                  <Tag color={
                    estado === 'Recibido' ? 'green' :
                    estado === 'Pendiente' ? 'orange' :
                    'red'
                  }>
                    {estado}
                  </Tag>
                )
              }
            ]}
            rowKey="id_pago"
            loading={loading}
            pagination={{ pageSize: 3 }}
            scroll={{ x: 'max-content' }}
          />
        </Card>

        <Card
          title="COMENTARIOS Y CALIFICACIONES"
          className="dashboard-card"
          extra={
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => setShowComentariosFilters(!showComentariosFilters)}
              className="action-button primary"
            >
              Filtros {getActiveFiltersCount(filtrosComentarios) > 0 && `(${getActiveFiltersCount(filtrosComentarios)})`}
            </Button>
          }
        >
          <TableFilters
            type="comentarios"
            searchText={filtrosComentarios.calificacion}
            onSearchChange={e => setFiltrosComentarios({ ...filtrosComentarios, calificacion: e.target.value })}
            clearFilters={() => setFiltrosComentarios({ estado: '', calificacion: '' })}
            activeFiltersCount={getActiveFiltersCount(filtrosComentarios)}
            filterContent={
              <div style={{ padding: '8px', minWidth: '300px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <div style={{ marginBottom: 4 }}>Estado del comentario:</div>
                    <Select
                      placeholder="Filtrar por estado"
                      style={{ width: '100%' }}
                      onChange={value => setFiltrosComentarios({ ...filtrosComentarios, estado: value })}
                      value={filtrosComentarios.estado}
                      allowClear
                    >
                      <Select.Option value="">Todos</Select.Option>
                      <Select.Option value="Activo">Activo</Select.Option>
                      <Select.Option value="Editado">Editado</Select.Option>
                      <Select.Option value="Eliminado">Eliminado</Select.Option>
                    </Select>
                  </div>
                  <div>
                    <div style={{ marginBottom: 4 }}>Calificación:</div>
                    <Select
                      placeholder="Filtrar por calificación"
                      style={{ width: '100%' }}
                      onChange={value => setFiltrosComentarios({ ...filtrosComentarios, calificacion: value })}
                      value={filtrosComentarios.calificacion}
                      allowClear
                    >
                      <Select.Option value="">Todas</Select.Option>
                      <Select.Option value="1">1 estrella</Select.Option>
                      <Select.Option value="2">2 estrellas</Select.Option>
                      <Select.Option value="3">3 estrellas</Select.Option>
                      <Select.Option value="4">4 estrellas</Select.Option>
                      <Select.Option value="5">5 estrellas</Select.Option>
                    </Select>
                  </div>
                </Space>
              </div>
            }
          />
          <Table
            className="dashboard-table"
            dataSource={getFilteredComentarios()}
            columns={[
              {
                title: 'Evento',
                dataIndex: 'evento',
                key: 'evento',
                render: (evento, record) =>
                  record.id_evento +
                  (evento && evento.cliente
                    ? ' - ' + evento.cliente.nombre_usuario + ' ' + evento.cliente.apellido_usuario
                    : '')
              },
              {
                title: 'Comentario',
                dataIndex: 'comentario',
                key: 'comentario',
                render: (comentario) => (
                  <span style={{ whiteSpace: 'pre-line', wordBreak: 'break-word', maxWidth: 250, display: 'block' }}>
                    {comentario}
                  </span>
                )
              },
              {
                title: 'Calificación',
                dataIndex: 'calificacion',
                key: 'calificacion',
                render: (calificacion) => <Rate disabled defaultValue={calificacion} />
              },
              {
                title: 'Estado',
                dataIndex: 'estado_comentario',
                key: 'estado_comentario',
                render: (estado) => (
                  <Tag color={
                    estado === 'Activo' ? 'green' :
                    estado === 'Editado' ? 'orange' :
                    estado === 'Eliminado' ? 'red' : 'red'
                  }>
                    {estado}
                  </Tag>
                )
              }
            ]}
            rowKey="id_comentario"
            loading={loading}
            pagination={{ pageSize: 3 }}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </div>
    </div>
  );
};

export default WelcomeAdmin;