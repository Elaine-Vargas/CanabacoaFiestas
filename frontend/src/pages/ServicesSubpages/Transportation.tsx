import React, { useState, useEffect } from 'react';
import '../../styles/dashboard/ServicesSubpages.scss';
import { useUser } from '../../contexts/UserContext';
import '../../components/ServiceBase';

export type UserRole = 'admin' | 'coordinator' | 'inventory' | 'client';

interface Transportation {
  id_transportacion: number;
  id_evento: number;
  direccion: string;
  distancia: number;
  vehiculo: string;
  conductor: string;
  cantidad_elementos: number;
  precio_neto: number;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
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
  direccion: string;
  distancia: number;
  precio_neto: number;
  total: number;
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
    id_transportacion: 0,
    id_evento: 0,
    direccion: '',
    distancia: 0,
    vehiculo: '',
    conductor: '',
    cantidad_elementos: 0,
    precio_neto: 0,
    estado: 'Pendiente',
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
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

  // Estados y funciones para edición de vehículo
  const [editVehiculo, setEditVehiculo] = useState<Partial<Vehiculo> | null>(null);
  const [showEditVehiculoModal, setShowEditVehiculoModal] = useState(false);

  const handleEditVehiculo = (vehiculo: Vehiculo) => {
    setEditVehiculo(vehiculo);
    setShowEditVehiculoModal(true);
  };

