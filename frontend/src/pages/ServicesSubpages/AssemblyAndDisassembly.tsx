import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import '../../styles/services-subpages.scss';
import ServiceBase from '../../components/ServiceBase';
import { useNavigate } from "react-router-dom";
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

export default function AssemblyAndDisassembly() {
  const { userRole } = useUser();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [formData, setFormData] = useState<Partial<Assembly>>({});
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
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    fetchStats();
  }, []);

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
        await fetch(`/api/assembly/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/assembly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      const response = await fetch('/api/assembly');
      const data = await response.json();
      setAssemblies(data);
      setShowModal(false);
      setFormData({});
      setEditId(null);
    } catch (error) {
      console.error('Error al guardar:', error);
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

  return (
    <ServiceBase 
      title="Montaje y Desmontaje" 
      stats={stats}
    >
      <div className="assembly-content">
        <button className="new-form-btn" onClick={() => setShowModal(true)}>
          Agregar Servicio
        </button>

        <div className="table-section">
          <p>Servicios Registrados</p>
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
                  Tipo de Servicio:
                  <select
                    name="tipo_servicio"
                    value={formData.tipo_servicio || ''}
                    onChange={handleSelectChange}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Montaje">Montaje</option>
                    <option value="Desmontaje">Desmontaje</option>
                    <option value="Montaje y Desmontaje">Montaje y Desmontaje</option>
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
                  Fecha Inicio:
                  <input
                    type="datetime-local"
                    name="fecha_inicio"
                    value={formData.fecha_inicio || ''}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  Fecha Fin:
                  <input
                    type="datetime-local"
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
    </ServiceBase>
  );
}
