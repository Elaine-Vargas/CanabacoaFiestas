import { useState, ChangeEvent, FormEvent } from "react";
import "../../styles/decor.scss";
import "../../styles/services-subpages.scss";

type DecorItem = {
  id_decoracion: number;
  id_evento: number;
  tema_decoracion: string;
  id_espacio: number;
  precio_neto: number;
  itbis_decoracion: number;
  total_decoracion: number;
};

type Evento = {
  id_evento: number;
  fecha_evento: string;
  hora_evento: string;
  estado_evento: string;
  tipo_evento: string;
  nota_cliente: string;
};

export default function Decor() {
  const [showModal, setShowModal] = useState(false);
  const [decorItems, setDecorItems] = useState<DecorItem[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [filtroEvento, setFiltroEvento] = useState("");
  const [formData, setFormData] = useState<Partial<DecorItem>>({});

  // Si tuvieras endpoint real, en useEffect cargarías eventos
  // useEffect(() => {
  //   fetch("/api/eventos")
  //     .then(res => res.json())
  //     .then(data => setEventos(data));
  // }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        ["id_evento", "id_espacio", "precio_neto", "itbis_decoracion", "total_decoracion"].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (formData.id_decoracion != null) {
      // Editar existente
      setDecorItems(prev =>
        prev.map(item =>
          item.id_decoracion === formData.id_decoracion
            ? ({
                id_decoracion: formData.id_decoracion!,
                id_evento: formData.id_evento!,
                tema_decoracion: formData.tema_decoracion!,
                id_espacio: formData.id_espacio!,
                precio_neto: formData.precio_neto!,
                itbis_decoracion: formData.itbis_decoracion!,
                total_decoracion: formData.total_decoracion!,
              } as DecorItem)
            : item
        )
      );
    } else {
      // Agregar nuevo
      const newItem: DecorItem = {
        id_decoracion: Math.max(0, ...decorItems.map(i => i.id_decoracion)) + 1,
        id_evento: formData.id_evento!,
        tema_decoracion: formData.tema_decoracion!,
        id_espacio: formData.id_espacio!,
        precio_neto: formData.precio_neto!,
        itbis_decoracion: formData.itbis_decoracion!,
        total_decoracion: formData.total_decoracion!,
      };
      setDecorItems(prev => [...prev, newItem]);
    }
    setFormData({});
    setShowModal(false);
  };

  const handleReset = () => {
    setFormData({});
  };

  const handleEdit = (item: DecorItem) => {
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Seguro que quieres eliminar esta decoración?")) {
      setDecorItems(prev => prev.filter(item => item.id_decoracion !== id));
    }
  };

  return (
    <div className="dashboard-container">
      <div className="content-area">
        <h1>Decoración</h1>
        <div style={{ height: "20px" }}></div>
        <button onClick={() => { setFormData({}); setShowModal(true); }} className="open-modal-btn">
          Agregar Decoración
        </button>
        <div style={{ height: "40px" }}></div>

        {/* Tabla principal de Decoración */}
        <div className="table-section">
          <p>Decoración</p>
          <table>
            <thead>
              <tr>
                <th>ID Decoración</th>
                <th>ID Evento</th>
                <th>Tema</th>
                <th>ID Espacio</th>
                <th>Precio Neto</th>
                <th>ITBIS</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {decorItems.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", fontStyle: "italic" }}>
                    No hay datos de decoración.
                  </td>
                </tr>
              ) : (
                decorItems.map(item => (
                  <tr key={item.id_decoracion}>
                    <td>{item.id_decoracion}</td>
                    <td>{item.id_evento}</td>
                    <td>{item.tema_decoracion}</td>
                    <td>{item.id_espacio}</td>
                    <td>{item.precio_neto}</td>
                    <td>{item.itbis_decoracion}</td>
                    <td>{item.total_decoracion}</td>
                    <td>
                      <button onClick={() => handleEdit(item)} className="edit-btn">Editar</button>
                      <button onClick={() => handleDelete(item.id_decoracion)} className="delete-btn">Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-container decor" style={{ display: "flex", gap: "20px" }}>
              <button onClick={() => setShowModal(false)} className="close-btn">×</button>

              {/* Formulario de Decoración (izquierda) */}
              <div className="modal-form" style={{ flex: "1" }}>
                <h3>{formData.id_decoracion != null ? "Editar Decoración" : "Nueva Decoración"}</h3>
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
                    Tema de Decoración
                    <input
                      type="text"
                      name="tema_decoracion"
                      value={formData.tema_decoracion || ""}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    ID Espacio
                    <input
                      type="number"
                      name="id_espacio"
                      value={formData.id_espacio || ""}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Precio Neto
                    <input
                      type="number"
                      name="precio_neto"
                      value={formData.precio_neto || ""}
                      onChange={handleChange}
                      required
                      min={0}
                    />
                  </label>

                  <label>
                    ITBIS
                    <input
                      type="number"
                      name="itbis_decoracion"
                      value={formData.itbis_decoracion || ""}
                      onChange={handleChange}
                      required
                      min={0}
                    />
                  </label>

                  <label>
                    Total
                    <input
                      type="number"
                      name="total_decoracion"
                      value={formData.total_decoracion || ""}
                      onChange={handleChange}
                      required
                      min={0}
                    />
                  </label>

                  <div className="form-buttons">
                    <button type="submit" className="submit-btn">Guardar</button>
                    <button type="button" className="reset-btn" onClick={handleReset}>Limpiar</button>
                  </div>
                </form>
              </div>

              {/* Lado derecho: Tablas de Evento y Espacio */}
              <div className="tables-container" style={{ flex: "1", display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Tabla de Eventos con buscador */}
                <div className="table-section">
                  <p>Eventos Disponibles</p>
                  <input
                    type="text"
                    placeholder="Buscar por ID, estado, fecha..."
                    value={filtroEvento}
                    onChange={(e) => setFiltroEvento(e.target.value)}
                    style={{
                      marginBottom: "10px",
                      marginTop: "10px",
                      marginRight: "10px",
                      width: "calc(100% - 20px)",
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
                      {eventos.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", fontStyle: "italic" }}>
                            No hay datos de eventos.
                          </td>
                        </tr>
                      ) : (
                        eventos
                          .filter(ev =>
                            Object.values(ev).join(" ").toLowerCase().includes(filtroEvento.toLowerCase())
                          )
                          .map(ev => (
                            <tr key={ev.id_evento}>
                              <td>{ev.id_evento}</td>
                              <td>{ev.fecha_evento}</td>
                              <td>{ev.hora_evento}</td>
                              <td>{ev.estado_evento}</td>
                              <td>{ev.tipo_evento}</td>
                              <td>{ev.nota_cliente}</td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Tabla estática de Espacio */}
                <div className="table-section">
                  <p>Espacio</p>
                  <input
                    type="text"
                    placeholder="Buscar por área, capacidad..."
                    style={{
                      marginBottom: "10px",
                      marginTop: "10px",
                      marginRight: "10px",
                      width: "calc(100% - 20px)",
                    }}
                  />
                  <table>
                    <thead>
                      <tr>
                        <th>ID Espacio</th>
                        <th>Nombre</th>
                        <th>Teléfono</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", fontStyle: "italic" }}>
                          Sin datos de espacios disponibles.
                        </td>
                      </tr>
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
