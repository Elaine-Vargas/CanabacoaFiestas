import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import '../../styles/dashboard/ServicesSubpages.scss';
import '../../components/ServiceBase';
import { useUser } from "../../contexts/UserContext";

interface Assembly {
  id_assembly?: number;
  id_evento: number;
  tipo_servicio: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  notas: string;
}

interface Evento {
  id_evento: number;
  fecha_evento: string;
  tipo_evento: string;
}

interface AssemblyStats {
  eventosCompletados: number;
  eventosPendientes: number;
  personalEncargado: number;
}

interface EventoCompletado {
  id_evento: number;
  nombre_evento: string;
  cliente: string;
  fecha: string;
  hora: string;
}

interface EventoPendiente {
  id_evento: number;
  nombre_evento: string;
  lugar: string;
  fecha: string;
  servicio: string;
  asesor: string;
  cliente: string;
}

interface EventoParticipacion {
  id_evento: number;
  nombre_evento: string;
  cliente: string;
  fecha: string;
  hora: string;
}

interface EventoTerminado {
  id_evento: number;
  nombre_evento: string;
  lugar: string;
  fecha: string;
  hora_montaje: string;
  hora_desmontaje: string;
  cantidad_empleados: number;
}

interface EmpleadoMontaje {
  id_empleado: number;
  nombre: string;
  cedula: string;
  cantidad_eventos: number;
}

