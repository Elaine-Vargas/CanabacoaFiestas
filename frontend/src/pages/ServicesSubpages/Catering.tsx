import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import '../../styles/dashboard/ServicesSubpages.scss';
import '../../components/ServiceBase';
import { useUser } from '../../contexts/UserContext';
import './MenuCatalogoCards.scss';

export type UserRole = 'admin' | 'client' | 'supervisor' | 'inventory';

export type Permission = {
  id: string;
  name: string;
  description: string;
};

export type RolePermissions = {
  [key in UserRole]: Permission[];
};

interface Plato {
  id_plato: number;
  desc_plato: string;
}

interface Menu {
  id_menu: number;
  desc_menu: string;
  id_proveedor: number;
  platos: Plato[];
  proveedor?: {
    nombre: string;
  };
}

interface Catering {
  id_catering?: number;
  id_evento: number;
  personas: number;
  precio_neto: number;
  itbis: number;
  total: number;
  menus: Menu[];
  estado: string;
  rating: number;
  comment: string;
}

interface Evento {
  id_evento: number;
  fecha_evento: string;
  tipo_evento: string;
  nombre_evento?: string;
  nombre_cliente?: string;
  lugar?: string;
  decoracion_solicitada?: string;
}

interface CateringStats {
  menuDisponibles: number;
  proveedorActivo: number;
  totalPedidos: number;
  pedidosPendientes: number;
  totalPersonas: number;
}

// Nueva interfaz para el catálogo
interface MenuCatalogo {
  id_menu: number;
  desc_menu: string;
  proveedor: string;
  precio_total: number | null;
  platos: { nombre: string }[];
}

