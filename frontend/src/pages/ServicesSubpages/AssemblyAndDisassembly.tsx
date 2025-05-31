import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import '../../styles/dashboard/ServicesSubpages.scss';
import ServiceBase from '../../components/ServiceBase';
import { useUser } from "../../context/UserContext";

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
  equiposDisponibles: number;
  personalAsignado: number;
}

export default function AssemblyAndDisassembly() {
  const { userRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showModal, setShowModal] = useState(false);
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [stats, setStats] = useState<AssemblyStats>({
    eventosCompletados: 0,
    equiposDisponibles: 0,
    personalAsignado: 0
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
        const response = await fetch('/api/assembly/stats');
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
          <span className="stat-card__label">Equipos Disponibles</span>
          <strong className="stat-card__number">{stats.equiposDisponibles}</strong>
          <button className="stat-card__seeInfo">Ver equipos</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Equipos en Uso</span>
          <strong className="stat-card__number">{stats.eventosCompletados}</strong>
          <button className="stat-card__seeInfo">Ver en uso</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Equipos en Mantenimiento</span>
          <strong className="stat-card__number">{stats.personalAsignado}</strong>
          <button className="stat-card__seeInfo">Ver mantenimiento</button>
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

  const renderOrganizerView = () => (
    <div className="assembly-content">
      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Eventos Completados</span>
          <strong className="stat-card__number">{stats.eventosCompletados}</strong>
          <button className="stat-card__seeInfo">Ver completados</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Personal Asignado</span>
          <strong className="stat-card__number">{stats.personalAsignado}</strong>
          <button className="stat-card__seeInfo">Ver personal</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Servicios Pendientes</span>
          <strong className="stat-card__number">{stats.equiposDisponibles}</strong>
          <button className="stat-card__seeInfo">Ver pendientes</button>
        </div>
      </div>

      <div className="table-section">
        <p>Servicios de Montaje y Desmontaje</p>
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
              <th>Tipo de Servicio</th>
              <th>Descripción</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
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
                  <td>{assembly.fecha_inicio}</td>
                  <td>{assembly.fecha_fin}</td>
                  <td>{assembly.estado}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(assembly)}
                    >
                      Editar
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(assembly.id_assembly!)}
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

  const renderAdminView = () => {
    return (
      <div className="assembly-content">
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Eventos Completados</span>
            <strong className="stat-card__number">{stats.eventosCompletados}</strong>
            <button className="stat-card__seeInfo">Ver completados</button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Equipos Disponibles</span>
            <strong className="stat-card__number">{stats.equiposDisponibles}</strong>
            <button className="stat-card__seeInfo">Ver equipos</button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Personal Asignado</span>
            <strong className="stat-card__number">{stats.personalAsignado}</strong>
            <button className="stat-card__seeInfo">Ver personal</button>
          </div>
        </div>

        <button className="new-form-btn" onClick={() => setShowModal(true)}>
          + Agregar Servicio
        </button>

        <div className="table-section">
          <p>Servicios de Montaje y Desmontaje Registrados</p>
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
                <th>Tipo de Servicio</th>
                <th>Descripción</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
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
                    <td>{assembly.fecha_inicio}</td>
                    <td>{assembly.fecha_fin}</td>
                    <td>{assembly.estado}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(assembly)}
                      >
                        Editar
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(assembly.id_assembly!)}
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

                <label>
                  Notas:
                  <textarea
                    name="notas"
                    value={formData.notas || ''}
                    onChange={handleInputChange}
                    rows={4}
                  />
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

  return (
    <ServiceBase 
      title="Montaje y Desmontaje" 
      stats={stats}
    >
      {(() => {
        const rolId = Number(userData.rol);
        const isAdmin = rolId === 1;
        const isOrganizer = rolId === 3;
        const isInventory = rolId === 4;

        if (isAdmin) {
          return renderAdminView();
        }

        if (isInventory) {
          return renderInventoryView();
        }

        if (isOrganizer) {
          return renderOrganizerView();
        }

        return null;
      })()}
    </ServiceBase>
  );
}
