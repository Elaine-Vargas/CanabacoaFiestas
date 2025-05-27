import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "../../styles/assembly-disassembly.scss";
import "../../styles/services-subpages.scss";

type MontajeDesmontaje = {
  id_montdes: number;
  id_evento: number;
  precio_neto: number;
  itbis: number;
  total: number;
};

type DetalleMontaje = {
  id_detalle_montaje: number;
  id_montdes: number;
  cedula_usuariopersonal: string;
  horas_trabajo: number;
  precioneto_montaje: number;
};

type Evento = {
  id_evento: number;
  fecha_evento: string;
  hora_evento: string;
  estado_evento: string;
  tipo_evento: string;
  nota_cliente: string;
};

type AssemblyAndDisassemblyProps = {
  totalServicios: number;
  horasTrabajadas: number;
  personalActivo: number;
};

export default function AssemblyAndDisassembly({
  totalServicios = 0,
  horasTrabajadas = 0,
  personalActivo = 0,
}: AssemblyAndDisassemblyProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<MontajeDesmontaje & DetalleMontaje>>({});
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [filtroEvento, setFiltroEvento] = useState("");
  const [montajes, setMontajes] = useState<(MontajeDesmontaje & DetalleMontaje)[]>([]);

  useEffect(() => {
    // Cargar eventos
    fetch("/api/eventos")
      .then((res) => res.json())
      .then((data) => setEventos(data));

    // Cargar montajes
    fetch("/api/montajes")
      .then((res) => res.json())
      .then((data) => setMontajes(data))
      .catch((error) => console.error("Error cargando montajes:", error));
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["id_evento", "precio_neto", "itbis", "total", "horas_trabajo", "precioneto_montaje"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar en la base de datos
    const nuevoMontaje = {
      ...formData,
      id_montdes: montajes.length + 1, // Esto sería manejado por el backend
    } as MontajeDesmontaje & DetalleMontaje;

    setMontajes((prev) => [...prev, nuevoMontaje]);
    setShowForm(false);
    setFormData({});
  };

  const handleReset = () => {
    setFormData({});
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Montaje y Desmontaje</h1>

      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Total de Servicios</span>
          <strong className="stat-card__number">{totalServicios}</strong>
          <br />
          <button className="stat-card__seeInfo">Ver datos</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Horas Trabajadas</span>
          <strong className="stat-card__number">{horasTrabajadas}</strong>
          <br />
          <button className="stat-card__seeInfo">Ver datos</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Personal Activo</span>
          <strong className="stat-card__number">{personalActivo}</strong>
          <br />
          <button className="stat-card__seeInfo2" onClick={() => setShowForm(true)}>
            Agregar Servicio
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
              <h3 className="form-title">Formulario de Montaje y Desmontaje</h3>
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
                  Precio Neto
                  <input
                    type="number"
                    name="precio_neto"
                    value={formData.precio_neto || ""}
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
                  Total
                  <input
                    type="number"
                    name="total"
                    value={formData.total || ""}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Cédula del usuario
                  <input
                    type="text"
                    name="cedula_usuariopersonal"
                    value={formData.cedula_usuariopersonal || ""}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Horas de trabajo
                  <input
                    type="number"
                    name="horas_trabajo"
                    value={formData.horas_trabajo || ""}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Precio neto montaje
                  <input
                    type="number"
                    name="precioneto_montaje"
                    value={formData.precioneto_montaje || ""}
                    onChange={handleChange}
                    required
                  />
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
                <p>Eventos Disponibles</p>
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

              <div className="table-section">
                <p>Servicios Registrados</p>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>ID Evento</th>
                      <th>Precio Neto</th>
                      <th>ITBIS</th>
                      <th>Total</th>
                      <th>Cédula Usuario</th>
                      <th>Horas Trabajo</th>
                      <th>Precio Neto Montaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {montajes.map((montaje) => (
                      <tr key={montaje.id_montdes}>
                        <td>{montaje.id_montdes}</td>
                        <td>{montaje.id_evento}</td>
                        <td>{montaje.precio_neto}</td>
                        <td>{montaje.itbis}</td>
                        <td>{montaje.total}</td>
                        <td>{montaje.cedula_usuariopersonal}</td>
                        <td>{montaje.horas_trabajo}</td>
                        <td>{montaje.precioneto_montaje}</td>
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
}
