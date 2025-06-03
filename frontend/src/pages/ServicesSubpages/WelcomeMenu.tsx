import React, { useState, useEffect } from 'react';
import '../../styles/dashboard/ServicesSubpages.scss';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

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
  cliente: string;
  espacio: string;
  servicios_adicionales: string[];
  empleado_encargado: string;
  contacto_asesor: string;
  fecha_evento: string;
  hora_evento: string;
  estado_evento: string;
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
  cedula: string;
  usuario: string;
  rol: string;
}

interface Cotizacion {
  id_cotizacion: number;
  cliente: string;
  espacio: string;
  servicios_adicionales: string[];
  empleado_encargado: string;
  estado: string;
  contacto_asesor: string;
  fecha_evento: string;
  hora_evento: string;
  monto?: number;
}

type WelcomeMenuProps = {
  eventsInProcess?: number;
  averageRating?: number;
  totalUsers?: number;
  quotations?: number;
};

interface Espacio {
  id_espacio: number;
  nombre: string;
  telefono: string;
  espacio: string;
  direccion: string;
  estado: string;
}

interface WelcomeStats {
  quotations: number;
  spaces: Espacio[];
  eventsInProcess: number;
  totalUsers: number;
  averageRating: number;
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
  estado_cotizacion: 'Pendiente' | 'Completada' | 'Aceptada' | 'Rechazada' | 'Cancelada' | 'Eliminada';
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

const WelcomeMenu: React.FC<WelcomeMenuProps> = () => {
  const navigate = useNavigate();
  const { userRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  console.log('Rol actual:', userRole);
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
    averageRating: 0
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
    estado_cotizacion: 'Pendiente',
    subtotal_evento: 0.00,
    itbis_evento: 0.00,
    total_evento: 0.00
  });
  const [spaceFormData, setSpaceFormData] = useState<Partial<Espacio>>({
    nombre: '',
    telefono: '',
    espacio: '',
    direccion: '',
    estado: 'Disponible'
  });
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [eventosEnProceso, setEventosEnProceso] = useState<EventoEnProceso[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    rol: '',
    usuario: '',
    contrasena: '',
    telefono: '',
    correo: ''
  });
  const [showEventosAsignadosModal, setShowEventosAsignadosModal] = useState(false);
  const [showClientesActivosModal, setShowClientesActivosModal] = useState(false);
  const [eventosAsignados, setEventosAsignados] = useState<EventoAsignado[]>([]);
  const [clientesActivos, setClientesActivos] = useState<ClienteActivo[]>([]);
  const [eventoEditando, setEventoEditando] = useState<EventoAsignado | null>(null);
  const [clienteEditando, setClienteEditando] = useState<ClienteActivo | null>(null);

  useEffect(() => {
    const fetchEspacios = async () => {
      try {
        console.log('Intentando cargar espacios...');
        const response = await fetch('/api/espacios');
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
    const fetchStats = async () => {
      try {
        console.log('Iniciando fetch de estadísticas...');
        const token = localStorage.getItem('token');
        console.log('Token disponible:', !!token);

        const response = await fetch('/api/dashboard/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        
        console.log('Respuesta recibida:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });

        let data;
        try {
          data = await response.json();
          console.log('Datos recibidos del backend:', data);
        } catch (jsonError) {
          console.error('Error al parsear JSON:', jsonError);
          throw new Error('Error al procesar la respuesta del servidor');
        }
        
        if (!response.ok) {
          console.error('Error en la respuesta:', data);
          throw new Error(data.details || `Error HTTP: ${response.status}`);
        }
        
        // Verificar que los datos tengan la estructura correcta
        if (data && typeof data === 'object') {
          const statsData: WelcomeStats = {
            eventsInProcess: Number(data.eventsInProcess) || 0,
            totalUsers: Number(data.totalUsers) || 0,
            spaces: Array.isArray(data.spaces) ? data.spaces : [],
            quotations: Number(data.quotations) || 0,
            averageRating: Number(data.averageRating) || 0
          };
          
          console.log('Datos procesados para actualizar estado:', statsData);
          
          // Verificar que los datos sean válidos antes de actualizar el estado
          if (isNaN(statsData.eventsInProcess) || 
              isNaN(statsData.totalUsers) || 
              isNaN(statsData.quotations) || 
              isNaN(statsData.averageRating)) {
            console.error('Datos inválidos detectados:', statsData);
            throw new Error('Datos inválidos recibidos del servidor');
          }
          
          setStats(statsData);
        } else {
          console.error('Datos recibidos no tienen la estructura esperada:', data);
          throw new Error('Estructura de datos inválida');
        }
      } catch (error) {
        console.error('Error detallado al cargar estadísticas:', error);
        // Mostrar mensaje de error más específico al usuario
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        alert(`Error al cargar las estadísticas: ${errorMessage}. Por favor, intente nuevamente.`);
        // Establecer valores por defecto
        setStats({
          quotations: 0,
          spaces: [],
          eventsInProcess: 0,
          totalUsers: 0,
          averageRating: 0
        });
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchEventosEnProceso = async () => {
      try {
        const response = await fetch('/api/eventos/en-proceso');
        const data = await response.json();
        setEventosEnProceso(data);
      } catch (error) {
        console.error('Error al cargar eventos en proceso:', error);
      }
    };

    const fetchUsuarios = async () => {
      try {
        const response = await fetch('/api/usuarios');
        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    };

    const fetchCotizaciones = async () => {
      try {
        const response = await fetch('/api/cotizaciones/pendientes');
        const data = await response.json();
        // Transformar los datos para incluir los campos adicionales
        const cotizacionesTransformadas = data.map((cotizacion: any) => ({
          ...cotizacion,
          contacto_asesor: cotizacion.contacto_asesor || 'No disponible',
          fecha_evento: cotizacion.fecha_evento || 'No disponible',
          hora_evento: cotizacion.hora_evento || 'No disponible'
        }));
        setCotizaciones(cotizacionesTransformadas);
      } catch (error) {
        console.error('Error al cargar cotizaciones:', error);
      }
    };

    if (showEventsInProcessModal) {
      fetchEventosEnProceso();
    }
    if (showUsersModal) {
      fetchUsuarios();
    }
    if (showQuotationsModal) {
      fetchCotizaciones();
    }
  }, [showEventsInProcessModal, showUsersModal, showQuotationsModal]);

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

  const handleSpaceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSpaceFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      const eventoData = {
        ...formData,
        supervision_evento: formData.supervision_evento ? 1 : 0 // Convertir boolean a tinyint
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
        estado_cotizacion: 'Pendiente',
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

  const renderEventForm = () => (
    <form className="modal-form" onSubmit={handleEventSubmit}>
      <h2>Nuevo Evento</h2>

      <label>
        {Number(userData.rol) === 2 ? 'Cédula:' : 'Cédula del Cliente:'}
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

      {(Number(userData.rol) === 1 || Number(userData.rol) === 3) && (
        <label>
          Cédula del Asesor:
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
        Fecha del evento:
        <input
          type="date"
          name="fecha_evento"
          value={formData.fecha_evento}
          onChange={handleInputChange}
          required
        />
      </label>

      <label>
        Hora del evento:
        <input
          type="time"
          name="hora_evento"
          value={formData.hora_evento}
          onChange={handleInputChange}
          required
        />
      </label>

      <label>
        Espacio:
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
                {espacio.nombre}
              </option>
            ))
          ) : (
            <option disabled>No hay espacios disponibles</option>
          )}
        </select>
      </label>

      <label>
        Tipo de evento:
        <select
          name="id_tipo_evento"
          value={formData.id_tipo_evento}
          onChange={handleInputChange}
          required
        >
          <option value="0">Seleccionar tipo</option>
          <option value="1">Compleaños</option>
          <option value="2">Boda</option>
          <option value="3">Reunión</option>
          <option value="4">Graduación</option>
          <option value="5">Otro</option>
        </select>
      </label>

      <label>
        ¿Requiere supervisión?
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
            Sí
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
            No
          </label>
        </div>
      </label>

      <label>
        Notas extras:
        <textarea
          name="nota_cliente"
          value={formData.nota_cliente}
          onChange={handleInputChange}
          rows={4}
          placeholder="Escriba aquí cualquier nota o detalle adicional..."
        />
      </label>

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
          <strong className="stat-card__number">{stats.eventsInProcess}</strong>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowEventsInProcessModal(true)}
          >
            Ver detalles
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Total de Eventos Realizados</span>
          <strong className="stat-card__number">{stats.totalUsers}</strong>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowQuotationsModal(true)}
          >
            Ver historial
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Comentarios Enviados</span>
          <strong className="stat-card__number">{stats.quotations}</strong>
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
            onClick={() => setShowEventModal(true)}>
            + Nuevo evento
          </button>
        </center>
      </div>

      {showEventsInProcessModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowEventsInProcessModal(false)}>×</button>
            <div className="modal-content">
              <h3>Mis Eventos Activos</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Asesor</th>
                      <th>Contacto</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Espacio</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventosEnProceso.map((evento) => (
                      <tr key={evento.id_evento}>
                        <td>{evento.empleado_encargado}</td>
                        <td>{evento.contacto_asesor}</td>
                        <td>{evento.fecha_evento}</td>
                        <td>{evento.hora_evento}</td>
                        <td>{evento.espacio}</td>
                        <td>
                          <button className="edit-btn">Editar</button>
                          <button className="delete-btn">Cancelar</button>
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
                  <tbody>
                    {cotizaciones.map((cotizacion) => (
                      <tr key={cotizacion.id_cotizacion}>
                        <td>{cotizacion.empleado_encargado}</td>
                        <td>{cotizacion.contacto_asesor}</td>
                        <td>{cotizacion.fecha_evento}</td>
                        <td>{cotizacion.hora_evento}</td>
                        <td>{cotizacion.espacio}</td>
                        <td>{cotizacion.servicios_adicionales.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
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
              
              <div className="event-select">
                <label>Seleccionar Evento:</label>
                <select
                  value={selectedEventId || ''}
                  onChange={(e) => setSelectedEventId(Number(e.target.value))}
                  required
                  className="event-select-input"
                >
                  <option value="">Seleccionar evento</option>
                  {eventos.map(evento => (
                    <option key={evento.id_evento} value={evento.id_evento}>
                      {evento.fecha_evento} - {evento.tipo_evento}
                    </option>
                  ))}
                </select>
              </div>

              <div className="comment-modal__rating">
                <span className="comment-modal__rating-label">Calificación:</span>
                <div className="comment-modal__rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= rating ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setRating(star)}
                      onMouseLeave={() => setRating(rating)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <label>
                Comentario:
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe tu comentario aquí..."
                  required
                  rows={4}
                />
              </label>

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
          <strong className="stat-card__number">{stats.eventsInProcess}</strong>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowEventsInProcessModal(true)}
          >
            Ver detalles
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Total de Usuarios</span>
          <strong className="stat-card__number">{stats.totalUsers}</strong>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowUsersModal(true)}
          >
            Ver usuarios
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Calificación Promedio</span>
          <strong className="stat-card__number">{stats.averageRating.toFixed(1)}</strong>
          <div className="stat-card__stars">{renderStars(stats.averageRating)}</div>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Espacios Disponibles</span>
          <strong className="stat-card__number">{stats.spaces.length}</strong>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowSpacesModal(true)}
          >
            Ver espacios
          </button>
        </div>
      </div>

      <div className="section-header">
        <center>
          <button 
            className="new-form-btn"
            onClick={() => setShowEventModal(true)}>
            + Nuevo evento
          </button>
        </center>
      </div>

      <div className="admin-actions">
        <br />
        <h3>Acciones Administrativas</h3>
        <div className="action-buttons">
          <button onClick={() => navigate('/Menu-Servicios/Transporte')}>Gestionar Transporte</button>
          <button onClick={() => navigate('/Menu-Servicios/Supervision')}>Gestionar Supervisión</button>
          <button onClick={() => navigate('/Menu-Servicios/Montaje-Desmontaje')}>Gestionar Montaje</button>
          <button onClick={() => navigate('/Menu-Servicios/Catering')}>Gestionar Catering</button>
          <button onClick={() => navigate('/Menu-Servicios/Decoracion')}>Gestionar Decoración</button>
          <button onClick={() => navigate('/Menu-Servicios/Alquiler')}>Gestionar Alquiler</button>
        </div>
      </div>
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
            <strong className="stat-card__number">{stats.eventsInProcess}</strong>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowEventosAsignadosModal(true)}
            >
              Ver eventos
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Calificación Promedio</span>
            <strong className="stat-card__number">{stats.averageRating.toFixed(1)}</strong>
            <div className="stat-card__stars">{renderStars(stats.averageRating)}</div>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Clientes activos</span>
            <strong className="stat-card__number">{stats.totalUsers}</strong>
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
              onClick={() => setShowEventModal(true)}>
              + Nuevo evento
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
          <p>Gestiona todos los servicios y eventos desde aquí</p>
        </div>

        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Elementos Disponibles</span>
            <strong className="stat-card__number">{stats.eventsInProcess}</strong>
            <button className="stat-card__seeInfo">Ver inventario</button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Elementos en Uso</span>
            <strong className="stat-card__number">{stats.totalUsers}</strong>
            <button className="stat-card__seeInfo">Ver en uso</button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Compras Pendientes</span>
            <strong className="stat-card__number">{stats.quotations}</strong>
            <button className="stat-card__seeInfo">Ver compras</button>
          </div>
        </div>
      </div>
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
          correo: ''
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
              + Agregar Espacio
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
                    <td>{espacio.nombre}</td>
                    <td>{espacio.telefono}</td>
                    <td>{espacio.direccion}</td>
                    <td>{espacio.estado}</td>
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
          nombre: '',
          telefono: '',
          espacio: '',
          direccion: '',
          estado: 'Disponible'
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
          
          <label>
            Nombre:
            <input
              type="text"
              name="nombre"
              value={spaceFormData.nombre}
              onChange={handleSpaceInputChange}
              required
            />
          </label>

          <label>
            Teléfono:
            <input
              type="tel"
              name="telefono"
              value={spaceFormData.telefono}
              onChange={handleSpaceInputChange}
              required
            />
          </label>

          <label>
            Espacio:
            <input
              type="text"
              name="espacio"
              value={spaceFormData.espacio}
              onChange={handleSpaceInputChange}
              required
            />
          </label>

          <label>
            Dirección:
            <input
              type="text"
              name="direccion"
              value={spaceFormData.direccion}
              onChange={handleSpaceInputChange}
              required
            />
          </label>

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

  return (
    <div className="welcome-menu">
      {Number(userData.rol) === 1 && renderAdminDashboard()}
      {Number(userData.rol) === 2 && renderClientDashboard()}
      {Number(userData.rol) === 3 && renderCoordinatorDashboard()}
      {Number(userData.rol) === 4 && renderInventoryDashboard()}

      {showCommentModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowCommentModal(false)}>×</button>
            <form className="modal-form" onSubmit={handleCommentSubmit}>
              <h3>Agregar Comentario</h3>
              
              <div className="event-select">
                <label>Seleccionar Evento:</label>
                <select
                  value={selectedEventId || ''}
                  onChange={(e) => setSelectedEventId(Number(e.target.value))}
                  required
                  className="event-select-input"
                >
                  <option value="">Seleccionar evento</option>
                  {eventos.map(evento => (
                    <option key={evento.id_evento} value={evento.id_evento}>
                      {evento.fecha_evento} - {evento.tipo_evento}
                    </option>
                  ))}
                </select>
              </div>

              <div className="comment-modal__rating">
                <span className="comment-modal__rating-label">Calificación:</span>
                <div className="comment-modal__rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= rating ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setRating(star)}
                      onMouseLeave={() => setRating(rating)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <label>
                Comentario:
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe tu comentario aquí..."
                  required
                  rows={4}
                />
              </label>

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
    </div>
  );
};

export default WelcomeMenu;
