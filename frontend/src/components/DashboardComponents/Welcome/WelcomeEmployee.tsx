import { useState, useEffect } from "react";
import { Card, Typography, Table, Button, Modal, Select, DatePicker, List, Rate, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, TeamOutlined } from "@ant-design/icons";
import "../../../styles/dashboard/ServicesSubpages.scss";
import EventoForm from "../FormService/EventoForm";
import { message } from 'antd';
import AsignacionEmpleadoForm from "../FormService/AsignacionEmpleadoForm";
import TableFilters from "../MoreDash/TableFilters";
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Title } = Typography;

interface Evento {
  id_evento: number;
  tipo_evento: {
    id_tipo_evento: number;
    tipo_evento: string;
  };
  fecha_evento: Dayjs | null;
  hora_evento: Dayjs | null;
  estado_solicitud: string;
  sector: string;
  calle: string;
  detalles: string;
  cedula_cliente: string;
  cedula_asesor: string;
  id_tipo_evento: number;
  nota_cliente: string;
  id_direccion: number;
  espacio_evento: string;
  desea_supervision: boolean;
  cliente: {
    cedula_usuario: string;
    nombre_usuario: string;
    apellido_usuario: string;
  };
  asesor: {
    cedula_usuario: string;
    nombre_usuario: string;
    apellido_usuario: string;
  };
}

interface AsignacionEmpleado {
  id_evento: number;
  empleado_evento: string;
  puesto_evento: 'Decorador' | 'Camarero' | 'Conductor' | 'Supervisor' | 'Encargado de Logística' | 'Encargado de Limpieza';
  estado_empevento: 'Activo' | 'Eliminado' | 'Completado';
  evento?: {
    id_evento: number;
    fecha_evento: string;
    hora_evento: string;
    tipo_evento?: {
      id_tipo_evento: number;
      tipo_evento: string;
    };
    cliente?: {
      cedula_usuario: string;
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

interface Cliente {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
  telefono_usuario: string;
  correo_usuario: string;
  estado_usuario: string;
}

interface TipoEvento {
  id_tipo_evento: number;
  tipo_evento: string;
}

interface Asesor {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
}

interface Empleado {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
  rol_usuario: string;
  estado_usuario: string;
}

interface EventoFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: EventoFormValues) => Promise<void>;
  loading: boolean;
  clientes: Cliente[];
  asesores: Asesor[];
  tiposEvento: TipoEvento[];
  initialValues?: Evento | null;
}

interface EventoFormValues {
  id_evento: number;
  cedula_cliente: string;
  cedula_asesor?: string;
  id_tipo_evento: number;
  fecha_evento: string;
  hora_evento: string;
  id_provincia: number;
  id_ciudad: number;
  sector: string;
  calle: string;
  detalles?: string;
  espacio_evento: string;
  estado_solicitud: string;
  desea_supervision: boolean;
  nota_cliente?: string;
}

interface AsignacionEmpleadoFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: AsignacionEmpleadoFormValues) => Promise<void>;
  loading: boolean;
  empleados: Empleado[];
  eventos: Evento[];
  initialValues?: AsignacionEmpleado | null;
}

interface AsignacionEmpleadoFormValues {
  id_evento: number;
  empleado_evento: string;
  puesto_evento: 'Decorador' | 'Camarero' | 'Conductor' | 'Supervisor' | 'Encargado de Logística' | 'Encargado de Limpieza';
}

interface Comentario {
  id_comentario: number;
  id_evento: number;
  calificacion: number;
  comentario: string;
  fecha_comentario: string;
  evento?: Evento;
}

