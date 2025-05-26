import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import "../../styles/rent.scss";
import "../../styles/fonts.scss";
import "../../styles/services-subpages.scss";

type Evento = {
  id_evento: number;
  fecha_evento: string;
  hora_evento: string;
  estado_evento: string;
  tipo_evento: string;
  nota_cliente: string;
};

type Elemento = {
  id_elemento: number;
  subcategoria: string;
  material: string;
  color: string;
  cantidad_total: number;
  cantidad_disponible: number;
  estado_elemento: string;
};

type Alquiler = {
  id_evento: number;
  id_elemento: number;
  precio_unitario: string;
  cantidad: string;
  precio_neto: string;
  itbis: string;
  total_alquiler: string;
};

export default function Rent() {
  const [showForm, setShowForm] = useState(false);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [filtroEvento, setFiltroEvento] = useState("");
  const [filtroElemento, setFiltroElemento] = useState("");
  const [formData, setFormData] = useState<Partial<Alquiler>>({});

  useEffect(() => {
    fetch("/api/eventos")
      .then((res) => res.json())
      .then((data) => setEventos(data));

    fetch("/api/elementos")
      .then((res) => res.json())
      .then((data) => setElementos(data));
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
    alert("Guardado (simulado)!");
    setShowForm(false);
  };

  const handleReset = () => {
    setFormData({});
  };

  const eliminarElemento = (id: number) => {
    if (confirm("¿Seguro que quieres eliminar este elemento?")) {
      setElementos((prev) => prev.filter((el) => el.id_elemento !== id));
    }
  };

  const editarElemento = (elemento: Elemento) => {
    setFormData({
      id_elemento: elemento.id_elemento,
      cantidad: "1",
      precio_unitario: "0",
      precio_neto: "0",
      itbis: "0",
      total_alquiler: "0",
    });
    setShowForm(true);
  };

  return (
    <div className="dashboard-container">
      <div className="content-area">
        <h1>Alquiler</h1>
        <div style={{ height: "20px" }}></div>
        <button onClick={() => setShowForm(true)} className="open-modal-btn">
          Agregar Alquiler
        </button>
        <div style={{ height: "40px" }}></div>

        <div className="table-section">
          <p>Alquileres</p>
          <p style={{ fontStyle: "italic" }}>No hay datos de alquileres aún.</p>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-container" style={{ display: "flex", gap: "20px" }}>
              <button onClick={() => setShowForm(false)} className="close-btn">×</button>

              {/* Formulario */}
              <div className="modal-form" style={{ flex: "1" }}>
                <div style={{ height: "5px" }}></div>
                <h3>Formulario de Alquiler</h3>
                <form onSubmit={handleSubmit}>
                  <label>
                    ID Evento
                    <input
                      type="number"
                      name="id_evento"
                      value={formData.id_evento || ""}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    ID Elemento
                    <input
                      type="number"
                      name="id_elemento"
                      value={formData.id_elemento || ""}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Precio Unitario
                    <input
                      type="text"
                      name="precio_unitario"
                      value={formData.precio_unitario || ""}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Cantidad
                    <input
                      type="number"
                      name="cantidad"
                      value={formData.cantidad || ""}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Precio Neto
                    <input
                      type="text"
                      name="precio_neto"
                      value={formData.precio_neto || ""}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    ITBIS
                    <input
                      type="text"
                      name="itbis"
                      value={formData.itbis || ""}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Total
                    <input
                      type="text"
                      name="total_alquiler"
                      value={formData.total_alquiler || ""}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <div className="form-buttons">
                    <button type="submit" className="submit-btn">Guardar</button>
                    <button type="button" className="reset-btn" onClick={handleReset}>Limpiar</button>
                  </div>
                </form>
              </div>

              {/* Tablas */}
              <div className="tables-container" style={{ flex: "2", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="table-section">
                  <p>Inventario de Elementos</p>
                  <input
  type="text"
  placeholder="Buscar por categoría, material, color..."
  value={filtroElemento}
  onChange={(e) => setFiltroElemento(e.target.value)}
  style={{
    marginBottom: "10px",
    marginTop: "10px", 
    marginRight: "10px", 
    width: "calc(100% - 20px)" 
  }}
/>

                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Subcategoría</th>
                        <th>Material</th>
                        <th>Color</th>
                        <th>Total</th>
                        <th>Disponible</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {elementos
                        .filter((el) =>
                          Object.values(el).join(" ").toLowerCase().includes(filtroElemento.toLowerCase())
                        )
                        .map((el) => (
                          <tr key={el.id_elemento}>
                            <td>{el.id_elemento}</td>
                            <td>{el.subcategoria}</td>
                            <td>{el.material}</td>
                            <td>{el.color}</td>
                            <td>{el.cantidad_total}</td>
                            <td>{el.cantidad_disponible}</td>
                            <td>{el.estado_elemento}</td>
                            <td>
                              <button onClick={() => editarElemento(el)} className="edit-btn">Editar</button>
                              <button onClick={() => eliminarElemento(el.id_elemento)} className="delete-btn">Eliminar</button>
                            </td>
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
                    style={{
    marginBottom: "10px",
    marginTop: "10px", 
    marginRight: "10px", 
    width: "calc(100% - 20px)" 
  }}
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
    </div>
  );
}
