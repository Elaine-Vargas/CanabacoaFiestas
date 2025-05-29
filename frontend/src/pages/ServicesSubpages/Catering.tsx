import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "../../styles/catering.scss";
import "../../styles/services-subpages.scss";
import { useUser } from "../../context/UserContext";

type Proveedor = {
  id: number;
  nombre: string;
  direccion: string;
};

type Menu = {
  id: string;
  descripcion: string;
  precio: number;
};

type Plato = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  proveedor_id: number;
};

type Evento = {
  id_evento: number;
  fecha_evento: string;
  hora_evento: string;
  estado_evento: string;
  tipo_evento: string;
  nota_cliente: string;
};

type CateringForm = {
  evento: string;
  proveedor: string;
  descripcion: string;
  precioNeto: string;
  itbis: string;
  total: string;
  menu_id?: string;
  platos?: Plato[];
};

type CateringProps = {
  menuVarieties?: Menu[];
  activeProveedor?: Proveedor[];
  completedOrders?: Evento[];
  proveedores?: Proveedor[];
  menus?: Menu[];
  platos?: Plato[];
};

type UserRole = 'cliente' | 'administrador' | 'coordinador';

const Catering: React.FC<CateringProps> = ({
  menuVarieties = [],
  activeProveedor = [],
  completedOrders = [],
  menus = [],
  platos = [],
}) => {
  const { userRole, hasPermission } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<CateringForm>>({});
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [filtroEvento, setFiltroEvento] = useState("");
  const [filtroMenu, setFiltroMenu] = useState("");
  const [selectedPlatos, setSelectedPlatos] = useState<Plato[]>([]);
  const [showPlatoSelector, setShowPlatoSelector] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showProveedoresModal, setShowProveedoresModal] = useState(false);
  const [showPlatosModal, setShowPlatosModal] = useState(false);

  useEffect(() => {
    fetch("/api/eventos")
      .then((res) => res.json())
      .then((data) => setEventos(data));
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (userRole === 'client' && !hasPermission('crear_menu')) {
      alert('No tienes permiso para crear menús');
      return;
    }
    alert("Formulario enviado (simulado)");
    setShowForm(false);
    setFormData({});
  };

  const handleReset = () => {
    setFormData({});
    setSelectedPlatos([]);
  };

  const handlePlatoSelection = (plato: Plato) => {
    setSelectedPlatos(prev => {
      const exists = prev.find(p => p.id === plato.id);
      if (exists) {
        return prev.filter(p => p.id !== plato.id);
      }
      return [...prev, plato];
    });
  };

  const canEditCatering = hasPermission('editar_catering');
  const canCreateMenu = hasPermission('crear_menu');
  const canEditMenu = hasPermission('editar_menu');

  const renderDashboard = () => {
    const role = userRole as UserRole;

    if (role === 'cliente') {
      return (
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Menús Reservados</span>
            <span className="stat-card__number">{menuVarieties.length}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowMenuModal(true)}>
              Ver Menús
            </button>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Pedidos Completados</span>
            <span className="stat-card__number">{completedOrders.length}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowOrdersModal(true)}>
              Ver Pedidos
            </button>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Proveedores Activos</span>
            <span className="stat-card__number">{activeProveedor.length}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowProveedoresModal(true)}>
              Ver Proveedores
            </button>
          </div>
        </div>
      );
    }

    if (role === 'administrador') {
      return (
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Total Menús</span>
            <span className="stat-card__number">{menus.length}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowMenuModal(true)}>
              Gestionar Menús
            </button>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Total Platos</span>
            <span className="stat-card__number">{platos.length}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowPlatosModal(true)}>
              Gestionar Platos
            </button>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Proveedores</span>
            <span className="stat-card__number">{activeProveedor.length}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowProveedoresModal(true)}>
              Gestionar Proveedores
            </button>
          </div>
        </div>
      );
    }

    if (role === 'coordinador') {
      return (
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Menús Asignados</span>
            <span className="stat-card__number">{menuVarieties.length}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowMenuModal(true)}>
              Ver Menús
            </button>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Pedidos Pendientes</span>
            <span className="stat-card__number">
              {completedOrders.filter((order: Evento) => order.estado_evento !== 'completado').length}
            </span>
            <button className="stat-card__seeInfo" onClick={() => setShowOrdersModal(true)}>
              Ver Pedidos
            </button>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Proveedores Activos</span>
            <span className="stat-card__number">{activeProveedor.length}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowProveedoresModal(true)}>
              Ver Proveedores
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Catering</h1>

      {renderDashboard()}

      {showForm && (
        <div className="modalOverlay">
          <div className="modalContainer" style={{ display: "flex", gap: "20px" }}>
            <button className="closeButton" onClick={() => setShowForm(false)}>
              ×
            </button>

            {/* Formulario */}
            <div className="modal-form" style={{ flex: 1 }}>
              <h3 className="form-title">
                {canEditCatering ? 'Formulario de Catering' : 'Crear Nuevo Menú'}
              </h3>
              <form onSubmit={handleSubmit}>
                <label>
                  Evento relacionado
                  <input 
                    type="text" 
                    name="evento" 
                    value={formData.evento || ""} 
                    onChange={handleChange} 
                    required 
                    disabled={!canEditCatering}
                  />
                </label>

                {canEditCatering && (
                  <>
                    <label>
                      Proveedor
                      <input 
                        type="text" 
                        name="proveedor" 
                        value={formData.proveedor || ""} 
                        onChange={handleChange} 
                        required 
                      />
                    </label>

                    <label>
                      Descripción de la comida
                      <input 
                        type="text" 
                        name="descripcion" 
                        value={formData.descripcion || ""} 
                        onChange={handleChange} 
                        required 
                      />
                    </label>

                    <label>
                      Precio Neto
                      <input 
                        type="number" 
                        name="precioNeto" 
                        value={formData.precioNeto || ""} 
                        onChange={handleChange} 
                        required 
                      />
                    </label>

                    <label>
                      ITBIS
                      <input 
                        type="number" 
                        name="itbis" 
                        value={formData.itbis || ""} 
                        onChange={handleChange} 
                        required 
                      />
                    </label>

                    <label>
                      Precio Total
                      <input 
                        type="number" 
                        name="total" 
                        value={formData.total || ""} 
                        onChange={handleChange} 
                        required 
                      />
                    </label>
                  </>
                )}

                {canCreateMenu && (
                  <>
                    <label>
                      Seleccionar Menú Existente
                      <select 
                        name="menu_id" 
                        value={formData.menu_id || ""} 
                        onChange={handleChange}
                      >
                        <option value="">Seleccionar menú...</option>
                        {menus.map(menu => (
                          <option key={menu.id} value={menu.id}>
                            {menu.descripcion} - ${menu.precio}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button 
                      type="button" 
                      onClick={() => setShowPlatoSelector(true)}
                      className="select-platos-btn"
                    >
                      Seleccionar Platos
                    </button>

                    {showPlatoSelector && (
                      <div className="plato-selector">
                        <h4>Seleccionar Platos</h4>
                        <div className="platos-grid">
                          {platos.map(plato => (
                            <div 
                              key={plato.id} 
                              className={`plato-card ${selectedPlatos.find(p => p.id === plato.id) ? 'selected' : ''}`}
                              onClick={() => handlePlatoSelection(plato)}
                            >
                              <h5>{plato.nombre}</h5>
                              <p>{plato.descripcion}</p>
                              <span>${plato.precio}</span>
                            </div>
                          ))}
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setShowPlatoSelector(false)}
                          className="close-plato-selector"
                        >
                          Cerrar Selector
                        </button>
                      </div>
                    )}
                  </>
                )}

                <div className="form-buttons">
                  <button type="submit" className="submitBtn">Guardar</button>
                  <button type="button" className="resetBtn" onClick={handleReset}>Limpiar</button>
                </div>
              </form>
            </div>

            {/* Tablas */}
            <div className="tables-container" style={{ flex: 2, display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="table-section">
                <p>Inventario de Menús</p>
                <input
                  type="text"
                  placeholder="Buscar por ID o descripción..."
                  value={filtroMenu}
                  onChange={(e) => setFiltroMenu(e.target.value)}
                  style={{ margin: "10px 0", width: "100%" }}
                />
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Descripción</th>
                      <th>Precio</th>
                      {canEditMenu && <th>Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {menus
                      .filter((m) =>
                        Object.values(m).join(" ").toLowerCase().includes(filtroMenu.toLowerCase())
                      )
                      .map((m) => (
                        <tr key={m.id}>
                          <td>{m.id}</td>
                          <td>{m.descripcion}</td>
                          <td>${m.precio}</td>
                          {canEditMenu && (
                            <td>
                              <button className="edit-btn">Editar</button>
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {canEditCatering && (
                <div className="table-section">
                  <p>Eventos de los Usuarios</p>
                  <input
                    type="text"
                    placeholder="Buscar evento por ID, estado, fecha..."
                    value={filtroEvento}
                    onChange={(e) => setFiltroEvento(e.target.value)}
                    style={{ margin: "10px 0", width: "100%" }}
                  />
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th>Tipo</th>
                        <th>Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventos
                        .filter((ev) =>
                          Object.values(ev).join(" ").toLowerCase().includes(filtroEvento.toLowerCase())
                        )
                        .map((ev) => (
                          <tr key={ev.id_evento}>
                            <td>{ev.id_evento}</td>
                            <td>{ev.fecha_evento}</td>
                            <td>{ev.hora_evento}</td>
                            <td>{ev.estado_evento}</td>
                            <td>{ev.tipo_evento}</td>
                            <td>{ev.nota_cliente}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      {showMenuModal && (
        <div className="modalOverlay">
          <div className="modalContainer">
            <button className="closeButton" onClick={() => setShowMenuModal(false)}>×</button>
            <h2>Menús</h2>
            {/* Contenido del modal de menús */}
          </div>
        </div>
      )}

      {showOrdersModal && (
        <div className="modalOverlay">
          <div className="modalContainer">
            <button className="closeButton" onClick={() => setShowOrdersModal(false)}>×</button>
            <h2>Pedidos</h2>
            {/* Contenido del modal de pedidos */}
          </div>
        </div>
      )}

      {showProveedoresModal && (
        <div className="modalOverlay">
          <div className="modalContainer">
            <button className="closeButton" onClick={() => setShowProveedoresModal(false)}>×</button>
            <h2>Proveedores</h2>
            {/* Contenido del modal de proveedores */}
          </div>
        </div>
      )}

      {showPlatosModal && (
        <div className="modalOverlay">
          <div className="modalContainer">
            <button className="closeButton" onClick={() => setShowPlatosModal(false)}>×</button>
            <h2>Platos</h2>
            {/* Contenido del modal de platos */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Catering;