  const handleEditVehiculoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditVehiculo(prev => prev ? { ...prev, [name]: value } : prev);
  };

  const handleUpdateVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editVehiculo || !editVehiculo.id_vehiculo) return;
    try {
      await fetch(`/api/transportacion/vehiculos/${editVehiculo.id_vehiculo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editVehiculo),
      });
      const updatedVehiculos = await fetch('/api/transportacion/vehiculos').then(res => res.json());
      setVehiculos(updatedVehiculos);
      setShowEditVehiculoModal(false);
      setEditVehiculo(null);
    } catch (error) {
      console.error('Error al actualizar vehículo:', error);
    }
  };

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
        id_transportacion: 0,
        id_evento: 0,
        direccion: '',
        distancia: 0,
        vehiculo: '',
        conductor: '',
        cantidad_elementos: 0,
        precio_neto: 0,
        estado: 'Pendiente',
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      });
      setEditId(null);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleEdit = (transportation: Transportation) => {
    setFormData(transportation);
    setEditId(transportation.id_transportacion!);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/transportation/${id}`, { method: 'DELETE' });
      setTransportations(prev => prev.filter(t => t.id_transportacion !== id));
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
          Agregar Servicio de Transporte
        </button>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
              <form className="modal-form" onSubmit={handleSubmit}>
                <h2>{editId ? 'Editar Transportación' : 'Nueva Transportación'}</h2>
                
                <div className="form-grid">
                  <label>
                    <span>Evento:</span>
                    <select
                      name="id_evento"
                      value={formData.id_evento || ''}
                      onChange={handleSelectChange}
                      required
                    >
                      <option value="">Seleccionar evento</option>
                      {eventos.map((evento) => (
                        <option key={evento.id_evento} value={evento.id_evento}>
                          {evento.tipo_evento} - {evento.fecha_evento}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Dirección:</span>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion || ''}
                      onChange={handleInputChange}
                      required
                      placeholder="Ingrese la dirección del evento"
                    />
                  </label>

                  <label>
                    <span>Distancia (km):</span>
                    <input
                      type="number"
                      name="distancia"
                      value={formData.distancia || ''}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.1"
                      placeholder="Ingrese la distancia en kilómetros"
                    />
                  </label>

                  <label className="full-width">
                    <span>DETALLE DE TRANSPORTE</span>
                  </label>

                  <label>
                    <span>Vehículo:</span>
                    <select
                      name="vehiculo"
                      value={formData.vehiculo || ''}
                      onChange={handleSelectChange}
                      required
                    >
                      <option value="">Seleccionar vehículo</option>
                      <option value="Bus">Bus</option>
                      <option value="Van">Van</option>
                      <option value="Carro">Carro</option>
                      <option value="Limousina">Limousina</option>
                    </select>
                  </label>

                  <label>
                    <span>Conductor:</span>
                    <input
                      type="text"
                      name="conductor"
                      value={formData.conductor || ''}
                      onChange={handleInputChange}
                      required
                      placeholder="Nombre del conductor"
                    />
                  </label>

                  <label>
                    <span>Cantidad de Elementos:</span>
                    <input
                      type="number"
                      name="cantidad_elementos"
                      value={formData.cantidad_elementos || ''}
                      onChange={handleInputChange}
                      required
                      min="1"
                      placeholder="Número de elementos a transportar"
                    />
                  </label>

                  <label>
                    <span>Precio Neto:</span>
                    <input
                      type="number"
                      name="precio_neto"
                      value={formData.precio_neto || ''}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Precio total del servicio"
                    />
                  </label>
                </div>

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

      <button className="new-form-btn" onClick={() => setShowModal(true)}>
        Agregar Servicio de Transporte
      </button>
    </div>
  );

  const renderPedidosCompletadosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowPedidosCompletadosModal(false)}>×</button>
        <div className="modal-content">
          <h3>Transportes Realizados</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Dirección</th>
                  <th>Distancia (km)</th>
                  <th>Precio Neto</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {pedidosCompletados.map((pedido) => (
                  <tr key={pedido.id_pedido}>
                    <td>{pedido.evento}</td>
                    <td>{pedido.direccion}</td>
                    <td>{pedido.distancia}</td>
                    <td>${pedido.precio_neto}</td>
                    <td>${pedido.total}</td>
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
          <h2>Agregar Nuevo Vehículo</h2>
          
          <div className="form-grid">
            <label>
              <span>Matrícula</span>
              <input
                type="text"
                name="matricula"
                value={nuevoVehiculo.matricula}
                onChange={handleVehiculoInputChange}
                required
                placeholder="Ingrese la matrícula del vehículo"
              />
            </label>

            <label>
              <span>Marca</span>
              <input
                type="text"
                name="marca"
                value={nuevoVehiculo.marca}
                onChange={handleVehiculoInputChange}
                required
                placeholder="Ingrese la marca del vehículo"
              />
            </label>

            <label>
              <span>Modelo</span>
              <input
                type="text"
                name="modelo"
                value={nuevoVehiculo.modelo}
                onChange={handleVehiculoInputChange}
                required
                placeholder="Ingrese el modelo del vehículo"
              />
            </label>

            <label>
              <span>Tipo</span>
              <select
                name="tipo"
                value={nuevoVehiculo.tipo}
                onChange={handleVehiculoInputChange}
                required
                className="escri"
              >
                <option value="Automóvil">Automóvil</option>
                <option value="Remolque">Remolque</option>
                <option value="Máquinas pesadas">Máquinas pesadas</option>
                <option value="Montacargas">Montacargas</option>
              </select>
            </label>

            <label>
              <span>Estado</span>
              <select
                name="estado"
                value={nuevoVehiculo.estado}
                onChange={handleVehiculoInputChange}
                required
                className="escri"
              >
                <option value="Disponible">Disponible</option>
                <option value="En uso">En uso</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>
            </label>
          </div>

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

  // Modal para editar vehículo
  const renderEditVehiculoModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowEditVehiculoModal(false)}>×</button>
        <form className="modal-form" onSubmit={handleUpdateVehiculo}>
          <h2>Editar Vehículo</h2>
          
          <div className="form-grid">
            <label>
              <span>Matrícula</span>
              <input
                type="text"
                name="matricula"
                value={editVehiculo?.matricula || ''}
                onChange={handleEditVehiculoInputChange}
                required
                placeholder="Ingrese la matrícula del vehículo"
              />
            </label>

            <label>
              <span>Marca</span>
              <input
                type="text"
                name="marca"
                value={editVehiculo?.marca || ''}
                onChange={handleEditVehiculoInputChange}
                required
                placeholder="Ingrese la marca del vehículo"
              />
            </label>

            <label>
              <span>Modelo</span>
              <input
                type="text"
                name="modelo"
                value={editVehiculo?.modelo || ''}
                onChange={handleEditVehiculoInputChange}
                required
                placeholder="Ingrese el modelo del vehículo"
              />
            </label>

            <label>
              <span>Tipo</span>
              <select
                name="tipo"
                value={editVehiculo?.tipo || ''}
                onChange={handleEditVehiculoInputChange}
                required
                className="escri"
              >
                <option value="Automóvil">Automóvil</option>
                <option value="Remolque">Remolque</option>
                <option value="Máquinas pesadas">Máquinas pesadas</option>
                <option value="Montacargas">Montacargas</option>
              </select>
            </label>

            <label>
              <span>Estado</span>
              <select
                name="estado"
                value={editVehiculo?.estado || ''}
                onChange={handleEditVehiculoInputChange}
                required
                className="escri"
              >
                <option value="Disponible">Disponible</option>
                <option value="En uso">En uso</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>
            </label>
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-btn">Guardar</button>
            <button type="button" className="reset-btn" onClick={() => setShowEditVehiculoModal(false)}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderInventoryView = () => {
    const rolId = Number(userData.rol);
    if (rolId !== 4) return null;

    return (
      <div className="transportation-content">
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Total de Vehículos</span>
            <strong className="stat-card__number">{stats.vehiculos}</strong>
            <button className="stat-card__seeInfo" onClick={() => setShowVehiculosModal(true)}>
              Ver vehículos
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Transportes Realizados</span>
            <strong className="stat-card__number">{stats.pedidosCompletados}</strong>
            <button className="stat-card__seeInfo" onClick={() => setShowPedidosCompletadosModal(true)}>
              Ver transportes
            </button>
          </div>
        </div>

        {showVehiculosModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button className="close-btn" onClick={() => setShowVehiculosModal(false)}>×</button>
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Vehículos Registrados</h3>
                  <button className="add-user-btn" onClick={() => setShowAddVehiculoModal(true)}>
                    Nuevo Vehículo
                  </button>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Matrícula</th>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th>Tipo de Vehículo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
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
                          <td>
                            <button className="edit-btn" onClick={() => handleEditVehiculo(vehiculo)}>
                              Editar
                            </button>
                            {/* Si tienes una ruta para eliminar vehículos, reemplaza handleDelete por la función correcta */}
                            {/* <button className="delete-btn" onClick={() => handleDeleteVehiculo(vehiculo.id_vehiculo)}>
                              Eliminar
                            </button> */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {showPedidosCompletadosModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button className="close-btn" onClick={() => setShowPedidosCompletadosModal(false)}>×</button>
              <div className="modal-content">
                <h3>Transportes Realizados</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Evento</th>
                        <th>Dirección</th>
                        <th>Distancia (km)</th>
                        <th>Precio Neto</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidosCompletados.map((pedido) => (
                        <tr key={pedido.id_pedido}>
                          <td>{pedido.evento}</td>
                          <td>{pedido.direccion}</td>
                          <td>{pedido.distancia}</td>
                          <td>${pedido.precio_neto}</td>
                          <td>${pedido.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddVehiculoModal && renderAddVehiculoModal()}
        {showEditVehiculoModal && renderEditVehiculoModal()}
      </div>
    );
  };

  return (
    <div className="transportation-page">
      <div className="welcome-header">
        <h1>Gestión de Transporte</h1>
        <p>Gestiona los servicios de transporte para eventos</p>
      </div>

      <div className="service-content">
        {(() => {
          const rolId = Number(userData.rol);
          const isAdmin = rolId === 1;
          const isOrganizer = rolId === 3;
          const isInventory = rolId === 4;

          if (isAdmin) {
            return renderAdminView();
          }

          if (isOrganizer) {
            return renderOrganizerView();
          }

          if (isInventory) {
            return renderInventoryView();
          }

          return null;
        })()}
      </div>

      {showPedidosCompletadosModal && renderPedidosCompletadosModal()}
      {showPedidosPendientesModal && renderPedidosPendientesModal()}
      {showVehiculosModal && renderVehiculosModal()}
      {showAddVehiculoModal && renderAddVehiculoModal()}
      {showEditVehiculoModal && renderEditVehiculoModal()}
    </div>
  );
}