export default function AssemblyAndDisassembly() {
  const { userRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showModal, setShowModal] = useState(false);
  const [showEventosCompletadosModal, setShowEventosCompletadosModal] = useState(false);
  const [showEventosPendientesModal, setShowEventosPendientesModal] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventosCompletados, setEventosCompletados] = useState<EventoCompletado[]>([]);
  const [eventosPendientes, setEventosPendientes] = useState<EventoPendiente[]>([]);
  const [empleadosMontaje, setEmpleadosMontaje] = useState<EmpleadoMontaje[]>([]);
  const [stats, setStats] = useState<AssemblyStats>({
    eventosCompletados: 0,
    eventosPendientes: 0,
    personalEncargado: 0
  });
  const [formData, setFormData] = useState<Partial<Assembly>>({
    id_evento: 0,
    descripcion: '',
    estado: 'Pendiente',
    notas: ''
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [filtroEvento, setFiltroEvento] = useState<string>('');

  useEffect(() => {
    // Verificar el rol del usuario
    const rolId = Number(userData.rol);
    if (![1, 3, 4].includes(rolId)) {
      // Si no es admin, organizador o inventario, redirigir a bienvenida
      window.location.href = '/Menu-Servicios/Bienvenida';
    }
  }, [userData.rol]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assembliesRes, eventosRes] = await Promise.all([
          fetch('/api/assembly'),
          fetch('/api/eventos')
        ]);

        const [assembliesData, eventosData] = await Promise.all([
          assembliesRes.json(),
          eventosRes.json()
        ]);

        setAssemblies(assembliesData);
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
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const response = await fetch('/api/assembly/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'user-role': userData.rol || '',
            'user-cedula': userData.cedula || ''
          }
        });
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
    const fetchEventosCompletados = async () => {
      if (showEventosCompletadosModal) {
        try {
          const response = await fetch('/api/montaje/eventos-completados');
          const data = await response.json();
          setEventosCompletados(data);
        } catch (error) {
          console.error('Error al cargar eventos completados:', error);
        }
      }
    };

    const fetchEventosPendientes = async () => {
      if (showEventosPendientesModal) {
        try {
          const response = await fetch('/api/montaje/eventos-pendientes');
          const data = await response.json();
          setEventosPendientes(data);
        } catch (error) {
          console.error('Error al cargar eventos pendientes:', error);
        }
      }
    };

    const fetchPersonalMontaje = async () => {
      if (showPersonalModal) {
        try {
          const response = await fetch('/api/montaje/personal');
          const data = await response.json();
          setEmpleadosMontaje(data);
        } catch (error) {
          console.error('Error al cargar personal:', error);
        }
      }
    };

    fetchEventosCompletados();
    fetchEventosPendientes();
    fetchPersonalMontaje();
  }, [showEventosCompletadosModal, showEventosPendientesModal, showPersonalModal]);

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
      const response = await fetch('/api/assemblies', {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el servicio');
      }

      const data = await response.json();
      setAssemblies(data);
      setShowModal(false);
      setFormData({
        id_evento: 0,
        descripcion: '',
        estado: 'Pendiente',
        notas: ''
      });
      setEditId(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (assembly: Assembly) => {
    setFormData(assembly);
    setEditId(assembly.id_assembly!);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/assembly/${id}`, { method: 'DELETE' });
      setAssemblies(prev => prev.filter(a => a.id_assembly !== id));
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const renderInventoryView = () => (
    <div className="assembly-content">
      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Personal Encargado</span>
          <button className="stat-card__seeInfo">Ver personal</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Eventos Completados</span>
          <button className="stat-card__seeInfo">Ver completados</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Eventos Pendientes</span>
          <button className="stat-card__seeInfo">Ver pendientes</button>
        </div>
      </div>

      <div className="table-section">
        <p>Inventario de Equipos</p>
        <input
          type="text"
          className="escri"
          placeholder="Filtrar por equipo..."
          value={filtroEvento}
          onChange={(e) => setFiltroEvento(e.target.value)}
        />
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Evento</th>
              <th>Tipo de Servicio</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {assemblies
              .filter(a => 
                eventos.find(e => e.id_evento === a.id_evento)?.tipo_evento
                  .toLowerCase()
                  .includes(filtroEvento.toLowerCase())
              )
              .map((assembly) => (
                <tr key={assembly.id_assembly}>
                  <td>{assembly.id_assembly}</td>
                  <td>
                    {eventos.find(e => e.id_evento === assembly.id_evento)?.tipo_evento}
                  </td>
                  <td>{assembly.tipo_servicio}</td>
                  <td>{assembly.descripcion}</td>
                  <td>{assembly.estado}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(assembly)}
                    >
                      Actualizar Estado
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrganizerView = () => {
    const [showPendientesModal, setShowPendientesModal] = useState(false);
    const [showParticipacionModal, setShowParticipacionModal] = useState(false);
    const [showTerminadosModal, setShowTerminadosModal] = useState(false);
    const [eventosPendientes, setEventosPendientes] = useState<EventoPendiente[]>([]);
    const [eventosParticipacion, setEventosParticipacion] = useState<EventoParticipacion[]>([]);
    const [eventosTerminados, setEventosTerminados] = useState<EventoTerminado[]>([]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const [pendientesRes, participacionRes, terminadosRes] = await Promise.all([
            fetch('/api/montaje/pendientes'),
            fetch('/api/montaje/participacion'),
            fetch('/api/montaje/terminados')
          ]);

          const [pendientesData, participacionData, terminadosData] = await Promise.all([
            pendientesRes.json(),
            participacionRes.json(),
            terminadosRes.json()
          ]);

          setEventosPendientes(pendientesData);
          setEventosParticipacion(participacionData);
          setEventosTerminados(terminadosData);
        } catch (error) {
          console.error('Error al cargar datos:', error);
        }
      };

      fetchData();
    }, []);

    const renderPendientesModal = () => (
      <div className="modal-overlay">
        <div className="modal-container">
          <button className="close-btn" onClick={() => setShowPendientesModal(false)}>×</button>
          <div className="modal-content">
            <h3>Eventos Pendientes</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Lugar</th>
                    <th>Fecha</th>
                    <th>Servicio a Realizar</th>
                    <th>Asesor del Evento</th>
                    <th>Cliente</th>
                  </tr>
                </thead>
                <tbody>
                  {eventosPendientes.map((evento) => (
                    <tr key={evento.id_evento}>
                      <td>{evento.nombre_evento}</td>
                      <td>{evento.lugar}</td>
                      <td>{evento.fecha}</td>
                      <td>{evento.servicio}</td>
                      <td>{evento.asesor}</td>
                      <td>{evento.cliente}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );

    const renderParticipacionModal = () => (
      <div className="modal-overlay">
        <div className="modal-container">
          <button className="close-btn" onClick={() => setShowParticipacionModal(false)}>×</button>
          <div className="modal-content">
            <h3>Eventos con Mi Participación</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {eventosParticipacion.map((evento) => (
                    <tr key={evento.id_evento}>
                      <td>{evento.nombre_evento}</td>
                      <td>{evento.cliente}</td>
                      <td>{evento.fecha}</td>
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

    const renderTerminadosModal = () => (
      <div className="modal-overlay">
        <div className="modal-container">
          <button className="close-btn" onClick={() => setShowTerminadosModal(false)}>×</button>
          <div className="modal-content">
            <h3>Eventos Terminados</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Lugar</th>
                    <th>Fecha</th>
                    <th>Hora Montaje</th>
                    <th>Hora Desmontaje</th>
                    <th>Cantidad de Empleados</th>
                  </tr>
                </thead>
                <tbody>
                  {eventosTerminados.map((evento) => (
                    <tr key={evento.id_evento}>
                      <td>{evento.nombre_evento}</td>
                      <td>{evento.lugar}</td>
                      <td>{evento.fecha}</td>
                      <td>{evento.hora_montaje}</td>
                      <td>{evento.hora_desmontaje}</td>
                      <td>{evento.cantidad_empleados}</td>
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
      <div className="assembly-content">
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Eventos Pendientes</span>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowPendientesModal(true)}
            >
              Ver pendientes
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Mi Participación</span>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowParticipacionModal(true)}
            >
              Ver participación
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Eventos Terminados</span>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowTerminadosModal(true)}
            >
              Ver terminados
            </button>
          </div>
        </div>

        <center>
          <button className="new-form-btn" onClick={() => setShowModal(true)}>
          + Agregar Servicio de Montaje y Desmontaje
        </button>
        </center>

        {showPendientesModal && renderPendientesModal()}
        {showParticipacionModal && renderParticipacionModal()}
        {showTerminadosModal && renderTerminadosModal()}
      </div>
    );
  };

  const renderAdminView = () => {
    return (
      <div className="assembly-content">
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Eventos Completados</span>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowEventosCompletadosModal(true)}
            >
              Ver completados
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Eventos Pendientes</span>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowEventosPendientesModal(true)}
            >
              Ver pendientes
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Personal Encargado</span>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowPersonalModal(true)}
            >
              Ver personal
            </button>
          </div>
        </div>

        <center>
          <button className="new-form-btn" onClick={() => setShowModal(true)}>
          + Agregar Servicio de Montaje y Desmontaje
        </button>
        </center>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
              <form className="modal-form" onSubmit={handleSubmit}>
                <h2>{editId ? 'Editar Montaje/Desmontaje' : 'Nuevo Montaje/Desmontaje'}</h2>
                
                <div className="form-grid">
                  <label>
                    <span>Evento:</span>
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
                    <span>Tipo de Servicio:</span>
                    <select
                      name="tipo_servicio"
                      value={formData.tipo_servicio || ''}
                      onChange={handleSelectChange}
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="Montaje">Montaje</option>
                      <option value="Desmontaje">Desmontaje</option>
                      <option value="Ambos">Ambos</option>
                    </select>
                  </label>

                  <label>
                    <span>Estado:</span>
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

                  <label>
                    <span>Notas:</span>
                    <textarea
                      name="notas"
                      value={formData.notas || ''}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </label>
                </div>

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

  const renderEventosCompletadosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowEventosCompletadosModal(false)}>×</button>
        <div className="modal-content">
          <h3>Eventos con Mi Participación</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {eventosCompletados.map((evento) => (
                  <tr key={evento.id_evento}>
                    <td>{evento.nombre_evento}</td>
                    <td>{evento.cliente}</td>
                    <td>{evento.fecha}</td>
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

  const renderEventosPendientesModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowEventosPendientesModal(false)}>×</button>
        <div className="modal-content">
          <h3>Eventos Pendientes</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Lugar</th>
                  <th>Fecha</th>
                  <th>Servicio a Realizar</th>
                  <th>Asesor del Evento</th>
                  <th>Cliente</th>
                </tr>
              </thead>
              <tbody>
                {eventosPendientes.map((evento) => (
                  <tr key={evento.id_evento}>
                    <td>{evento.nombre_evento}</td>
                    <td>{evento.lugar}</td>
                    <td>{evento.fecha}</td>
                    <td>{evento.servicio}</td>
                    <td>{evento.asesor}</td>
                    <td>{evento.cliente}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowPersonalModal(false)}>×</button>
        <div className="modal-content">
          <h3>Eventos Terminados</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Lugar</th>
                  <th>Fecha</th>
                  <th>Hora Montaje</th>
                  <th>Hora Desmontaje</th>
                  <th>Cantidad de Empleados</th>
                </tr>
              </thead>
              <tbody>
                {empleadosMontaje.map((evento) => (
                  <tr key={evento.id_empleado}>
                    <td>{evento.nombre}</td>
                    <td>{evento.cedula}</td>
                    <td>{evento.cantidad_eventos}</td>
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
    <div className="assembly-page">
      <div className="welcome-header">
        <h1>Gestión de Montaje y Desmontaje</h1>
        <p>Gestiona los servicios de montaje y desmontaje para eventos</p>
      </div>

      <div className="service-content">
        {(() => {
          const rolId = Number(userData.rol);
          const isAdmin = rolId === 1;
          const isOrganizer = rolId === 3;
          const isInventory = rolId === 4;

          if (isAdmin) {
            return (
              <>
                {renderAdminView()}
                {showEventosCompletadosModal && renderEventosCompletadosModal()}
                {showEventosPendientesModal && renderEventosPendientesModal()}
                {showPersonalModal && renderPersonalModal()}
              </>
            );
          }

          if (isInventory) {
            return renderInventoryView();
          }

          if (isOrganizer) {
            return renderOrganizerView();
          }

          return null;
        })()}
      </div>
    </div>
  );
}
