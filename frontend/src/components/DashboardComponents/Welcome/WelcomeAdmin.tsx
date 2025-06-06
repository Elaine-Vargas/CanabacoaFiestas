import React, { useState, useEffect } from 'react';
import '../../../styles/dashboard/ServicesSubpages.scss';
import { Card, Button, Table, Tag, Space, Typography, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import EventoForm from '../FormService/EventoForm';
import UsuarioForm from '../FormService/UsuarioForm';
import ProveedorForm from '../FormService/ProveedorForm';
import AsignacionEmpleadoForm from '../FormService/AsignacionEmpleadoForm';
import DecoracionForm from '../FormService/DecoracionForm';

// Definición de tipos
type EstadoSolicitud = 'Pendiente' | 'Aceptada' | 'Rechazada' | 'Completada' | 'Cancelada';
type EstadoEvento = 'Pendiente' | 'Completado' | 'Cancelado';

interface Evento {
  id_evento: number;
  nombre_cliente: string;
  fecha_evento: string;
  hora_evento: string;
  tipo_evento: string;
  espacio_evento: string;
  desea_supervision: boolean;
  estado_solicitud: EstadoSolicitud;
  estado_evento: EstadoEvento;
  total_evento: number;
  nombre_asesor: string | null;
}

interface Usuario {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
  usuario_login: string;
  correo_usuario: string;
  tel_usuario: string;
  estado_usuario: string;
  rol: string;
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
  };
  estado_proveedor: string;
}

interface AsignacionEmpleado {
  id: number;
  id_evento: number;
  nombre_cliente: string;
  fecha_evento: string;
  nombre_empleado: string;
  apellido_empleado: string;
  puesto_evento: string;
}

interface Decoracion {
  id_decoracion: number;
  nombre_cliente: string;
  fecha_evento: string;
  tema_decoracion: string;
  colores_decoracion: string;
  tematica_decoracion: string;
  tipo_decoracion: string;
  total_decoracion: number;
  estado_decoracion: string;
}

const { Title } = Typography;

