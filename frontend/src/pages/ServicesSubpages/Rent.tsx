import React, { useState, useEffect } from 'react';
import '../../styles/services-subpages.scss';
import { useUser } from '../../context/UserContext';
import ServiceBase from '../../components/ServiceBase';

export type UserRole = 'admin' | 'coordinator' | 'inventory' | 'client';

interface Rent {
  id_rent?: number;
  id_evento: number;
  item: string;
  cantidad: number;
  precio_unitario: number;
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

export default function Rent() {
  const { userRole } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [rents, setRents] = useState<Rent[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [formData, setFormData] = useState<Partial<Rent>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [filtroEvento, setFiltroEvento] = useState("");
  const [stats, setStats] = useState({
    eventsInProcess: 0,
    averageRating: 0,
    totalUsers: 0,
    quotations: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rentsRes, eventosRes] = await Promise.all([
          fetch('/api/rent'),
          fetch('/api/eventos')
        ]);

        const [rentsData, eventosData] = await Promise.all([
          rentsRes.json(),
          eventosRes.json()
        ]);

        setRents(rentsData);
        setEventos(eventosData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (userRole === 'client') {
        setStats({
          eventsInProcess: 0,
          averageRating: 0,
          totalUsers: 0,
          quotations: []
        });
        return;
      }

      try {
        const response = await fetch('/api/rent/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    fetchStats();
  }, [userRole]);

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
        await fetch(`/api/rent/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/rent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      const response = await fetch('/api/rent');
      const data = await response.json();
      setRents(data);
      setShowModal(false);
      setFormData({});
      setEditId(null);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleEdit = (rent: Rent) => {
    setFormData(rent);
    setEditId(rent.id_rent!);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/rent/${id}`, { method: 'DELETE' });
      setRents(prev => prev.filter(r => r.id_rent !== id));
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const renderClientView = () => (
    <div className="service-content">
      <div className="table-section">
        <p>Servicios de Renta Registrados</p>
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
              <th>Item</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rents
              .filter(r => 
                eventos.find(e => e.id_evento === r.id_evento)?.tipo_evento
                  .toLowerCase()
                  .includes(filtroEvento.toLowerCase())
              )
              .map((rent) => (
                <tr key={rent.id_rent}>
                  <td>{rent.id_rent}</td>
                  <td>
                    {eventos.find(e => e.id_evento === rent.id_evento)?.tipo_evento}
                  </td>
                  <td>{rent.item}</td>
                  <td>{rent.cantidad}</td>
                  <td>${rent.precio_unitario}</td>
                  <td>{rent.fecha_inicio}</td>
                  <td>{rent.fecha_fin}</td>
                  <td>{rent.estado}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAdminView = () => (
    <div className="service-content">
      <button className="new-form-btn" onClick={() => setShowModal(true)}>
        Agregar Servicio
      </button>

      <div className="table-section">
        <p>Servicios de Renta Registrados</p>
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
              <th>Item</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rents
              .filter(r => 
                eventos.find(e => e.id_evento === r.id_evento)?.tipo_evento
                  .toLowerCase()
                  .includes(filtroEvento.toLowerCase())
              )
              .map((rent) => (
                <tr key={rent.id_rent}>
                  <td>{rent.id_rent}</td>
                  <td>
                    {eventos.find(e => e.id_evento === rent.id_evento)?.tipo_evento}
                  </td>
                  <td>{rent.item}</td>
                  <td>{rent.cantidad}</td>
                  <td>${rent.precio_unitario}</td>
                  <td>{rent.fecha_inicio}</td>
                  <td>{rent.fecha_fin}</td>
                  <td>{rent.estado}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(rent)}
                    >
                      Editar
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(rent.id_rent!)}
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
                Item:
                <input
                  type="text"
                  name="item"
                  value={formData.item || ''}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label>
                Cantidad:
                <input
                  type="number"
                  name="cantidad"
                  value={formData.cantidad || ''}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label>
                Precio Unitario:
                <input
                  type="number"
                  name="precio_unitario"
                  value={formData.precio_unitario || ''}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label>
                Fecha Inicio:
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio || ''}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label>
                Fecha Fin:
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin || ''}
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
      title="Renta" 
      stats={stats}
    >
      {userRole === 'client' ? renderClientView() : renderAdminView()}
    </ServiceBase>
  );
}
