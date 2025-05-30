import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import '../../styles/services-subpages.scss';
import ServiceBase from '../../components/ServiceBase';

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
}

export default function Decor() {
  const [showModal, setShowModal] = useState(false);
  const [decors, setDecors] = useState<Decor[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [formData, setFormData] = useState<Partial<Decor>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [filtroEvento, setFiltroEvento] = useState("");
  const [stats, setStats] = useState({
    eventsInProcess: 0,
    averageRating: 0,
    totalUsers: 0,
    quotations: []
  });
  const [userRole] = useState('client');

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
        const response = await fetch('/api/decor/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    fetchStats();
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
      setFormData({});
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

  return (
    <ServiceBase 
      title="Decoración" 
      stats={stats}
    >
      <div className="decor-content">
        <button className="new-form-btn" onClick={() => setShowModal(true)}>
          Agregar Decoración
        </button>

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
                    <td>{decor.fecha}</td>
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
                <h2>{editId ? 'Editar Decoración' : 'Nueva Decoración'}</h2>
                
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
                    <option value="Centros de Mesa">Centros de Mesa</option>
                    <option value="Arreglos Florales">Arreglos Florales</option>
                    <option value="Iluminación">Iluminación</option>
                    <option value="Telas y Cortinas">Telas y Cortinas</option>
                    <option value="Otro">Otro</option>
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
    </ServiceBase>
  );
}
