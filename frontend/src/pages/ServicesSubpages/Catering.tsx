import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "../../styles/catering.scss";
import "../../styles/services-subpages.scss";

type Proveedor = {
  nombre: string;
  direccion: string;
};

type Menu = {
  id: string;
  descripcion: string;
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
};

type CateringProps = {
  menuVarieties: number;
  activeProveedor: number;
  completedOrders: number;
  proveedor: Proveedor[];
  menus: Menu[];
};

const Catering: React.FC<CateringProps> = ({
  menuVarieties,
  activeProveedor,
  completedOrders,
  menus,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<CateringForm>>({});
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [filtroEvento, setFiltroEvento] = useState("");
  const [filtroMenu, setFiltroMenu] = useState("");

  useEffect(() => {
    fetch("/api/eventos")
      .then((res) => res.json())
      .then((data) => setEventos(data));
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert("Formulario enviado (simulado)");
    setShowForm(false);
    setFormData({});
  };

  const handleReset = () => {
    setFormData({});
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Catering</h1>

      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Variedades de menú</span>
          <strong className="stat-card__number">{menuVarieties}</strong>
          <br />
          <button className="stat-card__seeInfo">Ver datos</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Proveedores activos</span>
          <strong className="stat-card__number">{activeProveedor}</strong>
          <br />
          <button className="stat-card__seeInfo">Ver datos</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Pedidos realizados</span>
          <strong className="stat-card__number">{completedOrders}</strong>
          <br />
          <button className="stat-card__seeInfo2" onClick={() => setShowForm(true)}>
            Agregar Catering
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modalOverlay">
          <div className="modalContainer" style={{ display: "flex", gap: "20px" }}>
            <button className="closeButton" onClick={() => setShowForm(false)}>
              ×
            </button>

            {/* Formulario */}
            <div className="modal-form" style={{ flex: 1 }}>
              <h3 className="form-title">Formulario de Catering</h3>
              <form onSubmit={handleSubmit}>
                <label>
                  Evento relacionado
                  <input type="text" name="evento" value={formData.evento || ""} onChange={handleChange} required />
                </label>

                <label>
                  Proveedor
                  <input type="text" name="proveedor" value={formData.proveedor || ""} onChange={handleChange} required />
                </label>

                <label>
                  Descripción de la comida
                  <input type="text" name="descripcion" value={formData.descripcion || ""} onChange={handleChange} required />
                </label>

                <label>
                  Precio Neto
                  <input type="number" name="precioNeto" value={formData.precioNeto || ""} onChange={handleChange} required />
                </label>

                <label>
                  ITBIS
                  <input type="number" name="itbis" value={formData.itbis || ""} onChange={handleChange} required />
                </label>

                <label>
                  Precio Total
                  <input type="number" name="total" value={formData.total || ""} onChange={handleChange} required />
                </label>

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
                    </tr>
                  </thead>
                  <tbody>
                    {menus
                      .filter((m) =>
                        Object.values(m).join(" ").toLowerCase().includes(filtroMenu.toLowerCase())
                      )
                      .map((m, index) => (
                        <tr key={index}>
                          <td>{m.id}</td>
                          <td>{m.descripcion}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catering;
