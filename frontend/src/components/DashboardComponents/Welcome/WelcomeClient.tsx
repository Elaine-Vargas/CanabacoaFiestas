import { useState, useEffect } from "react";
import { Card, Typography, Table, Button, Modal, Form, Input, Rate, message, Select, DatePicker, Descriptions } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import "../../../styles/dashboard/ServicesSubpages.scss";
import EventoForm from "../FormService/EventoForm";
import DecoracionForm from "../FormService/DecoracionForm";
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
  fecha_evento: Dayjs;
  hora_evento: Dayjs;
  id_direccion: number,
  direccion: {
    ciudad: {
      id_ciudad: number;
      nombre_ciudad: string;
      provincia: {
        id_provincia: number;
        nombre_provincia: string;
      }
    }
    sector: string;
    calle: string;
    detalles?: string;
  }
  estado_solicitud: string;
  cliente: {
    cedula_usuario: string;
    nombre_usuario: string;
  }
  asesor: Usuario;
  id_tipo_evento: number;
  nota_cliente: string;
  espacio_evento: string;
  desea_supervision: boolean;
}

interface Decoracion {
  id_decoracion?: number;
  id_evento: number;
  tema_decoracion: string;
  colores_decoracion: string;
  precioneto_decoracion?: number;
  itbis_decoracion?: number;
  total_decoracion?: number;
  estado_decoracion?: string;
  fecha_decoracion?: string;
  detalle_decoracion?: {
    id_detdecoracion: number;
    elemento_decoracion: string;
    cantelemento_decoracion: number;
    precio_elemento: number;
    precio_decoracion: number;
    estado_detdecoracion: string;
  }[];
  evento: Evento;
}

interface Comentario {
  id_comentario: number;
  id_evento: number;
  comentario: string;
  calificacion: number;
  estado_comentario: 'Activo' | 'Editado' | 'Eliminado';
  fecha_creacion: string;
  evento?: {
    tipo_evento: {
      tipo_evento: string;
    };
    fecha_evento: Dayjs;
  };
}

interface Empleado {
  empleado?: Usuario;
  puesto_evento?: string;
  estado_empevento?: string;
  id_evento?: number;
  evento?: {
    id_evento: number;
    fecha_evento: string;
    hora_evento: string;
    espacio_evento: string;
    estado_solicitud: string;
  };
}

interface Usuario {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
  tel_usuario: string;
}

interface TipoEvento {
  id_tipo_evento: number;
  tipo_evento: string;
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
  modo_pago: string;
  fecha_pago: Dayjs;
  hora_pago: Dayjs;
  monto: number;
  tipo_pago: string;
  estado_pago: string;
  evento?: {
    id_evento: number;
    tipo_evento: {
      tipo_evento: string;
    };
    fecha_evento: Dayjs;
  };
}

