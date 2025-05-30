import React, { useState, useEffect } from 'react';
import '../../styles/services-subpages.scss';
import { useUser } from '../../context/UserContext';
import ServiceBase from '../../components/ServiceBase';
import { useNavigate } from "react-router-dom";

export type UserRole = 'admin' | 'coordinator' | 'inventory' | 'client';

interface Transportation {
  id_transportation?: number;
  id_evento: number;
  tipo_vehiculo: string;
  capacidad: number;
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

export default function Transportation() {
  const { userRole } = useUser();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [transportations, setTransportations] = useState<Transportation[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [formData, setFormData] = useState<Partial<Transportation>>({});
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
        const [transportationsRes, eventosRes] = await Promise.all([
          fetch('/api/transportation'),
          fetch('/api/eventos')
        ]);

        const [transportationsData, eventosData] = await Promise.all([
          transportationsRes.json(),
          eventosRes.json()
        ]);

        setTransportations(transportationsData);
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
        const response = await fetch('/api/transportation/stats');
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
        await fetch(`/api/transportation/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/transportation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      const response = await fetch('/api/transportation');
      const data = await response.json();
      setTransportations(data);
      setShowModal(false);
      setFormData({});
      setEditId(null);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleEdit = (transportation: Transportation) => {
    setFormData(transportation);
    setEditId(transportation.id_transportation!);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/transportation/${id}`, { method: 'DELETE' });
      setTransportations(prev => prev.filter(t => t.id_transportation !== id));
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
        <p>Servicios de Transporte Registrados</p>
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
              <th>Tipo de Vehículo</th>
              <th>Capacidad</th>
              <th>Fecha</th>
              <th>Hora Inicio</th>
              <th>Hora Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {transportations
              .filter(t => 
                eventos.find(e => e.id_evento === t.id_evento)?.tipo_evento
                  .toLowerCase()
                  .includes(filtroEvento.toLowerCase())
              )
              .map((transportation) => (
                <tr key={transportation.id_transportation}>
                  <td>{transportation.id_transportation}</td>
                  <td>
                    {eventos.find(e => e.id_evento === transportation.id_evento)?.tipo_evento}
                  </td>
                  <td>{transportation.tipo_vehiculo}</td>
                  <td>{transportation.capacidad}</td>
                  <td>{transportation.fecha}</td>
                  <td>{transportation.hora_inicio}</td>
                  <td>{transportation.hora_fin}</td>
                  <td>{transportation.estado}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(transportation)}
                    >
                      Editar
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(transportation.id_transportation!)}
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
                Tipo de Vehículo:
                <input
                  type="text"
                  name="tipo_vehiculo"
                  value={formData.tipo_vehiculo || ''}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label>
                Capacidad:
                <input
                  type="number"
                  name="capacidad"
                  value={formData.capacidad || ''}
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
      title="Transporte" 
      stats={stats}
    >
      {renderAdminView()}
    </ServiceBase>
  );
}