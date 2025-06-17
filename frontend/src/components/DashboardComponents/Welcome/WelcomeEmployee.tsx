import { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Table,
  Button,
  Modal,
  Select,
  DatePicker,
  List,
  Space,
  Tag,
  Input,
  Descriptions,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  PlusOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import "../../../styles/dashboard/ServicesSubpages.scss";
import EventoForm from "../FormService/EventoForm";
import { message } from "antd";
import AsignacionEmpleadoForm from "../FormService/AsignacionEmpleadoForm";
import TableFilters from "../MoreDash/TableFilters";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import PagoForm from "../FormService/PagoForm";
import { apiUrl } from '../../../config';

const { Title } = Typography;
const { Option } = Select;

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
  total_evento?: number;
  subtotal_evento?: number;
  itbis_evento?: number;
  creacion_evento?: string;
  direccion?: {
    sector: string;
    calle: string;
    ciudad?: {
      nombre_ciudad: string;
      provincia?: {
        nombre_provincia: string;
      };
    };
  };
}

interface AsignacionEmpleado {
  id_evento: number;
  empleado_evento: string;
  puesto_evento:
    | "Decorador"
    | "Camarero"
    | "Conductor"
    | "Supervisor"
    | "Encargado de Logística"
    | "Encargado de Limpieza";
  estado_empevento: "Activo" | "Eliminado" | "Completado";
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
    asesor?: {
      cedula_usuario: string;
      nombre_usuario: string;
      apellido_usuario: string;
    };
    estado_solicitud?: string;
    sector?: string;
    calle?: string;
    detalles?: string;
    cedula_cliente?: string;
    cedula_asesor?: string;
    id_tipo_evento?: number;
    nota_cliente?: string;
    id_direccion?: number;
    espacio_evento?: string;
    desea_supervision?: boolean;
    total_evento?: number;
    subtotal_evento?: number;
    itbis_evento?: number;
    creacion_evento?: string;
    direccion?: {
      sector: string;
      calle: string;
      ciudad?: {
        nombre_ciudad: string;
        provincia?: {
          nombre_provincia: string;
        };
      };
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
  tel_usuario: string;
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

interface Pago {
  id_pago: number;
  id_evento: number;
  monto: number;
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

interface Provincia {
  id_provincia: number;
  nombre_provincia: string;
}

interface Ciudad {
  id_ciudad: number;
  nombre_ciudad: string;
  id_provincia: number;
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
}

const WelcomeEmployee: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionEmpleado[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [decoraciones, setDecoraciones] = useState<Decoracion[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [user, setUser] = useState<Usuario | null>(null);
  const [userCedula, setUserCedula] = useState<string | null>(null);
  const [empleadosParticipantes, setEmpleadosParticipantes] = useState<AsignacionEmpleado[]>([]);
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [modalEventoVisible, setModalEventoVisible] = useState(false);
  const [modalAsignacionVisible, setModalAsignacionVisible] = useState(false);
  const [modalPagoVisible, setModalPagoVisible] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [eventoDetalles, setEventoDetalles] = useState<Evento | null>(null);
  const [selectedAsignacion, setSelectedAsignacion] = useState<AsignacionEmpleado | null>(null);

  // Estados para búsqueda y filtros
  const [searchTextEventos, setSearchTextEventos] = useState("");
  const [searchTextAsignaciones, setSearchTextAsignaciones] = useState("");
  const [searchTextParticipaciones, setSearchTextParticipaciones] = useState("");
  const [searchTextClientes, setSearchTextClientes] = useState("");
  const [searchTextDecoraciones, setSearchTextDecoraciones] = useState("");
  const [searchTextPagos, setSearchTextPagos] = useState("");

  // Estados para los filtros
  const [filtrosEventos, setFiltrosEventos] = useState({
    estado: "",
    tipo: "",
    fecha: "",
  });
  const [filtrosAsignaciones, setFiltrosAsignaciones] = useState({
    rol: "",
    estado: "",
    eventoId: "",
  });
  const [filtrosParticipaciones, setFiltrosParticipaciones] = useState({
    rol: "",
    estado: "",
    eventoId: "",
  });
  const [filtrosClientes, setFiltrosClientes] = useState({
    estado: "",
  });
  const [filtrosDecoraciones, setFiltrosDecoraciones] = useState({
    estado: "",
    eventoId: "",
  });
  const [filtrosPagos, setFiltrosPagos] = useState({
    estado: '',
    eventoId: '',
    metodo: '',
    tipo: ''
  });

  // Estados para los modales de detalles
  const [modalDetallesEventoVisible, setModalDetallesEventoVisible] = useState(false);
  const [modalDetallesAsignacionVisible, setModalDetallesAsignacionVisible] = useState(false);
  const [modalDetallesClienteVisible, setModalDetallesClienteVisible] = useState(false);
  const [modalDetallesDecoracionVisible, setModalDetallesDecoracionVisible] = useState(false);
  const [modalDetallesPagoVisible, setModalDetallesPagoVisible] = useState(false);

  // Estados para los datos seleccionados
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState<AsignacionEmpleado | null>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [decoracionSeleccionada, setDecoracionSeleccionada] = useState<Decoracion | null>(null);
  const [pagoSeleccionado, setPagoSeleccionado] = useState<Pago | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          message.error("No hay sesión activa");
          return;
        }

        const response = await fetch(`${apiUrl}/auth/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener datos del usuario");
        }

        const userData = await response.json();
        setUserCedula(userData.cedula_usuario);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        message.error("Error al obtener datos del usuario");
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (userCedula) {
      fetchData();
      fetchDecoraciones();
      fetchPagos();
    }
  }, [userCedula]);

  useEffect(() => {
    fetchTiposEvento();
  }, []);

  // Cargar provincias y ciudades al montar el componente
  useEffect(() => {
    const fetchProvincias = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await fetch(`${apiUrl}/provincia`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setProvincias(data);
        }
      } catch (e) { /* opcional: manejar error */ }
    };
    const fetchCiudades = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await fetch(`${apiUrl}/ciudad`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCiudades(data);
        }
      } catch (e) { /* opcional: manejar error */ }
    };
    fetchProvincias();
    fetchCiudades();
  }, [apiUrl]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No hay token de autenticación");
        return;
      }

      // Obtener eventos donde el empleado es asesor
      const eventosResponse = await fetch(
        `${apiUrl}/evento/asesor/${userCedula}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!eventosResponse.ok) {
        throw new Error("Error al cargar los eventos");
      }
      const eventosData = await eventosResponse.json();
      console.log(
        "Datos de eventos recibidos (antes de parsear):",
        eventosData
      );
      const parsedEventos = eventosData.map((evento: Evento) => ({
        ...evento,
        fecha_evento: evento.fecha_evento ? dayjs(evento.fecha_evento) : null,
        hora_evento: evento.hora_evento
          ? dayjs(evento.hora_evento, "HH:mm:ss")
          : null,
      }));
      console.log(
        "Datos de eventos recibidos (después de parsear):",
        parsedEventos
      );
      setEventos(parsedEventos);

      // Obtener asignaciones de empleados (donde el empleado es asesor)
      const asignacionesResponse = await fetch(
        `${apiUrl}/evento/asesor/${userCedula}/asignaciones-equipo`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!asignacionesResponse.ok) {
        throw new Error("Error al cargar las asignaciones de equipo");
      }
      const asignacionesData = await asignacionesResponse.json();
      console.log(
        "Datos de asignaciones recibidos (equipo de asesor):",
        asignacionesData
      );
      setAsignaciones(asignacionesData);

      // Obtener participaciones del empleado (donde el empleado es el asignado)
      const participacionesResponse = await fetch(
        `${apiUrl}/evento/empleado/${userCedula}/eventos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!participacionesResponse.ok) {
        throw new Error("Error al cargar las participaciones");
      }
      const participacionesData = await participacionesResponse.json();
      console.log("Datos de participaciones recibidos:", participacionesData);
      setEmpleadosParticipantes(participacionesData);

      // Obtener clientes
      const clientesResponse = await fetch(`${apiUrl}/usuario?rol=2`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!clientesResponse.ok) {
        throw new Error("Error al cargar los clientes");
      }
      const clientesData = await clientesResponse.json();
      console.log("Datos de clientes recibidos:", clientesData);
      setClientes(clientesData.usuarios || []);

      // Obtener asesores
      const asesoresResponse = await fetch(`${apiUrl}/usuario/rol/3`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!asesoresResponse.ok) {
        throw new Error("Error al cargar los asesores");
      }
      const asesoresData = await asesoresResponse.json();
      console.log("Datos de asesores recibidos:", asesoresData);
      setAsesores(asesoresData);

      // Obtener empleados
      const empleadosResponse = await fetch(`${apiUrl}/usuario/rol/3`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!empleadosResponse.ok) {
        throw new Error("Error al cargar los empleados");
      }
      const empleadosData = await empleadosResponse.json();
      console.log("Datos de empleados recibidos:", empleadosData);
      setEmpleados(empleadosData);

      setError(null);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      setError("Error al cargar los datos");
      message.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const fetchDecoraciones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${apiUrl}/decoracion?include=evento.cliente,evento.tipo_evento,detalle_decoracion`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Error al cargar las decoraciones");
      }
      const data = await response.json();
      setDecoraciones(data);
    } catch (error) {
      console.error("Error al cargar decoraciones:", error);
      message.error("Error al cargar las decoraciones");
    } finally {
      setLoading(false);
    }
  };

  const fetchPagos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${apiUrl}/pago?include=evento.cliente`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error("Error al cargar los pagos");
      }
      const data = await response.json();
      setPagos(data);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
      message.error("Error al cargar los pagos");
    } finally {
      setLoading(false);
    }
  };

  const fetchTiposEvento = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No hay sesión activa");
        return;
      }

      const response = await fetch(`${apiUrl}/evento/tipo-eventos/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener tipos de evento");
      }
      const data = await response.json();
      setTiposEvento(data);
    } catch (error) {
      console.error("Error al cargar tipos de evento:", error);
      message.error("Error al cargar los tipos de evento");
    }
  };

  const handleEditEvento = (evento: Evento) => {
    setSelectedEvento(evento);
    setModalEventoVisible(true);
  };

  const handleEliminarEvento = async (evento: Evento) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No hay sesión activa");
        return;
      }

      const response = await fetch(`${apiUrl}/evento/${evento.id_evento}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el evento");
      }

      message.success("Evento eliminado exitosamente");
      fetchData();
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      message.error("Error al eliminar el evento");
    }
  };

  const handleVerDetallesEvento = async (evento: Evento) => {
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

      setEventoSeleccionado(eventoCompleto);
    setModalDetallesEventoVisible(true);
    } catch (error) {
      console.error('Error al obtener detalles:', error);
      message.error('Error al cargar los detalles del evento');
    }
  };

  const handleVerDetallesAsignacion = (asignacion: AsignacionEmpleado) => {
    setAsignacionSeleccionada(asignacion);
    setModalDetallesAsignacionVisible(true);
  };

  const handleVerDetallesCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setModalDetallesClienteVisible(true);
  };

  const handleVerDetallesDecoracion = (decoracion: Decoracion) => {
    setDecoracionSeleccionada(decoracion);
    setModalDetallesDecoracionVisible(true);
  };

  const handleVerDetallesPago = (pago: Pago) => {
    setPagoSeleccionado(pago);
    setModalDetallesPagoVisible(true);
  };

  const handleCreateAsignacion = async (values: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${apiUrl}/empleadoevento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error('Error al crear la asignación');
      }

      message.success('Asignación creada exitosamente');
      setModalAsignacionVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error al crear asignación:', error);
      message.error('Error al crear la asignación');
    } finally {
      setLoading(false);
    }
  };

  const handleEditarAsignacion = async (values: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No hay token de autenticación");
        return;
      }

      setLoading(true);
      const response = await fetch(
        `${apiUrl}/evento/${values.id_evento}/empleados/${values.empleado_evento}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            puesto_evento: values.puesto_evento,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar la asignación");
      }

      message.success("Asignación actualizada exitosamente");
      setModalAsignacionVisible(false);
      fetchData();
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar la asignación"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAsignacion = async (record: AsignacionEmpleado) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No hay sesión activa");
        return;
      }

      const response = await fetch(
        `${apiUrl}/evento/${record.id_evento}/empleados/${record.empleado_evento}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estado_empevento: "Eliminado",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar la asignación");
      }

      message.success("Asignación eliminada exitosamente");
      fetchData();
    } catch (error) {
      console.error("Error al eliminar asignación", error);
      message.error("Error al eliminar la asignación");
    }
  };

      // Obtener detalles del evento
      const handleVerDetallesParticipacion = async (participacion: AsignacionEmpleado) => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            message.error('No hay sesión activa');
            return;
          }

          // Obtener detalles del evento usando el endpoint correcto
          const eventoResponse = await fetch(`${apiUrl}/evento/${participacion.id_evento}?include=cliente,asesor,tipo_evento,direccion`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!eventoResponse.ok) {
            throw new Error('Error al obtener detalles del evento');
          }

          const eventoData = await eventoResponse.json();

          // Combinar los datos
          const eventoCompleto = {
            ...eventoData,
            fecha_evento: eventoData.fecha_evento ? dayjs(eventoData.fecha_evento) : null,
            hora_evento: eventoData.hora_evento ? dayjs(eventoData.hora_evento, "HH:mm:ss") : null
          };

          setEventoSeleccionado(eventoCompleto);
          setModalDetallesEventoVisible(true);
        } catch (error) {
          console.error('Error al obtener detalles:', error);
          message.error('Error al cargar los detalles del evento');
        }
      };

  const handleCreateEventoSubmit = async (values: EventoFormValues) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${apiUrl}/evento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error('Error al crear el evento');
      }

      message.success('Evento creado exitosamente');
      setModalEventoVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error al crear evento:', error);
      message.error('Error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearPago = async (values: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${apiUrl}/pago`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error('Error al crear el pago');
      }

      message.success('Pago creado exitosamente');
      setModalPagoVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error al crear pago:', error);
      message.error('Error al crear el pago');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEventos = () => {
    return eventos.filter((evento) => {
      const searchLower = searchTextEventos.toLowerCase();
      const matchesSearch =
        evento.tipo_evento.tipo_evento.toLowerCase().includes(searchLower) ||
        evento.estado_solicitud.toLowerCase().includes(searchLower) ||
        evento.cliente.nombre_usuario.toLowerCase().includes(searchLower) ||
        evento.cliente.apellido_usuario.toLowerCase().includes(searchLower) ||
        evento.sector.toLowerCase().includes(searchLower) ||
        evento.calle.toLowerCase().includes(searchLower);

      const matchesEstado = !filtrosEventos.estado || evento.estado_solicitud === filtrosEventos.estado;
      const matchesTipo = !filtrosEventos.tipo || evento.tipo_evento.tipo_evento === filtrosEventos.tipo;
      const matchesFecha = !filtrosEventos.fecha || evento.fecha_evento?.format('YYYY-MM-DD') === filtrosEventos.fecha;

      return matchesSearch && matchesEstado && matchesTipo && matchesFecha;
    });
  };

  const getFilteredAsignaciones = () => {
    return asignaciones.filter((asignacion) => {
      const searchLower = searchTextAsignaciones.toLowerCase();
      const matchesSearch =
        asignacion.puesto_evento.toLowerCase().includes(searchLower) ||
        asignacion.estado_empevento.toLowerCase().includes(searchLower) ||
        (asignacion.empleado?.nombre_usuario.toLowerCase().includes(searchLower) || false) ||
        (asignacion.empleado?.apellido_usuario.toLowerCase().includes(searchLower) || false);

      const matchesRol = !filtrosAsignaciones.rol || asignacion.puesto_evento === filtrosAsignaciones.rol;
      const matchesEstado = !filtrosAsignaciones.estado || asignacion.estado_empevento === filtrosAsignaciones.estado;
      const matchesEvento = !filtrosAsignaciones.eventoId || asignacion.id_evento.toString() === filtrosAsignaciones.eventoId;

      return matchesSearch && matchesRol && matchesEstado && matchesEvento;
    });
  };

  const getFilteredParticipaciones = () => {
    return empleadosParticipantes.filter((participacion) => {
      const searchLower = searchTextParticipaciones.toLowerCase();
      const matchesSearch =
        participacion.puesto_evento.toLowerCase().includes(searchLower) ||
        participacion.estado_empevento.toLowerCase().includes(searchLower) ||
        (participacion.evento?.cliente?.nombre_usuario.toLowerCase().includes(searchLower) || false) ||
        (participacion.evento?.cliente?.apellido_usuario.toLowerCase().includes(searchLower) || false);

      const matchesRol = !filtrosParticipaciones.rol || participacion.puesto_evento === filtrosParticipaciones.rol;
      const matchesEstado = !filtrosParticipaciones.estado || participacion.estado_empevento === filtrosParticipaciones.estado;
      const matchesEvento = !filtrosParticipaciones.eventoId || participacion.id_evento.toString() === filtrosParticipaciones.eventoId;

      return matchesSearch && matchesRol && matchesEstado && matchesEvento;
    });
  };

  const getFilteredClientes = () => {
    return clientes.filter((cliente) => {
      const searchLower = searchTextClientes.toLowerCase();
      const matchesSearch =
        cliente.nombre_usuario.toLowerCase().includes(searchLower) ||
        cliente.apellido_usuario.toLowerCase().includes(searchLower) ||
        cliente.cedula_usuario.toLowerCase().includes(searchLower) ||
        cliente.correo_usuario.toLowerCase().includes(searchLower) ||
        cliente.tel_usuario.toLowerCase().includes(searchLower);

      const matchesEstado = !filtrosClientes.estado || cliente.estado_usuario === filtrosClientes.estado;

      return matchesSearch && matchesEstado;
    });
  };

  const getFilteredDecoraciones = () => {
    return decoraciones.filter((decoracion) => {
      const searchLower = searchTextDecoraciones.toLowerCase();
      const matchesSearch =
        decoracion.tema_decoracion.toLowerCase().includes(searchLower) ||
        decoracion.colores_decoracion.toLowerCase().includes(searchLower) ||
        decoracion.estado_decoracion.toLowerCase().includes(searchLower) ||
        (decoracion.evento?.cliente?.nombre_usuario.toLowerCase().includes(searchLower) || false) ||
        (decoracion.evento?.cliente?.apellido_usuario.toLowerCase().includes(searchLower) || false);

      const matchesEstado = !filtrosDecoraciones.estado || decoracion.estado_decoracion === filtrosDecoraciones.estado;
      const matchesEvento = !filtrosDecoraciones.eventoId || decoracion.id_evento.toString() === filtrosDecoraciones.eventoId;

      return matchesSearch && matchesEstado && matchesEvento;
    });
  };

  const getFilteredPagos = () => {
    return pagos.filter((pago) => {
      const searchLower = searchTextPagos.toLowerCase();
      const matchesSearch =
        pago.tipo_pago.toLowerCase().includes(searchLower) ||
        pago.estado_pago.toLowerCase().includes(searchLower) ||
        pago.metodo_pago.toLowerCase().includes(searchLower) ||
        (pago.evento?.cliente?.nombre_usuario.toLowerCase().includes(searchLower) || false) ||
        (pago.evento?.cliente?.apellido_usuario.toLowerCase().includes(searchLower) || false);

      const matchesEstado = !filtrosPagos.estado || pago.estado_pago === filtrosPagos.estado;
      const matchesTipo = !filtrosPagos.tipo || pago.tipo_pago === filtrosPagos.tipo;
      const matchesMetodo = !filtrosPagos.metodo || pago.metodo_pago === filtrosPagos.metodo;
      const matchesEvento = !filtrosPagos.eventoId || pago.id_evento.toString() === filtrosPagos.eventoId;

      return matchesSearch && matchesEstado && matchesTipo && matchesMetodo && matchesEvento;
    });
  };

  const getActiveFiltersCount = (filters: any) => {
    let count = 0;
    for (const key in filters) {
      if (filters[key] && filters[key] !== "") {
        count++;
      }
    }
    return count;
  };

  const eventosColumns = [
    {
      title: "Evento",
      dataIndex: "id_evento",
      key: "id_evento",
      render: (text: string) => <span className="column-id">{text}</span>,
    },
    {
      title: "Tipo",
      dataIndex: ["tipo_evento", "tipo_evento"],
      key: "tipo_evento",
    },
    {
      title: "Cliente",
      dataIndex: ["cliente"],
      key: "cliente",
      render: (cliente: any) =>
        `${cliente.nombre_usuario} ${cliente.apellido_usuario}`,
    },
    {
      title: "Fecha",
      dataIndex: "fecha_evento",
      key: "fecha_evento",
      render: (fecha: Dayjs) => fecha?.format("DD/MM/YYYY"),
    },
    {
      title: "Hora",
      dataIndex: "hora_evento",
      key: "hora_evento",
      render: (hora: Dayjs) => hora?.format("HH:mm"),
    },
    {
      title: "Espacio",
      dataIndex: "espacio_evento",
      key: "espacio_evento",
    },
    {
      title: "Supervisión",
      dataIndex: "desea_supervision",
      key: "desea_supervision",
      render: (desea_supervision: boolean) => (desea_supervision ? "Sí" : "No"),
    },
    {
      title: "Estado",
      dataIndex: "estado_solicitud",
      key: "estado_solicitud",
      render: (estado: string) => {
        let color;
        switch (estado) {
          case "Pendiente":
            color = "gold";
            break;
          case "Aceptada":
            color = "green";
            break;
          case "Rechazada":
            color = "red";
            break;
          case "Completada":
            color = "blue";
            break;
          case "Cancelada":
            color = "volcano";
            break;
          default:
            color = "default";
        }
        return <Tag color={color}>{estado}</Tag>;
      },
    },
    {
      title: "Total $",
      dataIndex: "total_evento",
      key: "total_evento",
      render: (total: number) => `$${total?.toLocaleString()}`,
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: "right" as const,
      width: "fit-content",
      render: (_: any, record: Evento) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleVerDetallesEvento(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditEvento(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleEliminarEvento(record)}
          />
        </Space>
      ),
    },
  ];

  const asignacionesColumns = [
    {
      title: "Evento",
      dataIndex: ["evento", "id_evento"],
      key: "id_evento",
      render: (text: string) => <span className="column-id">{text}</span>,
    },
    {
      title: "Empleado",
      dataIndex: ["empleado"],
      key: "empleado",
      render: (empleado: any) =>
        empleado
          ? `${empleado.nombre_usuario} ${empleado.apellido_usuario}`
          : "N/A",
    },
    {
      title: "Puesto",
      dataIndex: "puesto_evento",
      key: "puesto_evento",
    },
    {
      title: "Estado Asignación",
      dataIndex: "estado_empevento",
      key: "estado_empevento",
      render: (estado: string) => {
        let color;
        switch (estado) {
          case "Activo":
            color = "green";
            break;
          case "Completado":
            color = "blue";
            break;
          case "Eliminado":
            color = "red";
            break;
          default:
            color = "default";
        }
        return <Tag color={color}>{estado}</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: "right" as const,
      width: "fit-content",
      render: (_: any, record: AsignacionEmpleado) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleVerDetallesAsignacion(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedAsignacion(record);
              setModalAsignacionVisible(true);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAsignacion(record)}
          />
        </Space>
      ),
    },
  ];

  const participacionesColumns = [
    {
      title: "Evento",
      dataIndex: ["evento", "id_evento"],
      key: "id_evento",
      render: (text: string) => <span className="column-id">{text}</span>,
    },
    {
      title: "Cliente",
      dataIndex: ["evento", "cliente"],
      key: "cliente",
      render: (cliente: any) =>
        cliente
          ? `${cliente.nombre_usuario} ${cliente.apellido_usuario}`
          : "N/A",
    },
    {
      title: "Asesor",
      dataIndex: ["evento", "asesor"],
      key: "asesor",
      render: (asesor: any) => {
        if (!asesor) {
          return `${userCedula ? "Tú" : "N/A"}`;
        }
        return `${asesor.nombre_usuario} ${asesor.apellido_usuario}`;
      },
    },
    {
      title: "Mi Puesto",
      dataIndex: "puesto_evento",
      key: "puesto_evento",
    },
    {
      title: "Estado Participación",
      dataIndex: "estado_empevento",
      key: "estado_empevento",
      render: (estado: string) => {
        let color;
        switch (estado) {
          case "Activo":
            color = "green";
            break;
          case "Completado":
            color = "blue";
            break;
          case "Eliminado":
            color = "red";
            break;
          default:
            color = "default";
        }
        return <Tag color={color}>{estado}</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: "right" as const,
      width: "fit-content",
      render: (_: any, record: AsignacionEmpleado) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleVerDetallesParticipacion(record)}
          />
        </Space>
      ),
    },
  ];

  const clientesColumns = [
    {
      title: "Cédula",
      dataIndex: "cedula_usuario",
      key: "cedula_usuario",
      render: (text: string) => <span className="column-id">{text}</span>,
    },
    {
      title: "Nombre",
      dataIndex: "nombre_usuario",
      key: "nombre_usuario",
    },
    {
      title: "Apellido",
      dataIndex: "apellido_usuario",
      key: "apellido_usuario",
    },
    {
      title: "Teléfono",
      dataIndex: "tel_usuario",
      key: "tel_usuario",
    },
    {
      title: "Correo",
      dataIndex: "correo_usuario",
      key: "correo_usuario",
    },
    {
      title: "Estado",
      dataIndex: "estado_usuario",
      key: "estado_usuario",
      render: (estado: string) => {
        let color;
        switch (estado) {
          case "Activo":
            color = "green";
            break;
          case "Inactivo":
            color = "red";
            break;
          default:
            color = "default";
        }
        return <Tag color={color}>{estado}</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: "right" as const,
      width: "fit-content",
      render: (_: any, record: Cliente) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleVerDetallesCliente(record)}
          />
        </Space>
      ),
    },
  ];

  const decoracionesColumns = [
    { title: "Evento ID", dataIndex: "id_evento", key: "id_evento" },
    { title: "Tema", dataIndex: "tema_decoracion", key: "tema_decoracion" },
    {
      title: "Colores",
      dataIndex: "colores_decoracion",
      key: "colores_decoracion",
    },
    {
      title: "Total $",
      dataIndex: "total_decoracion",
      key: "total_decoracion",
      render: (total: number) => `$${total?.toLocaleString()}`,
    },
    {
      title: "Estado",
      dataIndex: "estado_decoracion",
      key: "estado_decoracion",
      render: (estado: string) => {
        let color;
        switch (estado) {
          case "Activo":
            color = "green";
            break;
          case "Pendiente":
            color = "gold";
            break;
          case "Completada":
            color = "blue";
            break;
          case "Cancelada":
            color = "red";
            break;
          default:
            color = "default";
        }
        return <Tag color={color}>{estado}</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: any, record: Decoracion) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleVerDetallesDecoracion(record)}
          />
        </Space>
      ),
    },
  ];

  const pagosColumns = [
    {
      title: 'Evento ID',
      dataIndex: 'id_evento',
      key: 'id_evento',
    },
    {
      title: 'Cliente',
      dataIndex: ['evento', 'cliente'],
      key: 'cliente',
      render: (_: any, record: Pago) => {
        const eventoCorrespondiente = eventos.find(e => e.id_evento === record.id_evento);
        if (eventoCorrespondiente && eventoCorrespondiente.cliente) {
          return `${eventoCorrespondiente.cliente.nombre_usuario} ${eventoCorrespondiente.cliente.apellido_usuario}`;
        }
        return 'N/A';
      }
    },
    {
      title: 'Método de Pago',
      dataIndex: 'metodo_pago',
      key: 'metodo_pago',
      render: (metodo: string) => {
        switch(metodo) {
          case 'Efectivo':
            return 'Efectivo';
          case 'Tarjeta':
            return 'Tarjeta';
          case 'Transferencia':
            return 'Transferencia';
          default:
            return metodo;
        }
      }
    },
    {
      title: 'Fecha y Hora',
      dataIndex: 'fecha_pago',
      key: 'fecha_pago',
      render: (fecha: string, record: Pago) => `${fecha} ${record.hora_pago}`
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      render: (monto: number) => `RD$ ${monto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`
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
      render: (estado: string) => (
        <Tag color={
          estado === 'Recibido' ? 'green' :
          estado === 'Pendiente' ? 'orange' :
          'red'
        }>
          {estado}
        </Tag>
      )
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: 'right' as const,
      width: 'fit-content',
      render: (_: any, record: Pago) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleVerDetallesPago(record)}
          />
        </Space>
      ),
    },
  ];

  const filterContentEventos = (
    <div className="filters-container">
      <Select
        value={filtrosEventos.estado}
        onChange={(value) =>
          setFiltrosEventos({ ...filtrosEventos, estado: value })
        }
        placeholder="Estado"
        style={{ width: 120 }}
      >
        <Option value="">Todos los estados</Option>
        <Option value="Pendiente">Pendiente</Option>
        <Option value="Aceptada">Aceptada</Option>
        <Option value="Rechazada">Rechazada</Option>
        <Option value="Completada">Completada</Option>
        <Option value="Cancelada">Cancelada</Option>
      </Select>
      <Select
        value={filtrosEventos.tipo}
        onChange={(value) =>
          setFiltrosEventos({ ...filtrosEventos, tipo: value })
        }
        placeholder="Tipo de Evento"
        style={{ width: 150 }}
      >
        <Option value="">Todos los tipos</Option>
        {tiposEvento.map((tipo) => (
          <Option key={tipo.id_tipo_evento} value={tipo.tipo_evento}>
            {tipo.tipo_evento}
          </Option>
        ))}
      </Select>
      <DatePicker
        value={filtrosEventos.fecha ? dayjs(filtrosEventos.fecha) : null}
        onChange={(date) =>
          setFiltrosEventos({
            ...filtrosEventos,
            fecha: date ? date.format("YYYY-MM-DD") : "",
          })
        }
        placeholder="Fecha"
        style={{ width: 120 }}
      />
      <Button
        onClick={() => setFiltrosEventos({ estado: "", tipo: "", fecha: "" })}
      >
        Limpiar Filtros
      </Button>
    </div>
  );

  const filterContentAsignaciones = (
    <div className="filters-container">
      <Select
        value={filtrosAsignaciones.estado}
        onChange={(value) =>
          setFiltrosAsignaciones({ ...filtrosAsignaciones, estado: value })
        }
        placeholder="Estado"
        style={{ width: 120 }}
      >
        <Option value="">Todos los estados</Option>
        <Option value="Activo">Activo</Option>
        <Option value="Completado">Completado</Option>
        <Option value="Eliminado">Eliminado</Option>
      </Select>
      <Select
        value={filtrosAsignaciones.rol}
        onChange={(value) =>
          setFiltrosAsignaciones({ ...filtrosAsignaciones, rol: value })
        }
        placeholder="Puesto"
        style={{ width: 150 }}
      >
        <Option value="">Todos los puestos</Option>
        <Option value="Decorador">Decorador</Option>
        <Option value="Camarero">Camarero</Option>
        <Option value="Conductor">Conductor</Option>
        <Option value="Supervisor">Supervisor</Option>
        <Option value="Encargado de Logística">Encargado de Logística</Option>
        <Option value="Encargado de Limpieza">Encargado de Limpieza</Option>
      </Select>
      <Select
        value={filtrosAsignaciones.eventoId}
        onChange={(value) =>
          setFiltrosAsignaciones({ ...filtrosAsignaciones, eventoId: value })
        }
        placeholder="Evento ID"
        style={{ width: 120 }}
      >
        <Option value="">Todos los eventos</Option>
        {asignaciones.map(
          (asignacion) =>
            asignacion.evento && (
              <Option
                key={asignacion.id_evento}
                value={asignacion.id_evento.toString()}
              >
                {asignacion.evento.id_evento}
              </Option>
            )
        )}
      </Select>
      <Button
        onClick={() =>
          setFiltrosAsignaciones({ rol: "", estado: "", eventoId: "" })
        }
      >
        Limpiar Filtros
      </Button>
    </div>
  );

  const filterContentParticipaciones = (
    <div className="filters-container">
      <Select
        value={filtrosParticipaciones.estado}
        onChange={(value) =>
          setFiltrosParticipaciones({
            ...filtrosParticipaciones,
            estado: value,
          })
        }
        placeholder="Estado"
        style={{ width: 120 }}
      >
        <Option value="">Todos los estados</Option>
        <Option value="Activo">Activo</Option>
        <Option value="Completado">Completado</Option>
        <Option value="Eliminado">Eliminado</Option>
      </Select>
      <Select
        value={filtrosParticipaciones.rol}
        onChange={(value) =>
          setFiltrosParticipaciones({ ...filtrosParticipaciones, rol: value })
        }
        placeholder="Puesto"
        style={{ width: 150 }}
      >
        <Option value="">Todos los puestos</Option>
        <Option value="Decorador">Decorador</Option>
        <Option value="Camarero">Camarero</Option>
        <Option value="Conductor">Conductor</Option>
        <Option value="Supervisor">Supervisor</Option>
        <Option value="Encargado de Logística">Encargado de Logística</Option>
        <Option value="Encargado de Limpieza">Encargado de Limpieza</Option>
      </Select>
      <Select
        value={filtrosParticipaciones.eventoId}
        onChange={(value) =>
          setFiltrosParticipaciones({
            ...filtrosParticipaciones,
            eventoId: value,
          })
        }
        placeholder="Evento ID"
        style={{ width: 120 }}
      >
        <Option value="">Todos los eventos</Option>
        {empleadosParticipantes.map(
          (participacion) =>
            participacion.evento && (
              <Option
                key={participacion.id_evento}
                value={participacion.id_evento.toString()}
              >
                {participacion.evento.id_evento}
              </Option>
            )
        )}
      </Select>
      <Button
        onClick={() =>
          setFiltrosParticipaciones({ rol: "", estado: "", eventoId: "" })
        }
      >
        Limpiar Filtros
      </Button>
    </div>
  );

  const filterContentClientes = (
    <div className="filters-container">
      <Select
        value={filtrosClientes.estado}
        onChange={(value) =>
          setFiltrosClientes({ ...filtrosClientes, estado: value })
        }
        placeholder="Estado"
        style={{ width: 120 }}
      >
        <Option value="">Todos los estados</Option>
        <Option value="Activo">Activo</Option>
        <Option value="Inactivo">Inactivo</Option>
      </Select>
      <Button onClick={() => setFiltrosClientes({ estado: "" })}>
        Limpiar Filtros
      </Button>
    </div>
  );

  const filterContentDecoraciones = (
    <div className="filters-container">
      <Select
        value={filtrosDecoraciones.estado}
        onChange={(value) =>
          setFiltrosDecoraciones({ ...filtrosDecoraciones, estado: value })
        }
        placeholder="Estado"
        style={{ width: 120 }}
      >
        <Option value="">Todos los estados</Option>
        <Option value="Activo">Activo</Option>
        <Option value="Completada">Completada</Option>
        <Option value="Cancelada">Cancelada</Option>
      </Select>
      <Select
        value={filtrosDecoraciones.eventoId}
        onChange={(value) =>
          setFiltrosDecoraciones({ ...filtrosDecoraciones, eventoId: value })
        }
        placeholder="Evento ID"
        style={{ width: 120 }}
      >
        <Option value="">Todos los eventos</Option>
        {eventos.map((evento) => (
          <Option key={evento.id_evento} value={evento.id_evento.toString()}>
            {evento.id_evento}
          </Option>
        ))}
      </Select>
      <Button
        onClick={() =>
          setFiltrosDecoraciones({ estado: "", eventoId: "" })
        }
      >
        Limpiar Filtros
      </Button>
    </div>
  );

  const filterContentPagos = (
    <div className="filters-container">
      <Select
        value={filtrosPagos.estado}
        onChange={(value) => setFiltrosPagos({ ...filtrosPagos, estado: value })}
        placeholder="Estado"
        style={{ width: 120 }}
      >
        <Option value="">Todos los estados</Option>
        <Option value="Pendiente">Pendiente</Option>
        <Option value="Recibido">Recibido</Option>
        <Option value="Rechazado">Rechazado</Option>
      </Select>
      <Select
        value={filtrosPagos.metodo}
        onChange={(value) => setFiltrosPagos({ ...filtrosPagos, metodo: value })}
        placeholder="Método de Pago"
        style={{ width: 150 }}
      >
        <Option value="">Todos los métodos</Option>
        <Option value="Efectivo">Efectivo</Option>
        <Option value="Tarjeta">Tarjeta</Option>
        <Option value="Transferencia">Transferencia</Option>
      </Select>
      <Select
        value={filtrosPagos.tipo}
        onChange={(value) => setFiltrosPagos({ ...filtrosPagos, tipo: value })}
        placeholder="Tipo de Pago"
        style={{ width: 120 }}
      >
        <Option value="">Todos los tipos</Option>
        <Option value="Inicial">Inicial</Option>
        <Option value="Final">Final</Option>
        <Option value="Adicional">Adicional</Option>
      </Select>
      <Input
        placeholder="Buscar por ID de evento"
        value={filtrosPagos.eventoId}
        onChange={e => setFiltrosPagos({ ...filtrosPagos, eventoId: e.target.value })}
        style={{ width: '100%' }}
      />
      <Button
        onClick={() => setFiltrosPagos({ estado: "", eventoId: "", metodo: "", tipo: "" })}
      >
        Limpiar Filtros
      </Button>
    </div>
  );

  const handleEditEventoSubmit = async (values: EventoFormValues) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No hay token de autenticación");
        return;
      }

      const response = await fetch(`${apiUrl}/evento/${values.id_evento}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el evento");
      }

      message.success("Evento actualizado exitosamente");
      setModalEventoVisible(false);
      fetchData();
    } catch (error) {
      console.error("Error al actualizar evento:", error);
      message.error("Error al actualizar el evento");
    }
  };

  // Modales de detalles
  const renderModalDetallesEvento = () => (
    <Modal
      title="Detalles del Evento"
      open={modalDetallesEventoVisible}
      onCancel={() => setModalDetallesEventoVisible(false)}
      footer={null}
      width={800}
    >
      {eventoSeleccionado && (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID del Evento" span={2}>
            {eventoSeleccionado.id_evento}
          </Descriptions.Item>
          <Descriptions.Item label="Tipo de Evento">
            {eventoSeleccionado.tipo_evento?.tipo_evento}
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            {eventoSeleccionado.estado_solicitud}
          </Descriptions.Item>
          <Descriptions.Item label="Fecha">
            {eventoSeleccionado.fecha_evento?.format('DD/MM/YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Hora">
            {eventoSeleccionado.hora_evento?.format('HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Cliente" span={2}>
            {eventoSeleccionado.cliente ? 
              `${eventoSeleccionado.cliente.nombre_usuario} ${eventoSeleccionado.cliente.apellido_usuario}` : 
              'No disponible'}
          </Descriptions.Item>
          <Descriptions.Item label="Asesor" span={2}>
            {eventoSeleccionado.asesor ? 
              `${eventoSeleccionado.asesor.nombre_usuario} ${eventoSeleccionado.asesor.apellido_usuario}` : 
              'No asignado'}
          </Descriptions.Item>
          <Descriptions.Item label="Dirección" span={2}>
            {`${eventoSeleccionado.sector}, ${eventoSeleccionado.calle}`}
          </Descriptions.Item>
          <Descriptions.Item label="Espacio del Evento" span={2}>
            {eventoSeleccionado.espacio_evento}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );

  const renderModalDetallesAsignacion = () => (
    <Modal
      title="Detalles de la Asignación"
      open={modalDetallesAsignacionVisible}
      onCancel={() => setModalDetallesAsignacionVisible(false)}
      footer={null}
      width={800}
    >
      {asignacionSeleccionada && (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID del Evento">
            {asignacionSeleccionada.id_evento}
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            {asignacionSeleccionada.estado_empevento}
          </Descriptions.Item>
          <Descriptions.Item label="Puesto">
            {asignacionSeleccionada.puesto_evento}
          </Descriptions.Item>
          <Descriptions.Item label="Empleado" span={2}>
            {asignacionSeleccionada.empleado ? 
              `${asignacionSeleccionada.empleado.nombre_usuario} ${asignacionSeleccionada.empleado.apellido_usuario}` : 
              'No asignado'}
          </Descriptions.Item>
          {asignacionSeleccionada.evento && (
            <>
              <Descriptions.Item label="Fecha del Evento">
                {asignacionSeleccionada.evento.fecha_evento}
              </Descriptions.Item>
              <Descriptions.Item label="Hora del Evento">
                {asignacionSeleccionada.evento.hora_evento}
              </Descriptions.Item>
              <Descriptions.Item label="Cliente" span={2}>
                {asignacionSeleccionada.evento.cliente ? 
                  `${asignacionSeleccionada.evento.cliente.nombre_usuario} ${asignacionSeleccionada.evento.cliente.apellido_usuario}` : 
                  'No disponible'}
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      )}
    </Modal>
  );

  const renderModalDetallesCliente = () => (
    <Modal
      title="Detalles del Cliente"
      open={modalDetallesClienteVisible}
      onCancel={() => setModalDetallesClienteVisible(false)}
      footer={null}
      width={800}
    >
      {clienteSeleccionado && (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Cédula">
            {clienteSeleccionado.cedula_usuario}
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            {clienteSeleccionado.estado_usuario}
          </Descriptions.Item>
          <Descriptions.Item label="Nombre" span={2}>
            {`${clienteSeleccionado.nombre_usuario} ${clienteSeleccionado.apellido_usuario}`}
          </Descriptions.Item>
          <Descriptions.Item label="Teléfono">
            {clienteSeleccionado.tel_usuario}
          </Descriptions.Item>
          <Descriptions.Item label="Correo">
            {clienteSeleccionado.correo_usuario}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );

  const renderModalDetallesDecoracion = () => (
    <Modal
      title="Detalles de la Decoración"
      open={modalDetallesDecoracionVisible}
      onCancel={() => setModalDetallesDecoracionVisible(false)}
      footer={null}
      width={800}
    >
      {decoracionSeleccionada && (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID de Decoración">
            {decoracionSeleccionada.id_decoracion}
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            {decoracionSeleccionada.estado_decoracion}
          </Descriptions.Item>
          <Descriptions.Item label="Tema">
            {decoracionSeleccionada.tema_decoracion}
          </Descriptions.Item>
          <Descriptions.Item label="Colores">
            {decoracionSeleccionada.colores_decoracion}
          </Descriptions.Item>
          <Descriptions.Item label="Precio Neto">
            {decoracionSeleccionada.precioneto_decoracion ? 
              `RD$ ${decoracionSeleccionada.precioneto_decoracion.toLocaleString('es-DO', { minimumFractionDigits: 2 })}` 
              : 'No disponible'}
          </Descriptions.Item>
          <Descriptions.Item label="ITBIS">
            {decoracionSeleccionada.itbis_decoracion ? 
              `RD$ ${decoracionSeleccionada.itbis_decoracion.toLocaleString('es-DO', { minimumFractionDigits: 2 })}` 
              : 'No disponible'}
          </Descriptions.Item>
          <Descriptions.Item label="Total">
            {decoracionSeleccionada.total_decoracion ? 
              `RD$ ${decoracionSeleccionada.total_decoracion.toLocaleString('es-DO', { minimumFractionDigits: 2 })}` 
              : 'No disponible'}
          </Descriptions.Item>
          {decoracionSeleccionada.evento && (
            <>
              <Descriptions.Item label="Evento" span={2}>
                {`${decoracionSeleccionada.evento.tipo_evento.tipo_evento} - ${decoracionSeleccionada.evento.fecha_evento}`}
              </Descriptions.Item>
              <Descriptions.Item label="Cliente" span={2}>
                {decoracionSeleccionada.evento.cliente ? 
                  `${decoracionSeleccionada.evento.cliente.nombre_usuario} ${decoracionSeleccionada.evento.cliente.apellido_usuario}` : 
                  'No disponible'}
              </Descriptions.Item>
            </>
          )}
          {decoracionSeleccionada.detalle_decoracion && decoracionSeleccionada.detalle_decoracion.length > 0 && (
            <Descriptions.Item label="Elementos de Decoración" span={2}>
              <List
                dataSource={decoracionSeleccionada.detalle_decoracion}
                renderItem={(item) => (
                  <List.Item>
                    {item.elemento_decoracion} - Cantidad: {item.cantelemento_decoracion} - 
                    Precio: {item.precio_elemento ? 
                      `RD$ ${item.precio_elemento.toLocaleString('es-DO', { minimumFractionDigits: 2 })}` 
                      : 'No disponible'} - 
                    Total: {item.precio_decoracion ? 
                      `RD$ ${item.precio_decoracion.toLocaleString('es-DO', { minimumFractionDigits: 2 })}` 
                      : 'No disponible'}
                  </List.Item>
                )}
              />
            </Descriptions.Item>
          )}
        </Descriptions>
      )}
    </Modal>
  );

  const renderModalDetallesPago = () => (
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
          <Descriptions.Item label="ID del Pago" span={2}>
            {pagoSeleccionado.id_pago}
          </Descriptions.Item>
          <Descriptions.Item label="Evento" span={2}>
            ID: {pagoSeleccionado.id_evento} - 
            {pagoSeleccionado.evento?.cliente ? 
              `${pagoSeleccionado.evento.cliente.nombre_usuario} ${pagoSeleccionado.evento.cliente.apellido_usuario}` : 
              'Cliente no disponible'}
          </Descriptions.Item>
          <Descriptions.Item label="Monto">
            {pagoSeleccionado.monto ? 
              `RD$ ${pagoSeleccionado.monto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}` 
              : 'No disponible'}
          </Descriptions.Item>
          <Descriptions.Item label="Tipo">
            {pagoSeleccionado.tipo_pago === 'Inicial' ? 'Inicial' : 
             pagoSeleccionado.tipo_pago === 'Final' ? 'Final' : 'Adicional'}
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            {pagoSeleccionado.estado_pago === 'Recibido' ? 'Recibido' : 
             pagoSeleccionado.estado_pago === 'Pendiente' ? 'Pendiente' : 'Rechazado'}
          </Descriptions.Item>
          <Descriptions.Item label="Método de Pago">
            {pagoSeleccionado.metodo_pago}
          </Descriptions.Item>
          <Descriptions.Item label="Fecha">
            {new Date(pagoSeleccionado.fecha_pago).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Hora">
            {pagoSeleccionado.hora_pago}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );

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
                  onClick={() => {
                    setSelectedEvento(null);
                    setModalEventoVisible(true);
                  }}
                >
                  Nuevo Evento{" "}
                </Button>
              }
            >
              <TableFilters type="eventos"
                searchText={searchTextEventos}
                onSearchChange={setSearchTextEventos}
                clearFilters={() =>
                  setFiltrosEventos({ estado: "", tipo: "", fecha: "" })
                }
                activeFiltersCount={getActiveFiltersCount(filtrosEventos)}
                filterContent={filterContentEventos}
              />
              <Table
                columns={eventosColumns}
                dataSource={getFilteredEventos()}
                loading={loading}
                rowKey="id_evento"
                locale={{ emptyText: <span style={{ color: '#999', fontWeight: 500, fontSize: 16 }}>No hay Registros</span> }}
              />
            </Card>
          </div>

          {/* Segunda fila: Asignaciones y Participaciones */}
          <div className="dashboard-row">
            {/* Tarjeta de Asignaciones de Equipo (Eventos donde es asesor) */}
            <Card
              title="ASIGNACIONES DE EQUIPO"
              className="dashboard-card"
              extra={
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => {
                    setSelectedAsignacion(null);
                    setModalAsignacionVisible(true);
                  }}
                  className="action-button primary"
                >
                  Asignar empleado{" "}
                </Button>
              }
            >
              <TableFilters type="asignaciones"
                searchText={searchTextAsignaciones}
                onSearchChange={setSearchTextAsignaciones}
                clearFilters={() =>
                  setFiltrosAsignaciones({ rol: "", estado: "", eventoId: "" })
                }
                activeFiltersCount={getActiveFiltersCount(filtrosAsignaciones)}
                filterContent={filterContentAsignaciones}
              />
              <Table
                columns={asignacionesColumns}
                dataSource={getFilteredAsignaciones()}
                loading={loading}
                rowKey="id_asignacion"
                locale={{ emptyText: <span style={{ color: '#999', fontWeight: 500, fontSize: 16 }}>No hay Registros</span> }}
              />
            </Card>

            {/* Tarjeta de Mis Participaciones (Eventos donde es participante) */}
            <Card
              title="MIS PARTICIPACIONES"
              className="dashboard-card"
            >
              <TableFilters type=""
                searchText={searchTextParticipaciones}
                onSearchChange={setSearchTextParticipaciones}
                clearFilters={() =>
                  setFiltrosParticipaciones({
                    rol: "",
                    estado: "",
                    eventoId: "",
                  })
                }
                activeFiltersCount={getActiveFiltersCount(filtrosParticipaciones)}
                filterContent={filterContentParticipaciones}
              />
              <Table
                columns={participacionesColumns}
                dataSource={getFilteredParticipaciones()}
                loading={loading}
                rowKey="id_participacion"
                locale={{ emptyText: <span style={{ color: '#999', fontWeight: 500, fontSize: 16 }}>No hay Registros</span> }}
              />
            </Card>
          </div>

          {/* Cuarta fila: Decoraciones y Pagos */}
          <div className="dashboard-row">
            {/* Tarjeta de Decoraciones */}
            <Card
              title="DECORACIONES"
              className="dashboard-card"
            >
              <TableFilters type="decoraciones"
                searchText={searchTextDecoraciones}
                onSearchChange={setSearchTextDecoraciones}
                clearFilters={() =>
                  setFiltrosDecoraciones({ estado: "", eventoId: "" })
                }
                activeFiltersCount={getActiveFiltersCount(filtrosDecoraciones)}
                filterContent={filterContentDecoraciones}
              />
              <Table
                columns={decoracionesColumns}
                dataSource={getFilteredDecoraciones()}
                loading={loading}
                rowKey="id_decoracion"
                locale={{ emptyText: <span style={{ color: '#999', fontWeight: 500, fontSize: 16 }}>No hay Registros</span> }}
              />
            </Card>

            {/* Tarjeta de Pagos */}
            <Card
              title="PAGOS"
              className="dashboard-card"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="action-button primary"
                  onClick={() => setModalPagoVisible(true)}
                >
                  Nuevo Pago
                </Button>
              }
            >
              <TableFilters type="pagos"
                searchText={filtrosPagos.eventoId}
                onSearchChange={(value) => setFiltrosPagos({ ...filtrosPagos, eventoId: value })}
                clearFilters={() => setFiltrosPagos({ estado: "", eventoId: "", metodo: "", tipo: "" })}
                activeFiltersCount={getActiveFiltersCount(filtrosPagos)}
                filterContent={filterContentPagos}
              />
              <Table
                columns={pagosColumns}
                dataSource={getFilteredPagos()}
                loading={loading}
                rowKey="id_pago"
                scroll={{ x: 'max-content' }}
                pagination={{ pageSize: 5 }}
                locale={{ emptyText: <span style={{ color: '#999', fontWeight: 500, fontSize: 16 }}>No hay Registros</span> }}
              />
            </Card>
          </div>

          {/* Tercera fila: Clientes */}
          <div className="dashboard-row">
            {/* Tarjeta de Clientes */}
            <Card
              title="CLIENTES"
              className="dashboard-card"
            >
              <TableFilters type="clientes"
                searchText={searchTextClientes}
                onSearchChange={setSearchTextClientes}
                clearFilters={() => setFiltrosClientes({ estado: "" })}
                activeFiltersCount={getActiveFiltersCount(filtrosClientes)}
                filterContent={filterContentClientes}
              />
              <Table
                columns={clientesColumns}
                dataSource={getFilteredClientes()}
                loading={loading}
                rowKey="cedula_usuario"
                locale={{ emptyText: <span style={{ color: '#999', fontWeight: 500, fontSize: 16 }}>No hay Registros</span> }}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Modales de formularios */}
      <Modal
        title={selectedEvento ? "Editar Evento" : "Crear Evento"}
        open={modalEventoVisible}
        onCancel={() => setModalEventoVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <EventoForm
          visible={modalEventoVisible}
          onCancel={() => setModalEventoVisible(false)}
          onSubmit={
            selectedEvento ? handleEditEventoSubmit : handleCreateEventoSubmit
          }
          loading={loading}
          clientes={clientes}
          asesores={asesores}
          tiposEvento={tiposEvento}
          provincias={provincias}
          ciudades={ciudades}
          initialValues={selectedEvento}
          userRole="empleado"
        />
      </Modal>

      <Modal
        title={selectedAsignacion ? "Editar Asignación" : "Asignar Empleado"}
        open={modalAsignacionVisible}
        onCancel={() => setModalAsignacionVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <AsignacionEmpleadoForm
          visible={modalAsignacionVisible}
          onCancel={() => setModalAsignacionVisible(false)}
          onSubmit={
            selectedAsignacion ? handleEditarAsignacion : handleCreateAsignacion
          }
          loading={loading}
          empleados={empleados}
          eventos={eventos}
          //@ts-ignore
          initialValues={selectedAsignacion}
        />
      </Modal>

      {/* Modal para detalles de evento */}
      {renderModalDetallesEvento()}

      {/* Modal para detalles de asignación */}
      {renderModalDetallesAsignacion()}

      {/* Modal para detalles de cliente */}
      {renderModalDetallesCliente()}

      {/* Modal para detalles de decoración */}
      {renderModalDetallesDecoracion()}

      {/* Modal para detalles de pago */}
      {renderModalDetallesPago()}

      {/* Modal para formulario de pago */}
      <Modal
        title="Nuevo Pago"
        open={modalPagoVisible}
        onCancel={() => setModalPagoVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <PagoForm
          visible={modalPagoVisible}
          onCancel={() => setModalPagoVisible(false)}
          onSubmit={handleCrearPago}
          loading={loading}
          eventos={eventos}
        />
      </Modal>
    </div>
  );
};

export default WelcomeEmployee;