import React, { useState, useEffect } from 'react';
import '../../styles/dashboard/ServicesSubpages.scss';
import { useUser } from '../../contexts/UserContext';
import ServiceBase from '../../components/ServiceBase';

export type UserRole = 'admin' | 'client' | 'supervisor' | 'inventory';

export type Permission = {
  id: string;
  name: string;
  description: string;
};

export type RolePermissions = {
  [key in UserRole]: Permission[];
};

interface Rent {
  id_rent: number;
  id_evento: number;
  tipo_elemento: string;
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

interface RentStats {
  totalPedidos: number;
  pedidosPendientes: number;
  totalElementos: number;
}

export default function Rent() {
  const { userRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showModal, setShowModal] = useState(false);
  const [rents, setRents] = useState<Rent[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [stats, setStats] = useState<RentStats>({
    totalPedidos: 0,
    pedidosPendientes: 0,
    totalElementos: 0
  });
  const [formData, setFormData] = useState<Partial<Rent>>({
    id_evento: 0,
    tipo_elemento: '',
    cantidad: 0,
    precio_unitario: 0,
    estado: 'Pendiente',
    notas: ''
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [filtroEvento, setFiltroEvento] = useState<string>('');

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
      try {
        const response = await fetch('/api/rent/stats');
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
      setFormData({
        id_evento: 0,
        tipo_elemento: '',
        cantidad: 0,
        precio_unitario: 0,
        estado: 'Pendiente',
        notas: ''
      });
      setEditId(null);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleEdit = (rent: Rent) => {
    setFormData(rent);
    setEditId(rent.id_rent);
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
        <p>Servicios de Alquiler Registrados</p>
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
                  <td>{rent.tipo_elemento}</td>
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

  const renderAdminView = () => {
    return (
      <div className="rent-content">
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Total de Pedidos</span>
            <strong className="stat-card__number">{stats.totalPedidos}</strong>
            <button className="stat-card__seeInfo">Ver pedidos</button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Pedidos Pendientes</span>
            <strong className="stat-card__number">{stats.pedidosPendientes}</strong>
            <button className="stat-card__seeInfo">Ver pendientes</button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Total de Items</span>
            <strong className="stat-card__number">{stats.totalElementos}</strong>
            <button className="stat-card__seeInfo">Ver items</button>
          </div>
        </div>

        <button className="new-form-btn" onClick={() => setShowModal(true)}>
          + Agregar Servicio
        </button>

        <div className="table-section">
          <p>Servicios de Alquiler Registrados</p>
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
                <th>Tipo de Item</th>
                <th>Cantidad</th>
                <th>Precio</th>
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
                    <td>{rent.tipo_elemento}</td>
                    <td>{rent.cantidad}</td>
                    <td>${rent.precio_unitario}</td>
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
                  Tipo de Item:
                  <select
                    name="tipo_elemento"
                    value={formData.tipo_elemento || ''}
                    onChange={handleSelectChange}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Mesa">Mesa</option>
                    <option value="Silla">Silla</option>
                    <option value="Mantel">Mantel</option>
                    <option value="Cubiertos">Cubiertos</option>
                    <option value="Otros">Otros</option>
                  </select>
                </label>

                <label>
                  Cantidad:
                  <input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad || ''}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </label>

                <label>
                  Precio:
                  <input
                    type="number"
                    name="precio_unitario"
                    value={formData.precio_unitario || ''}
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

  const renderOrganizerView = () => (
    <div className="rent-content">
      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Total de Pedidos</span>
          <strong className="stat-card__number">{stats.totalPedidos}</strong>
          <button className="stat-card__seeInfo">Ver pedidos</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Pedidos Pendientes</span>
          <strong className="stat-card__number">{stats.pedidosPendientes}</strong>
          <button className="stat-card__seeInfo">Ver pendientes</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Total de Items</span>
          <strong className="stat-card__number">{stats.totalElementos}</strong>
          <button className="stat-card__seeInfo">Ver items</button>
        </div>
      </div>

      <div className="table-section">
        <p>Servicios de Alquiler Registrados</p>
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
              <th>Tipo de Item</th>
              <th>Cantidad</th>
              <th>Precio</th>
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
                  <td>{rent.tipo_elemento}</td>
                  <td>{rent.cantidad}</td>
                  <td>${rent.precio_unitario}</td>
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
    </div>
  );

  return (
    <ServiceBase 
      title="Alquiler" 
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
