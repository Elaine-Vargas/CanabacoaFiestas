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

const WelcomeEmployee: React.FC = () => {
    const apiUrl = `${import.meta.env.VITE_API_URL}/${import.meta.env.BACKEND_PORT}/${import.meta.env.VITE_API_BASE_URL}`;
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [empleadosEventos, setEmpleadosEventos] = useState<
    AsignacionEmpleado[]
  >([]);
  const [empleadosParticipantes, setEmpleadosParticipantes] = useState<
    AsignacionEmpleado[]
  >([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalEventoVisible, setModalEventoVisible] = useState(false);
  const [modalAsignacionVisible, setModalAsignacionVisible] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [selectedAsignacion, setSelectedAsignacion] =
    useState<AsignacionEmpleado | null>(null);
  const [userCedula, setUserCedula] = useState<string | null>(null);
  const [modalDetallesEventoVisible, setModalDetallesEventoVisible] =
    useState(false);
  const [modalDetallesClienteVisible, setModalDetallesClienteVisible] =
    useState(false);
  const [eventoDetalles, setEventoDetalles] = useState<Evento | null>(null);
  const [clienteDetalles, setClienteDetalles] = useState<Cliente | null>(null);

  // Estados para nuevas tablas: Decoraciones y Pagos
  const [decoraciones, setDecoraciones] = useState<Decoracion[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);

  // Modales de detalles para nuevas tablas
  const [modalDetallesDecoracionVisible, setModalDetallesDecoracionVisible] = useState(false);
  const [modalPagoVisible, setModalPagoVisible] = useState(false);
  const [modalDetallesPagoVisible, setModalDetallesPagoVisible] = useState(false);
  const [selectedDecoracion, setSelectedDecoracion] = useState<Decoracion | null>(null);
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
  const [loadingPago, setLoadingPago] = useState(false);

  // Estados para búsqueda y filtros
  const [searchTextEventos, setSearchTextEventos] = useState("");
  const [searchTextAsignaciones, setSearchTextAsignaciones] = useState("");
  const [searchTextParticipaciones, setSearchTextParticipaciones] = useState("");
  const [searchTextClientes, setSearchTextClientes] = useState("");
  const [searchTextDecoraciones, setSearchTextDecoraciones] = useState("");
  const [searchTextPagos, setSearchTextPagos] = useState("");

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

  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Estados para mostrar/ocultar filtros
  const [showEventosFilters, setShowEventosFilters] = useState(false);
  const [showAsignacionesFilters, setShowAsignacionesFilters] = useState(
    false
  );
  const [showParticipacionesFilters, setShowParticipacionesFilters] = useState(
    false
  );
  const [showClientesFilters, setShowClientesFilters] = useState(false);
  const [showDecoracionesFilters, setShowDecoracionesFilters] = useState(false);
  const [showPagosFilters, setShowPagosFilters] = useState(false);

  // Agregar estados para provincias y ciudades
  const [provincias, setProvincias] = useState<any[]>([]);
  const [ciudades, setCiudades] = useState<any[]>([]);

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
      setEmpleadosEventos(asignacionesData);

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

      const response = await fetch(`${apiUrl}/pagos`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const handleVerDetallesEvento = (evento: Evento) => {
    setEventoDetalles(evento);
    setModalDetallesEventoVisible(true);
  };

  const handleVerDetallesAsignacion = (asignacion: AsignacionEmpleado) => {
    if (!asignacion.evento || !asignacion.empleado) {
      message.error("Datos incompletos de la asignación");
      return;
    }

    const eventoDetallesParaModal: Evento = {
      id_evento: asignacion.evento.id_evento,
      tipo_evento: asignacion.evento.tipo_evento || {
        id_tipo_evento: 0,
        tipo_evento: "No especificado",
      },
      fecha_evento: asignacion.evento.fecha_evento
        ? dayjs(asignacion.evento.fecha_evento)
        : null,
      hora_evento: asignacion.evento.hora_evento
        ? dayjs(asignacion.evento.hora_evento, "HH:mm:ss")
        : null,
      estado_solicitud: asignacion.evento.estado_solicitud || 'N/A',
      sector: asignacion.evento.sector || '',
      calle: asignacion.evento.calle || '',
      detalles: asignacion.evento.detalles || '',
      cedula_cliente: asignacion.evento.cedula_cliente || '',
      cedula_asesor: asignacion.evento.cedula_asesor || '',
      id_tipo_evento: asignacion.evento.id_tipo_evento || 0,
      nota_cliente: asignacion.evento.nota_cliente || '',
      id_direccion: asignacion.evento.id_direccion || 0,
      espacio_evento: asignacion.evento.espacio_evento || '',
      desea_supervision: asignacion.evento.desea_supervision || false,
      cliente: asignacion.evento.cliente || {
        cedula_usuario: "",
        nombre_usuario: "",
        apellido_usuario: "",
      },
      asesor: asignacion.evento.asesor || {
        cedula_usuario: "",
        nombre_usuario: "",
        apellido_usuario: "",
      },
      total_evento: asignacion.evento.total_evento || 0,
      subtotal_evento: asignacion.evento.subtotal_evento || 0,
      itbis_evento: asignacion.evento.itbis_evento || 0,
      creacion_evento: asignacion.evento.creacion_evento || '',
      direccion: asignacion.evento.direccion,
    };
    setEventoDetalles(eventoDetallesParaModal);
    setModalDetallesEventoVisible(true);
  };

  const handleCreateAsignacion = async (values: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No hay token de autenticación");
        return;
      }

      setLoading(true);
      const response = await fetch(`${apiUrl}/evento/asignar-empleados`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear la asignación");
      }

      message.success("Asignación creada exitosamente");
      setModalAsignacionVisible(false);
      fetchData();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al crear la asignación"
      );
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

  const handleVerDetallesParticipacion = (
    participacion: AsignacionEmpleado
  ) => {
    if (!participacion.evento || !participacion.empleado) {
      message.error("Datos incompletos de la participación");
      return;
    }

    const eventoDetallesParaModal: Evento = {
      id_evento: participacion.evento.id_evento,
      tipo_evento: participacion.evento.tipo_evento || {
        id_tipo_evento: 0,
        tipo_evento: "No especificado",
      },
      fecha_evento: participacion.evento.fecha_evento
        ? dayjs(participacion.evento.fecha_evento)
        : null,
      hora_evento: participacion.evento.hora_evento
        ? dayjs(participacion.evento.hora_evento, "HH:mm:ss")
        : null,
      estado_solicitud: participacion.evento.estado_solicitud || 'N/A',
      sector: participacion.evento.sector || '',
      calle: participacion.evento.calle || '',
      detalles: participacion.evento.detalles || '',
      cedula_cliente: participacion.evento.cedula_cliente || '',
      cedula_asesor: participacion.evento.cedula_asesor || '',
      id_tipo_evento: participacion.evento.id_tipo_evento || 0,
      nota_cliente: participacion.evento.nota_cliente || '',
      id_direccion: participacion.evento.id_direccion || 0,
      espacio_evento: participacion.evento.espacio_evento || '',
      desea_supervision: participacion.evento.desea_supervision || false,
      cliente: participacion.evento.cliente || {
        cedula_usuario: "",
        nombre_usuario: "",
        apellido_usuario: "",
      },
      asesor: participacion.evento.asesor || {
        cedula_usuario: "",
        nombre_usuario: "",
        apellido_usuario: "",
      },
      total_evento: participacion.evento.total_evento || 0,
      subtotal_evento: participacion.evento.subtotal_evento || 0,
      itbis_evento: participacion.evento.itbis_evento || 0,
      creacion_evento: participacion.evento.creacion_evento || '',
      direccion: participacion.evento.direccion,
    };
    setEventoDetalles(eventoDetallesParaModal);
    setModalDetallesEventoVisible(true);
  };

  const handleVerDetallesCliente = (cliente: Cliente) => {
    setClienteDetalles(cliente);
    setModalDetallesClienteVisible(true);
  };

  const handleVerDetallesDecoracion = (decoracion: Decoracion) => {
    setSelectedDecoracion(decoracion);
    setModalDetallesDecoracionVisible(true);
  };

  const handleVerDetallesPago = (pago: Pago) => {
    setSelectedPago(pago);
    setModalDetallesPagoVisible(true);
  };

  // Funciones de filtrado
  const getFilteredEventos = () => {
    return eventos.filter((evento) => {
      const searchLower = searchTextEventos.toLowerCase();
      const tipoEventoStr =
        typeof evento.tipo_evento === "string"
          ? evento.tipo_evento
          : evento.tipo_evento.tipo_evento;

      const matchesSearch =
        searchTextEventos === "" ||
        (evento.cliente?.nombre_usuario || "")
          .toLowerCase()
          .includes(searchLower) ||
        (evento.cliente?.apellido_usuario || "")
          .toLowerCase()
          .includes(searchLower) ||
        (evento.asesor?.nombre_usuario || "")
          .toLowerCase()
          .includes(searchLower) ||
        (evento.asesor?.apellido_usuario || "")
          .toLowerCase()
          .includes(searchLower) ||
        tipoEventoStr.toLowerCase().includes(searchLower) ||
        (evento.espacio_evento || "").toLowerCase().includes(searchLower) ||
        evento.id_evento.toString().includes(searchTextEventos) ||
        (evento.fecha_evento?.format("DD/MM/YYYY") || "").includes(
          searchTextEventos
        ) ||
        (evento.hora_evento?.format("HH:mm") || "").includes(
          searchTextEventos
        ) ||
        (evento.desea_supervision ? "sí" : "no").includes(searchLower) ||
        (evento.estado_solicitud || "").toLowerCase().includes(searchLower);

      const matchesEstado =
        !filtrosEventos.estado ||
        evento.estado_solicitud === filtrosEventos.estado;
      const matchesTipo =
        !filtrosEventos.tipo ||
        (typeof evento.tipo_evento === "object"
          ? evento.tipo_evento.tipo_evento
          : evento.tipo_evento) === filtrosEventos.tipo;
      const matchesFecha =
        !filtrosEventos.fecha ||
        (evento.fecha_evento?.format("YYYY-MM-DD") || "") ===
          filtrosEventos.fecha;

      return matchesSearch && matchesEstado && matchesTipo && matchesFecha;
    });
  };

  const getFilteredAsignaciones = () => {
    return empleadosEventos.filter((asignacion) => {
      const searchLower = searchTextAsignaciones.toLowerCase();
      const matchesSearch =
        searchTextAsignaciones === "" ||
        asignacion.id_evento.toString().includes(searchTextAsignaciones) ||
        (asignacion.empleado?.nombre_usuario || "")
          .toLowerCase()
          .includes(searchLower) ||
        (asignacion.empleado?.apellido_usuario || "")
          .toLowerCase()
          .includes(searchLower) ||
        (asignacion.puesto_evento || "").toLowerCase().includes(searchLower) ||
        (asignacion.estado_empevento || "")
          .toLowerCase()
          .includes(searchLower) ||
        (asignacion.evento?.cliente?.nombre_usuario || "")
          .toLowerCase()
          .includes(searchLower) ||
        (asignacion.evento?.cliente?.apellido_usuario || "")
          .toLowerCase()
          .includes(searchLower) ||
        (asignacion.evento?.tipo_evento?.tipo_evento || "")
          .toLowerCase()
          .includes(searchLower);

      const matchesRol =
        !filtrosAsignaciones.rol ||
        asignacion.puesto_evento === filtrosAsignaciones.rol;
      const matchesEstado =
        !filtrosAsignaciones.estado ||
        asignacion.estado_empevento === filtrosAsignaciones.estado;
      const matchesEvento =
        !filtrosAsignaciones.eventoId ||
        asignacion.id_evento.toString() === filtrosAsignaciones.eventoId;

      return matchesSearch && matchesRol && matchesEstado && matchesEvento;
    });
  };

  const getFilteredParticipaciones = () => {
    return empleadosParticipantes.filter((participacion) => {
      const searchLower = searchTextParticipaciones.toLowerCase();
      const matchesSearch =
        searchTextParticipaciones === "" ||
        participacion.id_evento
          .toString()
          .includes(searchTextParticipaciones) ||
        (participacion.empleado?.nombre_usuario || "")
          .toLowerCase()
          .includes(searchLower) ||
        (participacion.empleado?.apellido_usuario || "")
          .toLowerCase()
          .includes(searchLower) ||
        (participacion.puesto_evento || "")
          .toLowerCase()
          .includes(searchLower) ||
        (participacion.estado_empevento || "")
          .toLowerCase()
          .includes(searchLower) ||
        (participacion.evento?.cliente?.nombre_usuario || "")
          .toLowerCase()
          .includes(searchLower) ||
        (participacion.evento?.cliente?.apellido_usuario || "")
          .toLowerCase()
          .includes(searchLower) ||
        (participacion.evento?.tipo_evento?.tipo_evento || "")
          .toLowerCase()
          .includes(searchLower);

      const matchesRol =
        !filtrosParticipaciones.rol ||
        participacion.puesto_evento === filtrosParticipaciones.rol;
      const matchesEstado =
        !filtrosParticipaciones.estado ||
        participacion.estado_empevento === filtrosParticipaciones.estado;
      const matchesEvento =
        !filtrosParticipaciones.eventoId ||
        participacion.id_evento.toString() === filtrosParticipaciones.eventoId;

      return matchesSearch && matchesRol && matchesEstado && matchesEvento;
    });
  };

  const getFilteredClientes = () => {
    return clientes.filter((cliente) => {
      const searchLower = searchTextClientes.toLowerCase();
      const matchesSearch =
        searchTextClientes === "" ||
        (cliente.nombre_usuario || "").toLowerCase().includes(searchLower) ||
        (cliente.apellido_usuario || "").toLowerCase().includes(searchLower) ||
        (cliente.cedula_usuario || "").includes(searchTextClientes) ||
        (cliente.tel_usuario || "").includes(searchTextClientes) ||
        (cliente.correo_usuario || "").toLowerCase().includes(searchLower) ||
        (cliente.estado_usuario || "").toLowerCase().includes(searchLower);

      const matchesEstado =
        !filtrosClientes.estado ||
        cliente.estado_usuario === filtrosClientes.estado;

      return matchesSearch && matchesEstado;
    });
  };

  const getFilteredDecoraciones = () => {
    return decoraciones.filter((decoracion) => {
      const searchLower = searchTextDecoraciones.toLowerCase();
      const tipoEvento =
        typeof decoracion.evento?.tipo_evento === "object"
          ? decoracion.evento.tipo_evento.tipo_evento
          : decoracion.evento?.tipo_evento;

      const matchesSearch =
        searchTextDecoraciones === "" ||
        decoracion.tema_decoracion.toLowerCase().includes(searchLower) ||
        decoracion.colores_decoracion.toLowerCase().includes(searchLower) ||
        (tipoEvento || "").toLowerCase().includes(searchLower) ||
        decoracion.id_decoracion.toString().includes(searchTextDecoraciones) ||
        decoracion.id_evento.toString().includes(searchTextDecoraciones) ||
        decoracion.precioneto_decoracion.toString().includes(searchTextDecoraciones) ||
        decoracion.total_decoracion.toString().includes(searchTextDecoraciones);

      const matchesEstado =
        !filtrosDecoraciones.estado ||
        decoracion.estado_decoracion === filtrosDecoraciones.estado;
      const matchesEventoId =
        !filtrosDecoraciones.eventoId ||
        decoracion.id_evento.toString() === filtrosDecoraciones.eventoId;

      return matchesSearch && matchesEstado && matchesEventoId;
    });
  };

  const getFilteredPagos = () => {
    return pagos.filter(pago => {
      const matchEstado = !filtrosPagos.estado || pago.estado_pago === filtrosPagos.estado;
      const matchEvento = !filtrosPagos.eventoId || pago.id_evento.toString() === filtrosPagos.eventoId;
      const matchMetodo = !filtrosPagos.metodo || pago.metodo_pago === filtrosPagos.metodo;
      const matchTipo = !filtrosPagos.tipo || pago.tipo_pago === filtrosPagos.tipo;
      return matchEstado && matchEvento && matchMetodo && matchTipo;
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
      render: (cliente: any) => 
        cliente ? `${cliente.nombre_usuario} ${cliente.apellido_usuario}` : 'N/A'
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
      render: (fecha: string, record: Pago) => `${fecha} ${record.hora_pago}`
    },
    {
      title: 'Monto',
      dataIndex: 'monto_pago',
      key: 'monto_pago',
      render: (monto: number) => `RD$ ${monto.toFixed(2)}`
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
        {empleadosEventos.map(
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

  const handleCreateEventoSubmit = async (values: EventoFormValues) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No hay token de autenticación");
        return;
      }

      const response = await fetch(`${apiUrl}/evento`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Error al crear el evento");
      }

      message.success("Evento creado exitosamente");
      setModalEventoVisible(false);
      fetchData();
    } catch (error) {
      console.error("Error al crear evento:", error);
      message.error("Error al crear el evento");
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
          ...values,
          fecha_pago: values.fecha_pago.format('YYYY-MM-DD'),
          hora_pago: values.hora_pago.format('HH:mm:ss'),
        }),
        credentials: 'include'
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
      <Modal
        title="Detalles del Evento"
        open={modalDetallesEventoVisible}
        onCancel={() => setModalDetallesEventoVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        {eventoDetalles && (
          <List
            itemLayout="horizontal"
            dataSource={[
              { label: "ID Evento", value: eventoDetalles.id_evento },
              {
                label: "Tipo de Evento",
                value: eventoDetalles.tipo_evento?.tipo_evento || "N/A",
              },
              {
                label: "Fecha del Evento",
                value: (
                  eventoDetalles.fecha_evento?.format("DD/MM/YYYY") || "N/A"
                ),
              },
              {
                label: "Hora del Evento",
                value: eventoDetalles.hora_evento?.format("HH:mm") || "N/A",
              },
              {
                label: "Estado de Solicitud",
                value: eventoDetalles.estado_solicitud,
              },
              {
                label: "Cliente",
                value: `${eventoDetalles.cliente?.nombre_usuario || "N/A"} ${eventoDetalles.cliente?.apellido_usuario || ""}`,
              },
              {
                label: "Asesor",
                value: `${eventoDetalles.asesor?.nombre_usuario || "N/A"} ${eventoDetalles.asesor?.apellido_usuario || ""}`,
              },
              {
                label: "Espacio del Evento",
                value: eventoDetalles.espacio_evento,
              },
              {
                label: "Desea Supervisión",
                value: eventoDetalles.desea_supervision ? "Sí" : "No",
              },
              {
                label: "Total del Evento",
                value: `$${eventoDetalles.total_evento?.toLocaleString()}`,
              },
              {
                label: "Nota del Cliente",
                value: eventoDetalles.nota_cliente || "N/A",
              },
              {
                label: "Dirección",
                value: `${eventoDetalles.direccion?.calle || "N/A"}, ${eventoDetalles.direccion?.sector || "N/A"}, ${eventoDetalles.direccion?.ciudad?.nombre_ciudad || "N/A"}, ${eventoDetalles.direccion?.ciudad?.provincia?.nombre_provincia || "N/A"}`,
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta title={item.label} description={item.value} />
              </List.Item>
            )}
          />
        )}
      </Modal>

      {/* Modal para detalles de cliente */}
      <Modal
        title="Detalles del Cliente"
        open={modalDetallesClienteVisible}
        onCancel={() => setModalDetallesClienteVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        {clienteDetalles && (
          <List
            itemLayout="horizontal"
            dataSource={[
              { label: "Cédula", value: clienteDetalles.cedula_usuario },
              {
                label: "Nombre",
                value: `${clienteDetalles.nombre_usuario} ${clienteDetalles.apellido_usuario}`,
              },
              { label: "Teléfono", value: clienteDetalles.tel_usuario },
              { label: "Correo", value: clienteDetalles.correo_usuario },
              { label: "Estado", value: clienteDetalles.estado_usuario },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta title={item.label} description={item.value} />
              </List.Item>
            )}
          />
        )}
      </Modal>

      {/* Modal para detalles de decoración */}
      <Modal
        title="Detalles de la Decoración"
        open={modalDetallesDecoracionVisible}
        onCancel={() => setModalDetallesDecoracionVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedDecoracion && (
          <List
            itemLayout="horizontal"
            dataSource={[
              { label: "ID Decoración", value: selectedDecoracion.id_decoracion },
              { label: "ID Evento", value: selectedDecoracion.id_evento },
              { label: "Tema", value: selectedDecoracion.tema_decoracion },
              { label: "Colores", value: selectedDecoracion.colores_decoracion },
              { label: "Precio Neto", value: `$${selectedDecoracion.precioneto_decoracion?.toLocaleString()}` },
              { label: "ITBIS", value: `$${selectedDecoracion.itbis_decoracion?.toLocaleString()}` },
              { label: "Total", value: `$${selectedDecoracion.total_decoracion?.toLocaleString()}` },
              { label: "Estado", value: selectedDecoracion.estado_decoracion },
              {
                label: "Cliente del Evento",
                value: `${selectedDecoracion.evento?.cliente?.nombre_usuario || "N/A"} ${selectedDecoracion.evento?.cliente?.apellido_usuario || ""}`,
              },
              {
                label: "Tipo de Evento",
                value: selectedDecoracion.evento?.tipo_evento?.tipo_evento || "N/A",
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta title={item.label} description={item.value} />
              </List.Item>
            )}
          />
        )}
      </Modal>

      {/* Modal para detalles de pago */}
      <Modal
        title="Detalles del Pago"
        open={modalDetallesPagoVisible}
        onCancel={() => setModalDetallesPagoVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        {selectedPago && (
          <List
            itemLayout="horizontal"
            dataSource={[
              { label: "ID Pago", value: selectedPago.id_pago },
              { label: "ID Evento", value: selectedPago.id_evento },
              { label: "Monto", value: `$${selectedPago.monto_pago?.toFixed(2)}` },
              { label: "Fecha", value: selectedPago.fecha_pago },
              { label: "Hora", value: selectedPago.hora_pago },
              { label: "Tipo de Pago", value: selectedPago.tipo_pago },
              { label: "Estado", value: selectedPago.estado_pago },
              { label: "Método de Pago", value: selectedPago.metodo_pago },
              {
                label: "Cliente del Evento",
                value: `${selectedPago.evento?.cliente?.nombre_usuario || "N/A"} ${selectedPago.evento?.cliente?.apellido_usuario || ""}`,
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta title={item.label} description={item.value} />
              </List.Item>
            )}
          />
        )}
      </Modal>

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
          loading={loadingPago}
          eventos={eventos}
        />
      </Modal>
    </div>
  );
};

export default WelcomeEmployee;