import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import '../../styles/dashboard/ServicesSubpages.scss';
import '../../components/ServiceBase';
import { useUser } from '../../contexts/UserContext';
import '../../styles/dashboard/MenuCatalogoCards.scss';

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

interface Proveedor {
  id_proveedor: number;
  nombre_proveedor: string;
  tipo_proveedor: string;
  telefono: string;
  correo: string;
  estado: string;
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
  platos: { nombre: string }[];
}

export default function Catering() {
  const { userRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showModal, setShowModal] = useState(false);
  const [showCreateMenuModal, setShowCreateMenuModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
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
    id_proveedor: '',
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
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [showMenusModal, setShowMenusModal] = useState(false);
  const [showEventosModal, setShowEventosModal] = useState(false);
  const [menusCatalogo, setMenusCatalogo] = useState<MenuCatalogo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<MenuCatalogo | null>(null);
  const [showCateringForm, setShowCateringForm] = useState(false);
  const [bandejaMenus, setBandejaMenus] = useState<MenuCatalogo[]>([]);
  const [showBandeja, setShowBandeja] = useState(false);
  const [newEventData, setNewEventData] = useState({
    nombre_evento: '',
    fecha_evento: '',
    hora_inicio: '',
    hora_fin: '',
    lugar_evento: '',
    descripcion: ''
  });

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

        const [menusRes, eventosRes] = await Promise.all([
          fetch('/api/menu/catalogo', { headers }),
          fetch('/api/eventos', { headers })
        ]);
        
        if (!menusRes.ok) {
          throw new Error('Error al cargar el catálogo de menús');
        }

        if (!eventosRes.ok) {
          throw new Error('Error al cargar los eventos');
        }

        const [menusData, eventosData] = await Promise.all([
          menusRes.json(),
          eventosRes.json()
        ]);

        setMenusCatalogo(menusData);
        setEventos(eventosData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar datos');
      }
    };

    fetchData();
  }, []);

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

  // Obtener proveedores únicos de los menús del catálogo
  const proveedoresCatering = React.useMemo(() => {
    const proveedoresSet = new Set();
    return menusCatalogo
      .filter(menu => {
        if (proveedoresSet.has(menu.proveedor)) return false;
        proveedoresSet.add(menu.proveedor);
        return true;
      })
      .map(menu => ({
        id_proveedor: menu.id_menu,
        nombre_proveedor: menu.proveedor,
        tipo_proveedor: 'catering'
      }));
  }, [menusCatalogo]);

  // Obtener platos únicos de los menús del catálogo
  const platosDisponibles = React.useMemo(() => {
    const platosSet = new Set();
    return menusCatalogo
      .flatMap(menu => menu.platos)
      .filter(plato => {
        if (platosSet.has(plato.nombre)) return false;
        platosSet.add(plato.nombre);
        return true;
      })
      .map((plato, index) => ({
        id_plato: index + 1,
        nombre: plato.nombre,
        descripcion: ''
      }));
  }, [menusCatalogo]);

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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Validar que se hayan seleccionado platos
      if (newMenuData.selectedPlatos.length === 0) {
        setError('Debe seleccionar al menos un plato para el menú');
        return;
      }

      const menuData = {
        desc_menu: newMenuData.desc_menu,
        id_proveedor: parseInt(newMenuData.id_proveedor),
        platos: newMenuData.selectedPlatos.map(plato => ({
          id_plato: plato.id_plato,
          nombre: plato.nombre,
          descripcion: plato.descripcion
        }))
      };

      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(menuData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el menú');
      }

      // Recargar menús
      const menusRes = await fetch('/api/menu/catalogo', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!menusRes.ok) {
        throw new Error('Error al recargar menús');
      }

      const menusData = await menusRes.json();
      setMenusCatalogo(menusData);
      setShowCreateMenuModal(false);
      setNewMenuData({
        desc_menu: '',
        id_proveedor: '',
        selectedPlatos: []
      });
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al crear el menú');
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
                    <td>{proveedor.nombre_proveedor}</td>
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

  const handleCreateEvent = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('/api/evento', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEventData)
      });

      if (!response.ok) {
        throw new Error('Error al crear el evento');
      }

      // Recargar eventos
      const eventosRes = await fetch('/api/eventos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!eventosRes.ok) {
        throw new Error('Error al recargar eventos');
      }

      const eventosData = await eventosRes.json();
      setEventos(eventosData);
      setShowCreateEventModal(false);
      setNewEventData({
        nombre_evento: '',
        fecha_evento: '',
        hora_inicio: '',
        hora_fin: '',
        lugar_evento: '',
        descripcion: ''
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al crear el evento');
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
          <button
            onClick={() => setShowCreateMenuModal(true)}
            className="create-menu-btn"
            style={{
              background: 'var(--gold)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.2rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span role="img" aria-label="create">➕</span>
            Crear Menú
          </button>
        </div>

        <div className="menu-catalogo-grid">
          {filteredMenus.length > 0 ? (
            filteredMenus.map((menu) => (
              <div
                key={menu.id_menu}
                className={`menu-catalogo-card ${Number(menu.precio_menu) > 250 ? 'premium' : 'economico'}`}
              >
                <span className="menu-catalogo-proveedor">
                  {menu.proveedor}
                </span>
                <div className="menu-catalogo-card-content">
                  <h3 className="menu-catalogo-card-title">{menu.desc_menu}</h3>
                  <div className="menu-catalogo-platos-list">
                    <h4>Platos incluidos:</h4>
                    <ul>
                      {menu.platos.map((plato, index) => (
                        <li key={index}>
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                          </svg>
                          <span>{plato.nombre}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="menu-catalogo-precio">
                    <span>Precio total:</span>
                    <span className="precio-total">
                      ${Number(menu.precio_menu).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleBandejaMenu(menu)}
                    className="menu-catalogo-btn"
                    style={{marginTop: 8, background: bandejaMenus.some(m => m.id_menu === menu.id_menu) ? 'var(--dark-gold)' : undefined}}
                  >
                    {bandejaMenus.some(m => m.id_menu === menu.id_menu) ? 'Quitar de la bandeja' : 'Agregar a la bandeja'}
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

        {showCateringForm && (
          <div className="modal-overlay">
            <div className="modal-container" style={{ maxWidth: 400, padding: '1.2rem', borderRadius: 16 }}>
              <button className="close-btn" onClick={closeCateringForm} style={{ position: 'absolute', top: 16, right: 16, fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
              <h2 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>Solicitar Catering</h2>
              <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label>
                  Evento:
                  <select
                    name="id_evento"
                    value={formData.id_evento}
                    onChange={handleInputChange}
                    required
                    style={{width: '100%', fontSize: '1rem', marginTop: '0.2rem'}}>
                    <option value="">Selecciona un evento</option>
                    {eventos.map(ev => (
                      <option key={ev.id_evento} value={ev.id_evento}>{ev.nombre_evento || `Evento #${ev.id_evento}`}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Personas:
                  <input
                    type="number"
                    name="personas_catering"
                    min={1}
                    value={formData.personas_catering}
                    onChange={handleInputChange}
                    required
                    style={{width: '100%', fontSize: '1rem', marginTop: '0.2rem'}}
                  />
                </label>
                <label>
                  Precio Neto:
                  <input
                    type="number"
                    name="precioneto_catering"
                    value={formData.precioneto_catering}
                    readOnly
                    style={{width: '100%', fontSize: '1rem', marginTop: '0.2rem', background: '#f5f5f5'}}
                  />
                </label>
                <label>
                  ITBIS (18%):
                  <input
                    type="number"
                    name="itbis_catering"
                    value={formData.itbis_catering}
                    readOnly
                    style={{width: '100%', fontSize: '1rem', marginTop: '0.2rem', background: '#f5f5f5'}}
                  />
                </label>
                <label>
                  Total:
                  <input
                    type="number"
                    name="total_catering"
                    value={formData.total_catering}
                    readOnly
                    style={{width: '100%', fontSize: '1rem', marginTop: '0.2rem', background: '#f5f5f5'}}
                  />
                </label>
                <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.7rem'}}>
                  <button type="submit" style={{flex: 1, background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem', fontWeight: 700}}>Solicitar</button>
                  <button type="button" onClick={closeCateringForm} style={{flex: 1, background: '#eee', color: '#333', border: 'none', borderRadius: '8px', padding: '0.6rem'}}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Icono de bandeja flotante */}
        <div style={{position: 'fixed', top: 24, right: 24, zIndex: 1200}}>
          <button onClick={() => setShowBandeja(true)} style={{
            background: 'var(--gold)',
            border: 'none',
            borderRadius: '50%',
            width: 56,
            height: 56,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: 'pointer',
          }}>
            <span role="img" aria-label="bandeja" style={{fontSize: 32}}>🍽️</span>
            {bandejaMenus.length > 0 && (
              <span style={{
                position: 'absolute',
                top: 6,
                right: 6,
                background: '#fff',
                color: 'var(--gold)',
                borderRadius: '50%',
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                border: '2px solid var(--gold)'
              }}>{bandejaMenus.length}</span>
            )}
          </button>
        </div>

        {/* Modal de bandeja */}
        {showBandeja && (
          <div className="modal-overlay">
            <div className="modal-container" style={{ maxWidth: 400, padding: '1.2rem', borderRadius: 16, minHeight: 200 }}>
              <button className="close-btn" onClick={() => setShowBandeja(false)} style={{ position: 'absolute', top: 16, right: 16, fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
              <h2 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>Bandeja de Menús</h2>
              {bandejaMenus.length === 0 ? (
                <p style={{textAlign: 'center', color: '#888'}}>No hay menús en la bandeja.</p>
              ) : (
                <ul style={{listStyle: 'none', padding: 0, margin: 0, maxHeight: 200, overflowY: 'auto'}}>
                  {bandejaMenus.map(menu => (
                    <li key={menu.id_menu} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, background: '#f5f5f5', borderRadius: 8, padding: '0.5rem 0.7rem'}}>
                      <span style={{fontWeight: 600}}>{menu.desc_menu}</span>
                      <button onClick={() => toggleBandejaMenu(menu)} style={{background: 'none', border: 'none', color: 'var(--gold)', fontWeight: 700, fontSize: 18, cursor: 'pointer'}}>✕</button>
                    </li>
                  ))}
                </ul>
              )}
              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 16, gap: 8}}>
                <button onClick={() => setBandejaMenus([])} style={{flex: 1, background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '0.6rem'}}>Vaciar bandeja</button>
                <button onClick={handleSolicitarCateringDesdeBandeja} disabled={bandejaMenus.length === 0} style={{flex: 1, background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem', fontWeight: 700}}>Solicitar catering</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Crear Evento */}
        {showCreateEventModal && (
          <div className="modal-overlay">
            <div className="modal-container" style={{ maxWidth: 500, padding: '1.5rem', borderRadius: 16 }}>
              <button 
                className="close-btn" 
                onClick={() => setShowCreateEventModal(false)} 
                style={{ position: 'absolute', top: 16, right: 16, fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ×
              </button>
              <h2 style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Crear Nuevo Evento</h2>
              <form onSubmit={handleCreateEvent} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>
                    Nombre del Evento:
                    <input
                      type="text"
                      value={newEventData.nombre_evento}
                      onChange={(e) => setNewEventData(prev => ({...prev, nombre_evento: e.target.value}))}
                      required
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        marginTop: '0.3rem'
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>
                    Fecha del Evento:
                    <input
                      type="date"
                      value={newEventData.fecha_evento}
                      onChange={(e) => setNewEventData(prev => ({...prev, fecha_evento: e.target.value}))}
                      required
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        marginTop: '0.3rem'
                      }}
                    />
                  </label>
                </div>
                <div style={{display: 'flex', gap: '1rem'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>
                      Hora de Inicio:
                      <input
                        type="time"
                        value={newEventData.hora_inicio}
                        onChange={(e) => setNewEventData(prev => ({...prev, hora_inicio: e.target.value}))}
                        required
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          marginTop: '0.3rem'
                        }}
                      />
                    </label>
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>
                      Hora de Fin:
                      <input
                        type="time"
                        value={newEventData.hora_fin}
                        onChange={(e) => setNewEventData(prev => ({...prev, hora_fin: e.target.value}))}
                        required
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          marginTop: '0.3rem'
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>
                    Lugar del Evento:
                    <input
                      type="text"
                      value={newEventData.lugar_evento}
                      onChange={(e) => setNewEventData(prev => ({...prev, lugar_evento: e.target.value}))}
                      required
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        marginTop: '0.3rem'
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>
                    Descripción:
                    <textarea
                      value={newEventData.descripcion}
                      onChange={(e) => setNewEventData(prev => ({...prev, descripcion: e.target.value}))}
                      required
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        marginTop: '0.3rem',
                        minHeight: '100px',
                        resize: 'vertical'
                      }}
                    />
                  </label>
                </div>
                <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                  <button 
                    type="submit" 
                    style={{
                      flex: 1,
                      background: 'var(--gold)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Crear Evento
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowCreateEventModal(false)}
                    style={{
                      flex: 1,
                      background: '#eee',
                      color: '#333',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Crear Menú */}
        {showCreateMenuModal && (
          <div className="modal-overlay">
            <div className="modal-container" style={{ maxWidth: 500, padding: '1.5rem', borderRadius: 16 }}>
              <button 
                className="close-btn" 
                onClick={() => setShowCreateMenuModal(false)} 
                style={{ position: 'absolute', top: 16, right: 16, fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ×
              </button>
              <h2 style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Crear Nuevo Menú</h2>
              {error && (
                <div style={{
                  background: '#fee',
                  color: '#c00',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  marginBottom: '1rem'
                }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleCreateMenu} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>
                    Nombre del Menú:
                    <input
                      type="text"
                      value={newMenuData.desc_menu}
                      onChange={(e) => setNewMenuData(prev => ({...prev, desc_menu: e.target.value}))}
                      required
                      placeholder="Ej: Menú Vegetariano"
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        marginTop: '0.3rem'
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>
                    Proveedor de Catering:
                    <select
                      value={newMenuData.id_proveedor}
                      onChange={(e) => setNewMenuData(prev => ({...prev, id_proveedor: e.target.value}))}
                      required
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        marginTop: '0.3rem'
                      }}
                    >
                      <option value="">Seleccione un proveedor</option>
                      {proveedoresCatering.map(proveedor => (
                        <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                          {proveedor.nombre_proveedor}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>
                    Platos Disponibles:
                    <div style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      marginTop: '0.3rem'
                    }}>
                      {platosDisponibles.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
                          No hay platos disponibles
                        </div>
                      ) : (
                        platosDisponibles.map(plato => (
                          <div key={plato.id_plato} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.5rem',
                            borderBottom: '1px solid #eee'
                          }}>
                            <input
                              type="checkbox"
                              id={`plato-${plato.id_plato}`}
                              checked={newMenuData.selectedPlatos.some(p => p.id_plato === plato.id_plato)}
                              onChange={() => {
                                setNewMenuData(prev => ({
                                  ...prev,
                                  selectedPlatos: prev.selectedPlatos.some(p => p.id_plato === plato.id_plato)
                                    ? prev.selectedPlatos.filter(p => p.id_plato !== plato.id_plato)
                                    : [...prev.selectedPlatos, plato]
                                }));
                              }}
                              style={{ marginRight: '0.5rem' }}
                            />
                            <label htmlFor={`plato-${plato.id_plato}`} style={{ flex: 1 }}>
                              {plato.nombre}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </label>
                </div>
                <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                  <button 
                    type="submit" 
                    style={{
                      flex: 1,
                      background: 'var(--gold)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Crear Menú
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowCreateMenuModal(false);
                      setError(null);
                    }}
                    style={{
                      flex: 1,
                      background: '#eee',
                      color: '#333',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.8rem',
                      cursor: 'pointer'
                    }}
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
                      value={formData.id_evento}
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
                      value={formData.personas_catering}
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
                      value={formData.precioneto_catering}
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
                      value={formData.itbis_catering}
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
                      value={formData.total_catering}
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
                        <td>{proveedor.nombre_proveedor}</td>
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