export default function Catering() {
  const { userRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showModal, setShowModal] = useState(false);
  const [showCreateMenuModal, setShowCreateMenuModal] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<CateringStats>({
    menuDisponibles: 0,
    proveedorActivo: 0,
    totalPedidos: 0,
    pedidosPendientes: 0,
    totalPersonas: 0
  });
  const [formData, setFormData] = useState<Partial<Catering>>({
    menus: [],
    rating: 0,
    comment: ''
  });
  const [newMenuData, setNewMenuData] = useState({
    desc_menu: '',
    selectedPlatos: [] as Plato[]
  });
  const [caterings, setCaterings] = useState<Catering[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [showPedidosModal, setShowPedidosModal] = useState(false);
  const [showPendientesModal, setShowPendientesModal] = useState(false);
  const [showProveedoresModal, setShowProveedoresModal] = useState(false);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [pedidosPendientes, setPedidosPendientes] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [showMenusModal, setShowMenusModal] = useState(false);
  const [showEventosModal, setShowEventosModal] = useState(false);
  const [menusCatalogo, setMenusCatalogo] = useState<MenuCatalogo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const menusRes = await fetch('/api/menu/catalogo', { headers });
        
        if (!menusRes.ok) {
          throw new Error('Error al cargar el catálogo de menús');
        }

        const menusData = await menusRes.json();
        console.log('Menus data:', menusData); // Debug log
        setMenusCatalogo(menusData);
      } catch (error) {
        console.error('Error al cargar el catálogo:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar el catálogo');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Error al cargar estadísticas' }));
          throw new Error(errorData.error || `Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar estadísticas');
      }
    };

    if (userRole === 'admin') {
      fetchStats();
    }
  }, [userRole]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        const response = await fetch('/api/catering/pedidos', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        setPedidos(data);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar pedidos. Por favor, intente nuevamente.');
      }
    };

    const fetchPedidosPendientes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        const response = await fetch('/api/catering/pendientes', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        setPedidosPendientes(data);
      } catch (error) {
        console.error('Error al cargar pedidos pendientes:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar pedidos pendientes. Por favor, intente nuevamente.');
      }
    };

    const fetchProveedores = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        const response = await fetch('/api/catering/proveedores', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        setProveedores(data);
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar proveedores. Por favor, intente nuevamente.');
      }
    };

    if (showPedidosModal) {
      fetchPedidos();
    }
    if (showPendientesModal) {
      fetchPedidosPendientes();
    }
    if (showProveedoresModal) {
      fetchProveedores();
    }
  }, [showPedidosModal, showPendientesModal, showProveedoresModal]);

  useEffect(() => {
    if (userRole === 'client') {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      fetch('/api/menu/catalogo', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) {
            setMenusCatalogo(data);
          } else {
            console.error('Los datos recibidos no son un array:', data);
            setMenusCatalogo([]);
          }
        })
        .catch(err => {
          console.error('Error al cargar catálogo de menús:', err);
          setMenusCatalogo([]);
        });
    }
  }, [userRole]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleMenuSelect = (menu: Menu) => {
    setFormData(prev => ({
      ...prev,
      menus: prev.menus?.includes(menu) 
        ? prev.menus.filter(m => m.id_menu !== menu.id_menu)
        : [...(prev.menus || []), menu]
    }));
  };

  const handlePlatoSelect = (plato: Plato) => {
    setNewMenuData(prev => ({
      ...prev,
      selectedPlatos: prev.selectedPlatos.includes(plato)
        ? prev.selectedPlatos.filter(p => p.id_plato !== plato.id_plato)
        : [...prev.selectedPlatos, plato]
    }));
  };

  const handleCreateMenu = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          desc_menu: newMenuData.desc_menu,
          platos: newMenuData.selectedPlatos.map(p => p.id_plato)
        })
      });

      if (response.ok) {
        const updatedMenus = await fetch('/api/menus').then(res => res.json());
        setMenus(updatedMenus);
        setShowCreateMenuModal(false);
        setNewMenuData({ desc_menu: '', selectedPlatos: [] });
      }
    } catch (error) {
      console.error('Error al crear menú:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await fetch(`/api/catering/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/catering', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      const response = await fetch('/api/catering');
      const data = await response.json();
      setCaterings(data);
      setShowModal(false);
      setFormData({
        id_evento: 0,
        personas: 0,
        precio_neto: 0,
        itbis: 0,
        total: 0,
        menus: [],
        rating: 0,
        comment: ''
      });
      setEditId(null);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleSolicitarMenu = (menuId: number) => {
    setShowModal(true);
    setFormData(prev => ({
      ...prev,
      menus: [{ id_menu: menuId }]
    }));
  };

  const renderPedidosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowPedidosModal(false)}>×</button>
        <div className="modal-content">
          <h3>Total de Pedidos</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Evento</th>
                  <th>Personas</th>
                  <th>Precio Neto</th>
                  <th>ITBIS</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id_catering}>
                    <td>{pedido.id_catering}</td>
                    <td>{pedido.nombre_evento}</td>
                    <td>{pedido.personas}</td>
                    <td>${pedido.precio_neto}</td>
                    <td>${pedido.itbis}</td>
                    <td>${pedido.total}</td>
                    <td>{pedido.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPendientesModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowPendientesModal(false)}>×</button>
        <div className="modal-content">
          <h3>Pedidos Pendientes</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Evento</th>
                  <th>Personas</th>
                  <th>Precio Neto</th>
                  <th>ITBIS</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {pedidosPendientes.map((pedido) => (
                  <tr key={pedido.id_catering}>
                    <td>{pedido.id_catering}</td>
                    <td>{pedido.nombre_evento}</td>
                    <td>{pedido.personas}</td>
                    <td>${pedido.precio_neto}</td>
                    <td>${pedido.itbis}</td>
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

  const renderProveedoresModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowProveedoresModal(false)}>×</button>
        <div className="modal-content">
          <h3>Proveedores Activos</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((proveedor) => (
                  <tr key={proveedor.id_proveedor}>
                    <td>{proveedor.nombre}</td>
                    <td>{proveedor.telefono}</td>
                    <td>{proveedor.correo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClientView = () => {
    const filteredMenus = menusCatalogo?.filter(menu => 
      menu.desc_menu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.platos.some(plato => plato.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

    return (
      <div className="menu-catalogo-container">
        <h1 className="menu-catalogo-title">Catálogo de Menús</h1>
        
        <div className="menu-catalogo-filters">
          <div className="search-container">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por menú, proveedor o plato..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="todos">Todos los menús</option>
            <option value="economico">Económicos</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        <div className="menu-catalogo-grid">
          {filteredMenus.length > 0 ? (
            filteredMenus.map((menu) => (
              <div key={menu.id_menu} className="menu-catalogo-card">
                <span className="menu-catalogo-proveedor">{menu.proveedor}</span>
                <div className="menu-catalogo-card-content">
                  <h3 className="menu-catalogo-card-title">{menu.desc_menu}</h3>
                  <div className="menu-catalogo-platos-list">
                    <h4>Platos incluidos:</h4>
                    <ul>
                      {menu.platos.map((plato, index) => (
                        <li key={index}>
                          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" /></svg>
                          <span>{plato.nombre}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="menu-catalogo-precio">
                    <span>Precio total:</span>
                    <span className="precio-total">${menu.precio_total?.toFixed(2) || '0.00'}</span>
                  </div>
                  <button
                    onClick={() => handleSolicitarMenu(menu.id_menu)}
                    className="menu-catalogo-btn"
                  >
                    Solicitar este menú
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No se encontraron menús disponibles</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAdminView = () => {
    return (
      <div className="catering-content">
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Todos los Pedidos</span>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowPedidosModal(true)}
            >
              Ver pedidos
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Pedidos Pendientes</span>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowPendientesModal(true)}
            >
              Ver pendientes
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Proveedores de Catering</span>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowProveedoresModal(true)}
            >
              Ver proveedores
            </button>
          </div>
        </div>

        {showPedidosModal && renderPedidosModal()}
        {showPendientesModal && renderPendientesModal()}
        {showProveedoresModal && renderProveedoresModal()}

        <center>
          <button className="new-form-btn" onClick={() => setShowModal(true)}>
          Agregar Servicio de Catering
        </button>
        </center>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
              <form className="modal-form" onSubmit={handleSubmit}>
                <h2>{editId ? 'Editar Servicio de Catering' : 'Nuevo Servicio de Catering'}</h2>
                
                <div className="form-grid">
                  <label>
                    <span>Evento:</span>
                    <select
                      name="id_evento"
                      value={formData.id_evento || ''}
                      onChange={handleInputChange}
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
                    <span>Número de Personas:</span>
                    <input
                      type="number"
                      name="personas"
                      value={formData.personas || ''}
                      onChange={handleInputChange}
                      required
                      min="1"
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
                    />
                  </label>

                  <label>
                    <span>Estado:</span>
                    <select
                      name="estado"
                      value={formData.estado || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar estado</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Progreso">En Progreso</option>
                      <option value="Completado">Completado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
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
    <div className="catering-content">
      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Menús Disponibles</span>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowMenusModal(true)}
          >
            Ver menús
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Proveedores Activos</span>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowProveedoresModal(true)}
          >
            Ver proveedores
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Eventos con Catering</span>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowEventosModal(true)}
          >
            Ver eventos
          </button>
        </div>
      </div>

      {showMenusModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowMenusModal(false)}>×</button>
            <div className="modal-content">
              <h3>Menús Disponibles</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Descripción del Menú</th>
                      <th>Proveedor</th>
                      <th>Cantidad de Platos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menus.map((menu) => (
                      <tr key={menu.id_menu}>
                        <td>{menu.desc_menu}</td>
                        <td>{menu.proveedor?.nombre || 'No asignado'}</td>
                        <td>{menu.platos?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProveedoresModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowProveedoresModal(false)}>×</button>
            <div className="modal-content">
              <h3>Proveedores de Catering Activos</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Contacto</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proveedores.map((proveedor) => (
                      <tr key={proveedor.id_proveedor}>
                        <td>{proveedor.nombre}</td>
                        <td>{proveedor.telefono}</td>
                        <td>
                          <span className={`estado-badge ${proveedor.estado.toLowerCase()}`}>
                            {proveedor.estado}
                          </span>
                        </td>
                        <td>
                          <div className="acciones-buttons">
                            <button className="edit-btn">Editar</button>
                            <button className="delete-btn">Eliminar</button>
                          </div>
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

      {showEventosModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowEventosModal(false)}>×</button>
            <div className="modal-content">
              <h3>Eventos con Catering</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Cliente</th>
                      <th>Espacio</th>
                      <th>Menú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caterings.map((catering) => {
                      const evento = eventos.find(e => e.id_evento === catering.id_evento);
                      return (
                        <tr key={catering.id_catering}>
                          <td>{evento?.tipo_evento}</td>
                          <td>{evento?.nombre_cliente}</td>
                          <td>{evento?.lugar}</td>
                          <td>{catering.menus?.map(m => m.desc_menu).join(', ')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <center>
          <button className="new-form-btn" onClick={() => setShowModal(true)}>
          Agregar Servicio de Catering
        </button>
        </center>
    </div>
  );

  return (
    <div className="catering-page">
      <div className="welcome-header">
        <h1>Gestión de Catering</h1>
        <p>selecciona un menú y solicítalo para tu evento</p>
      </div>

      <div className="service-content">
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
      </div>

      {/* Modales necesarios */}
    </div>
  );
}
