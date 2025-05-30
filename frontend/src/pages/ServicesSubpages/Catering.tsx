import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import '../../styles/services-subpages.scss';
import ServiceBase from '../../components/ServiceBase';
import { useUser } from '../../context/UserContext';

interface Plato {
  id_plato: number;
  desc_plato: string;
}

interface Menu {
  id_menu: number;
  desc_menu: string;
  id_proveedor: number;
  platos: Plato[];
}

interface Catering {
  id_catering: number;
  id_evento: number;
  personas_catering: number;
  precioneto_catering: number;
  itbis_catering: number;
  total_catering: number;
  menus: Menu[];
}

export default function Catering() {
  const { userRole } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [showCreateMenuModal, setShowCreateMenuModal] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEvento, setFiltroEvento] = useState('');
  const [formData, setFormData] = useState<Partial<Catering>>({
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menusRes, platosRes] = await Promise.all([
          fetch('/api/menus'),
          fetch('/api/platos')
        ]);

        const [menusData, platosData] = await Promise.all([
          menusRes.json(),
          platosRes.json()
        ]);

        setMenus(menusData);
        setPlatos(platosData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const response = await fetch('/api/catering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({
          personas_catering: 0,
          precioneto_catering: 0,
          itbis_catering: 0,
          total_catering: 0,
          menus: []
        });
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const renderClientView = () => (
    <div className="catering-content">
      <div className="menu-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar menús..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-select">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="todos">Todos los menús</option>
            <option value="populares">Más populares</option>
            <option value="recientes">Recientes</option>
          </select>
        </div>
        <button 
          className="create-menu-btn"
          onClick={() => setShowCreateMenuModal(true)}
        >
          Crear menú personalizado
        </button>
      </div>

      <div className="menus-grid">
        {menus
          .filter(menu => 
            menu.desc_menu.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(menu => (
            <div key={menu.id_menu} className="menu-card">
              <h3>{menu.desc_menu}</h3>
              <div className="menu-platos">
                {menu.platos.map(plato => (
                  <p key={plato.id_plato}>{plato.desc_plato}</p>
                ))}
              </div>
              <button 
                className="select-menu-btn"
                onClick={() => handleMenuSelect(menu)}
              >
                Seleccionar menú
              </button>
            </div>
          ))}
      </div>

      {showCreateMenuModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowCreateMenuModal(false)}>×</button>
            <form className="modal-form" onSubmit={handleCreateMenu}>
              <h2>Crear Menú Personalizado</h2>
              
              <label>
                Descripción del menú:
                <textarea
                  value={newMenuData.desc_menu}
                  onChange={(e) => setNewMenuData(prev => ({
                    ...prev,
                    desc_menu: e.target.value
                  }))}
                  required
                  rows={4}
                />
              </label>

              <div className="platos-grid">
                {platos.map(plato => (
                  <div
                    key={plato.id_plato}
                    className={`plato-card ${
                      newMenuData.selectedPlatos.some(p => p.id_plato === plato.id_plato) 
                        ? 'selected' 
                        : ''
                    }`}
                    onClick={() => handlePlatoSelect(plato)}
                  >
                    <p>{plato.desc_plato}</p>
                  </div>
                ))}
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  Crear Menú
                </button>
                <button
                  type="button"
                  className="reset-btn"
                  onClick={() => setShowCreateMenuModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            <form className="modal-form" onSubmit={handleSubmit}>
              <h2>Seleccionar Menú para el Evento</h2>
              
              <label>
                Número de personas:
                <input
                  type="number"
                  name="personas_catering"
                  value={formData.personas_catering || ''}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </label>

              <div className="selected-menus">
                <h4>Menús seleccionados:</h4>
                {formData.menus?.map(menu => (
                  <div key={menu.id_menu} className="selected-menu">
                    <p>{menu.desc_menu}</p>
                    <button
                      type="button"
                      onClick={() => handleMenuSelect(menu)}
                      className="remove-menu-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  Confirmar Selección
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

  const renderAdminView = () => (
    <div className="catering-content">
      <button className="new-form-btn" onClick={() => setShowModal(true)}>
        Agregar Servicio
      </button>

      <div className="table-section">
        <p>Servicios de Catering Registrados</p>
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
              <th>Personas</th>
              <th>Precio Neto</th>
              <th>ITBIS</th>
              <th>Total</th>
              <th>Menús</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* Aquí iría la tabla de servicios para administradores */}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <ServiceBase 
      title="Catering" 
      stats={{
        eventsInProcess: 0,
        averageRating: 0,
        totalUsers: 0,
        quotations: []
      }}
    >
      {userRole === 'client' ? renderClientView() : renderAdminView()}
    </ServiceBase>
  );
}
