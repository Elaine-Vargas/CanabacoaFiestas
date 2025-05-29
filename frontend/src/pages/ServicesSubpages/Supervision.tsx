import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "../../styles/supervision.scss";
import "../../styles/services-subpages.scss";
import { useUser } from "../../context/UserContext";

type SupervisionForm = {
  evento: string;
  tarifaHora: string;
  precioNeto: string;
  itbis: string;
  total: string;
  supervisor_id?: string;
  horas_trabajo?: string;
  estado?: string;
};

type Evento = {
  id_evento: number;
  fecha_evento: string;
  hora_evento: string;
  estado_evento: string;
  tipo_evento: string;
  nota_cliente: string;
};

type Supervisor = {
  id: number;
  nombre: string;
  especialidad: string;
  tarifa_hora: number;
};

type SupervisionProps = {
  eventosSupervisados?: number;
  eventosParticipados?: number;
  horasTrabajadas?: number;
  supervisores?: any[];
};

const Supervision: React.FC<SupervisionProps> = ({
  eventosSupervisados,
  eventosParticipados,
  horasTrabajadas,
  supervisores
}) => {
  const { userRole, hasPermission, user } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<SupervisionForm>>({});
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [filtroEvento, setFiltroEvento] = useState("");
  const [filtroSupervisor, setFiltroSupervisor] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
  const [showSupervisorDetails, setShowSupervisorDetails] = useState(false);
  const [showEventosModal, setShowEventosModal] = useState(false);
  const [showSupervisoresModal, setShowSupervisoresModal] = useState(false);
  const [showHorasModal, setShowHorasModal] = useState(false);
  const [showPendientesModal, setShowPendientesModal] = useState(false);

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

    // Si se selecciona un supervisor, actualizar la tarifa por hora
    if (name === 'supervisor_id') {
      const supervisor = supervisores?.find(s => s.id.toString() === value);
      if (supervisor) {
        setFormData(prev => ({
          ...prev,
          tarifaHora: supervisor.tarifa_hora.toString()
        }));
      }
    }

    // Calcular totales si se modifican horas o tarifa
    if (name === 'horas_trabajo' || name === 'tarifaHora') {
      const horas = parseFloat(formData.horas_trabajo || '0');
      const tarifa = parseFloat(formData.tarifaHora || '0');
      const precioNeto = horas * tarifa;
      const itbis = precioNeto * 0.18;
      const total = precioNeto + itbis;

      setFormData(prev => ({
        ...prev,
        precioNeto: precioNeto.toFixed(2),
        itbis: itbis.toFixed(2),
        total: total.toFixed(2)
      }));
    }
  };

  const handleSupervisorClick = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    setShowSupervisorDetails(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (userRole === 'client' && !hasPermission('crear_supervision')) {
      alert('No tienes permiso para crear supervisión');
      return;
    }
    alert("Formulario enviado (simulado)");
    setShowForm(false);
    setFormData({});
  };

  const handleReset = () => {
    setFormData({});
    setSelectedSupervisor(null);
  };

  const canEditSupervision = hasPermission('editar_supervision');
  const canCreateSupervision = hasPermission('crear_supervision');

  const renderDashboard = () => {
    const role = user?.rol?.nombre;

    if (role === 'cliente') {
      return (
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Eventos Supervisados</span>
            <span className="stat-card__number">{eventosSupervisados?.length || 0}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowEventosModal(true)}>
              Ver Eventos
            </button>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Supervisores Asignados</span>
            <span className="stat-card__number">{supervisores?.length || 0}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowSupervisoresModal(true)}>
              Ver Supervisores
            </button>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Horas de Supervisión</span>
            <span className="stat-card__number">{horasTrabajadas || 0}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowHorasModal(true)}>
              Ver Detalles
            </button>
          </div>
        </div>
      );
    }

    if (role === 'administrador') {
      return (
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Total Eventos</span>
            <span className="stat-card__number">{eventosSupervisados?.length || 0}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowEventosModal(true)}>
              Gestionar Eventos
            </button>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Total Supervisores</span>
            <span className="stat-card__number">{supervisores?.length || 0}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowSupervisoresModal(true)}>
              Gestionar Supervisores
            </button>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Horas Totales</span>
            <span className="stat-card__number">{horasTrabajadas || 0}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowHorasModal(true)}>
              Ver Reportes
            </button>
          </div>
        </div>
      );
    }

    if (role === 'supervisor') {
      return (
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Mis Eventos</span>
            <span className="stat-card__number">{eventosParticipados?.length || 0}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowEventosModal(true)}>
              Ver Eventos
            </button>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Horas Trabajadas</span>
            <span className="stat-card__number">{horasTrabajadas || 0}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowHorasModal(true)}>
              Ver Detalles
            </button>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Eventos Pendientes</span>
            <span className="stat-card__number">{eventosParticipados?.filter(e => !e.completado)?.length || 0}</span>
            <button className="stat-card__seeInfo" onClick={() => setShowPendientesModal(true)}>
              Ver Pendientes
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Supervisión</h1>

      {renderDashboard()}

      {showForm && (
        <div className="modalOverlay">
          <div className="modalContainer">
            <button className="closeButton" onClick={() => setShowForm(false)}>
              ×
            </button>

            <div className="modal-form">
              <h3 className="form-title">
                {canEditSupervision ? 'Formulario de Supervisión' : 'Crear Nueva Supervisión'}
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
                    disabled={!canEditSupervision}
                  />
                </label>

                {canEditSupervision && (
                  <>
                    <label>
                      Supervisor
                      <select 
                        name="supervisor_id" 
                        value={formData.supervisor_id || ""} 
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccionar supervisor...</option>
                        {supervisores?.map(supervisor => (
                          <option key={supervisor.id} value={supervisor.id}>
                            {supervisor.nombre} - {supervisor.especialidad}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Tarifa por hora
                      <input 
                        type="number" 
                        name="tarifaHora" 
                        value={formData.tarifaHora || ""} 
                        onChange={handleChange} 
                        required 
                        disabled
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
                        min="1"
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
                        disabled
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
                        disabled
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
                        disabled
                      />
                    </label>

                    <label>
                      Estado
                      <select 
                        name="estado" 
                        value={formData.estado || ""} 
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccionar estado...</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="en_proceso">En Proceso</option>
                        <option value="completado">Completado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </label>
                  </>
                )}

                <div className="form-buttons">
                  <button type="submit" className="submitBtn">Guardar</button>
                  <button type="button" className="resetBtn" onClick={handleReset}>Limpiar</button>
                </div>
              </form>
            </div>

            <div className="tables-container">
              {canEditSupervision && (
                <>
                  <div className="table-section">
                    <p>Supervisores Disponibles</p>
                    <input
                      type="text"
                      placeholder="Buscar supervisor por nombre o especialidad..."
                      value={filtroSupervisor}
                      onChange={(e) => setFiltroSupervisor(e.target.value)}
                      className="search-input"
                    />
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nombre</th>
                          <th>Especialidad</th>
                          <th>Tarifa/Hora</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supervisores
                          ?.filter((s) =>
                            Object.values(s).join(" ").toLowerCase().includes(filtroSupervisor.toLowerCase())
                          )
                          .map((s) => (
                            <tr key={s.id}>
                              <td>{s.id}</td>
                              <td>{s.nombre}</td>
                              <td>{s.especialidad}</td>
                              <td>${s.tarifa_hora}</td>
                              <td>
                                <button 
                                  className="edit-btn"
                                  onClick={() => handleSupervisorClick(s)}
                                >
                                  Ver Detalles
                                </button>
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
                      className="search-input"
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
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showSupervisorDetails && selectedSupervisor && (
        <div className="modalOverlay">
          <div className="modalContainer supervisor-details">
            <button className="closeButton" onClick={() => setShowSupervisorDetails(false)}>
              ×
            </button>
            <h3>Detalles del Supervisor</h3>
            <div className="supervisor-info">
              <p><strong>Nombre:</strong> {selectedSupervisor.nombre}</p>
              <p><strong>Especialidad:</strong> {selectedSupervisor.especialidad}</p>
              <p><strong>Tarifa por Hora:</strong> ${selectedSupervisor.tarifa_hora}</p>
            </div>
            <button 
              className="select-supervisor-btn"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  supervisor_id: selectedSupervisor.id.toString(),
                  tarifaHora: selectedSupervisor.tarifa_hora.toString()
                }));
                setShowSupervisorDetails(false);
              }}
            >
              Seleccionar Supervisor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Supervision;
