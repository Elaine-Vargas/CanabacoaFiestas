import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import '../../../../src/styles/dashboard/ServicesSubpages.scss';
import { useUser } from '../../../../src/contexts/UserContext';
import '../../../../src/styles/dashboard/MenuCatalogoCards.scss';

export type UserRole = 'admin' | 'client' | 'supervisor';

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
  nombre: string;
  descripcion: string;
}

interface Menu {
  id_menu: number;
  desc_menu: string;
  id_proveedor: number;
  precio_menu: number;
  platos: Plato[];
  proveedor: string;
}

interface Catering {
  id_catering?: number;
  id_evento: number;
  personas_catering: number;
  precioneto_catering: number;
  itbis_catering: number;
  total_catering: number;
  menus?: Menu[];
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

// Nueva interfaz para el catálogo
interface MenuCatalogo {
  id_menu: number;
  desc_menu: string;
  proveedor: string;
  precio_menu: number;
  platos: { 
    id?: number;
    nombre: string;
    descripcion?: string;
  }[];
}

export default function CateringClient() {
  const { userRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showModal, setShowModal] = useState(false);
  const [showCreateMenuModal, setShowCreateMenuModal] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Catering>>({
    id_evento: 0,
    personas_catering: 0,
    precioneto_catering: 0,
    itbis_catering: 0,
    total_catering: 0,
    menus: []
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
  const [selectedMenu, setSelectedMenu] = useState<MenuCatalogo | null>(null);
  const [showCateringForm, setShowCateringForm] = useState(false);
  const [bandejaMenus, setBandejaMenus] = useState<MenuCatalogo[]>([]);
  const [showBandeja, setShowBandeja] = useState(false);

  useEffect(() => {
    const rolId = Number(userData.rol);
    if (rolId === 2) { // Si es cliente
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Cargar catálogo de menús
      fetch('/api/catering/menu/catalogo', { headers })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Menús recibidos:', data);
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

      // Cargar eventos del cliente
      fetch('/api/evento', { headers })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setEventos(data);
          }
        })
        .catch(err => console.error('Error al cargar eventos:', err));
    }
  }, [userData.rol]);

  useEffect(() => {
    const ensureArray = (data: any) => Array.isArray(data) ? data : [];
  
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
        setPedidos(ensureArray(data));
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
        setPedidos([]); // fallback seguro
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
        setPedidosPendientes(ensureArray(data));
      } catch (error) {
        console.error('Error al cargar pedidos pendientes:', error);
        setPedidosPendientes([]); // fallback seguro
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
        setProveedores(ensureArray(data));
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
        setProveedores([]); // fallback seguro
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'precioneto_catering') {
      const precioNeto = parseFloat(value) || 0;
      const itbis = precioNeto * 0.18; // 18% de ITBIS
      const total = precioNeto + itbis;
      
      setFormData(prev => ({
        ...prev,
        [name]: precioNeto,
        itbis_catering: itbis,
        total_catering: total
      }));
    } else if (name === 'id_evento') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMenuSelect = (menu: Menu) => {
    setFormData(prev => {
      const newMenus = prev.menus?.includes(menu) 
        ? prev.menus.filter(m => m.id_menu !== menu.id_menu)
        : [...(prev.menus || []), menu];
      
      // Calcular el precio neto basado en los menús seleccionados
      const precioNeto = newMenus.reduce((total, menu) => {
        const menuCatalogo = menusCatalogo.find(m => m.id_menu === menu.id_menu);
        return total + (menuCatalogo?.precio_menu || 0);
      }, 0);
      
      const itbis = precioNeto * 0.18;
      const total = precioNeto + itbis;
      
      return {
        ...prev,
        menus: newMenus,
        precioneto_catering: precioNeto,
        itbis_catering: itbis,
        total_catering: total
      };
    });
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
        personas_catering: 0,
        precioneto_catering: 0,
        itbis_catering: 0,
        total_catering: 0,
        menus: []
      });
      setEditId(null);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleSolicitarMenu = (menuId: number) => {
    const menu = menusCatalogo.find(m => m.id_menu === menuId) || null;
    setSelectedMenu(menu);
    setShowCateringForm(true);
    if (menu) {
      setFormData(prev => ({
        ...prev,
        precioneto_catering: menu.precio_menu,
        itbis_catering: +(menu.precio_menu * 0.18).toFixed(2),
        total_catering: +(menu.precio_menu * 1.18).toFixed(2),
        personas_catering: 1,
        menus: [{
          id_menu: menu.id_menu,
          desc_menu: menu.desc_menu,
          id_proveedor: 0,
          precio_menu: menu.precio_menu,
          proveedor: menu.proveedor || '',
          platos: (menu.platos || []).map((p, idx) => ({
            id_plato: p.id || idx,
            nombre: p.nombre,
            descripcion: p.descripcion || '',
          })),
        }],
      }));
    }
  };

