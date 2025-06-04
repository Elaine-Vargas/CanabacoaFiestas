import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import '../../styles/dashboard/ServicesSubpages.scss';
import '../../components/ServiceBase';
import { useUser } from '../../contexts/UserContext';

export type UserRole = 'admin' | 'client' | 'supervisor' | 'inventory';

export type Permission = {
  id: string;
  name: string;
  description: string;
};

export type RolePermissions = {
  [key in UserRole]: Permission[];
};

interface Decor {
  id_decoracion?: number;
  id_evento: number;
  tema_decoracion: string;
  precioneto_decoracion: number;
  itbis_decoracion: number;
  total_decoracion: number;
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

interface DecorStats {
  empleadosEncargados: number;
  eventosConDecoracion: number;
  decoracionesPendintes: number;
  decoracionesCompletadas: number;
}

export default function Decor() {
  const { userRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showModal, setShowModal] = useState(false);
  const [decors, setDecors] = useState<Decor[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [formData, setFormData] = useState<Partial<Decor>>({
    id_evento: 0,
    tema_decoracion: '',
    precioneto_decoracion: 0,
    itbis_decoracion: 0,
    total_decoracion: 0
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [filtroEvento, setFiltroEvento] = useState<string>('');
  const [showEmpleadosModal, setShowEmpleadosModal] = useState(false);
  const [showEventosModal, setShowEventosModal] = useState(false);
  const [showCompletadosModal, setShowCompletadosModal] = useState(false);
  const [empleados] = useState<any[]>([]);
  const [completados] = useState<any[]>([]);
  const [showPendientesModal, setShowPendientesModal] = useState(false);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await fetch(`/api/decor/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/decor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      const response = await fetch('/api/decor');
      const data = await response.json();
      setDecors(data);
      setShowModal(false);
      setFormData({
        id_decoracion: 0,
        id_evento: 0,
        tema_decoracion: '',
        precioneto_decoracion: 0,
        itbis_decoracion: 0,
        total_decoracion: 0
      });
      setEditId(null);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const renderClientView = () => (
    <div className="decor-content">
      <div className="table-section">
        <h4>Mis Decoraciones</h4>
        <div className="search-container">
          <select
            className="escri"
            value={filtroEvento}
            onChange={(e) => setFiltroEvento(e.target.value)}
          >
            <option value="">Todos los eventos</option>
            <option value="recientes">Eventos recientes</option>
            <option value="pendientes">Eventos pendientes</option>
            <option value="completados">Eventos completados</option>
            <option value="cancelados">Eventos cancelados</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Evento</th>
              <th>Tipo de Decoración</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {decors
              .filter(d => 
                eventos.find(e => e.id_evento === d.id_evento)?.tipo_evento
                  .toLowerCase()
                  .includes(filtroEvento.toLowerCase())
              )
              .map((decor) => (
                <tr key={decor.id_decoracion}>
                  <td>{decor.id_decoracion}</td>
                  <td>
                    {eventos.find(e => e.id_evento === decor.id_evento)?.tipo_evento}
                  </td>
                  <td>{decor.tema_decoracion}</td>
                  <td>{decor.tema_decoracion}</td>
                  <td>${decor.precioneto_decoracion}</td>
                  <td>{decor.precioneto_decoracion}</td>
                  <td>{decor.precioneto_decoracion}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEmpleadosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowEmpleadosModal(false)}>×</button>
        <div className="modal-content">
          <h3>Empleados Encargados</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>ID</th>
                  <th>Eventos Participados</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map((empleado) => (
                  <tr key={empleado.id_empleado}>
                    <td>{empleado.nombre}</td>
                    <td>{empleado.id_empleado}</td>
                    <td>{empleado.eventos_participados}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEventosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowEventosModal(false)}>×</button>
        <div className="modal-content">
          <h3>Eventos con Decoración</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                <th>Evento</th>
                <th>Cliente</th>
                <th>Asesor</th>
                <th>Espacio</th>
                <th>Descripción Decoración</th>
                <th>Estado</th>
                <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {decors.map((decor) => {
                  const evento = eventos.find(e => e.id_evento === decor.id_evento);
                  return (
                    <tr key={decor.id_decoracion}>
                      <td>{evento?.tipo_evento}</td>
                      <td>{evento?.nombre_cliente}</td>
                      <td>{evento?.lugar || 'No especificado'}</td>
                      <td>{decor.tema_decoracion}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompletadosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowCompletadosModal(false)}>×</button>
        <div className="modal-content">
          <h3>Decoraciones Completadas</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Número de Empleados</th>
                  <th>Cliente</th>
                </tr>
              </thead>
              <tbody>
                {completados.map((completado) => (
                  <tr key={completado.id_decoracion}>
                    <td>{completado.nombre_evento}</td>
                    <td>{completado.fecha_inicio}</td>
                    <td>{completado.fecha_fin}</td>
                    <td>{completado.num_empleados}</td>
                    <td>{completado.nombre_cliente}</td>
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
          <h3>Decoraciones Pendientes</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                <th>Evento</th>
                      <th>Cliente</th>
                      <th>Asesor</th>
                      <th>Espacio</th>
                      <th>Descripción Decoración</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {decors
                  .filter(decor => decor.precioneto_decoracion === 0)
                  .map((decor) => {
                    const evento = eventos.find(e => e.id_evento === decor.id_evento);
                    return (
                      <tr key={decor.id_decoracion}>
                        <td>{evento?.tipo_evento}</td>
                        <td>{evento?.nombre_cliente}</td>
                        <td>{evento?.lugar || 'No especificado'}</td>
                        <td>{decor.tema_decoracion}</td>
                        <td>
                          <span className={`estado-badge ${decor.precioneto_decoracion === 0 ? 'pendiente' : 'completado'}`}>
                            {decor.precioneto_decoracion === 0 ? 'Pendiente' : 'Completado'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminView = () => {
    return (
      <div className="decor-content">
        <div className="dashboard__stats">

          <div className="stat-card">
            <span className="stat-card__label">Eventos con Decoración</span>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowEventosModal(true)}
            >
              Ver eventos
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Decoraciones Pendientes</span>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowPendientesModal(true)}
            >
              Ver pendientes
            </button>
          </div>
        </div>

        {showEventosModal && renderEventosModal()}
        {showPendientesModal && renderPendientesModal()}

        <center>
        <button className="new-form-btn" onClick={() => setShowModal(true)}>
          Agregar Servicio de Decoración
        </button>
        </center>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
              <form className="modal-form" onSubmit={handleSubmit}>
                <h2>{editId ? 'Editar Decoración' : 'Nueva Decoración'}</h2>
                
                <div className="form-grid">
                  <label>
                    <span>Evento:</span>
                    <select
                      name="id_evento"
                      value={formData.id_evento || ''}
                      onChange={handleSelectChange}
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

                  <label className="full-width">
                    <span>Tema de Decoración:</span>
                    <textarea
                      name="tema_decoracion"
                      value={formData.tema_decoracion || ''}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Describe el tema y detalles de la decoración..."
                    />
                  </label>

                  <label>
                    <span>Precio Neto:</span>
                    <input
                      type="number"
                      name="precioneto_decoracion"
                      value={formData.precioneto_decoracion || ''}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </label>

                  <label>
                    <span>ITBIS:</span>
                    <input
                      type="number"
                      name="itbis_decoracion"
                      value={formData.itbis_decoracion || ''}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </label>

                  <label>
                    <span>Total:</span>
                    <input
                      type="number"
                      name="total_decoracion"
                      value={formData.total_decoracion || ''}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
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
    <div className="decor-content">
      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Eventos en los que participé</span>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowEventosModal(true)}
          >
            Ver eventos
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Decoraciones Pendientes</span>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowPendientesModal(true)}
          >
            Ver pendientes
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Personal Encargado</span>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowEmpleadosModal(true)}
          >
            Ver personal
          </button>
        </div>
      </div>

      <center>
        <button className="new-form-btn" onClick={() => setShowModal(true)}>
          Agregar Servicio de Decoración
        </button>
        </center>

      {showEventosModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowEventosModal(false)}>×</button>
            <div className="modal-content">
              <h3>Eventos con Decoración</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Cliente</th>
                      <th>Asesor</th>
                      <th>Espacio</th>
                      <th>Descripción Decoración</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decors.map((decor) => {
                      const evento = eventos.find(e => e.id_evento === decor.id_evento);
                      return (
                        <tr key={decor.id_decoracion}>
                          <td>{evento?.tipo_evento}</td>
                          <td>{evento?.nombre_cliente}</td>
                          <td>{evento?.lugar || 'No especificado'}</td>
                          <td>{decor.tema_decoracion}</td>
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

      {showEmpleadosModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowEmpleadosModal(false)}>×</button>
            <div className="modal-content">
              <h3>Personal Encargado</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Cédula</th>
                      <th>Contacto</th>
                      <th>Total de Eventos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleados.map((empleado) => (
                      <tr key={empleado.id_empleado}>
                        <td>{empleado.nombre}</td>
                        <td>{empleado.apellido}</td>
                        <td>{empleado.cedula}</td>
                        <td>{empleado.contacto}</td>
                        <td>{empleado.total_eventos}</td>
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

  return (
    <div className="decor-page">
      <div className="welcome-header">
        <h1>Gestión de Decoración</h1>
        <p>Gestiona los servicios de decoración para eventos</p>
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            <form className="modal-form" onSubmit={handleSubmit}>
              <h2>{editId ? 'Editar Decoración' : 'Nueva Decoración'}</h2>
              
              <div className="form-grid">
                <label>
                  <span>Evento:</span>
                  <select
                    name="id_evento"
                    value={formData.id_evento || ''}
                    onChange={handleSelectChange}
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

                <label className="full-width">
                  <span>Tema de Decoración:</span>
                  <textarea
                    name="tema_decoracion"
                    value={formData.tema_decoracion || ''}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Describe el tema y detalles de la decoración..."
                  />
                </label>

                <label>
                  <span>Precio Neto:</span>
                  <input
                    type="number"
                    name="precioneto_decoracion"
                    value={formData.precioneto_decoracion || ''}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </label>

                <label>
                  <span>ITBIS:</span>
                  <input
                    type="number"
                    name="itbis_decoracion"
                    value={formData.itbis_decoracion || ''}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </label>

                <label>
                  <span>Total:</span>
                  <input
                    type="number"
                    name="total_decoracion"
                    value={formData.total_decoracion || ''}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
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
}
