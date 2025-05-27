import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "../../styles/supervision.scss";
import "../../styles/services-subpages.scss";

type SupervisionForm = {
  evento: string;
  tarifaHora: string;
  precioNeto: string;
  itbis: string;
  total: string;
};

type Evento = {
  id_evento: number;
  fecha_evento: string;
  hora_evento: string;
  estado_evento: string;
  tipo_evento: string;
  nota_cliente: string;
};

type SupervisionProps = {
  eventosSupervisados: number;
  eventosParticipados: number;
  horasTrabajadas: number;
};

const Supervision: React.FC<SupervisionProps> = ({
  eventosSupervisados,
  eventosParticipados,
  horasTrabajadas,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<SupervisionForm>>({});
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [filtroEvento, setFiltroEvento] = useState("");

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
      <h1 className="dashboard__title">Supervisión</h1>

      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Eventos Supervisados</span>
          <strong className="stat-card__number">{eventosSupervisados}</strong>
          <br />
          <button className="stat-card__seeInfo">Ver datos</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Eventos Participados</span>
          <strong className="stat-card__number">{eventosParticipados}</strong>
          <br />
          <button className="stat-card__seeInfo">Ver datos</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Horas Trabajadas</span>
          <strong className="stat-card__number">{horasTrabajadas}</strong>
          <br />
          <button className="stat-card__seeInfo2" onClick={() => setShowForm(true)}>
            Agregar Supervisión
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
              <h3 className="form-title">Formulario de Supervisión</h3>
              <form onSubmit={handleSubmit}>
                <label>
                  Evento relacionado
                  <input type="text" name="evento" value={formData.evento || ""} onChange={handleChange} required />
                </label>

                <label>
                  Tarifa por hora
                  <input type="number" name="tarifaHora" value={formData.tarifaHora || ""} onChange={handleChange} required />
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

            {/* Tabla de Eventos */}
            <div className="tables-container" style={{ flex: 2 }}>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Supervision;