  const closeCateringForm = () => {
    setShowCateringForm(false);
    setSelectedMenu(null);
  };

  const renderPedidosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowPedidosModal(false)}>×</button>
        <div className="modal-content">
          <h3>Todos los Pedidos</h3>
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(pedidos) && pedidos.map((pedido) => (
                  <tr key={pedido.id_catering}>
                    <td>{pedido.id_catering}</td>
                    <td>{pedido.nombre_evento}</td>
                    <td>{pedido.personas_catering}</td>
                    <td>${pedido.precioneto_catering}</td>
                    <td>${pedido.itbis_catering}</td>
                    <td>${pedido.total_catering}</td>
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
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
              {Array.isArray(pedidosPendientes) && pedidosPendientes.map((pedido) => (
                  <tr key={pedido.id_catering}>
                    <td>{pedido.id_catering}</td>
                    <td>{pedido.nombre_evento}</td>
                    <td>{pedido.personas_catering}</td>
                    <td>${pedido.precioneto_catering}</td>
                    <td>${pedido.itbis_catering}</td>
                    <td>${pedido.total_catering}</td>
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
          <h3>Proveedores de Catering Activos</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
              {Array.isArray(proveedores) && proveedores.map((proveedor) => (
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

  const filteredMenus = menusCatalogo.filter((menu) => {
    const searchTermLower = searchTerm.toLowerCase().trim();
    
    // Si no hay término de búsqueda, solo filtrar por categoría
    if (!searchTermLower) {
      const precio = Number(menu.precio_menu);
      if (selectedCategory === 'todos') return true;
      if (selectedCategory === 'economico') return precio <= 250;
      if (selectedCategory === 'premium') return precio > 250;
      return true;
    }

    // Buscar en todos los campos
    const menuMatch = menu.desc_menu.toLowerCase().includes(searchTermLower);
    const proveedorMatch = menu.proveedor.toLowerCase().includes(searchTermLower);
    const platosMatch = menu.platos.some(plato => 
      plato.nombre.toLowerCase().includes(searchTermLower)
    );

    const matchesSearch = menuMatch || proveedorMatch || platosMatch;

    // Aplicar filtro de categoría
    const precio = Number(menu.precio_menu);
    if (selectedCategory === 'todos') {
      return matchesSearch;
    } else if (selectedCategory === 'economico') {
      return matchesSearch && precio <= 250;
    } else if (selectedCategory === 'premium') {
      return matchesSearch && precio > 250;
    }

    return matchesSearch;
  });

  const toggleBandejaMenu = (menu: MenuCatalogo) => {
    setBandejaMenus(prev => {
      const exists = prev.some(m => m.id_menu === menu.id_menu);
      if (exists) {
        return prev.filter(m => m.id_menu !== menu.id_menu);
      } else {
        return [...prev, menu];
      }
    });
  };

  const handleSolicitarCateringDesdeBandeja = () => {
    setShowBandeja(false);
    setShowCateringForm(true);
    if (bandejaMenus.length > 0) {
      setFormData(prev => ({
        ...prev,
        menus: bandejaMenus.map(menu => ({
          id_menu: menu.id_menu,
          desc_menu: menu.desc_menu,
          id_proveedor: 0,
          precio_menu: menu.precio_menu,
          proveedor: menu.proveedor || '',
          platos: (menu.platos || []).map((p, idx) => ({
            id_plato: idx,
            nombre: p.nombre,
            descripcion: '',
          })),
        })),
        precioneto_catering: bandejaMenus.reduce((acc, m) => acc + m.precio_menu, 0),
        itbis_catering: +(bandejaMenus.reduce((acc, m) => acc + m.precio_menu, 0) * 0.18).toFixed(2),
        total_catering: +(bandejaMenus.reduce((acc, m) => acc + m.precio_menu, 0) * 1.18).toFixed(2),
        personas_catering: 1,
      }));
    }
  };

  const renderClientView = () => {
    return (
      <div className="catering-content">
        <div className="menu-catalogo-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar menús, platos o proveedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="todos">Todos los menús</option>
              <option value="economico">Económicos (hasta $250)</option>
              <option value="premium">Premium (más de $250)</option>
            </select>
          </div>
        </div>

        <div className="menu-catalogo-grid">
          {filteredMenus.length > 0 ? (
            filteredMenus.map((menu) => (
              <div key={menu.id_menu} className="menu-card">
                <div className="menu-card-header">
                  <h3>{menu.desc_menu}</h3>
                  <span className="menu-price">${menu.precio_menu.toFixed(2)}</span>
                </div>
                <div className="menu-card-content">
                  <p className="menu-proveedor">Proveedor: {menu.proveedor}</p>
                  <div className="menu-platos">
                    <h4>Platos incluidos:</h4>
                    <ul>
                      {menu.platos.map((plato, idx) => (
                        <li key={plato.id || idx}>{plato.nombre}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="menu-card-actions">
                  <button
                    className="solicitar-btn"
                    onClick={() => handleSolicitarMenu(menu.id_menu)}
                  >
                    Solicitar Menú
                  </button>
                  <button
                    className={`bandeja-btn ${bandejaMenus.some(m => m.id_menu === menu.id_menu) ? 'active' : ''}`}
                    onClick={() => toggleBandejaMenu(menu)}
                  >
                    {bandejaMenus.some(m => m.id_menu === menu.id_menu) ? 'En Bandeja' : 'Agregar a Bandeja'}
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

        {showCateringForm && selectedMenu && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button className="close-btn" onClick={closeCateringForm}>×</button>
              <h2>Solicitar Catering</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Evento:</label>
                  <select
                    name="id_evento"
                    value={formData.id_evento}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona un evento</option>
                    {eventos.map(ev => (
                      <option key={ev.id_evento} value={ev.id_evento}>
                        {ev.nombre_evento || `Evento #${ev.id_evento}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Número de Personas:</label>
                  <input
                    type="number"
                    name="personas_catering"
                    min="1"
                    value={formData.personas_catering}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="menu-details">
                  <h3>Detalles del Menú</h3>
                  <p><strong>Nombre:</strong> {selectedMenu.desc_menu}</p>
                  <p><strong>Proveedor:</strong> {selectedMenu.proveedor}</p>
                  <p><strong>Precio base:</strong> ${selectedMenu.precio_menu.toFixed(2)}</p>
                  <p><strong>ITBIS (18%):</strong> ${(selectedMenu.precio_menu * 0.18).toFixed(2)}</p>
                  <p><strong>Total:</strong> ${(selectedMenu.precio_menu * 1.18).toFixed(2)}</p>
                </div>
                <button type="submit" className="submit-btn">
                  Confirmar Solicitud
                </button>
              </form>
            </div>
          </div>
        )}
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
                      name="personas_catering"
                      value={formData.personas_catering || ''}
                      onChange={handleInputChange}
                      required
                      min="1"
                    />
                  </label>

                  <label>
                    <span>Precio Neto:</span>
                    <input
                      type="number"
                      name="precioneto_catering"
                      value={formData.precioneto_catering || ''}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </label>

                  <label>
                    <span>ITBIS (18%):</span>
                    <input
                      type="number"
                      name="itbis_catering"
                      value={formData.itbis_catering || ''}
                      readOnly
                      className="readonly"
                      placeholder="ITBIS calculado automáticamente"
                    />
                  </label>

                  <label>
                    <span>Total:</span>
                    <input
                      type="number"
                      name="total_catering"
                      value={formData.total_catering || ''}
                      readOnly
                      className="readonly"
                      placeholder="Total calculado automáticamente"
                    />
                  </label>

                  <label className="full-width">
                    <span>Menús:</span>
                    <div className="menu-selection">
                      {menus.map(menu => (
                        <div
                          key={menu.id_menu}
                          className={`menu-card ${
                            formData.menus?.some(m => m.id_menu === menu.id_menu) ? 'selected' : ''
                          }`}
                          onClick={() => handleMenuSelect(menu)}
                        >
                          <h4>{menu.desc_menu}</h4>
                          <div className="menu-platos">
                            {menu.platos?.map(plato => (
                              <p key={plato.id_plato}>{plato.nombre}</p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
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
                        <td>{menu.proveedor}</td>
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
