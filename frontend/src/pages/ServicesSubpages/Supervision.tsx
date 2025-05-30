import React, { useState, useEffect } from 'react';
import '../../styles/services-subpages.scss';
import { useUser } from '../../context/UserContext';
import ServiceBase from '../../components/ServiceBase';
import { useNavigate } from "react-router-dom";

export type UserRole = 'admin' | 'coordinator' | 'inventory' | 'client';

interface Supervision {
  id_supervision?: number;
  id_evento: number;
  supervisor: string;
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

export default function Supervision() {
  const { userRole } = useUser();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [supervisions, setSupervisions] = useState<Supervision[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [formData, setFormData] = useState<Partial<Supervision>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [filtroEvento, setFiltroEvento] = useState("");
  const [stats, setStats] = useState({
    eventsInProcess: 0,
    averageRating: 0,
    totalUsers: 0,
    quotations: []
  });

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/Menu-Servicios/Bienvenida');
    }
  }, [userRole, navigate]);

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
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    fetchStats();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await fetch(`/api/supervision/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/supervision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      const response = await fetch('/api/supervision');
      const data = await response.json();
      setSupervisions(data);
      setShowModal(false);
      setFormData({});
      setEditId(null);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleEdit = (supervision: Supervision) => {
    setFormData(supervision);
    setEditId(supervision.id_supervision!);
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

  const renderAdminView = () => (
    <div className="service-content">
      <button className="new-form-btn" onClick={() => setShowModal(true)}>
        Agregar Servicio
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
        <input
          type="text"
          placeholder="Filtrar por evento..."
          value={filtroEvento}
          onChange={(e) => setFiltroEvento(e.target.value)}
        />
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Evento</th>
              <th>Supervisor</th>
              <th>Fecha</th>
              <th>Hora Inicio</th>
              <th>Hora Fin</th>
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
                  <td>{supervision.supervisor}</td>
                  <td>{supervision.fecha}</td>
                  <td>{supervision.hora_inicio}</td>
                  <td>{supervision.hora_fin}</td>
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
                Supervisor:
                <input
                  type="text"
                  name="supervisor"
                  value={formData.supervisor || ''}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label>
                Fecha:
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha || ''}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label>
                Hora Inicio:
                <input
                  type="time"
                  name="hora_inicio"
                  value={formData.hora_inicio || ''}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label>
                Hora Fin:
                <input
                  type="time"
                  name="hora_fin"
                  value={formData.hora_fin || ''}
                  onChange={handleInputChange}
                  required
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

  return (
    <ServiceBase 
      title="Supervisión" 
      stats={stats}
    >
      {renderAdminView()}
    </ServiceBase>
  );
}