export default function WelcomeClient() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [decoraciones, setDecoraciones] = useState<Decoracion[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(false);
  const [modalEventoVisible, setModalEventoVisible] = useState(false);
  const [modalDecoracionVisible, setModalDecoracionVisible] = useState(false);
  const [modalComentarioVisible, setModalComentarioVisible] = useState(false);
  const [modalVerMasEventoVisible, setModalVerMasEventoVisible] = useState(false);
  const [modalVerMasDecoracionVisible, setModalVerMasDecoracionVisible] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [selectedDecoracion, setSelectedDecoracion] = useState<Decoracion | undefined>(undefined);
  const [selectedComentario, setSelectedComentario] = useState<Comentario | null>(null);
  const [selectedEventoComentario, setSelectedEventoComentario] = useState<Evento | null>(null);
  const [userCedula, setUserCedula] = useState<string>('');
  const [form] = Form.useForm();
  const [searchTextEventos, setSearchTextEventos] = useState('');
  const [searchTextDecoraciones, setSearchTextDecoraciones] = useState('');
  const [searchTextComentarios, setSearchTextComentarios] = useState('');
  const [searchTextPagos, setSearchTextPagos] = useState('');
  const [filtrosEventos, setFiltrosEventos] = useState({
    estado: '',
    tipo: '',
    fecha_evento: ''
  });
  const [filtrosDecoraciones, setFiltrosDecoraciones] = useState({
    estado: '',
    evento: ''
  });
  const [filtrosComentarios, setFiltrosComentarios] = useState({
    calificacion: ''
  });
  const [filtrosPagos, setFiltrosPagos] = useState({
    modo: '',
    tipo: '',
    estado: ''
  });
  const [searchTextEmpleados, setSearchTextEmpleados] = useState('');
  const [filtrosEmpleados, setFiltrosEmpleados] = useState({
    puesto: '',
    evento: '',
    estado: ''
  });
  const [modalVerMasEmpleadoVisible, setModalVerMasEmpleadoVisible] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      await fetchUserData();
      // Solo ejecutar fetchData y fetchTiposEvento después de que userCedula esté disponible
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (userCedula) {
      fetchData();
      fetchTiposEvento();
      fetchUbicaciones();
    }
  }, [userCedula]);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      if (!userCedula) {
        return;
      }

      // Obtener eventos del cliente
      const eventosResponse = await fetch(`${apiUrl}/evento/cliente/${userCedula}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!eventosResponse.ok) {
        const errorText = await eventosResponse.text();
        console.error(`Error al obtener eventos: ${eventosResponse.status} - ${errorText}`);
        throw new Error('Error al obtener eventos');
      }
      const eventosData = await eventosResponse.json();
      console.log('Datos de eventos recibidos del backend:', eventosData);
      setEventos(eventosData.map((evento: Evento) => ({
        ...evento,
        fecha_evento: evento.fecha_evento ? dayjs(evento.fecha_evento) : null,
        hora_evento: evento.hora_evento ? dayjs(evento.hora_evento, 'HH:mm:ss') : null,
      })));

      // Obtener decoraciones del cliente con filtros
      const decoracionQuery = [];
      if (filtrosDecoraciones.estado) decoracionQuery.push(`estado=${encodeURIComponent(filtrosDecoraciones.estado)}`);
      if (filtrosDecoraciones.evento) decoracionQuery.push(`id_evento=${encodeURIComponent(filtrosDecoraciones.evento)}`);
      const decoracionQueryString = decoracionQuery.length > 0 ? `?${decoracionQuery.join('&')}` : '';
      const decoracionesResponse = await fetch(`${apiUrl}/decoracion/cliente/${userCedula}${decoracionQueryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!decoracionesResponse.ok) {
        const errorText = await decoracionesResponse.text();
        console.error(`Error al obtener decoraciones: ${decoracionesResponse.status} - ${errorText}`);
        throw new Error('Error al obtener decoraciones');
      }
      const decoracionesData = await decoracionesResponse.json();
      setDecoraciones(decoracionesData.map((decoracion: Decoracion) => ({
        ...decoracion,
        precioneto_decoracion: parseFloat(decoracion.precioneto_decoracion as any),
        itbis_decoracion: parseFloat(decoracion.itbis_decoracion as any),
        total_decoracion: parseFloat(decoracion.total_decoracion as any),
      })));

      // Obtener comentarios del cliente
      const comentariosResponse = await fetch(`${apiUrl}/comentario/usuario/${userCedula}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!comentariosResponse.ok) {
        const errorText = await comentariosResponse.text();
        if (comentariosResponse.status === 404) {
          setComentarios([]);
          message.info('No tienes comentarios registrados.');
        } else {
          console.error(`Error al obtener comentarios: ${comentariosResponse.status} - ${errorText}`);
          message.error('Error al cargar los comentarios');
          // No lanzar throw para evitar mostrar el error global
        }
      } else {
        const comentariosData = await comentariosResponse.json();
        setComentarios(comentariosData);
      }

      // Obtener pagos del cliente
      const pagosResponse = await fetch(`${apiUrl}/pago`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!pagosResponse.ok) {
        const errorText = await pagosResponse.text();
        console.error(`Error al obtener pagos: ${pagosResponse.status} - ${errorText}`);
        throw new Error('Error al obtener pagos');
      }
      const pagosData = await pagosResponse.json();
      setPagos(pagosData.map((pago: Pago) => ({
        ...pago,
        fecha_pago: pago.fecha_pago ? dayjs(pago.fecha_pago) : null,
        hora_pago: pago.hora_pago ? dayjs(pago.hora_pago, 'HH:mm:ss') : null,
        monto: parseFloat(pago.monto as any),
      })));

      // Obtener empleados asignados a eventos del cliente
      const empleadosQuery: string[] = [];
      // Ejemplo: para filtrar por puesto: empleadosQuery.push(`puesto_evento=Decorador`);
      const empleadosQueryString = empleadosQuery.length > 0 ? `?${empleadosQuery.join('&')}` : '';
      const empleadosResponse = await fetch(`${apiUrl}/evento/empleados/cliente/${userCedula}${empleadosQueryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!empleadosResponse.ok) {
        const errorText = await empleadosResponse.text();
        console.error(`Error al obtener empleados: ${empleadosResponse.status} - ${errorText}`);
        throw new Error('Error al obtener empleados');
      }
      const empleadosData = await empleadosResponse.json();
      setEmpleados(empleadosData);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchTiposEvento = async () => {
    try {
      setLoadingTipos(true);
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
    } finally {
      setLoadingTipos(false);
    }
  };

  const fetchUbicaciones = async () => {
    try {
      setLoadingUbicaciones(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      // Obtener provincias
      const provinciasResponse = await fetch(`${apiUrl}/direccion/provincias`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!provinciasResponse.ok) {
        throw new Error('Error al obtener provincias');
      }
      const provinciasData = await provinciasResponse.json();
      setProvincias(provinciasData);

      // Obtener ciudades
      const ciudadesResponse = await fetch(`${apiUrl}/direccion/ciudades`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!ciudadesResponse.ok) {
        throw new Error('Error al obtener ciudades');
      }
      const ciudadesData = await ciudadesResponse.json();
      setCiudades(ciudadesData);

    } catch (error) {
      console.error('Error al cargar ubicaciones:', error);
      message.error('Error al cargar las ubicaciones');
    } finally {
      setLoadingUbicaciones(false);
    }
  };

  // Columnas para la tabla de eventos
  const eventosColumns = [
    {
      title: 'ID',
      dataIndex: 'id_evento',
      key: 'id_evento',
    },
    {
      title: 'Tipo de Evento',
      dataIndex: ['tipo_evento', 'tipo_evento'],
      key: 'tipo_evento',
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_evento',
      key: 'fecha_evento',
      render: (fecha: Dayjs) => fecha && dayjs.isDayjs(fecha) && fecha.isValid() ? fecha.format('DD/MM/YYYY') : '',
    },
    {
      title: 'Hora',
      dataIndex: 'hora_evento',
      key: 'hora_evento',
      render: (hora: Dayjs) => hora && dayjs.isDayjs(hora) && hora.isValid() ? hora.format('HH:mm') : '',
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
        <>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleVerDetalles(record)}
            style={{ marginRight: 8 }}
          />
          {record.estado_solicitud === 'Pendiente' && (
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditarEvento(record)}
              style={{ marginRight: 8 }}
            />
          )}
        </>
      ),
    },
  ];

  // Columnas para la tabla de decoraciones
  const decoracionesColumns = [
    {
      title: 'Tema',
      dataIndex: 'tema_decoracion',
      key: 'tema_decoracion',
    },
    {
      title: 'Evento',
      dataIndex: ['evento', 'tipo_evento', 'tipo_evento'],
      key: 'evento',
      render: (_: any, record: Decoracion) => {
        const evento = eventos.find(e => e.id_evento === record.id_evento);
        return evento ? `${evento.tipo_evento.tipo_evento} - ${evento.fecha_evento && dayjs.isDayjs(evento.fecha_evento) && evento.fecha_evento.isValid() ? evento.fecha_evento.format('DD/MM/YYYY') : 'Fecha no disponible'}` : 'N/A';
      }
    },
    {
      title: 'Colores',
      dataIndex: 'colores_decoracion',
      key: 'colores_decoracion',
      render: (colores: string) => colores || 'No especificado'
    },
    {
      title: 'Estado',
      dataIndex: 'estado_decoracion',
      key: 'estado_decoracion',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Decoracion) => (
        <>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleVerDetallesDecoracion(record)}
            style={{ marginRight: 8 }}
          />
          {record.estado_decoracion?.toLowerCase() === 'solicitado' && (
            <>
              <Button
                icon={<EditOutlined />}
                onClick={() => handleEditarDecoracion(record)}
                style={{ marginRight: 8 }}
              />
            </>
          )}
        </>
      ),
    },
  ];

  // Columnas para la tabla de comentarios
  const comentariosColumns = [
    {
      title: 'Evento',
      dataIndex: ['evento', 'tipo_evento', 'tipo_evento'],
      key: 'evento',
      render: (_: any, record: Comentario) => {
        const evento = eventos.find(e => e.id_evento === record.id_evento);
        return evento ? `${evento.tipo_evento.tipo_evento} - ${evento.fecha_evento && dayjs.isDayjs(evento.fecha_evento) && evento.fecha_evento.isValid() ? evento.fecha_evento.format('DD/MM/YYYY') : 'Fecha no disponible'}` : 'N/A';
      }
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
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Comentario) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditarComentario(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleEliminarComentario(record)}
            danger
          />
        </>
      ),
    },
  ];

  // Columnas para la tabla de empleados
  const empleadosColumns = [
    {
      title: 'Nombre',
      dataIndex: ['empleado', 'nombre_usuario'],
      key: 'nombre',
    },
    {
      title: 'Apellido',
      dataIndex: ['empleado', 'apellido_usuario'],
      key: 'apellido',
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
      title: 'Evento',
      dataIndex: ['evento', 'id_evento'],
      key: 'evento',
      render: (_: any, record: Empleado) =>
        record.evento
          ? `${record.evento.id_evento} - ${record.evento.fecha_evento}`
          : '',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Empleado) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleVerDetallesEmpleado(record)}
          style={{ marginRight: 8 }}
        />
      ),
    },
  ];

  // Columnas para la tabla de pagos
  const pagosColumns = [
    {
      title: 'ID Pago',
      dataIndex: 'id_pago',
      key: 'id_pago',
    },
    {
      title: 'Evento',
      dataIndex: ['evento', 'id_evento'],
      key: 'evento',
      render: (_: any, record: Pago) => {
        const eventoAsociado = eventos.find(e => e.id_evento === record.id_evento);
        return eventoAsociado ? `${eventoAsociado.tipo_evento.tipo_evento} - ${eventoAsociado.fecha_evento && dayjs.isDayjs(eventoAsociado.fecha_evento) && eventoAsociado.fecha_evento.isValid() ? eventoAsociado.fecha_evento.format('DD/MM/YYYY') : 'Fecha no disponible'}` : 'N/A';
      }
    },
    {
      title: 'Modo de Pago',
      dataIndex: 'modo_pago',
      key: 'modo_pago',
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_pago',
      key: 'fecha_pago',
      render: (fecha: Dayjs) => fecha && dayjs.isDayjs(fecha) && fecha.isValid() ? fecha.format('DD/MM/YYYY') : '',
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      render: (monto: number) => monto ? `$${monto.toFixed(2)}` : 'N/A',
    },
    {
      title: 'Tipo de Pago',
      dataIndex: 'tipo_pago',
      key: 'tipo_pago',
    },
    {
      title: 'Estado',
      dataIndex: 'estado_pago',
      key: 'estado_pago',
    },
  ];

  const handleVerDetalles = async (evento: Evento) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      // Obtener detalles de la dirección
      const direccionResponse = await fetch(`${apiUrl}/direccion/${evento.id_direccion}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!direccionResponse.ok) {
        throw new Error('Error al obtener detalles de la dirección');
      }

      const direccionData = await direccionResponse.json();
      
      // Combinar los datos del evento con los datos de la dirección
      const eventoCompleto = {
        ...evento,
        direccion: direccionData
      };

      setSelectedEvento(eventoCompleto);
      setModalVerMasEventoVisible(true);
    } catch (error) {
      console.error('Error al obtener detalles:', error);
      message.error('Error al cargar los detalles del evento');
    }
  };

  const handleEditarEvento = async (evento: Evento) => {
    if (evento.estado_solicitud !== 'Pendiente') {
      message.warning('Solo se pueden editar eventos en estado pendiente');
      return;
    }
    console.log('Evento seleccionado para editar:', evento);
    // Obtener detalles de la dirección si no están ya en el objeto evento
    if (evento.id_direccion && !evento.direccion?.calle) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('No hay sesión activa');
          return;
        }

        const direccionResponse = await fetch(`${apiUrl}/direccion/${evento.id_direccion}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!direccionResponse.ok) {
          throw new Error('Error al obtener detalles de la dirección');
        }
        const direccionData = await direccionResponse.json();
        const eventoConDireccion = { ...evento, direccion: direccionData };
        setSelectedEvento(eventoConDireccion);
      } catch (error) {
        console.error('Error al obtener detalles de la dirección para edición:', error);
        message.error('Error al cargar los detalles de la dirección');
        setSelectedEvento(evento);
      }
    } else {
      setSelectedEvento(evento);
    }
    setModalEventoVisible(true);
  };

  const handleVerDetallesDecoracion = (decoracion: Decoracion) => {
    setSelectedDecoracion(decoracion);
    setModalVerMasDecoracionVisible(true);
  };

  const handleEditarDecoracion = (decoracion: Decoracion) => {
    setSelectedDecoracion(decoracion);
    setModalDecoracionVisible(true);
  };

  const handleEliminarDecoracion = async (decoracion: Decoracion) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const response = await fetch(`${apiUrl}/decoracion/${decoracion.id_decoracion}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la decoración');
      }

      message.success('Decoración eliminada exitosamente');
      fetchData();
    } catch (error) {
      console.error('Error al eliminar decoración:', error);
      message.error('Error al eliminar la decoración');
    }
  };

  const handleEditarComentario = (comentario: Comentario) => {
    setSelectedComentario(comentario);
    form.setFieldsValue({
      id_evento: comentario.id_evento,
      comentario: comentario.comentario,
      calificacion: comentario.calificacion
    });
    setModalComentarioVisible(true);
  };

  const handleEliminarComentario = async (comentario: Comentario) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const response = await fetch(`${apiUrl}/comentario/${comentario.id_comentario}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el comentario');
      }

      message.success('Comentario eliminado exitosamente');
      fetchData();
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      message.error('Error al eliminar el comentario');
    }
  };

  const handleSubmitComentario = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const url = selectedComentario
        ? `${apiUrl}/comentario/${selectedComentario.id_comentario}`
        : `${apiUrl}/comentario`;

      const method = selectedComentario ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comentario: values.comentario,
          calificacion: values.calificacion,
          id_evento: parseInt(values.id_evento)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el comentario');
      }

      message.success(selectedComentario ? 'Comentario actualizado exitosamente' : 'Comentario creado exitosamente');
      setModalComentarioVisible(false);
      setSelectedComentario(null);
      setSelectedEventoComentario(null);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error('Error al guardar comentario:', error);
      message.error(error instanceof Error ? error.message : 'Error al guardar el comentario');
    }
  };

  // Funciones de filtrado
  const getFilteredEventos = () => {
    return eventos.filter(evento => {
      const matchesSearch = 
        evento.tipo_evento.tipo_evento.toLowerCase().includes(searchTextEventos.toLowerCase()) ||
        evento.espacio_evento.toLowerCase().includes(searchTextEventos.toLowerCase());

      const matchesEstado = !filtrosEventos.estado || evento.estado_solicitud === filtrosEventos.estado;
      const matchesTipo = !filtrosEventos.tipo || evento.tipo_evento.tipo_evento === filtrosEventos.tipo;
      const matchesFecha = !filtrosEventos.fecha_evento || evento.fecha_evento?.format('YYYY-MM-DD') === filtrosEventos.fecha_evento;

      return matchesSearch && matchesEstado && matchesTipo && matchesFecha;
    });
  };

  const getFilteredDecoraciones = () => {
    return decoraciones.filter(decoracion => {
      const matchesSearch = 
        decoracion.tema_decoracion.toLowerCase().includes(searchTextDecoraciones.toLowerCase()) ||
        decoracion.colores_decoracion.toLowerCase().includes(searchTextDecoraciones.toLowerCase());

      const matchesEstado = !filtrosDecoraciones.estado || decoracion.estado_decoracion === filtrosDecoraciones.estado;
      const matchesEvento = !filtrosDecoraciones.evento || decoracion.id_evento === Number(filtrosDecoraciones.evento);

      return matchesSearch && matchesEstado && matchesEvento;
    });
  };

  const getFilteredComentarios = () => {
    return comentarios.filter(comentario => {
      const matchesSearch = 
        comentario.comentario.toLowerCase().includes(searchTextComentarios.toLowerCase());

      const matchesCalificacion = !filtrosComentarios.calificacion || 
        comentario.calificacion === parseInt(filtrosComentarios.calificacion);

      const noEliminado = comentario.estado_comentario !== 'Eliminado';

      return matchesSearch && matchesCalificacion && noEliminado;
    });
  };

  const getFilteredPagos = () => {
    // Filtrar pagos por los eventos del cliente autenticado
    const clienteEventosIds = eventos.filter(e => e.cliente.cedula_usuario === userCedula).map(e => e.id_evento);
    return pagos.filter(pago => {
      const matchesSearch = 
        pago.modo_pago.toLowerCase().includes(searchTextPagos.toLowerCase()) ||
        pago.tipo_pago.toLowerCase().includes(searchTextPagos.toLowerCase()) ||
        pago.estado_pago.toLowerCase().includes(searchTextPagos.toLowerCase()) ||
        (pago.monto && pago.monto.toString().includes(searchTextPagos));

      const matchesModo = !filtrosPagos.modo || pago.modo_pago === filtrosPagos.modo;
      const matchesTipo = !filtrosPagos.tipo || pago.tipo_pago === filtrosPagos.tipo;
      const matchesEstado = !filtrosPagos.estado || pago.estado_pago === filtrosPagos.estado;
      
      // Asegurarse de que el pago esté asociado a un evento del cliente
      const belongsToClientEvent = clienteEventosIds.includes(pago.id_evento);

      return matchesSearch && matchesModo && matchesTipo && matchesEstado && belongsToClientEvent;
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
        onChange={(date) => setFiltrosEventos(prev => ({ ...prev, fecha_evento: date?.format('YYYY-MM-DD') || '' }))}
      />
    </div>
  );

  const filterContentDecoraciones = (
    <div style={{ padding: '8px' }}>
      <Select
        style={{ width: '100%', marginBottom: '8px' }}
        placeholder="Estado"
        allowClear
        onChange={(value) => setFiltrosDecoraciones(prev => ({ ...prev, estado: value }))}
      >
        <Select.Option value="solicitado">Solicitado</Select.Option>
        <Select.Option value="aprobado">Aprobado</Select.Option>
        <Select.Option value="completado">Completado</Select.Option>
        <Select.Option value="cancelado">Cancelado</Select.Option>
      </Select>
     
      <Select
        style={{ width: '100%' }}
        placeholder="Evento"
        allowClear
        onChange={(value) => setFiltrosDecoraciones(prev => ({ ...prev, evento: value }))}
      >
        {eventos.map(evento => (
          <Select.Option key={evento.id_evento} value={evento.id_evento}>
            {evento.tipo_evento.tipo_evento} - {evento.fecha_evento && dayjs.isDayjs(evento.fecha_evento) && evento.fecha_evento.isValid() ? evento.fecha_evento.format('DD/MM/YYYY') : 'Fecha no disponible'}
          </Select.Option>
        ))}
      </Select>
    </div>
  );

  const filterContentComentarios = (
    <div style={{ padding: '8px' }}>
      <Select
        style={{ width: '100%' }}
        placeholder="Calificación"
        allowClear
        onChange={(value) => setFiltrosComentarios(prev => ({ ...prev, calificacion: value }))}
      >
        <Select.Option value="5">5 estrellas</Select.Option>
        <Select.Option value="4">4 estrellas</Select.Option>
        <Select.Option value="3">3 estrellas</Select.Option>
        <Select.Option value="2">2 estrellas</Select.Option>
        <Select.Option value="1">1 estrella</Select.Option>
      </Select>
    </div>
  );

  const filterContentPagos = (
    <div style={{ padding: '8px' }}>
      <Select
        style={{ width: '100%', marginBottom: '8px' }}
        placeholder="Modo de Pago"
        allowClear
        onChange={(value) => setFiltrosPagos(prev => ({ ...prev, modo: value }))}
      >
        <Select.Option value="Efectivo">Efectivo</Select.Option>
        <Select.Option value="Transferencia">Transferencia</Select.Option>
      </Select>

      <Select
        style={{ width: '100%', marginBottom: '8px' }}
        placeholder="Tipo de Pago"
        allowClear
        onChange={(value) => setFiltrosPagos(prev => ({ ...prev, tipo: value }))}
      >
        <Select.Option value="Inicial">Inicial</Select.Option>
        <Select.Option value="Final">Final</Select.Option>
        <Select.Option value="Adicional">Adicional</Select.Option>
      </Select>

      <Select
        style={{ width: '100%' }}
        placeholder="Estado de Pago"
        allowClear
        onChange={(value) => setFiltrosPagos(prev => ({ ...prev, estado: value }))}
      >
        <Select.Option value="Pendiente">Pendiente</Select.Option>
        <Select.Option value="Recibido">Recibido</Select.Option>
        <Select.Option value="Rechazado">Rechazado</Select.Option>
      </Select>
    </div>
  );

  // Contar filtros activos
  const getActiveFiltersCount = (filtros: any) => {
    return Object.values(filtros).filter(value => value !== '').length;
  };

  const getFilteredEmpleados = () => {
    return empleados.filter(empleado => {
      const matchesSearch = 
        empleado.empleado?.nombre_usuario.toLowerCase().includes(searchTextEmpleados.toLowerCase()) ||
        empleado.empleado?.apellido_usuario.toLowerCase().includes(searchTextEmpleados.toLowerCase()) ||
        empleado.puesto_evento?.toLowerCase().includes(searchTextEmpleados.toLowerCase());

      const matchesPuesto = !filtrosEmpleados.puesto || empleado.puesto_evento === filtrosEmpleados.puesto;
      const matchesEvento = !filtrosEmpleados.evento || empleado.evento?.id_evento === parseInt(filtrosEmpleados.evento);
      const matchesEstado = !filtrosEmpleados.estado || empleado.estado_empevento === filtrosEmpleados.estado;

      return matchesSearch && matchesPuesto && matchesEvento && matchesEstado;
    });
  };

  const filterContentEmpleados = (
    <div style={{ padding: '8px' }}>
      <Select
        style={{ width: '100%', marginBottom: '8px' }}
        placeholder="Cargo"
        allowClear
        onChange={(value) => setFiltrosEmpleados(prev => ({ ...prev, puesto: value }))}
      >
        <Select.Option value="Decorador">Decorador</Select.Option>
        <Select.Option value="Camarero">Camarero</Select.Option>
        <Select.Option value="Conductor">Conductor</Select.Option>
        <Select.Option value="Supervisor">Supervisor</Select.Option>
        <Select.Option value="Encargado de logística">Encargado de logística</Select.Option>
        <Select.Option value="Encargado de Limpieza">Encargado de Limpieza</Select.Option>
      </Select>

      <Select
        style={{ width: '100%', marginBottom: '8px' }}
        placeholder="Evento"
        allowClear
        onChange={(value) => setFiltrosEmpleados(prev => ({ ...prev, evento: value }))}
      >
        {eventos.map(evento => (
          <Select.Option key={evento.id_evento} value={evento.id_evento}>
            {`${evento.id_evento} - ${evento.tipo_evento.tipo_evento} - ${evento.fecha_evento && dayjs.isDayjs(evento.fecha_evento) && evento.fecha_evento.isValid() ? evento.fecha_evento.format('DD/MM/YYYY') : 'Fecha no disponible'}`}
          </Select.Option>
        ))}
      </Select>

      <Select
        style={{ width: '100%' }}
        placeholder="Estado"
        allowClear
        onChange={(value) => setFiltrosEmpleados(prev => ({ ...prev, estado: value }))}
      >
        <Select.Option value="Activo">Activo</Select.Option>
        <Select.Option value="Completado">Completado</Select.Option>
      </Select>
    </div>
  );

  const handleVerDetallesEmpleado = (empleado: Empleado) => {
    setSelectedEmpleado(empleado);
    setModalVerMasEmpleadoVisible(true);
  };

  return (
    <div className="welcome-container">
      <Card className="welcome-card">
        <Title level={2} className="welcome-title">
          ¡Te damos la bienvenida a tu panel de Cliente!
        </Title>
        <p className="welcome-subtitle">
          Aquí podrás gestionar tus eventos y servicios con Canabacoa Fiestas
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
                  onClick={() => {
                    setSelectedEvento(null);
                    setModalEventoVisible(true);
                  }}
                >
                  Solicitar Evento
                </Button>
              }
            >
              <TableFilters
                type="eventos"
                searchText={searchTextEventos}
                onSearchChange={setSearchTextEventos}
                clearFilters={() => setFiltrosEventos({ estado: '', tipo: '', fecha_evento: '' })}
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

          {/* Segunda fila: Decoraciones y Comentarios */}
          <div className="dashboard-row">
            <Card
              title={
                <div className="card-header">
                  <span>DECORACIONES</span>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="action-button primary"
                    onClick={() => {
                      setSelectedDecoracion(undefined);
                      setModalDecoracionVisible(true);
                    }}
                  >
                    Solicitar Decoración
                  </Button>
                </div>
              }
              className="dashboard-card"
            >
              <TableFilters
                type="decoraciones"
                searchText={searchTextDecoraciones}
                onSearchChange={setSearchTextDecoraciones}
                clearFilters={() => setFiltrosDecoraciones({ estado: '',  evento: '' })}
                activeFiltersCount={getActiveFiltersCount(filtrosDecoraciones)}
                filterContent={filterContentDecoraciones}
              />
              <Table
                className="dashboard-table"
                columns={decoracionesColumns}
                dataSource={getFilteredDecoraciones()}
                loading={loading}
                pagination={{ pageSize: 3 }}
                rowKey="id_decoracion"
                scroll={{ x: 'max-content' }}
              />
            </Card>

            <Card
              title="COMENTARIOS"
              className="dashboard-card"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="action-button primary"
                  onClick={() => {
                    setSelectedComentario(null);
                    setSelectedEventoComentario(null);
                    setModalComentarioVisible(true);
                  }}
                >
                  Agregar Comentario
                </Button>
              }
            >
              <TableFilters
                type="comentarios"
                searchText={searchTextComentarios}
                onSearchChange={setSearchTextComentarios}
                clearFilters={() => setFiltrosComentarios({ calificacion: '' })}
                activeFiltersCount={getActiveFiltersCount(filtrosComentarios)}
                filterContent={filterContentComentarios}
              />
              <Table
                className="dashboard-table"
                columns={comentariosColumns}
                dataSource={getFilteredComentarios()}
                loading={loading}
                pagination={{ pageSize: 3 }}
                rowKey="id_comentario"
                scroll={{ x: 'max-content' }}
              />
            </Card>
          </div>

          {/* Tercera fila: Equipo de Trabajo */}
          <div className="dashboard-row">
            <Card
              title="EQUIPO DE TRABAJO"
              className="dashboard-card full-width"
            >
              <TableFilters
                type="empleados"
                searchText={searchTextEmpleados}
                onSearchChange={setSearchTextEmpleados}
                clearFilters={() => setFiltrosEmpleados({ puesto: '', evento: '', estado: '' })}
                activeFiltersCount={getActiveFiltersCount(filtrosEmpleados)}
                filterContent={filterContentEmpleados}
              />
              <Table
                className="dashboard-table"
                columns={empleadosColumns}
                dataSource={getFilteredEmpleados()}
                loading={loading}
                pagination={{ pageSize: 3 }}
                rowKey="id_empleado"
                scroll={{ x: 'max-content' }}
              />
            </Card>
          </div>

          {/* Cuarta fila: Pagos Realizados */}
          <div className="dashboard-row">
            <Card
              title="PAGOS REALIZADOS"
              className="dashboard-card full-width"
            >
              <TableFilters
                type="pagos"
                searchText={searchTextPagos}
                onSearchChange={setSearchTextPagos}
                clearFilters={() => setFiltrosPagos({ modo: '', tipo: '', estado: '' })}
                activeFiltersCount={getActiveFiltersCount(filtrosPagos)}
                filterContent={filterContentPagos}
              />
              <Table
                className="dashboard-table"
                columns={pagosColumns}
                dataSource={getFilteredPagos()}
                loading={loading}
                pagination={{ pageSize: 3 }}
                rowKey="id_pago"
                scroll={{ x: 'max-content' }}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Evento */}
      {modalEventoVisible && (
        <EventoForm
          visible={modalEventoVisible}
          onCancel={() => {
            setModalEventoVisible(false);
            setSelectedEvento(null);
          }}
          onSubmit={async (values) => {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                message.error('No hay sesión activa');
                return;
              }

              // Formatear las fechas
              const formattedValues = {
                ...values,
                fecha_evento: values.fecha_evento.format('YYYY-MM-DD'),
                hora_evento: values.hora_evento.format('HH:mm:ss')
              };

              const url = selectedEvento
                ? `${apiUrl}/evento/${selectedEvento.id_evento}`
                : `${apiUrl}/evento`;

              const method = selectedEvento ? 'PUT' : 'POST';

              const response = await fetch(url, {
                method,
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  ...formattedValues,
                  // Mantener los valores originales para campos no editables
                  cedula_cliente: selectedEvento ? selectedEvento.cliente.cedula_usuario : userCedula,
                  cedula_asesor: selectedEvento ? selectedEvento.asesor.cedula_usuario : null,
                  estado_solicitud: selectedEvento ? selectedEvento.estado_solicitud : 'pendiente'
                })
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensaje || 'Error al guardar el evento');
              }

              message.success(selectedEvento ? 'Evento actualizado exitosamente' : 'Evento creado exitosamente');
              setModalEventoVisible(false);
              setSelectedEvento(null);
              fetchData();
            } catch (error) {
              console.error('Error al guardar evento:', error);
              message.error(error instanceof Error ? error.message : 'Error al guardar el evento');
            }
          }}
          loading={loading || loadingUbicaciones}
          clientes={[]}
          asesores={[]}
          tiposEvento={tiposEvento}
          initialValues={selectedEvento || undefined}
          provincias={provincias}
          ciudades={ciudades}
          userCedula={userCedula}
        />
      )}

      {/* Modal de Decoración */}
      {modalDecoracionVisible && (
        <DecoracionForm
          visible={modalDecoracionVisible}
          onCancel={() => {
            setModalDecoracionVisible(false);
            setSelectedDecoracion(undefined);
          }}
          onSubmit={async (values) => {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                message.error('No hay sesión activa');
                return;
              }

              const url = selectedDecoracion
                ? `${apiUrl}/decoracion/${selectedDecoracion.id_decoracion}`
                : `${apiUrl}/decoracion`;

              const method = selectedDecoracion ? 'PUT' : 'POST';

              const response = await fetch(url, {
                method,
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  ...values,
                  detalles: values.detalle_decoracion || []
                })
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensaje || 'Error al guardar la decoración');
              }

              message.success(selectedDecoracion ? 'Decoración actualizada exitosamente' : 'Decoración creada exitosamente');
              setModalDecoracionVisible(false);
              setSelectedDecoracion(undefined);
              fetchData();
            } catch (error) {
              console.error('Error al guardar decoración:', error);
              message.error(error instanceof Error ? error.message : 'Error al guardar la decoración');
            }
          }}
          loading={loading}
          initialValues={selectedDecoracion || undefined}
          eventosCliente={eventos}
          userCedula={userCedula}
        />
      )}

      {/* Modal de Comentario */}
      <Modal
        title={selectedComentario ? "Editar Comentario" : "Agregar Comentario"}
        open={modalComentarioVisible}
        onCancel={() => {
          setModalComentarioVisible(false);
          setSelectedComentario(null);
          setSelectedEventoComentario(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitComentario}
        >
          <Form.Item
            name="id_evento"
            label="Seleccionar Evento"
            rules={[{ required: true, message: 'Por favor seleccione un evento' }]}
          >
            <Select
              placeholder="Seleccione un evento"
              onChange={(value) => {
                const evento = eventos.find(e => e.id_evento === value);
                setSelectedEventoComentario(evento || null);
              }}
            >
              {eventos
                .filter(evento => evento.cliente.cedula_usuario === userCedula)
                .map(evento => (
                  <Select.Option key={evento.id_evento} value={evento.id_evento}>
                    {`${evento.tipo_evento.tipo_evento} - ${evento.fecha_evento && dayjs.isDayjs(evento.fecha_evento) && evento.fecha_evento.isValid() ? evento.fecha_evento.format('DD/MM/YYYY') : 'Fecha no disponible'}`}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="comentario"
            label="Comentario"
            rules={[{ required: true, message: 'Por favor ingrese un comentario' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="calificacion"
            label="Calificación"
            rules={[{ required: true, message: 'Por favor seleccione una calificación' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {selectedComentario ? 'Actualizar' : 'Guardar'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Ver Más Evento */}
      <Modal
        title="Detalles del Evento"
        open={modalVerMasEventoVisible}
        onCancel={() => {
          setModalVerMasEventoVisible(false);
          setSelectedEvento(null);
        }}
        footer={null}
      >
        {selectedEvento && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="ID del Evento">
              {selectedEvento.id_evento}
            </Descriptions.Item>
            <Descriptions.Item label="Tipo de Evento">
              {selectedEvento.tipo_evento.tipo_evento}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha">
              {selectedEvento.fecha_evento && dayjs.isDayjs(selectedEvento.fecha_evento) && selectedEvento.fecha_evento.isValid() ? selectedEvento.fecha_evento.format('DD/MM/YYYY') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Hora">
              {selectedEvento.hora_evento && dayjs.isDayjs(selectedEvento.hora_evento) && selectedEvento.hora_evento.isValid() ? selectedEvento.hora_evento.format('HH:mm') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              {selectedEvento.estado_solicitud}
            </Descriptions.Item>
            <Descriptions.Item label="Espacio">
              {selectedEvento.espacio_evento}
            </Descriptions.Item>
            <Descriptions.Item label="Dirección">
              {selectedEvento.direccion ? 
                `${selectedEvento.direccion.calle || ''} ${selectedEvento.direccion.sector || ''} ${selectedEvento.direccion.ciudad?.nombre_ciudad || ''} ${selectedEvento.direccion.ciudad?.provincia?.nombre_provincia || ''}`
                : 'No disponible'}
            </Descriptions.Item>
            <Descriptions.Item label="Notas">
              {selectedEvento.nota_cliente || (selectedEvento.direccion && selectedEvento.direccion.detalles) || 'Sin notas'}
            </Descriptions.Item>
            <Descriptions.Item label="Asesor">
              {selectedEvento.asesor ? 
                `${selectedEvento.asesor.nombre_usuario} ${selectedEvento.asesor.apellido_usuario} (Cédula: ${selectedEvento.asesor.cedula_usuario || 'N/A'})`
                : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal de Ver Más Decoración */}
      <Modal
        title="Detalles de la Decoración"
        open={modalVerMasDecoracionVisible}
        onCancel={() => {
          setModalVerMasDecoracionVisible(false);
          setSelectedDecoracion(undefined);
        }}
        footer={null}
      >
        {selectedDecoracion && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tema">
              {selectedDecoracion.tema_decoracion}
            </Descriptions.Item>
            <Descriptions.Item label="Colores">
              {selectedDecoracion.colores_decoracion || 'No especificado'}
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              {selectedDecoracion.estado_decoracion}
            </Descriptions.Item>
            <Descriptions.Item label="Precio Neto">
              {selectedDecoracion.precioneto_decoracion?.toFixed(2) || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="ITBIS">
              {selectedDecoracion.itbis_decoracion?.toFixed(2) || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Total">
              {selectedDecoracion.total_decoracion?.toFixed(2) || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Evento Asociado">
              {selectedDecoracion.evento ? 
                `${selectedDecoracion.evento.tipo_evento.tipo_evento} - ${selectedDecoracion.evento.fecha_evento && dayjs.isDayjs(selectedDecoracion.evento.fecha_evento) && selectedDecoracion.evento.fecha_evento.isValid() ? selectedDecoracion.evento.fecha_evento.format('DD/MM/YYYY') : 'Fecha no disponible'}`
                : 'No disponible'}
            </Descriptions.Item>
            <Descriptions.Item label="Detalle de Decoración">
              {selectedDecoracion.detalle_decoracion && selectedDecoracion.detalle_decoracion.length > 0 ? (
                <ul>
                  {selectedDecoracion.detalle_decoracion.map((detalle, index) => (
                    <li key={index}>
                      {`${detalle.elemento_decoracion} (Cantidad: ${detalle.cantelemento_decoracion}, Precio por Unidad: ${detalle.precio_elemento?.toFixed(2)}, Precio Total: ${detalle.precio_decoracion?.toFixed(2)})`}
                    </li>
                  ))}
                </ul>
              ) : 'Sin detalles'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal de Ver Más Empleado */}
      <Modal
        title="Detalles del Empleado"
        open={modalVerMasEmpleadoVisible}
        onCancel={() => {
          setModalVerMasEmpleadoVisible(false);
          setSelectedEmpleado(null);
        }}
        footer={null}
      >
        {selectedEmpleado && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Nombre">
              {selectedEmpleado.empleado?.nombre_usuario}
            </Descriptions.Item>
            <Descriptions.Item label="Apellido">
              {selectedEmpleado.empleado?.apellido_usuario}
            </Descriptions.Item>
            <Descriptions.Item label="Cédula">
              {selectedEmpleado.empleado?.cedula_usuario}
            </Descriptions.Item>
            <Descriptions.Item label="Puesto">
              {selectedEmpleado.puesto_evento}
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              {selectedEmpleado.estado_empevento}
            </Descriptions.Item>
            <Descriptions.Item label="Evento">
              {selectedEmpleado.evento ? 
                `${selectedEmpleado.evento.id_evento} - ${selectedEmpleado.evento.fecha_evento} - ${selectedEmpleado.evento.espacio_evento} - ${selectedEmpleado.evento.estado_solicitud}`
                : 'No disponible'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