const WelcomeAdmin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionEmpleado[]>([]);
  const [decoraciones, setDecoraciones] = useState<Decoracion[]>([]);
  
  // Estados para los modales
  const [modalEventoVisible, setModalEventoVisible] = useState(false);
  const [modalUsuarioVisible, setModalUsuarioVisible] = useState(false);
  const [modalProveedorVisible, setModalProveedorVisible] = useState(false);
  const [modalAsignacionVisible, setModalAsignacionVisible] = useState(false);
  const [modalDecoracionVisible, setModalDecoracionVisible] = useState(false);

  // Estados para los filtros
  const [searchText, setSearchText] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('todos');
  const [selectedRol, setSelectedRol] = useState<string | undefined>();
  const [selectedCliente, setSelectedCliente] = useState<string | undefined>();
  const [selectedAsesor, setSelectedAsesor] = useState<string | undefined>();
  const [selectedTipo, setSelectedTipo] = useState<string | undefined>();
  const [selectedEvento, setSelectedEvento] = useState<string | undefined>();
  const [selectedCargo, setSelectedCargo] = useState<string | undefined>();

  // Función para cargar los datos
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Cargar eventos
      const eventosResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/eventos`);
      if (eventosResponse.ok) {
        const eventosData = await eventosResponse.json();
        setEventos(eventosData);
      }

      // Cargar usuarios
      const usuariosResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usuarios`);
      if (usuariosResponse.ok) {
        const usuariosData = await usuariosResponse.json();
        setUsuarios(usuariosData);
      }

      // Cargar proveedores
      const proveedoresResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/proveedores`);
      if (proveedoresResponse.ok) {
        const proveedoresData = await proveedoresResponse.json();
        setProveedores(proveedoresData);
      }

      // Cargar asignaciones
      const asignacionesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/asignaciones`);
      if (asignacionesResponse.ok) {
        const asignacionesData = await asignacionesResponse.json();
        setAsignaciones(asignacionesData);
      }

      // Cargar decoraciones
      const decoracionesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/decoraciones`);
      if (decoracionesResponse.ok) {
        const decoracionesData = await decoracionesResponse.json();
        setDecoraciones(decoracionesData);
      }
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEvento = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/eventos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Error al crear el evento');
      }

      setModalEventoVisible(false);
      fetchData(); // Recargar la lista de eventos
    } catch (error) {
      console.error('Error al crear evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsignacion = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/empleado-evento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/decoraciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Error al crear la decoración');
      }

      setModalDecoracionVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error al crear decoración:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUsuario = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/proveedores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleEstadoChange = (value: string) => {
    setSelectedEstado(value);
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

  // Funciones de filtrado
  const getFilteredEventos = () => {
    return eventos.filter(evento => {
      const matchesSearch = searchText === '' || 
        evento.nombre_cliente.toLowerCase().includes(searchText.toLowerCase()) ||
        evento.tipo_evento.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesEstado = selectedEstado === 'todos' || 
        evento.estado_evento === selectedEstado;
      
      const matchesCliente = !selectedCliente || 
        evento.nombre_cliente === selectedCliente;
      
      const matchesAsesor = !selectedAsesor || 
        evento.nombre_asesor === selectedAsesor;

      return matchesSearch && matchesEstado && matchesCliente && matchesAsesor;
    });
  };

  const getFilteredUsuarios = () => {
    return usuarios.filter(usuario => {
      const matchesSearch = searchText === '' || 
        usuario.nombre_usuario.toLowerCase().includes(searchText.toLowerCase()) ||
        usuario.apellido_usuario.toLowerCase().includes(searchText.toLowerCase()) ||
        usuario.usuario_login.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesEstado = selectedEstado === 'todos' || 
        usuario.estado_usuario === selectedEstado;
      
      const matchesRol = !selectedRol || 
        usuario.rol === selectedRol;

      return matchesSearch && matchesEstado && matchesRol;
    });
  };

  const getFilteredProveedores = () => {
    return proveedores.filter(proveedor => {
      const matchesSearch = searchText === '' || 
        proveedor.nombre_proveedor.toLowerCase().includes(searchText.toLowerCase()) ||
        proveedor.tipo_proveedor.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesEstado = selectedEstado === 'todos' || 
        proveedor.estado_proveedor === selectedEstado;
      
      const matchesTipo = !selectedTipo || 
        proveedor.tipo_proveedor === selectedTipo;

      return matchesSearch && matchesEstado && matchesTipo;
    });
  };

  const getFilteredAsignaciones = () => {
    return asignaciones.filter(asignacion => {
      const matchesSearch = searchText === '' || 
        asignacion.nombre_empleado.toLowerCase().includes(searchText.toLowerCase()) ||
        asignacion.apellido_empleado.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesEvento = !selectedEvento || 
        asignacion.id_evento.toString() === selectedEvento;
      
      const matchesCargo = !selectedCargo || 
        asignacion.puesto_evento === selectedCargo;

      return matchesSearch && matchesEvento && matchesCargo;
    });
  };

  const getFilteredDecoraciones = () => {
    return decoraciones.filter(decoracion => {
      const matchesSearch = searchText === '' || 
        decoracion.tema_decoracion.toLowerCase().includes(searchText.toLowerCase()) ||
        decoracion.colores_decoracion.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesEstado = selectedEstado === 'todos' || 
        decoracion.estado_decoracion === selectedEstado;
      
      const matchesTipo = !selectedTipo || 
        decoracion.tipo_decoracion === selectedTipo;

      return matchesSearch && matchesEstado && matchesTipo;
    });
  };

  // Componente de filtros para las tablas
  const TableFilters = ({ type }: { type: string }) => {
    switch (type) {
      case 'eventos':
        return (
          <Space style={{ marginBottom: 16 }}>
            <Input
              placeholder="Buscar eventos..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Filtrar por estado"
              style={{ width: 150 }}
              onChange={handleEstadoChange}
              options={[
                { value: 'todos', label: 'Todos' },
                { value: 'Pendiente', label: 'Pendiente' },
                { value: 'Confirmado', label: 'Confirmado' },
                { value: 'Cancelado', label: 'Cancelado' },
                { value: 'Completado', label: 'Completado' }
              ]}
            />
            <Select
              placeholder="Filtrar por cliente"
              style={{ width: 150 }}
              onChange={handleClienteChange}
              options={eventos.map(evento => ({
                value: evento.nombre_cliente,
                label: evento.nombre_cliente
              }))}
            />
            <Select
              placeholder="Filtrar por asesor"
              style={{ width: 150 }}
              onChange={handleAsesorChange}
              options={eventos
                .filter(evento => evento.nombre_asesor !== null)
                .map(evento => ({
                  value: evento.nombre_asesor!,
                  label: evento.nombre_asesor!
                }))}
            />
          </Space>
        );
      case 'usuarios':
        return (
          <Space style={{ marginBottom: 16 }}>
            <Input
              placeholder="Buscar usuarios..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Filtrar por estado"
              style={{ width: 150 }}
              onChange={handleEstadoChange}
              options={[
                { value: 'todos', label: 'Todos' },
                { value: 'Activo', label: 'Activo' },
                { value: 'Inactivo', label: 'Inactivo' },
                { value: 'Eliminado', label: 'Eliminado' }
              ]}
            />
            <Select
              placeholder="Filtrar por rol"
              style={{ width: 150 }}
              onChange={handleRolChange}
              options={[
                { value: 'admin', label: 'Administrador' },
                { value: 'client', label: 'Cliente' },
                { value: 'employee', label: 'Empleado' },
                { value: 'driver', label: 'Conductor' }
              ]}
            />
          </Space>
        );
      case 'proveedores':
        return (
          <Space style={{ marginBottom: 16 }}>
            <Input
              placeholder="Buscar proveedores..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Filtrar por estado"
              style={{ width: 150 }}
              onChange={handleEstadoChange}
              options={[
                { value: 'todos', label: 'Todos' },
                { value: 'Activo', label: 'Activo' },
                { value: 'Inactivo', label: 'Inactivo' },
                { value: 'Eliminado', label: 'Eliminado' }
              ]}
            />
            <Select
              placeholder="Filtrar por tipo"
              style={{ width: 150 }}
              onChange={handleTipoChange}
              options={[
                { value: 'Catering', label: 'Catering' },
                { value: 'Decoración', label: 'Decoración' },
                { value: 'Música', label: 'Música' },
                { value: 'Fotografía', label: 'Fotografía' },
                { value: 'Otro', label: 'Otro' }
              ]}
            />
          </Space>
        );
      case 'asignaciones':
        return (
          <Space style={{ marginBottom: 16 }}>
            <Input
              placeholder="Buscar asignaciones..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Filtrar por evento"
              style={{ width: 150 }}
              onChange={handleEventoChange}
              options={eventos.map(evento => ({
                value: evento.id_evento,
                label: `${evento.nombre_cliente} - ${new Date(evento.fecha_evento).toLocaleDateString()}`
              }))}
            />
            <Select
              placeholder="Filtrar por cargo"
              style={{ width: 150 }}
              onChange={handleCargoChange}
              options={[
                { value: 'Mesero', label: 'Mesero' },
                { value: 'Cocinero', label: 'Cocinero' },
                { value: 'Bartender', label: 'Bartender' },
                { value: 'Seguridad', label: 'Seguridad' },
                { value: 'Otro', label: 'Otro' }
              ]}
            />
          </Space>
        );
      case 'decoraciones':
        return (
          <Space style={{ marginBottom: 16 }}>
            <Input
              placeholder="Buscar decoraciones..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Filtrar por estado"
              style={{ width: 150 }}
              onChange={handleEstadoChange}
              options={[
                { value: 'todos', label: 'Todos' },
                { value: 'Solicitado', label: 'Solicitado' },
                { value: 'Aceptado', label: 'Aceptado' },
                { value: 'Completado', label: 'Completado' },
                { value: 'Cancelado', label: 'Cancelado' }
              ]}
            />
            <Select
              placeholder="Filtrar por tipo"
              style={{ width: 150 }}
              onChange={handleTipoChange}
              options={[
                { value: 'Boda', label: 'Boda' },
                { value: 'Quinceañera', label: 'Quinceañera' },
                { value: 'Cumpleaños', label: 'Cumpleaños' },
                { value: 'Graduación', label: 'Graduación' },
                { value: 'Otro', label: 'Otro' }
              ]}
            />
          </Space>
        );
      default:
        return null;
    }
  };

  const columns = [
    {
      title: 'Cliente',
      dataIndex: 'nombre_cliente',
      key: 'nombre_cliente',
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_evento',
      key: 'fecha_evento',
    },
    {
      title: 'Hora',
      dataIndex: 'hora_evento',
      key: 'hora_evento',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_evento',
      key: 'tipo_evento',
    },
    {
      title: 'Espacio',
      dataIndex: 'espacio_evento',
      key: 'espacio_evento',
    },
    {
      title: 'Supervisión',
      dataIndex: 'desea_supervision',
      key: 'desea_supervision',
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
      title: 'Estado Evento',
      dataIndex: 'estado_evento',
      key: 'estado_evento',
      render: (estado: EstadoEvento) => {
        const colors: Record<EstadoEvento, string> = {
          'Pendiente': 'gold',
          'Completado': 'green',
          'Cancelado': 'red'
        };
        return <Tag color={colors[estado]}>{estado}</Tag>;
      }
    },
    {
      title: 'Total',
      dataIndex: 'total_evento',
      key: 'total_evento',
      render: (total: number) => `RD$ ${total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: unknown, record: Evento) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => console.log('Ver', record)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => console.log('Editar', record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => console.log('Eliminar', record)} />
        </Space>
      ),
    },
  ];

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
      title: 'Usuario',
      dataIndex: 'usuario_login',
      key: 'usuario_login',
    },
    {
      title: 'Correo',
      dataIndex: 'correo_usuario',
      key: 'correo_usuario',
    },
    {
      title: 'Teléfono',
      dataIndex: 'tel_usuario',
      key: 'tel_usuario',
    },
    {
      title: 'Estado',
      dataIndex: 'estado_usuario',
      key: 'estado_usuario',
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
      render: (_: unknown, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => console.log('Editar', record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => console.log('Eliminar', record)} />
        </Space>
      ),
    },
  ];

  const proveedorColumns = [
    {
      title: 'ID',
      dataIndex: 'id_proveedor',
      key: 'id_proveedor',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_proveedor',
      key: 'tipo_proveedor',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre_proveedor',
      key: 'nombre_proveedor',
    },
    {
      title: 'Teléfono',
      dataIndex: 'tel_proveedor',
      key: 'tel_proveedor',
    },
    {
      title: 'Correo',
      dataIndex: 'correo_proveedor',
      key: 'correo_proveedor',
    },
    {
      title: 'Dirección',
      key: 'direccion',
      render: (_: unknown, record: any) => (
        <span>
          {record.direccion?.calle}, {record.direccion?.sector}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado_proveedor',
      key: 'estado_proveedor',
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
      render: (_: unknown, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => console.log('Editar', record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => console.log('Eliminar', record)} />
        </Space>
      ),
    },
  ];

  const asignacionColumns = [
    {
      title: 'Evento',
      dataIndex: 'nombre_cliente',
      key: 'nombre_cliente',
      render: (_: string, record: AsignacionEmpleado) => (
        <span>
          {record.nombre_cliente} - {new Date(record.fecha_evento!).toLocaleDateString()}
        </span>
      )
    },
    {
      title: 'Empleado',
      dataIndex: 'nombre_empleado',
      key: 'nombre_empleado',
      render: (_: string, record: AsignacionEmpleado) => (
        <span>
          {record.nombre_empleado} {record.apellido_empleado}
        </span>
      )
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
      title: 'Acciones',
      key: 'acciones',
      render: (_: unknown, record: AsignacionEmpleado) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => console.log('Editar', record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => console.log('Eliminar', record)} />
        </Space>
      ),
    },
  ];

  const decoracionColumns = [
    {
      title: 'Evento',
      dataIndex: 'nombre_cliente',
      key: 'nombre_cliente',
      render: (_: string, record: Decoracion) => (
        <span>
          {record.nombre_cliente} - {new Date(record.fecha_evento!).toLocaleDateString()}
        </span>
      )
    },
    {
      title: 'Tema',
      dataIndex: 'tema_decoracion',
      key: 'tema_decoracion',
      ellipsis: true
    },
    {
      title: 'Colores',
      dataIndex: 'colores_decoracion',
      key: 'colores_decoracion'
    },
    {
      title: 'Temática',
      dataIndex: 'tematica_decoracion',
      key: 'tematica_decoracion'
    },
    {
      title: 'Total',
      dataIndex: 'total_decoracion',
      key: 'total_decoracion',
      render: (total: number) => `RD$ ${total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`
    },
    {
      title: 'Estado',
      dataIndex: 'estado_decoracion',
      key: 'estado_decoracion',
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
      render: (_: unknown, record: Decoracion) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => console.log('Ver', record)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => console.log('Editar', record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => console.log('Eliminar', record)} />
        </Space>
      ),
    },
  ];

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
              <TableFilters type="eventos" />
              <Table 
                className="dashboard-table"
                columns={columns}
                dataSource={getFilteredEventos()}
                loading={loading}
                pagination={{ pageSize: 5 }}
                rowKey="id_evento"
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
              <TableFilters type="usuarios" />
              <Table 
                className="dashboard-table"
                columns={usuarioColumns}
                dataSource={getFilteredUsuarios()}
                loading={loading}
                pagination={{ pageSize: 5 }}
                rowKey="cedula_usuario"
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
              <TableFilters type="proveedores" />
              <Table 
                className="dashboard-table"
                columns={proveedorColumns}
                dataSource={getFilteredProveedores()}
                loading={loading}
                pagination={{ pageSize: 5 }}
                rowKey="id_proveedor"
              />
            </Card>
          </div>

          {/* Tercera fila: Asignación de Equipo y Decoraciones */}
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
              <TableFilters type="asignaciones" />
              <Table 
                className="dashboard-table"
                columns={asignacionColumns}
                dataSource={getFilteredAsignaciones()}
                loading={loading}
                pagination={{ pageSize: 5 }}
                rowKey="id"
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
              <TableFilters type="decoraciones" />
              <Table 
                className="dashboard-table"
                columns={decoracionColumns}
                dataSource={getFilteredDecoraciones()}
                loading={loading}
                pagination={{ pageSize: 5 }}
                rowKey="id_decoracion"
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
      />

      <UsuarioForm
        visible={modalUsuarioVisible}
        onCancel={() => setModalUsuarioVisible(false)}
        onSubmit={handleCreateUsuario}
        loading={loading}
      />

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
    </div>
  );
};

export default WelcomeAdmin;

