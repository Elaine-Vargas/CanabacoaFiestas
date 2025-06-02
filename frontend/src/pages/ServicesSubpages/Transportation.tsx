import React, { useState, useEffect } from 'react';
import '../../styles/dashboard/ServicesSubpages.scss';
import { useUser } from '../../contexts/UserContext';
import ServiceBase from '../../components/ServiceBase';

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
  precio: number;
}

interface Evento {
  id_evento: number;
  fecha_evento: string;
  tipo_evento: string;
}

interface TransportationStats {
  pedidosCompletados: number;
  pedidosPendientes: number;
  vehiculos: number;
}

interface PedidoCompletado {
  id_pedido: number;
  evento: string;
  lugar: string;
  vehiculo: string;
  chofer: string;
  cantidad_transportada: number;
  fecha_entrega: string;
  hora: string;
}

interface PedidoPendiente {
  id_pedido: number;
  evento: string;
  lugar: string;
  vehiculo: string;
  chofer: string;
  cantidad_transportada: number;
  fecha_entrega: string;
  hora: string;
  fecha_entrega_estimada: string;
}

interface Vehiculo {
  id_vehiculo: number;
  matricula: string;
  marca: string;
  modelo: string;
  tipo: 'Automóvil' | 'Remolque' | 'Máquinas pesadas' | 'Montacargas';
  estado: string;
}

