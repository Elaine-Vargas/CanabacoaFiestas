import React, { useState, useEffect } from 'react';
import '../../styles/dashboard/ServicesSubpages.scss';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import UserConfig from './UserConfig';

export type UserRole = 'admin' | 'client' | 'supervisor' | 'inventory';

export type Permission = {
  id: string;
  name: string;
  description: string;
};

export type RolePermissions = {
  [key in UserRole]: Permission[];
};

export type Quotation = {
  client: string;
  status: string;
  date: string;
};

interface EventoEnProceso {
  id_evento: number;
  cedula_cliente: string;
  cedula_asesor: string;
  fecha_evento: string;
  hora_evento: string;
  id_espacio: number;
  estado_evento: 'Pendiente' | 'Confirmado' | 'Cancelado' | 'Completado';
  id_tipo_evento: number;
  desea_supervision: number;
  nota_cliente: string;
  creacion_evento: string;
  subtotal_evento: number;
  itbis_evento: number;
  total_evento: number;
  nombre_cliente?: string;
  nombre_asesor?: string;
  nombre_espacio?: string;
  nombre_tipo_evento?: string;
}

interface EventoRealizado {
  id_evento: number;
  asesor: string;
  contacto_asesor: string;
  fecha_evento: string;
  hora_evento: string;
  espacio: string;
  servicios_adicionales: string[];
}

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  cedula: string;
  usuario: string;
  rol: string;
  estado: string;
  telefono: string;
  correo: string;
}

type WelcomeMenuProps = {
  eventsInProcess?: number;
  averageRating?: number;
  totalUsers?: number;
  quotations?: number;
};

interface Espacio {
  id_espacio: number;
  nombre_espacio: string;
  tel_espacio: string;
  id_direccion: number;
  estado_espacio: 'Activo' | 'Inactivo' | 'Eliminado';
  direccion?: {
    id_direccion: number;
    id_provincia: number;
    sector: string;
    calle: string;
    detalles?: string;
    provincia?: {
      id_provincia: number;
      nombre_provincia: string;
    };
  };
}

interface WelcomeStats {
  quotations: number;
  spaces: Espacio[];
  eventsInProcess: number;
  totalUsers: number;
  averageRating: number;
  eventosActivos?: number;
  eventosRealizados?: number;
  comentariosEnviados?: number;
}

interface EventoFormData {
  cedula_cliente: string;
  cedula_asesor: string;
  fecha_evento: string;
  hora_evento: string;
  id_espacio: number;
  estado_evento: 'Pendiente' | 'Confirmado' | 'Cancelado' | 'Completado';
  id_tipo_evento: number;
  supervision_evento: boolean;
  nota_cliente: string;
  subtotal_evento: number;
  itbis_evento: number;
  total_evento: number;
}

interface Evento {
  id_evento: number;
  fecha_evento: string;
  tipo_evento: string;
}

interface EventoAsignado {
  id_evento: number;
  tipo_evento: string;
  cliente: string;
  contacto_cliente: string;
  fecha_evento: string;
  servicios_realizados: string[];
  estado_evento: string;
  activo: boolean;
}

interface ClienteActivo {
  id_usuario: number;
  nombre: string;
  apellido: string;
  cedula: string;
  contacto: string;
  eventos_realizados: number;
  activo: boolean;
}

interface Elemento {
  id_elemento: number;
  nombre: string;
  cantidad_disponible: number;
  veces_utilizado: number;
}

interface Compra {
  id_compra: number;
  proveedor: string;
  cantidad_elementos: number;
  fecha_compra: string;
  hora_compra: string;
  costo_compra: number;
}

interface CompraProceso extends Compra {
  estado: string;
}

interface DetalleCompra {
  elemento: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
}

interface NuevaCompra {
  proveedor: string;
  fecha_compra: string;
  hora_compra: string;
  costo_compra: number;
  detalles: DetalleCompra[];
}

interface Proveedor {
  id_proveedor: number;
  id_tipo_proveedor: number;
  nombre_proveedor: string;
  tel_proveedor: string;
  correo_proveedor: string;
  id_direccion: number;
  estado_proveedor: 'Activo' | 'Inactivo' | 'Eliminado';
  tipo_proveedor?: {
    nombre_tipo: string;
  };
  direccion?: {
    sector: string;
    calle: string;
    detalles?: string;
    provincia?: {
      id_provincia: number;
      nombre_provincia: string;
    };
  };
}

interface TipoProveedor {
  id_tipo_proveedor: number;
  nombre_tipo: string;
}

interface Provincia {
  id_provincia: number;
  nombre_provincia: string;
}

interface ProveedorFormData {
  id_tipo_proveedor: string;
  nombre_proveedor: string;
  tel_proveedor: string;
  correo_proveedor: string;
  id_provincia: string;
  sector: string;
  calle: string;
  detalles: string;
  estado_proveedor: 'Activo' | 'Inactivo' | 'Eliminado';
}

interface TipoEvento {
  id_tipo_evento: number;
  nombre_tipo_evento: string;
}