const WelcomeEmployee: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [empleadosEventos, setEmpleadosEventos] = useState<AsignacionEmpleado[]>([]);
  const [empleadosParticipantes, setEmpleadosParticipantes] = useState<AsignacionEmpleado[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalEventoVisible, setModalEventoVisible] = useState(false);
  const [modalAsignacionVisible, setModalAsignacionVisible] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [selectedAsignacion, setSelectedAsignacion] = useState<AsignacionEmpleado | null>(null);
  const [userCedula, setUserCedula] = useState<string | null>(null);
  const [modalDetallesEventoVisible, setModalDetallesEventoVisible] = useState(false);
  const [modalDetallesClienteVisible, setModalDetallesClienteVisible] = useState(false);
  const [eventoDetalles, setEventoDetalles] = useState<Evento | null>(null);
  const [clienteDetalles, setClienteDetalles] = useState<Cliente | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filtrosEventos, setFiltrosEventos] = useState({
    estado: '',
    tipo: '',
    fecha: ''
  });
  const [filtrosAsignaciones, setFiltrosAsignaciones] = useState({
    rol: '',
    estado: ''
  });
  const [filtrosParticipaciones, setFiltrosParticipaciones] = useState({
    rol: '',
    estado: ''
  });
  const [filtrosClientes, setFiltrosClientes] = useState({
    estado: ''
  });
  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('No hay sesión activa');
          return;
        }

        const response = await fetch(`${apiUrl}/auth/current`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener datos del usuario');
        }

        const userData = await response.json();
        setUserCedula(userData.cedula_usuario);
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        message.error('Error al obtener datos del usuario');
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (userCedula) {
      fetchData();
    }
  }, [userCedula]);

  useEffect(() => {
    fetchTiposEvento();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      // Obtener eventos
      const eventosResponse = await fetch(`${apiUrl}/evento`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!eventosResponse.ok) {
        throw new Error('Error al cargar los eventos');
      }
      const eventosData = await eventosResponse.json();
      setEventos(eventosData.eventos || []);

      // Obtener asignaciones de empleados
      const asignacionesResponse = await fetch(`${apiUrl}/evento/asignar-empleados`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!asignacionesResponse.ok) {
        throw new Error('Error al cargar las asignaciones');
      }
      const asignacionesData = await asignacionesResponse.json();
      setEmpleadosEventos(asignacionesData || []);

      // Obtener participaciones del empleado actual
      if (userCedula) {
        const participacionesResponse = await fetch(`${apiUrl}/evento/empleados/${userCedula}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!participacionesResponse.ok) {
          throw new Error('Error al cargar las participaciones');
        }
        const participacionesData = await participacionesResponse.json();
        setEmpleadosParticipantes(participacionesData || []);
      }

      // Obtener tipos de evento
      const tiposEventoResponse = await fetch(`${apiUrl}/evento/tipos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!tiposEventoResponse.ok) {
        throw new Error('Error al cargar los tipos de evento');
      }
      const tiposEventoData = await tiposEventoResponse.json();
      setTiposEvento(tiposEventoData.tipos || []);

      // Obtener asesores
      const asesoresResponse = await fetch(`${apiUrl}/usuario/asesores`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (asesoresResponse.ok) {
        const asesoresData = await asesoresResponse.json();
        setAsesores(asesoresData);
      }

      // Obtener empleados
      const empleadosResponse = await fetch(`${apiUrl}/usuario/empleados`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (empleadosResponse.ok) {
        const empleadosData = await empleadosResponse.json();
        setEmpleados(empleadosData);
      }

      // Obtener comentarios de los eventos asignados
      const comentariosResponse = await fetch(`${apiUrl}/comentarios/empleado/${userCedula}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!comentariosResponse.ok) {
        throw new Error('Error al cargar los comentarios');
      }

      const comentariosData = await comentariosResponse.json();
      setComentarios(comentariosData);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchTiposEvento = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const response = await fetch(`${apiUrl}/evento/tipo-eventos/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Error al obtener tipos de evento');
      }
      const data = await response.json();
      setTiposEvento(data);
    } catch (error) {
      console.error('Error al cargar tipos de evento:', error);
      message.error('Error al cargar los tipos de evento');
    }
  };

  const handleCreateEvento = () => {
    setSelectedEvento(null);
    setModalEventoVisible(true);
  };

  const handleEditEvento = (evento: Evento) => {
    setSelectedEvento(evento);
    setModalEventoVisible(true);
  };

  const handleEliminarEvento = async (evento: Evento) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const response = await fetch(`${apiUrl}/evento/${evento.id_evento}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el evento');
      }

      message.success('Evento eliminado exitosamente');
      fetchData();
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      message.error('Error al eliminar el evento');
    }
  };

  const handleVerDetallesEvento = (evento: Evento) => {
    setSelectedEvento(evento);
    // Implementar lógica para mostrar detalles
  };

  const handleVerDetallesAsignacion = (asignacion: AsignacionEmpleado) => {
    if (!asignacion.evento || !asignacion.empleado) {
      message.error('Datos incompletos de la asignación');
      return;
    }

    const eventoDetalles: Evento = {
      id_evento: asignacion.evento.id_evento,
      tipo_evento: {
        id_tipo_evento: asignacion.evento.tipo_evento?.id_tipo_evento || 0,
        tipo_evento: asignacion.evento.tipo_evento?.tipo_evento || 'No especificado'
      },
      fecha_evento: dayjs(asignacion.evento.fecha_evento),
      hora_evento: dayjs(asignacion.evento.hora_evento),
      estado_solicitud: '',
      sector: '',
      calle: '',
      detalles: '',
      cedula_cliente: asignacion.evento.cliente?.cedula_usuario || '',
      cedula_asesor: '',
      id_tipo_evento: asignacion.evento.tipo_evento?.id_tipo_evento || 0,
      nota_cliente: '',
      id_direccion: 0,
      espacio_evento: '',
      desea_supervision: false,
      cliente: asignacion.evento.cliente || {
        cedula_usuario: '',
        nombre_usuario: '',
        apellido_usuario: ''
      },
      asesor: {
        cedula_usuario: '',
        nombre_usuario: '',
        apellido_usuario: ''
      }
    };
    setEventoDetalles(eventoDetalles);
    setModalDetallesEventoVisible(true);
  };

  const handleEditarAsignacion = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay token de autenticación');
        return;
      }

      setLoading(true);
      const response = await fetch(`${apiUrl}/evento/${values.id_evento}/empleados/${values.empleado_evento}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          puesto_evento: values.puesto_evento
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar la asignación');
      }

      message.success('Asignación actualizada exitosamente');
      setModalAsignacionVisible(false);
      fetchData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Error al actualizar la asignación');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarAsignacion = async (asignacion: AsignacionEmpleado) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay token de autenticación');
        return;
      }

      setLoading(true);
      const response = await fetch(`${apiUrl}/evento/${asignacion.id_evento}/empleados/${asignacion.empleado_evento}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar la asignación');
      }

      message.success('Asignación eliminada exitosamente');
      fetchData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Error al eliminar la asignación');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetallesParticipacion = (participacion: AsignacionEmpleado) => {
    if (!participacion.evento || !participacion.empleado) {
      message.error('Datos incompletos de la participación');
      return;
    }

    const eventoDetalles: Evento = {
      id_evento: participacion.evento.id_evento,
      tipo_evento: {
        id_tipo_evento: participacion.evento.tipo_evento?.id_tipo_evento || 0,
        tipo_evento: participacion.evento.tipo_evento?.tipo_evento || 'No especificado'
      },
      fecha_evento: dayjs(participacion.evento.fecha_evento),
      hora_evento: dayjs(participacion.evento.hora_evento),
      estado_solicitud: '',
      sector: '',
      calle: '',
      detalles: '',
      cedula_cliente: participacion.evento.cliente?.cedula_usuario || '',
      cedula_asesor: '',
      id_tipo_evento: participacion.evento.tipo_evento?.id_tipo_evento || 0,
      nota_cliente: '',
      id_direccion: 0,
      espacio_evento: '',
      desea_supervision: false,
      cliente: participacion.evento.cliente || {
        cedula_usuario: '',
        nombre_usuario: '',
        apellido_usuario: ''
      },
      asesor: {
        cedula_usuario: '',
        nombre_usuario: '',
        apellido_usuario: ''
      }
    };
    setEventoDetalles(eventoDetalles);
    setModalDetallesEventoVisible(true);
  };

  const handleVerDetallesCliente = (cliente: Cliente) => {
    setClienteDetalles(cliente);
    setModalDetallesClienteVisible(true);
  };

  // Funciones de filtrado
  const getFilteredEventos = () => {
    return eventos.filter(evento => {
      const matchesSearch = 
        evento.tipo_evento.tipo_evento.toLowerCase().includes(searchText.toLowerCase()) ||
        evento.cliente?.nombre_usuario.toLowerCase().includes(searchText.toLowerCase()) ||
        evento.cliente?.apellido_usuario.toLowerCase().includes(searchText.toLowerCase());

      const matchesEstado = !filtrosEventos.estado || evento.estado_solicitud === filtrosEventos.estado;
      const matchesTipo = !filtrosEventos.tipo || evento.tipo_evento.tipo_evento === filtrosEventos.tipo;
      const matchesFecha = !filtrosEventos.fecha || evento.fecha_evento?.format('YYYY-MM-DD') === filtrosEventos.fecha;

      return matchesSearch && matchesEstado && matchesTipo && matchesFecha;
    });
  };

  const getFilteredAsignaciones = () => {
    return empleadosEventos.filter(asignacion => {
      const searchMatch = searchText === '' || 
        asignacion.evento?.tipo_evento?.tipo_evento?.toLowerCase().includes(searchText.toLowerCase()) ||
        asignacion.empleado?.nombre_usuario?.toLowerCase().includes(searchText.toLowerCase()) ||
        asignacion.empleado?.apellido_usuario?.toLowerCase().includes(searchText.toLowerCase());

      const rolMatch = !filtrosAsignaciones.rol || asignacion.puesto_evento === filtrosAsignaciones.rol;
      const estadoMatch = !filtrosAsignaciones.estado || asignacion.estado_empevento === filtrosAsignaciones.estado;

      return searchMatch && rolMatch && estadoMatch;
    });
  };

  const getFilteredParticipaciones = () => {
    return empleadosParticipantes.filter(participacion => {
      const searchMatch = searchText === '' || 
        participacion.evento?.tipo_evento?.tipo_evento?.toLowerCase().includes(searchText.toLowerCase()) ||
        participacion.empleado?.nombre_usuario?.toLowerCase().includes(searchText.toLowerCase()) ||
        participacion.empleado?.apellido_usuario?.toLowerCase().includes(searchText.toLowerCase());

      const matchesRol = !filtrosParticipaciones.rol || participacion.puesto_evento === filtrosParticipaciones.rol;
      const matchesEstado = !filtrosParticipaciones.estado || participacion.estado_empevento === filtrosParticipaciones.estado;

      return searchMatch && matchesRol && matchesEstado;
    });
  };

  const getFilteredClientes = () => {
    return clientes.filter(cliente => {
      const matchesSearch = 
        cliente.nombre_usuario.toLowerCase().includes(searchText.toLowerCase()) ||
        cliente.apellido_usuario.toLowerCase().includes(searchText.toLowerCase()) ||
        cliente.cedula_usuario.toLowerCase().includes(searchText.toLowerCase());

      const matchesEstado = !filtrosClientes.estado || cliente.estado_usuario === filtrosClientes.estado;

      return matchesSearch && matchesEstado;
    });
  };

  // Contenido de los filtros
  const filterContentEventos = (
    <div style={{ padding: '8px' }}>
      <Select
        style={{ width: '100%', marginBottom: '8px' }}
        placeholder="Estado"
        allowClear
        onChange={(value) => setFiltrosEventos(prev => ({ ...prev, estado: value }))}
      >
        <Select.Option value="pendiente">Pendiente</Select.Option>
        <Select.Option value="aprobado">Aprobado</Select.Option>
        <Select.Option value="rechazado">Rechazado</Select.Option>
      </Select>
      <Select
        style={{ width: '100%', marginBottom: '8px' }}
        placeholder="Tipo de Evento"
        allowClear
        onChange={(value) => setFiltrosEventos(prev => ({ ...prev, tipo: value }))}
      >
        {tiposEvento.map(tipo => (
          <Select.Option key={tipo.id_tipo_evento} value={tipo.tipo_evento}>
            {tipo.tipo_evento}
          </Select.Option>
        ))}
      </Select>
      <DatePicker
        style={{ width: '100%' }}
        placeholder="Fecha"
        onChange={(date) => setFiltrosEventos(prev => ({ ...prev, fecha: date?.format('YYYY-MM-DD') || '' }))}
      />
    </div>
  );

  const filterContentAsignaciones = (
    <div style={{ padding: '8px' }}>
      <Select
        style={{ width: '100%', marginBottom: '8px' }}
        placeholder="Rol"
        allowClear
        onChange={(value) => setFiltrosAsignaciones(prev => ({ ...prev, rol: value }))}
      >
        <Select.Option value="supervisor">Supervisor</Select.Option>
        <Select.Option value="ayudante">Ayudante</Select.Option>
        <Select.Option value="mesero">Mesero</Select.Option>
      </Select>
      <Select
        style={{ width: '100%' }}
        placeholder="Estado"
        allowClear
        onChange={(value) => setFiltrosAsignaciones(prev => ({ ...prev, estado: value }))}
      >
        <Select.Option value="Activo">Activo</Select.Option>
        <Select.Option value="Completado">Completado</Select.Option>
        <Select.Option value="Eliminado">Eliminado</Select.Option>
      </Select>
    </div>
  );

  const filterContentParticipaciones = (
    <div style={{ padding: '8px' }}>
      <Select
        style={{ width: '100%', marginBottom: '8px' }}
        placeholder="Rol"
        allowClear
        onChange={(value) => setFiltrosParticipaciones(prev => ({ ...prev, rol: value }))}
      >
        <Select.Option value="supervisor">Supervisor</Select.Option>
        <Select.Option value="ayudante">Ayudante</Select.Option>
        <Select.Option value="mesero">Mesero</Select.Option>
      </Select>
      <Select
        style={{ width: '100%' }}
        placeholder="Estado"
        allowClear
        onChange={(value) => setFiltrosParticipaciones(prev => ({ ...prev, estado: value }))}
      >
        <Select.Option value="Activo">Activo</Select.Option>
        <Select.Option value="Completado">Completado</Select.Option>
        <Select.Option value="Eliminado">Eliminado</Select.Option>
      </Select>
    </div>
  );

  const filterContentClientes = (
    <div style={{ padding: '8px' }}>
      <Select
        style={{ width: '100%' }}
        placeholder="Estado"
        allowClear
        onChange={(value) => setFiltrosClientes(prev => ({ ...prev, estado: value }))}
      >
        <Select.Option value="activo">Activo</Select.Option>
        <Select.Option value="inactivo">Inactivo</Select.Option>
      </Select>
    </div>
  );

  // Contar filtros activos
  const getActiveFiltersCount = (filtros: any) => {
    return Object.values(filtros).filter(value => value !== '').length;
  };

  const eventosColumns = [
    {
      title: 'Tipo de Evento',
      dataIndex: ['tipo_evento', 'tipo_evento'],
      key: 'tipo_evento',
    },
    {
      title: 'Cliente',
      dataIndex: ['cliente'],
      key: 'cliente',
      render: (cliente: any) => `${cliente.nombre_usuario} ${cliente.apellido_usuario}`,
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_evento',
      key: 'fecha_evento',
      render: (fecha: Dayjs) => fecha?.format('DD/MM/YYYY'),
    },
    {
      title: 'Hora',
      dataIndex: 'hora_evento',
      key: 'hora_evento',
      render: (hora: Dayjs) => hora?.format('HH:mm'),
    },
    {
      title: 'Estado',
      dataIndex: 'estado_solicitud',
      key: 'estado_solicitud',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Evento) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleVerDetallesEvento(record)} />
          <Button icon={<EditOutlined />} onClick={() => handleEditEvento(record)} />
          <Button icon={<DeleteOutlined />} onClick={() => handleEliminarEvento(record)} danger />
        </Space>
      ),
    },
  ];

  const clientesColumns = [
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
      title: 'Teléfono',
      dataIndex: 'telefono_usuario',
      key: 'telefono_usuario',
    },
    {
      title: 'Correo',
      dataIndex: 'correo_usuario',
      key: 'correo_usuario',
    },
    {
      title: 'Estado',
      dataIndex: 'estado_usuario',
      key: 'estado_usuario',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Cliente) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleVerDetallesCliente(record)} />
        </Space>
      ),
    },
  ];

  const participacionesColumns = [
    {
      title: 'Evento',
      dataIndex: ['evento', 'tipo_evento', 'tipo_evento'],
      key: 'tipo_evento',
    },
    {
      title: 'Cliente',
      dataIndex: ['evento', 'cliente'],
      key: 'cliente',
      render: (cliente: any) => cliente ? `${cliente.nombre_usuario} ${cliente.apellido_usuario}` : 'N/A',
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
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: AsignacionEmpleado) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleVerDetallesParticipacion(record)} />
        </Space>
      ),
    },
  ];

  const asignacionesColumns = [
    {
      title: 'Evento',
      dataIndex: ['evento', 'tipo_evento', 'tipo_evento'],
      key: 'tipo_evento',
    },
    {
      title: 'Cliente',
      dataIndex: ['evento', 'cliente'],
      key: 'cliente',
      render: (cliente: any) => cliente ? `${cliente.nombre_usuario} ${cliente.apellido_usuario}` : 'N/A',
    },
    {
      title: 'Empleado',
      dataIndex: ['empleado'],
      key: 'empleado',
      render: (empleado: any) => empleado ? `${empleado.nombre_usuario} ${empleado.apellido_usuario}` : 'N/A',
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
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: AsignacionEmpleado) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleVerDetallesAsignacion(record)} />
          <Button icon={<EditOutlined />} onClick={() => {
            setSelectedAsignacion(record);
            setModalAsignacionVisible(true);
          }} />
          <Button icon={<DeleteOutlined />} onClick={() => handleEliminarAsignacion(record)} danger />
        </Space>
      ),
    },
  ];
  

  return (
    <div className="welcome-container">
      <Card className="welcome-card">
        <Title level={2} className="welcome-title">
          ¡Te damos la bienvenida a tu panel de Empleado!
        </Title>
        <p className="welcome-subtitle">
          Aquí podrás gestionar tus tareas y servicios asignados
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
                  onClick={handleCreateEvento}
                >
                  Crear Evento
                </Button>
              }
            >
              <TableFilters
                type="eventos"
                searchText={searchText}
                onSearchChange={setSearchText}
                clearFilters={() => setFiltrosEventos({ estado: '', tipo: '', fecha: '' })}
                activeFiltersCount={getActiveFiltersCount(filtrosEventos)}
                filterContent={filterContentEventos}
              />
              <Table
                className="dashboard-table"
                columns={eventosColumns}
                dataSource={getFilteredEventos()}
                loading={loading}
                pagination={{ pageSize: 3 }}
                rowKey="id_evento"
                scroll={{ x: 'max-content' }}
              />
            </Card>
          </div>

          {/* Segunda fila: Asignaciones y Participaciones */}
          <div className="dashboard-row">
            <Card
              title="ASIGNACIONES (ASESOR)"
              className="dashboard-card"
              extra={
                <Button
                  type="primary"
                  icon={<TeamOutlined />}
                  className="action-button primary"
                  onClick={() => {
                    setSelectedAsignacion(null);
                    setModalAsignacionVisible(true);
                  }}
                >
                  Asignar Empleado
                </Button>
              }
            >
              <TableFilters
                type="asignaciones"
                searchText={searchText}
                onSearchChange={setSearchText}
                clearFilters={() => setFiltrosAsignaciones({ rol: '', estado: '' })}
                activeFiltersCount={getActiveFiltersCount(filtrosAsignaciones)}
                filterContent={filterContentAsignaciones}
              />
              <Table
                className="dashboard-table"
                columns={asignacionesColumns}
                dataSource={getFilteredAsignaciones()}
                loading={loading}
                pagination={{ pageSize: 3 }}
                rowKey={(record) => `${record.id_evento}-${record.empleado_evento}`}
                scroll={{ x: 'max-content' }}
              />
            </Card>

            <Card
              title="PARTICIPACIONES"
              className="dashboard-card"
            >
              <TableFilters
                type="participaciones"
                searchText={searchText}
                onSearchChange={setSearchText}
                clearFilters={() => setFiltrosParticipaciones({ rol: '', estado: '' })}
                activeFiltersCount={getActiveFiltersCount(filtrosParticipaciones)}
                filterContent={filterContentParticipaciones}
              />
              <Table
                className="dashboard-table"
                columns={participacionesColumns}
                dataSource={getFilteredParticipaciones()}
                loading={loading}
                pagination={{ pageSize: 3 }}
                rowKey={(record) => `${record.id_evento}-${record.empleado_evento}`}
                scroll={{ x: 'max-content' }}
              />
            </Card>
          </div>

          {/* Tercera fila: Clientes y Comentarios */}
          <div className="dashboard-row">
            <Card
              title="CLIENTES REGISTRADOS"
              className="dashboard-card"
            >
              <TableFilters
                type="clientes"
                searchText={searchText}
                onSearchChange={setSearchText}
                clearFilters={() => setFiltrosClientes({ estado: '' })}
                activeFiltersCount={getActiveFiltersCount(filtrosClientes)}
                filterContent={filterContentClientes}
              />
              <Table
                className="dashboard-table"
                columns={clientesColumns}
                dataSource={getFilteredClientes()}
                loading={loading}
                pagination={{ pageSize: 3 }}
                rowKey="cedula_usuario"
                scroll={{ x: 'max-content' }}
              />
            </Card>

            <Card
              title="COMENTARIOS"
              className="dashboard-card"
            >
              <List
                loading={loadingComentarios}
                dataSource={comentarios}
                renderItem={(comentario) => (
                  <List.Item>
                    <Card style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div>
                          <strong>Evento:</strong> {comentario.evento?.tipo_evento?.tipo_evento || 'N/A'}
                        </div>
                        <div>
                          <Rate disabled defaultValue={comentario.calificacion} />
                        </div>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <strong>Comentario:</strong> {comentario.comentario}
                      </div>
                      <div style={{ color: '#888', fontSize: '12px' }}>
                        Fecha: {new Date(comentario.fecha_comentario).toLocaleString()}
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </div>
      </div>


      {/* Modal de Asignación */}
      {modalAsignacionVisible && selectedAsignacion && (
        <AsignacionEmpleadoForm
          visible={modalAsignacionVisible}
          onCancel={() => {
            setModalAsignacionVisible(false);
            setSelectedAsignacion(null);
          }}
          onSubmit={async (values: AsignacionEmpleadoFormValues) => {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                message.error('No hay token de autenticación');
                return;
              }

              setLoading(true);
              const response = await fetch(`${apiUrl}/evento/asignar-empleados`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al asignar el empleado');
              }

              message.success('Empleado asignado exitosamente');
              setModalAsignacionVisible(false);
              setSelectedAsignacion(null);
              fetchData();
            } catch (error) {
              message.error(error instanceof Error ? error.message : 'Error al asignar el empleado');
            } finally {
              setLoading(false);
            }
          }}
          loading={loading}
          empleados={empleados}
          eventos={eventos}
          initialValues={selectedAsignacion}
        />
      )}

      {/* Modal de Detalles de Evento */}
      <Modal
        title="Detalles del Evento"
        open={modalDetallesEventoVisible}
        onCancel={() => {
          setModalDetallesEventoVisible(false);
          setEventoDetalles(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setModalDetallesEventoVisible(false);
            setEventoDetalles(null);
          }}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {eventoDetalles && (
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3>Información del Evento</h3>
              <p><strong>Tipo de Evento:</strong> {eventoDetalles.tipo_evento.tipo_evento}</p>
              <p><strong>Fecha:</strong> {eventoDetalles.fecha_evento?.format('DD/MM/YYYY')}</p>
              <p><strong>Hora:</strong> {eventoDetalles.hora_evento?.format('HH:mm')}</p>
              <p><strong>Estado:</strong> {eventoDetalles.estado_solicitud}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>Información del Cliente</h3>
              <p><strong>Nombre:</strong> {eventoDetalles.cliente?.nombre_usuario} {eventoDetalles.cliente?.apellido_usuario}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>Información del Asesor</h3>
              <p><strong>Asesor Responsable:</strong> {eventoDetalles?.asesor?.nombre_usuario || 'No asignado'} {eventoDetalles?.asesor?.apellido_usuario || ''}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>Dirección del Evento</h3>
              <p><strong>Sector:</strong> {eventoDetalles.sector}</p>
              <p><strong>Calle:</strong> {eventoDetalles.calle}</p>
              <p><strong>Detalles:</strong> {eventoDetalles.detalles}</p>
              <p><strong>Espacio:</strong> {eventoDetalles.espacio_evento}</p>
            </div>

            {eventoDetalles.nota_cliente && (
              <div>
                <h3>Notas Adicionales</h3>
                <p>{eventoDetalles.nota_cliente}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de Detalles de Cliente */}
      <Modal
        title="Detalles del Cliente"
        open={modalDetallesClienteVisible}
        onCancel={() => {
          setModalDetallesClienteVisible(false);
          setClienteDetalles(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setModalDetallesClienteVisible(false);
            setClienteDetalles(null);
          }}>
            Cerrar
          </Button>
        ]}
        width={600}
      >
        {clienteDetalles && (
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3>Información Personal</h3>
              <p><strong>ID Cliente:</strong> {clienteDetalles.cedula_usuario}</p>
              <p><strong>Nombre:</strong> {clienteDetalles.nombre_usuario}</p>
              <p><strong>Apellido:</strong> {clienteDetalles.apellido_usuario}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>Información de Contacto</h3>
              <p><strong>Teléfono:</strong> {clienteDetalles.telefono_usuario}</p>
              <p><strong>Email:</strong> {clienteDetalles.correo_usuario}</p>
            </div>

            <div>
              <h3>Estado</h3>
              <p><strong>Estado:</strong> {clienteDetalles.estado_usuario}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WelcomeEmployee;