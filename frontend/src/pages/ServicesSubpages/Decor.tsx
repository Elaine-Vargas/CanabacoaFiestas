import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/dashboard/ServicesSubpages.scss';
import ServiceBase from '../../components/ServiceBase';
import { useUser } from '../../contexts/UserContext';

export type UserRole = 'admin' | 'client' | 'supervisor' | 'inventory';

export type Permission = {
  id: string;
  name: string;
  description: string;
};

export type RolePermissions = {
  [key in UserRole]: Permission[];
};

interface Decor {
  id_decor?: number;
  id_evento: number;
  tipo_decoracion: string;
  descripcion: string;
  precio: number;
  fecha: string;
  estado: string;
  notas: string;
}

interface Evento {
  id_evento: number;
  fecha_evento: string;
  tipo_evento: string;
  nombre_evento?: string;
  nombre_cliente?: string;
  empleado_responsable?: string;
  decoracion_solicitada?: string;
}

interface DecorStats {
  empleadosEncargados: number;
  eventosConDecoracion: number;
  decoracionesPendintes: number;
  decoracionesCompletadas: number;
}

export default function Decor() {
  const navigate = useNavigate();
  const { userRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showModal, setShowModal] = useState(false);
  const [decors, setDecors] = useState<Decor[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [stats, setStats] = useState<DecorStats>({
    empleadosEncargados: 0,
    eventosConDecoracion: 0,
    decoracionesPendintes: 0,
    decoracionesCompletadas: 0
  });
  const [formData, setFormData] = useState<Partial<Decor>>({
    id_evento: 0,
    tipo_decoracion: '',
    descripcion: '',
    precio: 0,
    fecha: '',
    estado: 'Pendiente',
    notas: ''
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [filtroEvento, setFiltroEvento] = useState<string>('');
  const [showEmpleadosModal, setShowEmpleadosModal] = useState(false);
  const [showEventosModal, setShowEventosModal] = useState(false);
  const [showCompletadosModal, setShowCompletadosModal] = useState(false);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [completados, setCompletados] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [decorsRes, eventosRes] = await Promise.all([
          fetch('/api/decor'),
          fetch('/api/eventos')
        ]);

        const [decorsData, eventosData] = await Promise.all([
          decorsRes.json(),
          eventosRes.json()
        ]);

        setDecors(decorsData);
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
        const response = await fetch('/api/decor/stats');
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
    const fetchEmpleados = async () => {
      try {
        const response = await fetch('/api/decoracion/empleados');
        const data = await response.json();
        setEmpleados(data);
      } catch (error) {
        console.error('Error al cargar empleados:', error);
      }
    };

    const fetchCompletados = async () => {
      try {
        const response = await fetch('/api/decoracion/completados');
        const data = await response.json();
        setCompletados(data);
      } catch (error) {
        console.error('Error al cargar decoraciones completadas:', error);
      }
    };

    if (showEmpleadosModal) {
      fetchEmpleados();
    }
    if (showCompletadosModal) {
      fetchCompletados();
    }
  }, [showEmpleadosModal, showCompletadosModal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await fetch(`/api/decor/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/decor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      const response = await fetch('/api/decor');
      const data = await response.json();
      setDecors(data);
      setShowModal(false);
      setFormData({
        id_decor: 0,
        id_evento: 0,
        tipo_decoracion: '',
        descripcion: '',
        precio: 0,
        fecha: '',
        estado: 'Pendiente',
        notas: ''
      });
      setEditId(null);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleEdit = (decor: Decor) => {
    setFormData(decor);
    setEditId(decor.id_decor!);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/decor/${id}`, { method: 'DELETE' });
      setDecors(prev => prev.filter(d => d.id_decor !== id));
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const renderClientView = () => (
    <div className="decor-content">
      <div className="table-section">
        <p>Decoraciones Registradas</p>
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
              <th>Tipo de Decoración</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {decors
              .filter(d => 
                eventos.find(e => e.id_evento === d.id_evento)?.tipo_evento
                  .toLowerCase()
                  .includes(filtroEvento.toLowerCase())
              )
              .map((decor) => (
                <tr key={decor.id_decor}>
                  <td>{decor.id_decor}</td>
                  <td>
                    {eventos.find(e => e.id_evento === decor.id_evento)?.tipo_evento}
                  </td>
                  <td>{decor.tipo_decoracion}</td>
                  <td>{decor.descripcion}</td>
                  <td>${decor.precio}</td>
                  <td>{decor.fecha}</td>
                  <td>{decor.estado}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEmpleadosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowEmpleadosModal(false)}>×</button>
        <div className="modal-content">
          <h3>Empleados Encargados</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>ID</th>
                  <th>Eventos Participados</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map((empleado) => (
                  <tr key={empleado.id_empleado}>
                    <td>{empleado.nombre}</td>
                    <td>{empleado.id_empleado}</td>
                    <td>{empleado.eventos_participados}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEventosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowEventosModal(false)}>×</button>
        <div className="modal-content">
          <h3>Eventos con Decoraciones</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Cliente</th>
                  <th>Empleado Responsable</th>
                  <th>Decoración Solicitada</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((evento) => (
                  <tr key={evento.id_evento}>
                    <td>{evento.nombre_evento || evento.tipo_evento}</td>
                    <td>{evento.nombre_cliente || 'No especificado'}</td>
                    <td>{evento.empleado_responsable || 'No asignado'}</td>
                    <td>{evento.decoracion_solicitada || 'No especificada'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompletadosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowCompletadosModal(false)}>×</button>
        <div className="modal-content">
          <h3>Decoraciones Completadas</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Número de Empleados</th>
                  <th>Cliente</th>
                </tr>
              </thead>
              <tbody>
                {completados.map((completado) => (
                  <tr key={completado.id_decoracion}>
                    <td>{completado.nombre_evento}</td>
                    <td>{completado.fecha_inicio}</td>
                    <td>{completado.fecha_fin}</td>
                    <td>{completado.num_empleados}</td>
                    <td>{completado.nombre_cliente}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminView = () => {
    return (
      <div className="decor-content">
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Empleados Encargados</span>
            <strong className="stat-card__number">{stats.empleadosEncargados}</strong>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowEmpleadosModal(true)}
            >
              Ver empleados
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Eventos con Decoración</span>
            <strong className="stat-card__number">{stats.eventosConDecoracion}</strong>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowEventosModal(true)}
            >
              Ver eventos
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Decoraciones Completadas</span>
            <strong className="stat-card__number">{stats.decoracionesCompletadas}</strong>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowCompletadosModal(true)}
            >
              Ver completadas
            </button>
          </div>
        </div>

        {showEmpleadosModal && renderEmpleadosModal()}
        {showEventosModal && renderEventosModal()}
        {showCompletadosModal && renderCompletadosModal()}

        <button className="new-form-btn" onClick={() => setShowModal(true)}>
          + Agregar Servicio
        </button>

        <div className="table-section">
          <p>Servicios de Decoración Registrados</p>
          <div className="search-container">
            <select
              className="escri"
              value={filtroEvento}
              onChange={(e) => setFiltroEvento(e.target.value)}
            >
              <option value="">Todos los eventos</option>
              <option value="recientes">Eventos recientes</option>
              <option value="pendientes">Eventos pendientes</option>
              <option value="completados">Eventos completados</option>
              <option value="cancelados">Eventos cancelados</option>
            </select>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Evento</th>
                <th>Tipo de Decoración</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {decors
                .filter(d => 
                  eventos.find(e => e.id_evento === d.id_evento)?.tipo_evento
                    .toLowerCase()
                    .includes(filtroEvento.toLowerCase())
                )
                .map((decor) => (
                  <tr key={decor.id_decor}>
                    <td>{decor.id_decor}</td>
                    <td>
                      {eventos.find(e => e.id_evento === decor.id_evento)?.tipo_evento}
                    </td>
                    <td>{decor.tipo_decoracion}</td>
                    <td>{decor.descripcion}</td>
                    <td>${decor.precio}</td>
                    <td>{decor.estado}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(decor)}
                      >
                        Editar
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(decor.id_decor!)}
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
                  Tipo de Decoración:
                  <select
                    name="tipo_decoracion"
                    value={formData.tipo_decoracion || ''}
                    onChange={handleSelectChange}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Flores">Flores</option>
                    <option value="Centros de Mesa">Centros de Mesa</option>
                    <option value="Arcos">Arcos</option>
                    <option value="Iluminación">Iluminación</option>
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
                  Precio:
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio || ''}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
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
    <div className="decor-content">
      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Empleados Encargados</span>
          <strong className="stat-card__number">{stats.empleadosEncargados}</strong>
          <button className="stat-card__seeInfo">Ver empleados</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Eventos con Decoración</span>
          <strong className="stat-card__number">{stats.eventosConDecoracion}</strong>
          <button className="stat-card__seeInfo">Ver eventos</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Decoraciones Completadas</span>
          <strong className="stat-card__number">{stats.decoracionesCompletadas}</strong>
          <button className="stat-card__seeInfo">Ver completadas</button>
        </div>
      </div>

      <div className="table-section">
        <p>Servicios de Decoración Registrados</p>
        <div className="search-container">
          <select
            className="escri"
            value={filtroEvento}
            onChange={(e) => setFiltroEvento(e.target.value)}
          >
            <option value="">Todos los eventos</option>
            <option value="recientes">Eventos recientes</option>
            <option value="pendientes">Eventos pendientes</option>
            <option value="completados">Eventos completados</option>
            <option value="cancelados">Eventos cancelados</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Evento</th>
              <th>Tipo de Decoración</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {decors
              .filter(d => 
                eventos.find(e => e.id_evento === d.id_evento)?.tipo_evento
                  .toLowerCase()
                  .includes(filtroEvento.toLowerCase())
              )
              .map((decor) => (
                <tr key={decor.id_decor}>
                  <td>{decor.id_decor}</td>
                  <td>
                    {eventos.find(e => e.id_evento === decor.id_evento)?.tipo_evento}
                  </td>
                  <td>{decor.tipo_decoracion}</td>
                  <td>{decor.descripcion}</td>
                  <td>${decor.precio}</td>
                  <td>{decor.estado}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(decor)}
                    >
                      Editar
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(decor.id_decor!)}
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
      title="Decoración" 
      stats={stats}
    >
      {(() => {
        const rolId = Number(userData.rol);
        const isAdmin = rolId === 1;
        const isOrganizer = rolId === 3;
        const isClient = rolId === 2;

        if (isAdmin) {
          return renderAdminView();
        }

        if (isOrganizer) {
          return renderOrganizerView();
        }

        if (isClient) {
          return renderClientView();
        }

        return null;
      })()}
    </ServiceBase>
  );
}
