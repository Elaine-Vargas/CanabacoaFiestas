import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import '../../styles/services-subpages.scss';
import ServiceBase from '../../components/ServiceBase';
import { useUser } from '../../context/UserContext';

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

export default function Supervision() {
  const { userRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showModal, setShowModal] = useState(false);
  const [supervisions, setSupervisions] = useState<Supervision[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
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
  const [filtroEvento, setFiltroEvento] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supervisionsRes, eventosRes] = await Promise.all([
          fetch('/api/supervision'),
          fetch('/api/eventos')
        ]);

        const [supervisionsData, eventosData] = await Promise.all([
          supervisionsRes.json(),
          eventosRes.json()
        ]);

        setSupervisions(supervisionsData);
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

      const data = await response.json();
      setSupervisions(data);
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

  const handleEdit = (supervision: Supervision) => {
    setFormData(supervision);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/supervision/${id}`, { method: 'DELETE' });
      setSupervisions(prev => prev.filter(s => s.id_supervision !== id));
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };


  const renderAdminView = () => {
    return (
      <div className="supervision-content">
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Eventos Supervisados</span>
            <strong className="stat-card__number">{stats.eventosSupervisados}</strong>
            <button className="stat-card__seeInfo">Ver eventos</button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Empleados a Cargo</span>
            <strong className="stat-card__number">{stats.empleadosEncargados}</strong>
            <button className="stat-card__seeInfo">Ver empleados</button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Supervisiones Completadas</span>
            <strong className="stat-card__number">{stats.supervisionesCompletadas}</strong>
            <button className="stat-card__seeInfo">Ver completadas</button>
          </div>
        </div>

        <button className="new-form-btn" onClick={() => setShowModal(true)}>
          + Agregar Servicio
        </button>

        <div className="table-section">
          <p>Servicios de Supervisión Registrados</p>
          <input
            type="text"
            className="escri"
            placeholder="Filtrar por evento..."
            value={filtroEvento}
            onChange={(e) => setFiltroEvento(e.target.value)}
          />
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Evento</th>
                <th>Tipo de Supervisión</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {supervisions
                .filter(s => 
                  eventos.find(e => e.id_evento === s.id_evento)?.tipo_evento
                    .toLowerCase()
                    .includes(filtroEvento.toLowerCase())
                )
                .map((supervision) => (
                  <tr key={supervision.id_supervision}>
                    <td>{supervision.id_supervision}</td>
                    <td>
                      {eventos.find(e => e.id_evento === supervision.id_evento)?.tipo_evento}
                    </td>
                    <td>{supervision.tipo_supervision}</td>
                    <td>{supervision.descripcion}</td>
                    <td>{supervision.estado}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(supervision)}
                      >
                        Editar
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(supervision.id_supervision!)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
              <form className="modal-form" onSubmit={handleSubmit}>
                <h2>{editId ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
                
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
                        {evento.fecha_evento} - {evento.tipo_evento}
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
                    <option value="Otros">Otros</option>
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
          <span className="stat-card__label">Eventos Supervisados</span>
          <strong className="stat-card__number">{stats.eventosSupervisados}</strong>
          <button className="stat-card__seeInfo">Ver eventos</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Empleados a Cargo</span>
          <strong className="stat-card__number">{stats.empleadosEncargados}</strong>
          <button className="stat-card__seeInfo">Ver empleados</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Supervisiones Completadas</span>
          <strong className="stat-card__number">{stats.supervisionesCompletadas}</strong>
          <button className="stat-card__seeInfo">Ver completadas</button>
        </div>
      </div>

      <div className="table-section">
        <p>Servicios de Supervisión Registrados</p>
        <input
          type="text"
          className="escri"
          placeholder="Filtrar por evento..."
          value={filtroEvento}
          onChange={(e) => setFiltroEvento(e.target.value)}
        />
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Evento</th>
              <th>Tipo de Supervisión</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {supervisions
              .filter(s => 
                eventos.find(e => e.id_evento === s.id_evento)?.tipo_evento
                  .toLowerCase()
                  .includes(filtroEvento.toLowerCase())
              )
              .map((supervision) => (
                <tr key={supervision.id_supervision}>
                  <td>{supervision.id_supervision}</td>
                  <td>
                    {eventos.find(e => e.id_evento === supervision.id_evento)?.tipo_evento}
                  </td>
                  <td>{supervision.tipo_supervision}</td>
                  <td>{supervision.descripcion}</td>
                  <td>{supervision.estado}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(supervision)}
                    >
                      Editar
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(supervision.id_supervision!)}
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
  );

  return (
    <ServiceBase 
      title="Supervisión" 
      stats={stats}
    >
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
    </ServiceBase>
  );
}