export default function Transportation() {
  const { userRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showModal, setShowModal] = useState(false);
  const [transportations, setTransportations] = useState<Transportation[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [stats, setStats] = useState<TransportationStats>({
    pedidosCompletados: 0,
    pedidosPendientes: 0,
    vehiculos: 0
  });
  const [formData, setFormData] = useState<Partial<Transportation>>({
    id_evento: 0,
    tipo_vehiculo: '',
    capacidad: 0,
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    estado: 'Pendiente',
    notas: '',
    precio: 0
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [filtroEvento, setFiltroEvento] = useState<string>('');
  const [showPedidosCompletadosModal, setShowPedidosCompletadosModal] = useState(false);
  const [showPedidosPendientesModal, setShowPedidosPendientesModal] = useState(false);
  const [showVehiculosModal, setShowVehiculosModal] = useState(false);
  const [showAddVehiculoModal, setShowAddVehiculoModal] = useState(false);
  const [pedidosCompletados, setPedidosCompletados] = useState<PedidoCompletado[]>([]);
  const [pedidosPendientes, setPedidosPendientes] = useState<PedidoPendiente[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [nuevoVehiculo, setNuevoVehiculo] = useState<Partial<Vehiculo>>({
    matricula: '',
    marca: '',
    modelo: '',
    tipo: 'Automóvil',
    estado: 'Disponible'
  });

  useEffect(() => {
    const rolId = Number(userData.rol);
    if (![1, 3, 4].includes(rolId)) {
      window.location.href = '/Menu-Servicios/Bienvenida';
    }
  }, [userData.rol]);

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
    const fetchPedidosCompletados = async () => {
      if (showPedidosCompletadosModal) {
        try {
          const response = await fetch('/api/transportacion/pedidos-completados');
          const data = await response.json();
          setPedidosCompletados(data);
        } catch (error) {
          console.error('Error al cargar pedidos completados:', error);
        }
      }
    };

    const fetchPedidosPendientes = async () => {
      if (showPedidosPendientesModal) {
        try {
          const response = await fetch('/api/transportacion/pedidos-pendientes');
          const data = await response.json();
          setPedidosPendientes(data);
        } catch (error) {
          console.error('Error al cargar pedidos pendientes:', error);
        }
      }
    };

    const fetchVehiculos = async () => {
      if (showVehiculosModal) {
        try {
          const response = await fetch('/api/transportacion/vehiculos');
          const data = await response.json();
          setVehiculos(data);
        } catch (error) {
          console.error('Error al cargar vehículos:', error);
        }
      }
    };

    fetchPedidosCompletados();
    fetchPedidosPendientes();
    fetchVehiculos();
  }, [showPedidosCompletadosModal, showPedidosPendientesModal, showVehiculosModal]);

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
      setFormData({
        id_transportation: 0,
        id_evento: 0,
        tipo_vehiculo: '',
        capacidad: 0,
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        estado: 'Pendiente',
        notas: '',
        precio: 0
      });
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

  const handleVehiculoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoVehiculo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/transportacion/vehiculos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoVehiculo),
      });

      if (response.ok) {
        const updatedVehiculos = await fetch('/api/transportacion/vehiculos').then(res => res.json());
        setVehiculos(updatedVehiculos);
        setShowAddVehiculoModal(false);
        setNuevoVehiculo({
          matricula: '',
          marca: '',
          modelo: '',
          tipo: 'Automóvil',
          estado: 'Disponible'
        });
      }
    } catch (error) {
      console.error('Error al agregar vehículo:', error);
    }
  };

  const renderAdminView = () => {
    return (
      <div className="transportation-content">
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Pedidos Completados</span>
            <strong className="stat-card__number">{stats.pedidosCompletados}</strong>
            <button className="stat-card__seeInfo" onClick={() => setShowPedidosCompletadosModal(true)}>Ver completados</button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Pedidos Pendientes</span>
            <strong className="stat-card__number">{stats.pedidosPendientes}</strong>
            <button className="stat-card__seeInfo" onClick={() => setShowPedidosPendientesModal(true)}>Ver pendientes</button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Vehículos Disponibles</span>
            <strong className="stat-card__number">{stats.vehiculos}</strong>
            <button className="stat-card__seeInfo" onClick={() => setShowVehiculosModal(true)}>Ver vehículos</button>
          </div>
        </div>

        <button className="new-form-btn" onClick={() => setShowModal(true)}>
          + Agregar Servicio
        </button>

        <div className="table-section">
          <p>Servicios de Transporte Registrados</p>
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
                <th>Tipo de Vehículo</th>
                <th>Capacidad</th>
                <th>Precio</th>
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
                    <td>${transportation.precio}</td>
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
                  <select
                    name="tipo_vehiculo"
                    value={formData.tipo_vehiculo || ''}
                    onChange={handleSelectChange}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Bus">Bus</option>
                    <option value="Van">Van</option>
                    <option value="Carro">Carro</option>
                    <option value="Otros">Otros</option>
                  </select>
                </label>

                <label>
                  Capacidad:
                  <input
                    type="number"
                    name="capacidad"
                    value={formData.capacidad || ''}
                    onChange={handleInputChange}
                    required
                    min="1"
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
    <div className="transportation-content">
      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Pedidos Completados</span>
          <strong className="stat-card__number">{stats.pedidosCompletados}</strong>
          <button className="stat-card__seeInfo" onClick={() => setShowPedidosCompletadosModal(true)}>Ver completados</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Pedidos Pendientes</span>
          <strong className="stat-card__number">{stats.pedidosPendientes}</strong>
          <button className="stat-card__seeInfo" onClick={() => setShowPedidosPendientesModal(true)}>Ver pendientes</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Vehículos Disponibles</span>
          <strong className="stat-card__number">{stats.vehiculos}</strong>
          <button className="stat-card__seeInfo" onClick={() => setShowVehiculosModal(true)}>Ver vehículos</button>
        </div>
      </div>

      <div className="table-section">
        <p>Servicios de Transporte Registrados</p>
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
              <th>Tipo de Vehículo</th>
              <th>Capacidad</th>
              <th>Precio</th>
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
                  <td>${transportation.precio}</td>
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
    </div>
  );

  const renderPedidosCompletadosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowPedidosCompletadosModal(false)}>×</button>
        <div className="modal-content">
          <h3>Pedidos Completados</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Lugar</th>
                  <th>Vehículo</th>
                  <th>Chofer</th>
                  <th>Cantidad Transportada</th>
                  <th>Fecha de Entrega</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {pedidosCompletados.map((pedido) => (
                  <tr key={pedido.id_pedido}>
                    <td>{pedido.evento}</td>
                    <td>{pedido.lugar}</td>
                    <td>{pedido.vehiculo}</td>
                    <td>{pedido.chofer}</td>
                    <td>{pedido.cantidad_transportada}</td>
                    <td>{pedido.fecha_entrega}</td>
                    <td>{pedido.hora}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPedidosPendientesModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowPedidosPendientesModal(false)}>×</button>
        <div className="modal-content">
          <h3>Pedidos Pendientes</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Lugar</th>
                  <th>Vehículo</th>
                  <th>Chofer</th>
                  <th>Cantidad Transportada</th>
                  <th>Fecha de Entrega</th>
                  <th>Hora</th>
                  <th>Fecha Estimada</th>
                </tr>
              </thead>
              <tbody>
                {pedidosPendientes.map((pedido) => (
                  <tr key={pedido.id_pedido}>
                    <td>{pedido.evento}</td>
                    <td>{pedido.lugar}</td>
                    <td>{pedido.vehiculo}</td>
                    <td>{pedido.chofer}</td>
                    <td>{pedido.cantidad_transportada}</td>
                    <td>{pedido.fecha_entrega}</td>
                    <td>{pedido.hora}</td>
                    <td>{pedido.fecha_entrega_estimada}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVehiculosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowVehiculosModal(false)}>×</button>
        <div className="modal-content">
          <div className="modal-header">
            <h3>Vehículos Disponibles</h3>
            <button className="add-user-btn" onClick={() => setShowAddVehiculoModal(true)}>
              Agregar Vehículo
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.map((vehiculo) => (
                  <tr key={vehiculo.id_vehiculo}>
                    <td>{vehiculo.matricula}</td>
                    <td>{vehiculo.marca}</td>
                    <td>{vehiculo.modelo}</td>
                    <td>{vehiculo.tipo}</td>
                    <td>{vehiculo.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddVehiculoModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowAddVehiculoModal(false)}>×</button>
        <form className="modal-form" onSubmit={handleAddVehiculo}>
          <h3>Agregar Nuevo Vehículo</h3>
          
          <label>
            Matrícula:
            <input
              type="text"
              name="matricula"
              value={nuevoVehiculo.matricula}
              onChange={handleVehiculoInputChange}
              required
            />
          </label>

          <label>
            Marca:
            <input
              type="text"
              name="marca"
              value={nuevoVehiculo.marca}
              onChange={handleVehiculoInputChange}
              required
            />
          </label>

          <label>
            Modelo:
            <input
              type="text"
              name="modelo"
              value={nuevoVehiculo.modelo}
              onChange={handleVehiculoInputChange}
              required
            />
          </label>

          <label>
            Tipo:
            <select
              name="tipo"
              value={nuevoVehiculo.tipo}
              onChange={handleVehiculoInputChange}
              required
            >
              <option value="Automóvil">Automóvil</option>
              <option value="Remolque">Remolque</option>
              <option value="Máquinas pesadas">Máquinas pesadas</option>
              <option value="Montacargas">Montacargas</option>
            </select>
          </label>

          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              Guardar
            </button>
            <button
              type="button"
              className="reset-btn"
              onClick={() => setShowAddVehiculoModal(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <ServiceBase 
      title="Transporte" 
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
      {showPedidosCompletadosModal && renderPedidosCompletadosModal()}
      {showPedidosPendientesModal && renderPedidosPendientesModal()}
      {showVehiculosModal && renderVehiculosModal()}
      {showAddVehiculoModal && renderAddVehiculoModal()}
    </ServiceBase>
  );
}