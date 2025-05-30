import React, { useState, useEffect } from 'react';
import '../../styles/services-subpages.scss';
import { useUser } from '../../context/UserContext';
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

type WelcomeMenuProps = {
  eventsInProcess?: number;
  averageRating?: number;
  totalUsers?: number;
  quotations?: Quotation[];
};

interface Espacio {
  id_espacio: number;
  nombre: string;
}

interface NuevoEvento {
  cedula_cliente: string;
  fecha_evento: string;
  hora_evento: string;
  id_espacio: number;
  id_tipo_evento: number;
  nota_cliente: string;
  estado_evento: 'Pendiente' | 'Confirmado' | 'Cancelado' | 'Completado';
  estado_cotizacion: 'Pendiente' | 'Completada' | 'Aceptada' | 'Rechazada' | 'Cancelada' | 'Eliminada';
}

const WelcomeMenu: React.FC<WelcomeMenuProps> = () => {
  const navigate = useNavigate();
  const { userRole } = useUser();
  console.log('Rol actual:', userRole);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [stats, setStats] = useState({
    eventsInProcess: 0,
    averageRating: 0,
    totalUsers: 0,
    quotations: [] as Quotation[]
  });
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [formData, setFormData] = useState<NuevoEvento>({
    cedula_cliente: '',
    fecha_evento: '',
    hora_evento: '',
    id_espacio: 0,
    id_tipo_evento: 0,
    nota_cliente: '',
    estado_evento: 'Pendiente',
    estado_cotizacion: 'Pendiente'
  });

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

  // Agregar un log para ver los espacios disponibles
  useEffect(() => {
    console.log('Espacios actuales:', espacios);
  }, [espacios]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment,
          rating,
          userId: localStorage.getItem('userId'), // Obtener el ID del usuario del localStorage
        }),
      });

      if (response.ok) {
        setShowCommentModal(false);
        setComment('');
        setRating(0);
        // Actualizar los datos del dashboard
        const updatedData = await fetch(`/api/auth/current`);
        const data = await updatedData.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error al enviar el comentario:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
        subtotal_evento: 0.00,
        itbis_evento: 0.00,
        total_evento: 0.00
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
        fecha_evento: '',
        hora_evento: '',
        id_espacio: 0,
        id_tipo_evento: 0,
        nota_cliente: '',
        estado_evento: 'Pendiente',
        estado_cotizacion: 'Pendiente'
      });
    } catch (error) {
      console.error('Error al crear evento:', error);
      alert('Hubo un error al crear el evento. Por favor, intente nuevamente.');
    }
  };

  const handleServiceSelect = (service: string) => {
    setShowServicesModal(false);
    navigate(`/services/${service}`, { state: { openModal: true } });
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

  const renderClientDashboard = () => (
    <>
      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Mis Eventos Activos</span>
          <strong className="stat-card__number">{stats.eventsInProcess}</strong>
          <button className="stat-card__seeInfo">Ver detalles</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Total de Eventos Realizados</span>
          <strong className="stat-card__number">{stats.totalUsers}</strong>
          <button className="stat-card__seeInfo">Ver historial</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Comentarios Enviados</span>
          <strong className="stat-card__number">{stats.quotations.length}</strong>
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
         <div className="comment-section">
         <h3>Mis Comentarios</h3>
       </div>
        <div className="comment-list">
          {stats.quotations.map((comment, index) => (
            <div key={index} className="comment-card">
              <div className="comment-header">
                <div className="user-info">
                  <div className="user-avatar">
                    {comment.client.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{comment.client}</span>
                </div>
                <span className="comment-date">{comment.date}</span>
              </div>
              <div className="comment-rating">
                {renderStars(parseFloat(comment.status))}
              </div>
              <p className="comment-text">{comment.client}</p>
            </div>
          ))}
        </div>
      </div>

      {showCommentModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowCommentModal(false)}>×</button>
            <form className="modal-form" onSubmit={handleCommentSubmit}>
              <h3>Agregar Comentario</h3>
              
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
                <button type="submit" className="submit-btn">
                  Enviar Comentario
                </button>
                <button
                  type="button"
                  className="reset-btn"
                  onClick={() => setShowCommentModal(false)}
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
            <form className="modal-form" onSubmit={handleEventSubmit}>
              <h2>Nuevo Evento</h2>

              <label>
                Cédula:
                <input
                  type="text"
                  name="cedula_cliente"
                  value={formData.cedula_cliente}
                  onChange={handleInputChange}
                  required
                />
              </label>

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

              {formData.id_tipo_evento === 5 && (
                <label>
                  Especifique el tipo de evento:
                  <input
                    type="text"
                    name="tipo_evento_otro"
                    value={formData.nota_cliente}
                    onChange={handleInputChange}
                    required
                  />
                </label>
              )}

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
                {userRole !== 'client' && (
                  <>
                    <button onClick={() => handleServiceSelect('transportation')}>Transporte</button>
                    <button onClick={() => handleServiceSelect('supervision')}>Supervisión</button>
                    <button onClick={() => handleServiceSelect('assembly')}>Montaje y Desmontaje</button>
                  </>
                )}
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
          <button className="stat-card__seeInfo">Ver detalles</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Total de Usuarios</span>
          <strong className="stat-card__number">{stats.totalUsers}</strong>
          <button className="stat-card__seeInfo">Ver usuarios</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Calificación Promedio</span>
          <strong className="stat-card__number">{stats.averageRating.toFixed(1)}</strong>
          <div className="stat-card__stars">{renderStars(stats.averageRating)}</div>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Cotizaciones Pendientes</span>
          <strong className="stat-card__number">{stats.quotations.length}</strong>
          <button className="stat-card__seeInfo">Ver cotizaciones</button>
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
          <button onClick={() => navigate('/Menu-Servicios/Transportation')}>Gestionar Transporte</button>
          <button onClick={() => navigate('/Menu-Servicios/Supervision')}>Gestionar Supervisión</button>
          <button onClick={() => navigate('/Menu-Servicios/AssemblyAndDisassembly')}>Gestionar Montaje</button>
          <button onClick={() => navigate('/Menu-Servicios/Catering')}>Gestionar Catering</button>
          <button onClick={() => navigate('/Menu-Servicios/Decor')}>Gestionar Decoración</button>
          <button onClick={() => navigate('/Menu-Servicios/Rent')}>Gestionar Alquiler</button>
        </div>
      </div>
    </div>
  );

  const renderCoordinatorDashboard = () => (
    <>
      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Eventos Asignados</span>
          <strong className="stat-card__number">{stats.eventsInProcess}</strong>
          <button className="stat-card__seeInfo">Ver eventos</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Calificación Promedio</span>
          <strong className="stat-card__number">{stats.averageRating.toFixed(1)}</strong>
          <div className="stat-card__stars">{renderStars(stats.averageRating)}</div>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Eventos Supervisados</span>
          <strong className="stat-card__number">{stats.totalUsers}</strong>
          <button className="stat-card__seeInfo">Ver historial</button>
        </div>
      </div>
    </>
  );

  const renderInventoryDashboard = () => (
    <>
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
          <strong className="stat-card__number">{stats.quotations.length}</strong>
          <button className="stat-card__seeInfo">Ver compras</button>
        </div>
      </div>
    </>
  );

  return (
    <div className="welcome-menu">
      {userRole === 'admin' && renderAdminDashboard()}
      {userRole === 'client' && renderClientDashboard()}
      {userRole === 'supervisor' && renderCoordinatorDashboard()}
      {userRole === 'inventory' && renderInventoryDashboard()}

      {showCommentModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowCommentModal(false)}>×</button>
            <form className="modal-form" onSubmit={handleCommentSubmit}>
              <h3>Agregar Comentario</h3>
              
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
                <button type="submit" className="submit-btn">
                  Enviar Comentario
                </button>
                <button
                  type="button"
                  className="reset-btn"
                  onClick={() => setShowCommentModal(false)}
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
            <form className="modal-form" onSubmit={handleEventSubmit}>
              <h2>Nuevo Evento</h2>

              <label>
                Cédula:
                <input
                  type="text"
                  name="cedula_cliente"
                  value={formData.cedula_cliente}
                  onChange={handleInputChange}
                  required
                />
              </label>

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

              {formData.id_tipo_evento === 5 && (
                <label>
                  Especifique el tipo de evento:
                  <input
                    type="text"
                    name="tipo_evento_otro"
                    value={formData.nota_cliente}
                    onChange={handleInputChange}
                    required
                  />
                </label>
              )}

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
                {userRole !== 'client' && (
                  <>
                    <button onClick={() => handleServiceSelect('transportation')}>Transporte</button>
                    <button onClick={() => handleServiceSelect('supervision')}>Supervisión</button>
                    <button onClick={() => handleServiceSelect('assembly')}>Montaje y Desmontaje</button>
                  </>
                )}
                <button onClick={() => setShowServicesModal(false)}>No, gracias</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeMenu;
