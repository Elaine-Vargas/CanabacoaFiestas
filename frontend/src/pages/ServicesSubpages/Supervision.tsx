import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import '../../styles/dashboard/ServicesSubpages.scss';
import '../../components/ServiceBase';
import { useUser } from '../../contexts/UserContext';

interface Supervision {
  id_supervision?: number;
  id_evento: number;
  supervisor: string;
  tipo_supervision: string;
  descripcion: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  notas: string;
}

interface Evento {
  id_evento: number;
  fecha_evento: string;
  tipo_evento: string;
}

interface SupervisionStats {
  eventosSupervisados: number;
  empleadosEncargados: number;
  supervisionesCompletadas: number;
}

interface EventoSupervisado {
  id_evento: number;
  nombre_evento: string;
  cliente: string;
  fecha: string;
  lugar: string;
  hora: string;
}

interface EmpleadoSupervision {
  id_empleado: number;
  nombre: string;
  apellido: string;
  cedula: string;
  cantidad_eventos: number;
}

interface SupervisionCompletada {
  id_supervision: number;
  evento: string;
  cliente: string;
  asesor: string;
  lugar: string;
  fecha: string;
  hora: string;
  servicios_adicionales: string;
}

export default function Supervision() {
  const { userRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showModal, setShowModal] = useState(false);
  const [showEventosModal, setShowEventosModal] = useState(false);
  const [showEmpleadosModal, setShowEmpleadosModal] = useState(false);
  const [showCompletadasModal, setShowCompletadasModal] = useState(false);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventosSupervisados, setEventosSupervisados] = useState<EventoSupervisado[]>([]);
  const [empleadosSupervision, setEmpleadosSupervision] = useState<EmpleadoSupervision[]>([]);
  const [supervisionesCompletadas, setSupervisionesCompletadas] = useState<SupervisionCompletada[]>([]);
  const [stats, setStats] = useState<SupervisionStats>({
    eventosSupervisados: 0,
    empleadosEncargados: 0,
    supervisionesCompletadas: 0
  });
  const [formData, setFormData] = useState<Partial<Supervision>>({
    id_evento: 0,
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    estado: 'Pendiente',
    notas: ''
  });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supervisionsRes, eventosRes] = await Promise.all([
          fetch('/api/supervision'),
          fetch('/api/eventos')
        ]);

        const [eventosData] = await Promise.all([
          supervisionsRes.json(),
          eventosRes.json()
        ]);

        setEventos(eventosData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/supervision/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    };

    if (userRole !== 'client') {
      fetchStats();
    }
  }, [userRole]);

  useEffect(() => {
    // Verificar el rol del usuario
    const rolId = Number(userData.rol);
    if (![1, 3, 4].includes(rolId)) {
      // Si no es admin, organizador o inventario, redirigir a bienvenida
      window.location.href = '/Menu-Servicios/Bienvenida';
    }
  }, [userData.rol]);

  useEffect(() => {
    const fetchEventosSupervisados = async () => {
      if (showEventosModal) {
        try {
          const response = await fetch('/api/supervision/eventos');
          const data = await response.json();
          setEventosSupervisados(data);
        } catch (error) {
          console.error('Error al cargar eventos supervisados:', error);
        }
      }
    };

    const fetchEmpleadosSupervision = async () => {
      if (showEmpleadosModal) {
        try {
          const response = await fetch('/api/supervision/empleados');
          const data = await response.json();
          setEmpleadosSupervision(data);
        } catch (error) {
          console.error('Error al cargar empleados:', error);
        }
      }
    };

    const fetchSupervisionesCompletadas = async () => {
      if (showCompletadasModal) {
        try {
          const response = await fetch('/api/supervision/completadas');
          const data = await response.json();
          setSupervisionesCompletadas(data);
        } catch (error) {
          console.error('Error al cargar supervisiones completadas:', error);
        }
      }
    };

    fetchEventosSupervisados();
    fetchEmpleadosSupervision();
    fetchSupervisionesCompletadas();
  }, [showEventosModal, showEmpleadosModal, showCompletadasModal]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/supervisions', {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la supervisión');
      }

      setShowModal(false);
      setFormData({
        id_evento: 0,
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        estado: 'Pendiente',
        notas: ''
      });
      setEditId(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderAdminView = () => {
    return (
      <div className="supervision-content">
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Eventos Supervisados</span>
            <strong className="stat-card__number">{stats.eventosSupervisados}</strong>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowEventosModal(true)}
            >
              Ver eventos
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Empleados a Cargo</span>
            <strong className="stat-card__number">{stats.empleadosEncargados}</strong>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowEmpleadosModal(true)}
            >
              Ver empleados
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Supervisiones Completadas</span>
            <strong className="stat-card__number">{stats.supervisionesCompletadas}</strong>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowCompletadasModal(true)}
            >
              Ver completadas
            </button>
          </div>
        </div>

        <button className="new-form-btn" onClick={() => setShowModal(true)}>
          + Agregar Servicio de Supervisión
        </button>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
              <form className="modal-form" onSubmit={handleSubmit}>
                <h2>{editId ? 'Editar Supervisión' : 'Nueva Supervisión'}</h2>
                
                <label>
                  Evento:
                  <select
                    name="id_evento"
                    value={formData.id_evento || ''}
                    onChange={handleSelectChange}
                    required
                  >
                    <option value="">Seleccionar evento</option>
                    {eventos.map((evento) => (
                      <option key={evento.id_evento} value={evento.id_evento}>
                        {evento.tipo_evento} - {evento.fecha_evento}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Tipo de Supervisión:
                  <select
                    name="tipo_supervision"
                    value={formData.tipo_supervision || ''}
                    onChange={handleSelectChange}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="General">General</option>
                    <option value="Seguridad">Seguridad</option>
                    <option value="Logística">Logística</option>
                    <option value="Calidad">Calidad</option>
                  </select>
                </label>

                <label>
                  Descripción:
                  <textarea
                    name="descripcion"
                    value={formData.descripcion || ''}
                    onChange={handleInputChange}
                    required
                    rows={4}
                  />
                </label>

                <label>
                  Estado:
                  <select
                    name="estado"
                    value={formData.estado || ''}
                    onChange={handleSelectChange}
                    required
                  >
                    <option value="">Seleccionar estado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Progreso">En Progreso</option>
                    <option value="Completado">Completado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </label>

                <div className="form-buttons">
                  <button type="submit" className="submit-btn">
                    {editId ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    className="reset-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOrganizerView = () => (
    <div className="supervision-content">
      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Eventos Supervisados por Mí</span>
          <strong className="stat-card__number">{stats.eventosSupervisados}</strong>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowEventosModal(true)}
          >
            Ver eventos
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Equipo de Trabajo</span>
          <strong className="stat-card__number">{stats.empleadosEncargados}</strong>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowEmpleadosModal(true)}
          >
            Ver equipo
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Todos los Eventos</span>
          <strong className="stat-card__number">{stats.supervisionesCompletadas}</strong>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowCompletadasModal(true)}
          >
            Ver todos
          </button>
        </div>
      </div>

      <button className="new-form-btn" onClick={() => setShowModal(true)}>
        + Agregar Servicio de Supervisión
      </button>
    </div>
  );

  const renderEventosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowEventosModal(false)}>×</button>
        <div className="modal-content">
          <h3>Eventos Supervisados por Mí</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Lugar</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {eventosSupervisados.map((evento) => (
                  <tr key={evento.id_evento}>
                    <td>{evento.nombre_evento}</td>
                    <td>{evento.cliente}</td>
                    <td>{evento.fecha}</td>
                    <td>{evento.lugar}</td>
                    <td>{evento.hora}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmpleadosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowEmpleadosModal(false)}>×</button>
        <div className="modal-content">
          <h3>Equipo de Trabajo</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Cédula</th>
                  <th>Cantidad de Eventos</th>
                </tr>
              </thead>
              <tbody>
                {empleadosSupervision.map((empleado) => (
                  <tr key={empleado.id_empleado}>
                    <td>{empleado.nombre}</td>
                    <td>{empleado.apellido}</td>
                    <td>{empleado.cedula}</td>
                    <td>{empleado.cantidad_eventos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompletadasModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowCompletadasModal(false)}>×</button>
        <div className="modal-content">
          <h3>Todos los Eventos con Supervisión</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Cliente</th>
                  <th>Asesor</th>
                  <th>Lugar</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Servicios Adicionales</th>
                </tr>
              </thead>
              <tbody>
                {supervisionesCompletadas.map((supervision) => (
                  <tr key={supervision.id_supervision}>
                    <td>{supervision.evento}</td>
                    <td>{supervision.cliente}</td>
                    <td>{supervision.asesor}</td>
                    <td>{supervision.lugar}</td>
                    <td>{supervision.fecha}</td>
                    <td>{supervision.hora}</td>
                    <td>{supervision.servicios_adicionales}</td>
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
    <div className="supervision-page">
      <div className="welcome-header">
        <h1>Gestión de Supervisión</h1>
        <p>Gestiona los servicios de supervisión para eventos</p>
      </div>

      <div className="service-content">
        {(() => {
          const rolId = Number(userData.rol);
          const isAdmin = rolId === 1;
          const isOrganizer = rolId === 3;

          if (isAdmin) {
            return renderAdminView();
          }

          if (isOrganizer) {
            return renderOrganizerView();
          }

          return null;
        })()}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            <form className="modal-form" onSubmit={handleSubmit}>
              <h2>{editId ? 'Editar Supervisión' : 'Nueva Supervisión'}</h2>
              
              <label>
                Evento:
                <select
                  name="id_evento"
                  value={formData.id_evento || ''}
                  onChange={handleSelectChange}
                  required
                >
                  <option value="">Seleccionar evento</option>
                  {eventos.map((evento) => (
                    <option key={evento.id_evento} value={evento.id_evento}>
                      {evento.tipo_evento} - {evento.fecha_evento}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Tipo de Supervisión:
                <select
                  name="tipo_supervision"
                  value={formData.tipo_supervision || ''}
                  onChange={handleSelectChange}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="General">General</option>
                  <option value="Seguridad">Seguridad</option>
                  <option value="Logística">Logística</option>
                  <option value="Calidad">Calidad</option>
                </select>
              </label>

              <label>
                Descripción:
                <textarea
                  name="descripcion"
                  value={formData.descripcion || ''}
                  onChange={handleInputChange}
                  required
                  rows={4}
                />
              </label>

              <label>
                Estado:
                <select
                  name="estado"
                  value={formData.estado || ''}
                  onChange={handleSelectChange}
                  required
                >
                  <option value="">Seleccionar estado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Progreso">En Progreso</option>
                  <option value="Completado">Completado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </label>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  {editId ? 'Actualizar' : 'Guardar'}
                </button>
                <button
                  type="button"
                  className="reset-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEventosModal && renderEventosModal()}
      {showEmpleadosModal && renderEmpleadosModal()}
      {showCompletadasModal && renderCompletadasModal()}
    </div>
  );
}