const WelcomeMenu: React.FC<WelcomeMenuProps> = () => {

  const apiUrl = import.meta.env.VITE_API_BASE_URL;


  const navigate = useNavigate();
  const { userRole } = useUser();
  const [userData, setUserData] = useState<any>(null);
  
  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    setUserData(storedUserData);
  }, []);

  // Corregir la detección del rol
  const currentRole = userData ? Number(userData.rol) : 0;
  console.log('Rol actual:', currentRole);
  console.log('Datos del usuario:', userData);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showEventsInProcessModal, setShowEventsInProcessModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showQuotationsModal, setShowQuotationsModal] = useState(false);
  const [showSpacesModal, setShowSpacesModal] = useState(false);
  const [showAddSpaceModal, setShowAddSpaceModal] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [stats, setStats] = useState<WelcomeStats>({
    quotations: 0,
    spaces: [],
    eventsInProcess: 0,
    totalUsers: 0,
    averageRating: 0,
    eventosActivos: 0,
    eventosRealizados: 0,
    comentariosEnviados: 0
  });
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [formData, setFormData] = useState<Partial<EventoFormData>>({
    cedula_cliente: '',
    cedula_asesor: '',
    fecha_evento: '',
    hora_evento: '',
    id_espacio: 0,
    estado_evento: 'Pendiente',
    id_tipo_evento: 0,
    supervision_evento: false,
    nota_cliente: '', 
    subtotal_evento: 0.00,
    itbis_evento: 0.00,
    total_evento: 0.00
  });
  const [spaceFormData, setSpaceFormData] = useState<Partial<Espacio>>({
    nombre_espacio: '',
    tel_espacio: '',
    estado_espacio: 'Activo',
    direccion: {
      id_direccion: 0,
      id_provincia: 0,
      sector: '',
      calle: '',
      detalles: ''
    }
  });
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [eventosEnProceso, setEventosEnProceso] = useState<EventoEnProceso[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    rol: '',
    usuario: '',
    contrasena: '',
    telefono: '',
    correo: '',
    estado: 'Activo'
  });
  const [showEventosAsignadosModal, setShowEventosAsignadosModal] = useState(false);
  const [showClientesActivosModal, setShowClientesActivosModal] = useState(false);
  const [eventosAsignados, setEventosAsignados] = useState<EventoAsignado[]>([]);
  const [clientesActivos, setClientesActivos] = useState<ClienteActivo[]>([]);
  const [eventoEditando, setEventoEditando] = useState<EventoAsignado | null>(null);
  const [clienteEditando, setClienteEditando] = useState<ClienteActivo | null>(null);
  const [showInventarioModal, setShowInventarioModal] = useState(false);
  const [showComprasModal, setShowComprasModal] = useState(false);
  const [showComprasProcesoModal, setShowComprasProcesoModal] = useState(false);
  const [showNuevaCompraModal, setShowNuevaCompraModal] = useState(false);
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [comprasProceso, setComprasProceso] = useState<CompraProceso[]>([]);
  const [nuevaCompra, setNuevaCompra] = useState<NuevaCompra>({
    proveedor: '',
    fecha_compra: '',
    hora_compra: '',
    costo_compra: 0,
    detalles: [{ elemento: '', cantidad: 0, precio_unitario: 0, precio_total: 0 }]
  });
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [filteredRole, setFilteredRole] = useState<string | null>(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    rol: '',
    usuario: '',
    contrasena: '',
    telefono: '',
    correo: '',
    estado: 'Activo'
  });
  const [showProveedoresModal, setShowProveedoresModal] = useState(false);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [tiposProveedor, setTiposProveedor] = useState<TipoProveedor[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [proveedorFormData, setProveedorFormData] = useState<ProveedorFormData>({
    id_tipo_proveedor: '',
    nombre_proveedor: '',
    tel_proveedor: '',
    correo_proveedor: '',
    id_provincia: '',
    sector: '',
    calle: '',
    detalles: '',
    estado_proveedor: 'Activo'
  });
  const [showProveedorForm, setShowProveedorForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);




  useEffect(() => {
    const fetchEspacios = async () => {
      try {
        console.log('Intentando cargar espacios...');
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}espacios`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Espacios cargados:', data);
        setEspacios(data);
      } catch (error) {
        console.error('Error al cargar espacios:', error);
      }
    };

    fetchEspacios();
  }, []);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch('/api/eventos');
        const data = await response.json();
        setEventos(data);
      } catch (error) {
        console.error('Error al cargar eventos:', error);
      }
    };

    fetchEventos();
  }, []);

  // Agregar un log para ver los espacios disponibles
  useEffect(() => {
    console.log('Espacios actuales:', espacios);
  }, [espacios]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/usuarios`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
  
        const data = await response.json();
  
        if (Array.isArray(data)) {
          setUsuarios(data);
          console.log('Usuarios recibidos:', data);
        } else if (Array.isArray(data.usuarios)) {
          setUsuarios(data.usuarios);
          console.log('Usuarios recibidos:', data);
        } else {
          console.error('Respuesta inesperada del endpoint de usuarios:', data);
          setUsuarios([]); // fallback para evitar errores en renderizado
        }
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    };
  
    if (showUsersModal) {
      fetchUsuarios();
    }
  }, [showUsersModal]);
  
  useEffect(() => {
    const fetchEventosRealizados = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/eventos/realizados`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
      } catch (error) {
        console.error('Error al cargar eventos realizados:', error);
      }
    };

    if (showQuotationsModal) {
      fetchEventosRealizados();
    }
  }, [showQuotationsModal]);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await fetch('/api/espacios');
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          spaces: data
        }));
      } catch (error) {
        console.error('Error al cargar espacios:', error);
      }
    };

    if (showSpacesModal) {
      fetchSpaces();
    }
  }, [showSpacesModal]);

  useEffect(() => {
    const fetchEventosAsignados = async () => {
      try {
        const response = await fetch('/api/eventos/asignados');
        const data = await response.json();
        setEventosAsignados(data);
      } catch (error) {
        console.error('Error al cargar eventos asignados:', error);
      }
    };

    const fetchClientesActivos = async () => {
      try {
        const response = await fetch('/api/clientes/activos');
        const data = await response.json();
        setClientesActivos(data);
      } catch (error) {
        console.error('Error al cargar clientes activos:', error);
      }
    };

    if (showEventosAsignadosModal) {
      fetchEventosAsignados();
    }
    if (showClientesActivosModal) {
      fetchClientesActivos();
    }
  }, [showEventosAsignadosModal, showClientesActivosModal]);

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const response = await fetch('/api/inventario');
        const data = await response.json();
        setElementos(data);
      } catch (error) {
        console.error('Error al cargar inventario:', error);
      }
    };

    const fetchCompras = async () => {
      try {
        const response = await fetch('/api/compras');
        const data = await response.json();
        setCompras(data);
      } catch (error) {
        console.error('Error al cargar compras:', error);
      }
    };

    const fetchComprasProceso = async () => {
      try {
        const response = await fetch('/api/compras/proceso');
        const data = await response.json();
        setComprasProceso(data);
      } catch (error) {
        console.error('Error al cargar compras en proceso:', error);
      }
    };

    if (showInventarioModal) {
      fetchInventario();
    }
    if (showComprasModal) {
      fetchCompras();
    }
    if (showComprasProcesoModal) {
      fetchComprasProceso();
    }
  }, [showInventarioModal, showComprasModal, showComprasProcesoModal]);

  useEffect(() => {
    if (showProveedoresModal) {
      fetchProveedores();
      fetchTiposProveedor();
      fetchProvincias();
    }
  }, [showProveedoresModal]);

  useEffect(() => {
    const fetchTiposEvento = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/tipos-evento`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar tipos de evento');
        }
        
        const data = await response.json();
        setTiposEvento(data);
      } catch (error) {
        console.error('Error al cargar tipos de evento:', error);
      }
    };

    fetchTiposEvento();
  }, []);

  const fetchProveedores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/proveedores', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar proveedores');
      }
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setProveedores([]);
    }
  };

  const fetchTiposProveedor = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/tipos-proveedor', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar tipos de proveedor');
      }
      const data = await response.json();
      setTiposProveedor(data);
    } catch (error) {
      console.error('Error al cargar tipos de proveedor:', error);
      setTiposProveedor([]);
    }
  };

  const fetchProvincias = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/provincias', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar provincias');
      }
      const data = await response.json();
      setProvincias(data);
    } catch (error) {
      console.error('Error al cargar provincias:', error);
      setProvincias([]);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      alert('Por favor, selecciona un evento para calificar');
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment,
          rating,
          userId: localStorage.getItem('userId'),
          eventId: selectedEventId
        }),
      });

      if (response.ok) {
        setShowCommentModal(false);
        setComment('');
        setRating(0);
        setSelectedEventId(null);
        // Actualizar los datos del dashboard
        const updatedData = await fetch(`/api/auth/current`);
        const data = await updatedData.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error al enviar el comentario:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpaceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSpaceFormData(prev => {
        const parentValue = prev[parent as keyof typeof prev] as { [key: string]: any };
        return {
          ...prev,
          [parent]: {
            ...parentValue,
            [child]: value
          }
        };
      });
    } else {
      setSpaceFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEspacioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setFormData(prev => ({
      ...prev,
      id_espacio: value
    }));
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      const eventoData = {
        ...formData,
        cedula_cliente: Number(storedUserData.rol) === 2 ? storedUserData.cedula_usuario : formData.cedula_cliente,
        supervision_evento: formData.supervision_evento ? 1 : 0
      };

      const response = await fetch('/api/eventos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventoData),
      });

      if (!response.ok) {
        throw new Error('Error al crear evento');
      }

      setShowEventModal(false);
      setShowServicesModal(true);
      setFormData({
        cedula_cliente: '',
        cedula_asesor: '',
        fecha_evento: '',
        hora_evento: '',
        id_espacio: 0,
        estado_evento: 'Pendiente',
        id_tipo_evento: 0,
        supervision_evento: false,
        nota_cliente: '',
        subtotal_evento: 0.00,
        itbis_evento: 0.00,
        total_evento: 0.00
      });
    } catch (error) {
      console.error('Error al crear evento:', error);
      alert('Hubo un error al crear el evento. Por favor, intente nuevamente.');
    }
  };

  const handleServiceSelect = (service: string) => {
    setShowServicesModal(false);
    // Mapeo correcto de las rutas
    const routeMap: { [key: string]: string } = {
      'catering': '/Menu-Servicios/Catering',
      'decor': '/Menu-Servicios/Decoracion',
      'rent': '/Menu-Servicios/Alquiler',
      'transportation': '/Menu-Servicios/Transporte',
      'supervision': '/Menu-Servicios/Supervision',
      'assembly': '/Menu-Servicios/Montaje-Desmontaje'
    };

    const route = routeMap[service];
    if (route) {
      navigate(route);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return (
      <>
        {'★'.repeat(fullStars)}
        <span className="stars--empty">{'☆'.repeat(emptyStars)}</span>
      </>
    );
  };

  const renderEventForm = () => {
    if (!userData) return null;
    // Si el usuario es cliente y la cédula no está en el formData, autocompletar
    if (Number(userData.rol) === 2 && formData.cedula_cliente !== userData.cedula_usuario) {
      setFormData(prev => ({
        ...prev,
        cedula_cliente: userData.cedula_usuario
      }));
    }
    return (
      <form className="modal-form" onSubmit={handleEventSubmit}>
        <h2>Nuevo Evento</h2>
        <div className="form-grid">
          {Number(userData.rol) === 2 ? (
            <label>
              <span>Cédula:</span>
              <input
                type="text"
                name="cedula_cliente"
                value={formData.cedula_cliente || userData.cedula_usuario}
                disabled
                className="disabled-input"
              />
            </label>
          ) : (
            <label>
              <span>Cédula del Cliente:</span>
              <input
                type="text"
                name="cedula_cliente"
                value={formData.cedula_cliente}
                onChange={handleInputChange}
                required
                maxLength={13}
                pattern="[0-9]{11,13}"
                title="La cédula debe tener entre 11 y 13 dígitos"
              />
            </label>
          )}

          {(Number(userData.rol) === 1 || Number(userData.rol) === 3) && (
            <label>
              <span>Cédula del Asesor:</span>
              <input
                type="text"
                name="cedula_asesor"
                value={formData.cedula_asesor}
                onChange={handleInputChange}
                required
                maxLength={13}
                pattern="[0-9]{11,13}"
                title="La cédula debe tener entre 11 y 13 dígitos"
              />
            </label>
          )}

          <label>
            <span>Fecha del evento:</span>
            <input
              type="date"
              name="fecha_evento"
              value={formData.fecha_evento}
              onChange={handleInputChange}
              required
            />
          </label>

          <label>
            <span>Hora del evento:</span>
            <input
              type="time"
              name="hora_evento"
              value={formData.hora_evento}
              onChange={handleInputChange}
              required
            />
          </label>

          <label>
            <span>Espacio:</span>
            <select
              name="id_espacio"
              value={formData.id_espacio || ''}
              onChange={handleEspacioChange}
              required
            >
              <option value="">Seleccionar espacio</option>
              {espacios && espacios.length > 0 ? (
                espacios.map(espacio => (
                  <option 
                    key={espacio.id_espacio} 
                    value={espacio.id_espacio}
                  >
                    {espacio.nombre_espacio}
                  </option>
                ))
              ) : (
                <option disabled>No hay espacios disponibles</option>
              )}
            </select>
          </label>

          <label>
            <span>Tipo de evento:</span>
            <select
              name="id_tipo_evento"
              value={formData.id_tipo_evento}
              onChange={handleInputChange}
              required
            >
              <option value="0">Seleccionar tipo</option>
              {tiposEvento.map((tipo) => (
                <option key={tipo.id_tipo_evento} value={tipo.id_tipo_evento}>
                  {tipo.nombre_tipo_evento}
                </option>
              ))}
            </select>
          </label>

          <label className="full-width">
            <span>¿Requiere supervisión?</span>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="supervision_evento"
                  checked={formData.supervision_evento}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    supervision_evento: true
                  }))}
                />
                <span>Sí</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="supervision_evento"
                  checked={!formData.supervision_evento}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    supervision_evento: false
                  }))}
                />
                <span>No</span>
              </label>
            </div>
          </label>

          <label className="full-width">
            <span>Notas extras:</span>
            <textarea
              name="nota_cliente"
              value={formData.nota_cliente}
              onChange={handleInputChange}
              rows={4}
              placeholder="Escriba aquí cualquier nota o detalle adicional..."
            />
          </label>
        </div>

        <div className="form-buttons">
          <button type="submit" className="submit-btn">
            Crear Evento
          </button>
          <button
            type="button"
            className="reset-btn"
            onClick={() => setShowEventModal(false)}
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  };

  const handleOpenEventModal = () => {
    if (userData && Number(userData.rol) === 2) {
      setFormData(prev => ({
        ...prev,
        cedula_cliente: userData.cedula_usuario
      }));
    }
    setShowEventModal(true);
  };

  const renderClientDashboard = () => (
    <>
      <div className="welcome-header">
        <center>
          <h1>Bienvenido a tu Panel de Cliente</h1>
        </center>
        <p>Gestiona tus eventos y servicios desde aquí</p>
      </div>

      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Mis Eventos Activos</span>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowEventsInProcessModal(true)}
          >
            Ver detalles
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Mis Eventos Realizados</span>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowQuotationsModal(true)}
          >
            Ver historial
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Comentarios Enviados</span>
          <button 
            className="stat-card__seeInfo2"
            onClick={() => setShowCommentModal(true)}
          >
            Agregar Comentario
          </button>
        </div>
      </div>

      <div className="section-header">
        <center>
          <button 
            className="new-form-btn"
            onClick={handleOpenEventModal}>
            Nuevo evento
          </button>
        </center>
      </div>

      {showEventsInProcessModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowEventsInProcessModal(false)}>×</button>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Eventos en Proceso</h3>
                <button 
                  className="add-user-btn"
                  onClick={() => setShowAllEvents(!showAllEvents)}
                >
                  {showAllEvents ? 'Ver eventos en proceso' : 'Ver todos los eventos'}
                </button>
              </div>
              <div className="table-section">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Asesor</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Espacio</th>
                        <th>Tipo Evento</th>
                        <th>Supervisión</th>
                        <th>Estado</th>
                        <th>Total</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventosEnProceso.map((evento) => (
                        <tr key={evento.id_evento}>
                          <td>{evento.id_evento}</td>
                          <td>{evento.nombre_cliente || evento.cedula_cliente}</td>
                          <td>{evento.nombre_asesor || evento.cedula_asesor}</td>
                          <td>{evento.fecha_evento}</td>
                          <td>{evento.hora_evento}</td>
                          <td>{evento.nombre_espacio || evento.id_espacio}</td>
                          <td>{evento.nombre_tipo_evento || evento.id_tipo_evento}</td>
                          <td>{evento.desea_supervision ? 'Sí' : 'No'}</td>
                          <td>
                            <span className={`estado-badge ${evento.estado_evento.toLowerCase()}`}>
                              {evento.estado_evento}
                            </span>
                          </td>
                          <td>${evento.total_evento.toFixed(2)}</td>
                          <td>
                            <div className="acciones-buttons">
                              <button className="edit-btn">Editar</button>
                              <button className="delete-btn">Cancelar</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQuotationsModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowQuotationsModal(false)}>×</button>
            <div className="modal-content">
              <h3>Mis Eventos Realizados</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Asesor</th>
                      <th>Contacto</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Espacio</th>
                      <th>Servicios Adicionales</th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCommentModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowCommentModal(false)}>×</button>
            <form className="modal-form" onSubmit={handleCommentSubmit}>
              <h3>Agregar Comentario</h3>
              
              <div className="form-grid">
                <label className="full-width">
                  <span>Seleccionar Evento:</span>
                  <select
                    value={selectedEventId || ''}
                    onChange={(e) => setSelectedEventId(Number(e.target.value))}
                    required
                  >
                    <option value="">Seleccionar evento</option>
                    {eventos.map(evento => (
                      <option key={evento.id_evento} value={evento.id_evento}>
                        {evento.fecha_evento} - {evento.tipo_evento}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="comment-modal__rating">
                <span className="comment-modal__rating-label">Calificación:</span>
                <div className="comment-modal__rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= rating ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-grid">
                <label className="full-width">
                  <span>Comentario:</span>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Escribe tu comentario aquí..."
                    required
                    rows={4}
                  />
                </label>
              </div>

              <div className="form-buttons">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={!selectedEventId || !rating}
                >
                  Enviar Comentario
                </button>
                <button
                  type="button"
                  className="reset-btn"
                  onClick={() => {
                    setShowCommentModal(false);
                    setSelectedEventId(null);
                    setRating(0);
                    setComment('');
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEventModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowEventModal(false)}>×</button>
            {renderEventForm()}
          </div>
        </div>
      )}

      {showServicesModal && (
        <div className="modal-overlay">
          <div className="modal-container services-modal">
            <button className="close-btn" onClick={() => setShowServicesModal(false)}>×</button>
            <div className="services-modal__content">
              <h3>¿Desea algún servicio extra?</h3>
              <div className="services-buttons">
                <button onClick={() => handleServiceSelect('catering')}>Catering</button>
                <button onClick={() => handleServiceSelect('decor')}>Decoración</button>
                <button onClick={() => handleServiceSelect('rent')}>Renta</button>
                <button onClick={() => setShowServicesModal(false)}>No, gracias</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderAdminDashboard = () => (
    <div className="admin-dashboard">
      <div className="welcome-header">
        <center>
        <h1>Bienvenido al Panel de Administración</h1>
        </center>
        <p>Gestiona todos los servicios y eventos desde aquí</p>
      </div>

      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Eventos en Proceso</span>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowEventsInProcessModal(true)}
          >
            Ver detalles
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Usuarios Registrados</span>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowUsersModal(true)}
          >
            Ver usuarios
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Espacios Disponibles</span>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowSpacesModal(true)}
          >
            Ver espacios
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Proveedores</span>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowProveedoresModal(true)}
          >
            Ver proveedores
          </button>
        </div>
      </div>

      <div className="section-header">
        <center>
          <button 
            className="new-form-btn"
            onClick={handleOpenEventModal}>
            Nuevo evento
          </button>
        </center>
      </div>

      {showEventsInProcessModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowEventsInProcessModal(false)}>×</button>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Eventos en Proceso</h3>
                <button 
                  className="add-user-btn"
                  onClick={() => setShowAllEvents(!showAllEvents)}
                >
                  {showAllEvents ? 'Ver eventos en proceso' : 'Ver todos los eventos'}
                </button>
              </div>
              <div className="table-section">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Asesor</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Espacio</th>
                        <th>Tipo Evento</th>
                        <th>Supervisión</th>
                        <th>Estado</th>
                        <th>Total</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventosEnProceso.map((evento) => (
                        <tr key={evento.id_evento}>
                          <td>{evento.id_evento}</td>
                          <td>{evento.nombre_cliente || evento.cedula_cliente}</td>
                          <td>{evento.nombre_asesor || evento.cedula_asesor}</td>
                          <td>{evento.fecha_evento}</td>
                          <td>{evento.hora_evento}</td>
                          <td>{evento.nombre_espacio || evento.id_espacio}</td>
                          <td>{evento.nombre_tipo_evento || evento.id_tipo_evento}</td>
                          <td>{evento.desea_supervision ? 'Sí' : 'No'}</td>
                          <td>
                            <span className={`estado-badge ${evento.estado_evento.toLowerCase()}`}>
                              {evento.estado_evento}
                            </span>
                          </td>
                          <td>${evento.total_evento.toFixed(2)}</td>
                          <td>
                            <div className="acciones-buttons">
                              <button className="edit-btn">Editar</button>
                              <button className="delete-btn">Cancelar</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCoordinatorDashboard = () => (
    <>
      <div className="coordinator-dashboard">
        <div className="welcome-header">
          <center>
            <h1>Bienvenido al Panel de Coordinador</h1>
          </center>
          <p>Gestiona todos los servicios y eventos desde aquí</p>
        </div>

        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Eventos Asignados</span>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowEventosAsignadosModal(true)}
            >
              Ver eventos
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Calificación Promedio</span>
            <div className="stat-card__stars">{renderStars(stats.averageRating)}</div>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Clientes activos</span>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowClientesActivosModal(true)}
            >
              Ver clientes
            </button>
          </div>
        </div>

        <div className="section-header">
          <center>
            <button 
              className="new-form-btn"
              onClick={handleOpenEventModal}>
              Nuevo evento
            </button>
          </center>
        </div>
      </div>

      {showEventosAsignadosModal && renderEventosAsignadosModal()}
      {showClientesActivosModal && renderClientesActivosModal()}
    </>
  );

  const renderInventoryDashboard = () => (
    <>
      <div className="coordinator-dashboard">
        <div className="welcome-header">
          <center>
            <h1>Bienvenido al Panel de Inventario</h1>
          </center>
          <p>Gestiona el inventario y las compras de elementos</p>
        </div>

        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Elementos Disponibles</span>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowInventarioModal(true)}
            >
              Ver inventario
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Todas las Compras</span>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowComprasModal(true)}
            >
              Ver compras
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Compras en Proceso</span>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowComprasProcesoModal(true)}
            >
              Ver en proceso
            </button>
          </div>
        </div>

        <div className="section-header">
          <center>
            <button 
              className="new-form-btn"
              onClick={() => setShowNuevaCompraModal(true)}>
              Nueva Compra
            </button>
          </center>
        </div>
      </div>

      {showInventarioModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowInventarioModal(false)}>×</button>
            <div className="modal-content">
              <h3>Elementos Disponibles</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Elemento</th>
                      <th>Categoría</th>
                      <th>Material</th>
                      <th>Color</th>
                      <th>Precio</th>
                      <th>Cantidad</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elementos.map((elemento) => (
                      <tr key={elemento.id_elemento}>
                        <td>{elemento.nombre}</td>
                        <td>{elemento.cantidad_disponible}</td>
                        <td>{elemento.veces_utilizado}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showComprasModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowComprasModal(false)}>×</button>
            <div className="modal-content">
              <h3>Todas las Compras</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID Compra</th>
                      <th>Proveedor</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Cantidad Elementos</th>
                      <th>Precio total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compras.map((compra) => (
                      <tr key={compra.id_compra}>
                        <td>{compra.id_compra}</td>
                        <td>{compra.proveedor}</td>
                        <td>{compra.fecha_compra}</td>
                        <td>{compra.hora_compra}</td>
                        <td>{compra.cantidad_elementos}</td>
                        <td>${compra.costo_compra}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showComprasProcesoModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowComprasProcesoModal(false)}>×</button>
            <div className="modal-content">
              <h3>Compras en Proceso</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                    <th>ID Compra</th>
                      <th>Proveedor</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Cantidad Elementos</th>
                      <th>Precio total</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprasProceso.map((compra) => (
                      <tr key={compra.id_compra}>
                        <td>{compra.proveedor}</td>
                        <td>{compra.cantidad_elementos}</td>
                        <td>{compra.fecha_compra}</td>
                        <td>{compra.hora_compra}</td>
                        <td>${compra.costo_compra}</td>
                        <td>{compra.estado}</td>
                        <td>
                          <button 
                            className="edit-btn"
                            onClick={() => {/* Implementar edición */}}
                          >
                            Editar
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleCancelarCompra(compra.id_compra)}
                          >
                            Cancelar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNuevaCompraModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowNuevaCompraModal(false)}>×</button>
            <form className="modal-form" onSubmit={handleNuevaCompraSubmit}>
              <h2>Nueva Compra</h2>
              
              <div className="form-grid">
                <label>
                  Proveedor:
                  <input
                    type="text"
                    value={nuevaCompra.proveedor}
                    onChange={(e) => setNuevaCompra(prev => ({ ...prev, proveedor: e.target.value }))}
                    required
                  />
                </label>

                <label>
                  Fecha de Compra:
                  <input
                    type="date"
                    value={nuevaCompra.fecha_compra}
                    onChange={(e) => setNuevaCompra(prev => ({ ...prev, fecha_compra: e.target.value }))}
                    required
                  />
                </label>

                <label>
                  Hora de Compra:
                  <input
                    type="time"
                    value={nuevaCompra.hora_compra}
                    onChange={(e) => setNuevaCompra(prev => ({ ...prev, hora_compra: e.target.value }))}
                    required
                  />
                </label>

                <label>
                  Costo de la Compra:
                  <input
                    type="number"
                    value={nuevaCompra.costo_compra}
                    onChange={(e) => setNuevaCompra(prev => ({ ...prev, costo_compra: Number(e.target.value) }))}
                    required
                  />
                </label>
              </div>

              <h2>Detalles de la Compra</h2>

              <div className="form-grid">
                <label>
                  Elemento:
                  <input
                    type="text"
                    value={nuevaCompra.detalles[0].elemento}
                    onChange={(e) => {
                      const nuevosDetalles = [...nuevaCompra.detalles];
                      nuevosDetalles[0].elemento = e.target.value;
                      setNuevaCompra(prev => ({ ...prev, detalles: nuevosDetalles }));
                    }}
                    required
                  />
                </label>

                <label>
                  Cantidad:
                  <input
                    type="number"
                    min="1"
                    value={nuevaCompra.detalles[0].cantidad}
                    onChange={(e) => {
                      const nuevosDetalles = [...nuevaCompra.detalles];
                      nuevosDetalles[0].cantidad = Number(e.target.value);
                      nuevosDetalles[0].precio_total = nuevosDetalles[0].cantidad * nuevosDetalles[0].precio_unitario;
                      setNuevaCompra(prev => ({ ...prev, detalles: nuevosDetalles }));
                    }}
                    required
                  />
                </label>

                <label>
                  Precio Unitario:
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={nuevaCompra.detalles[0].precio_unitario}
                    onChange={(e) => {
                      const nuevosDetalles = [...nuevaCompra.detalles];
                      nuevosDetalles[0].precio_unitario = Number(e.target.value);
                      nuevosDetalles[0].precio_total = nuevosDetalles[0].cantidad * nuevosDetalles[0].precio_unitario;
                      setNuevaCompra(prev => ({ ...prev, detalles: nuevosDetalles }));
                    }}
                    required
                  />
                </label>

                <label>
                  Precio Total:
                  <input
                    type="number"
                    value={nuevaCompra.detalles[0].precio_total}
                    disabled
                  />
                </label>
              </div>

              <div className="form-buttons">
                <button 
                  type="button"
                  className="submit-btn"
                  onClick={() => setNuevaCompra(prev => ({
                    ...prev,
                    detalles: [...prev.detalles, { elemento: '', cantidad: 0, precio_unitario: 0, precio_total: 0 }]
                  }))}
                >
                  Agregar Elemento
                </button>
                <button type="submit" className="submit-btn">
                  Guardar Compra
                </button>
                <button
                  type="button"
                  className="reset-btn"
                  onClick={() => setShowNuevaCompraModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  const handleNuevoUsuarioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoUsuario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNuevoUsuarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoUsuario),
      });

      if (response.ok) {
        setShowAddUserModal(false);
        setNuevoUsuario({
          cedula: '',
          nombre: '',
          apellido: '',
          rol: '',
          usuario: '',
          contrasena: '',
          telefono: '',
          correo: '',
          estado: 'Activo'
        });
        // Actualizar la lista de usuarios
        const updatedResponse = await fetch('/api/usuarios');
        const data = await updatedResponse.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      alert('Hubo un error al crear el usuario. Por favor, intente nuevamente.');
    }
  };

  const renderSpacesModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowSpacesModal(false)}>×</button>
        <div className="modal-content">
          <div className="modal-header">
            <h3>Espacios Disponibles</h3>
            <button 
              className="add-user-btn"
              onClick={() => setShowAddSpaceModal(true)}
            >
              Agregar Espacio
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {stats.spaces.map((espacio) => (
                  <tr key={espacio.id_espacio}>
                    <td>{espacio.nombre_espacio}</td>
                    <td>{espacio.tel_espacio}</td>
                    <td>
                      {espacio.direccion?.calle}, {espacio.direccion?.sector}
                      {espacio.direccion?.provincia?.nombre_provincia && 
                        `, ${espacio.direccion.provincia.nombre_provincia}`}
                    </td>
                    <td>{espacio.estado_espacio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/espacios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spaceFormData),
      });

      if (response.ok) {
        const updatedSpaces = await fetch('/api/espacios').then(res => res.json());
        setStats(prev => ({
          ...prev,
          spaces: updatedSpaces
        }));
        setShowAddSpaceModal(false);
        setSpaceFormData({
          nombre_espacio: '',
          tel_espacio: '',
          estado_espacio: 'Activo',
          direccion: {
            id_direccion: 0,
            id_provincia: 0,
            sector: '',
            calle: '',
            detalles: ''
          }
        });
      }
    } catch (error) {
      console.error('Error al agregar espacio:', error);
    }
  };

  const renderAddSpaceModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowAddSpaceModal(false)}>×</button>
        <form className="modal-form" onSubmit={handleSubmit}>
          <h2>Agregar Nuevo Espacio</h2>
          
          <div className="form-grid">
            <label>
              <span>Nombre del Espacio:</span>
              <input
                type="text"
                name="nombre_espacio"
                value={spaceFormData.nombre_espacio}
                onChange={handleSpaceInputChange}
                required
                maxLength={50}
              />
            </label>

            <label>
              <span>Teléfono:</span>
              <input
                type="tel"
                name="tel_espacio"
                value={spaceFormData.tel_espacio}
                onChange={handleSpaceInputChange}
                required
                pattern="[0-9]{12}"
                maxLength={12}
                placeholder="809123456789"
              />
            </label>

            <label>
              <span>Provincia:</span>
              <select
                name="direccion.id_provincia"
                value={spaceFormData.direccion?.id_provincia || ''}
                onChange={handleSpaceInputChange}
                required
              >
                <option value="">Seleccionar provincia</option>
                {provincias && provincias.map((provincia) => (
                  <option key={provincia.id_provincia} value={provincia.id_provincia}>
                    {provincia.nombre_provincia}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Sector:</span>
              <input
                type="text"
                name="direccion.sector"
                value={spaceFormData.direccion?.sector || ''}
                onChange={handleSpaceInputChange}
                required
                maxLength={50}
              />
            </label>

            <label>
              <span>Calle:</span>
              <input
                type="text"
                name="direccion.calle"
                value={spaceFormData.direccion?.calle || ''}
                onChange={handleSpaceInputChange}
                required
                maxLength={50}
              />
            </label>

            <label className="full-width">
              <span>Detalles Adicionales:</span>
              <textarea
                name="direccion.detalles"
                value={spaceFormData.direccion?.detalles || ''}
                onChange={handleSpaceInputChange}
                rows={3}
              />
            </label>

            <label>
              <span>Estado:</span>
              <select
                name="estado_espacio"
                value={spaceFormData.estado_espacio}
                onChange={handleSpaceInputChange}
                required
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Eliminado">Eliminado</option>
              </select>
            </label>
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              Guardar
            </button>
            <button
              type="button"
              className="reset-btn"
              onClick={() => setShowAddSpaceModal(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const handleEditarEvento = (evento: EventoAsignado) => {
    setEventoEditando(evento);
    // Aquí puedes abrir un modal de edición o navegar a una página de edición
  };

  const handleDeshabilitarEvento = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas deshabilitar este evento?')) {
      try {
        const response = await fetch(`/api/eventos/${id}/deshabilitar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          setEventosAsignados(prev => 
            prev.map(evento => 
              evento.id_evento === id 
                ? { ...evento, activo: false }
                : evento
            )
          );
        }
      } catch (error) {
        console.error('Error al deshabilitar evento:', error);
      }
    }
  };

  const handleEditarCliente = (cliente: ClienteActivo) => {
    setClienteEditando(cliente);
    // Aquí puedes abrir un modal de edición o navegar a una página de edición
  };

  const handleDeshabilitarCliente = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas deshabilitar este cliente?')) {
      try {
        const response = await fetch(`/api/clientes/${id}/deshabilitar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          setClientesActivos(prev => 
            prev.map(cliente => 
              cliente.id_usuario === id 
                ? { ...cliente, activo: false }
                : cliente
            )
          );
        }
      } catch (error) {
        console.error('Error al deshabilitar cliente:', error);
      }
    }
  };

  const renderEventosAsignadosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowEventosAsignadosModal(false)}>×</button>
        <div className="modal-content">
          <h3>Eventos Asignados</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Fecha</th>
                  <th>Servicios</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {eventosAsignados.map((evento) => (
                  <tr key={evento.id_evento} className={!evento.activo ? 'deshabilitado' : ''}>
                    <td>{evento.tipo_evento}</td>
                    <td>{evento.cliente}</td>
                    <td>{evento.contacto_cliente}</td>
                    <td>{evento.fecha_evento}</td>
                    <td>{evento.servicios_realizados.join(', ')}</td>
                    <td>
                      <span className={`estado-badge ${evento.estado_evento.toLowerCase()}`}>
                        {evento.estado_evento}
                      </span>
                    </td>
                    <td>
                      <div className="acciones-buttons">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditarEvento(evento)}
                          disabled={!evento.activo}
                        >
                          Editar
                        </button>
                        <button 
                          className={`${evento.activo ? 'delete-btn' : 'enable-btn'}`}
                          onClick={() => handleDeshabilitarEvento(evento.id_evento)}
                        >
                          {evento.activo ? 'Deshabilitar' : 'Habilitar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClientesActivosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowClientesActivosModal(false)}>×</button>
        <div className="modal-content">
          <h3>Clientes Activos</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Cédula</th>
                  <th>Contacto</th>
                  <th>Eventos Realizados</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesActivos.map((cliente) => (
                  <tr key={cliente.id_usuario} className={!cliente.activo ? 'deshabilitado' : ''}>
                    <td>{cliente.nombre}</td>
                    <td>{cliente.apellido}</td>
                    <td>{cliente.cedula}</td>
                    <td>{cliente.contacto}</td>
                    <td>{cliente.eventos_realizados}</td>
                    <td>
                      <div className="acciones-buttons">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditarCliente(cliente)}
                          disabled={!cliente.activo}
                        >
                          Editar
                        </button>
                        <button 
                          className={`${cliente.activo ? 'delete-btn' : 'enable-btn'}`}
                          onClick={() => handleDeshabilitarCliente(cliente.id_usuario)}
                        >
                          {cliente.activo ? 'Deshabilitar' : 'Habilitar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const handleNuevaCompraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/compras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaCompra),
      });

      if (response.ok) {
        setShowNuevaCompraModal(false);
        setNuevaCompra({
          proveedor: '',
          fecha_compra: '',
          hora_compra: '',
          costo_compra: 0,
          detalles: [{ elemento: '', cantidad: 0, precio_unitario: 0, precio_total: 0 }]
        });
        // Actualizar la lista de compras
        const updatedResponse = await fetch('/api/compras');
        const data = await updatedResponse.json();
        setCompras(data);
      }
    } catch (error) {
      console.error('Error al crear compra:', error);
      alert('Hubo un error al crear la compra. Por favor, intente nuevamente.');
    }
  };

  const handleCancelarCompra = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta compra?')) {
      try {
        const response = await fetch(`/api/compras/${id}/cancelar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          setComprasProceso(prev => 
            prev.filter(compra => compra.id_compra !== id)
          );
        }
      } catch (error) {
        console.error('Error al cancelar compra:', error);
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/usuarios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        throw new Error('Error al crear usuario');
      }

      setShowCreateUserModal(false);
      setNewUser({
        cedula: '',
        nombre: '',
        apellido: '',
        rol: '',
        usuario: '',
        contrasena: '',
        telefono: '',
        correo: '',
        estado: 'Activo'
      });
      
      // Recargar la lista de usuarios
      const updatedResponse = await fetch(`${apiUrl}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await updatedResponse.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      alert('Error al crear el usuario. Por favor, intente nuevamente.');
    }
  };

  const handleProveedorInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProveedorFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (proveedor: Proveedor) => {
    setEditId(proveedor.id_proveedor);
    setProveedorFormData({
      id_tipo_proveedor: proveedor.id_tipo_proveedor.toString(),
      nombre_proveedor: proveedor.nombre_proveedor,
      tel_proveedor: proveedor.tel_proveedor,
      correo_proveedor: proveedor.correo_proveedor,
      id_provincia: proveedor.direccion?.provincia?.id_provincia?.toString() || '',
      sector: proveedor.direccion?.sector || '',
      calle: proveedor.direccion?.calle || '',
      detalles: proveedor.direccion?.detalles || '',
      estado_proveedor: proveedor.estado_proveedor
    });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este proveedor?')) {
      try {
        const response = await fetch(`/api/proveedores/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchProveedores();
        }
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
      }
    }
  };

  const handleProveedorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId ? `/api/proveedores/${editId}` : '/api/proveedores';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proveedorFormData),
      });

      if (response.ok) {
        fetchProveedores();
        setShowProveedoresModal(false);
        setProveedorFormData({
          id_tipo_proveedor: '',
          nombre_proveedor: '',
          tel_proveedor: '',
          correo_proveedor: '',
          id_provincia: '',
          sector: '',
          calle: '',
          detalles: '',
          estado_proveedor: 'Activo'
        });
        setEditId(null);
      }
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
    }
  };

  const renderProveedoresModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowProveedoresModal(false)}>×</button>
        <div className="modal-content">
          <div className="modal-header">
            <h3>Gestión de Proveedores</h3>
            <button 
              className="add-user-btn"
              onClick={() => {
                setEditId(null);
                setShowProveedorForm(true);
                setProveedorFormData({
                  id_tipo_proveedor: '',
                  nombre_proveedor: '',
                  tel_proveedor: '',
                  correo_proveedor: '',
                  id_provincia: '',
                  sector: '',
                  calle: '',
                  detalles: '',
                  estado_proveedor: 'Activo'
                });
              }}
            >
              Nuevo Proveedor
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Correo</th>
                  <th>Tipo</th>
                  <th>Dirección</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores && proveedores.map((proveedor) => (
                  <tr key={proveedor.id_proveedor}>
                    <td>{proveedor.id_proveedor}</td>
                    <td>{proveedor.nombre_proveedor}</td>
                    <td>{proveedor.tel_proveedor}</td>
                    <td>{proveedor.correo_proveedor}</td>
                    <td>{proveedor.tipo_proveedor?.nombre_tipo}</td>
                    <td>
                      {proveedor.direccion?.calle}, {proveedor.direccion?.sector}
                      {proveedor.direccion?.provincia?.nombre_provincia && 
                        `, ${proveedor.direccion.provincia.nombre_provincia}`}
                    </td>
                    <td>{proveedor.estado_proveedor}</td>
                    <td>
                      <button 
                        className="edit-btn"
                        onClick={() => {
                          handleEdit(proveedor);
                          setShowProveedorForm(true);
                        }}
                      >
                        Editar
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(proveedor.id_proveedor)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProveedorForm = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => {
          setShowProveedorForm(false);
          setEditId(null);
          setProveedorFormData({
            id_tipo_proveedor: '',
            nombre_proveedor: '',
            tel_proveedor: '',
            correo_proveedor: '',
            id_provincia: '',
            sector: '',
            calle: '',
            detalles: '',
            estado_proveedor: 'Activo'
          });
        }}>×</button>
        <form className="modal-form" onSubmit={handleProveedorSubmit}>
          <h2>{editId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
          <div className="form-grid">
            <label>
              <span>Tipo de Proveedor:</span>
              <select
                name="id_tipo_proveedor"
                value={proveedorFormData.id_tipo_proveedor}
                onChange={handleProveedorInputChange}
                required
              >
                <option value="">Seleccionar tipo</option>
                {tiposProveedor && tiposProveedor.map((tipo) => (
                  <option key={tipo.id_tipo_proveedor} value={tipo.id_tipo_proveedor}>
                    {tipo.nombre_tipo}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Nombre:</span>
              <input
                type="text"
                name="nombre_proveedor"
                value={proveedorFormData.nombre_proveedor}
                onChange={handleProveedorInputChange}
                required
                maxLength={50}
              />
            </label>

            <label>
              <span>Teléfono:</span>
              <input
                type="tel"
                name="tel_proveedor"
                value={proveedorFormData.tel_proveedor}
                onChange={handleProveedorInputChange}
                required
                pattern="[0-9]{12}"
                maxLength={12}
                placeholder="809123456789"
              />
            </label>

            <label>
              <span>Correo:</span>
              <input
                type="email"
                name="correo_proveedor"
                value={proveedorFormData.correo_proveedor}
                onChange={handleProveedorInputChange}
                required
                maxLength={100}
              />
            </label>

            <label>
              <span>Provincia:</span>
              <select
                name="id_provincia"
                value={proveedorFormData.id_provincia}
                onChange={handleProveedorInputChange}
                required
              >
                <option value="">Seleccionar provincia</option>
                {provincias && provincias.map((provincia) => (
                  <option key={provincia.id_provincia} value={provincia.id_provincia}>
                    {provincia.nombre_provincia}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Sector:</span>
              <input
                type="text"
                name="sector"
                value={proveedorFormData.sector}
                onChange={handleProveedorInputChange}
                required
                maxLength={50}
              />
            </label>

            <label>
              <span>Calle:</span>
              <input
                type="text"
                name="calle"
                value={proveedorFormData.calle}
                onChange={handleProveedorInputChange}
                required
                maxLength={50}
              />
            </label>

            <label className="full-width">
              <span>Detalles:</span>
              <textarea
                name="detalles"
                value={proveedorFormData.detalles}
                onChange={handleProveedorInputChange}
                rows={3}
              />
            </label>

            <label>
              <span>Estado:</span>
              <select
                name="estado_proveedor"
                value={proveedorFormData.estado_proveedor}
                onChange={handleProveedorInputChange}
                required
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Eliminado">Eliminado</option>
              </select>
            </label>
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              {editId ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              type="button"
              className="reset-btn"
              onClick={() => {
                setShowProveedorForm(false);
                setEditId(null);
                setProveedorFormData({
                  id_tipo_proveedor: '',
                  nombre_proveedor: '',
                  tel_proveedor: '',
                  correo_proveedor: '',
                  id_provincia: '',
                  sector: '',
                  calle: '',
                  detalles: '',
                  estado_proveedor: 'Activo'
                });
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="welcome-menu">
      {currentRole === 1 && renderAdminDashboard()}
      {currentRole === 2 && renderClientDashboard()}
      {currentRole === 3 && renderCoordinatorDashboard()}
      {currentRole === 4 && renderInventoryDashboard()}

      {showCommentModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowCommentModal(false)}>×</button>
            <form className="modal-form" onSubmit={handleCommentSubmit}>
              <h3>Agregar Comentario</h3>
              
              <div className="form-grid">
                <label className="full-width">
                  <span>Seleccionar Evento:</span>
                  <select
                    value={selectedEventId || ''}
                    onChange={(e) => setSelectedEventId(Number(e.target.value))}
                    required
                  >
                    <option value="">Seleccionar evento</option>
                    {eventos.map(evento => (
                      <option key={evento.id_evento} value={evento.id_evento}>
                        {evento.fecha_evento} - {evento.tipo_evento}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="comment-modal__rating">
                <span className="comment-modal__rating-label">Calificación:</span>
                <div className="comment-modal__rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= rating ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-grid">
                <label className="full-width">
                  <span>Comentario:</span>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Escribe tu comentario aquí..."
                    required
                    rows={4}
                  />
                </label>
              </div>

              <div className="form-buttons">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={!selectedEventId || !rating}
                >
                  Enviar Comentario
                </button>
                <button
                  type="button"
                  className="reset-btn"
                  onClick={() => {
                    setShowCommentModal(false);
                    setSelectedEventId(null);
                    setRating(0);
                    setComment('');
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEventModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowEventModal(false)}>×</button>
            {renderEventForm()}
          </div>
        </div>
      )}

      {showServicesModal && (
        <div className="modal-overlay">
          <div className="modal-container services-modal">
            <button className="close-btn" onClick={() => setShowServicesModal(false)}>×</button>
            <div className="services-modal__content">
              <h3>¿Desea algún servicio extra?</h3>
              <div className="services-buttons">
                <button onClick={() => handleServiceSelect('catering')}>Catering</button>
                <button onClick={() => handleServiceSelect('decor')}>Decoración</button>
                <button onClick={() => handleServiceSelect('rent')}>Renta</button>
                <button onClick={() => setShowServicesModal(false)}>No, gracias</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSpacesModal && renderSpacesModal()}
      {showAddSpaceModal && renderAddSpaceModal()}

      {showUsersModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowUsersModal(false)}>×</button>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Usuarios Registrados</h3>
                <button 
                  className="add-user-btn"
                  onClick={() => setShowCreateUserModal(true)}
                >
                  Crear Usuario
                </button>
              </div>
              
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${filteredRole === null ? 'active' : ''}`}
                  onClick={() => setFilteredRole(null)}
                >
                  Todos
                </button>
                <button 
                  className={`filter-btn ${filteredRole === 'cliente' ? 'active' : ''}`}
                  onClick={() => setFilteredRole('cliente')}
                >
                  Clientes
                </button>
                <button 
                  className={`filter-btn ${filteredRole === 'admin' ? 'active' : ''}`}
                  onClick={() => setFilteredRole('admin')}
                >
                  Administradores
                </button>
                <button 
                  className={`filter-btn ${filteredRole === 'organizador' ? 'active' : ''}`}
                  onClick={() => setFilteredRole('organizador')}
                >
                  Organizadores
                </button>
                <button 
                  className={`filter-btn ${filteredRole === 'inventario' ? 'active' : ''}`}
                  onClick={() => setFilteredRole('inventario')}
                >
                  Inventario
                </button>
              </div>

              <div className="table-section">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Cédula</th>
                        <th>Rol</th>
                        <th>Contacto</th>
                        <th>Correo</th>
                        <th>Usuario</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios
                        .filter(usuario => !filteredRole || usuario.rol === filteredRole)
                        .map((usuario) => (
                          <tr key={usuario.id_usuario}>
                            <td>{usuario.nombre}</td>
                            <td>{usuario.apellido}</td>
                            <td>{usuario.cedula}</td>
                            <td>{usuario.rol}</td>
                            <td>{usuario.telefono}</td>
                            <td>{usuario.correo}</td>
                            <td>{usuario.usuario}</td>
                            <td>
                            <span className={`estado-badge ${usuario.estado?.toLowerCase?.() || 'desconocido'}`}>
                              {usuario.estado || 'Desconocido'}
                              </span>
                            </td>
                            <td>
                              <div className="acciones-buttons">
                                <button className="edit-btn">Editar</button>
                                <button className="delete-btn">Deshabilitar</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateUserModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowCreateUserModal(false)}>×</button>
            <form className="modal-form" onSubmit={handleCreateUser}>
              <h2>Crear Nuevo Usuario</h2>
              <div className="form-grid">
                <label>
                  Cédula:
                  <input
                    type="text"
                    value={newUser.cedula}
                    onChange={(e) => setNewUser(prev => ({ ...prev, cedula: e.target.value }))}
                    required
                    maxLength={13}
                    pattern="[0-9]{11,13}"
                    title="La cédula debe tener entre 11 y 13 dígitos"
                  />
                </label>

                <label>
                  Nombre:
                  <input
                    type="text"
                    value={newUser.nombre}
                    onChange={(e) => setNewUser(prev => ({ ...prev, nombre: e.target.value }))}
                    required
                  />
                </label>

                <label>
                  Apellido:
                  <input
                    type="text"
                    value={newUser.apellido}
                    onChange={(e) => setNewUser(prev => ({ ...prev, apellido: e.target.value }))}
                    required
                  />
                </label>

                <label>
                  Rol:
                  <select
                    value={newUser.rol}
                    onChange={(e) => setNewUser(prev => ({ ...prev, rol: e.target.value }))}
                    required
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="admin">Administrador</option>
                    <option value="cliente">Cliente</option>
                    <option value="organizador">Organizador</option>
                    <option value="inventario">Encargado de Inventario</option>
                  </select>
                </label>

                <label>
                  Usuario:
                  <input
                    type="text"
                    value={newUser.usuario}
                    onChange={(e) => setNewUser(prev => ({ ...prev, usuario: e.target.value }))}
                    required
                  />
                </label>

                <label className="password-field">
                  Contraseña:
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newUser.contrasena}
                      onChange={(e) => setNewUser(prev => ({ ...prev, contrasena: e.target.value }))}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </label>

                <label>
                  Teléfono:
                  <input
                    type="tel"
                    value={newUser.telefono}
                    onChange={(e) => setNewUser(prev => ({ ...prev, telefono: e.target.value }))}
                    required
                  />
                </label>

                <label>
                  Correo:
                  <input
                    type="email"
                    value={newUser.correo}
                    onChange={(e) => setNewUser(prev => ({ ...prev, correo: e.target.value }))}
                    required
                  />
                </label>
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  Crear Usuario
                </button>
                <button
                  type="button"
                  className="reset-btn"
                  onClick={() => setShowCreateUserModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProveedoresModal && renderProveedoresModal()}
      {showProveedorForm && renderProveedorForm()}
    </div>
  );
};

export default WelcomeMenu;
