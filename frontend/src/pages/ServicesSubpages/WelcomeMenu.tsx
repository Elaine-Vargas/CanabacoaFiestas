import React, { useState, useEffect } from 'react';
import '../../styles/welcome-menu.scss';
import { useUser } from '../../context/UserContext';

export type UserRole = 'admin' | 'coordinator' | 'inventory' | 'client';

export type Permission = {
  id: string;
  name: string;
  description: string;
};

export type RolePermissions = {
  [key in UserRole]: Permission[];
};

export type Quotation = {
  client: string;
  status: string;
  date: string;
};

type WelcomeMenuProps = {
  eventsInProcess?: number;
  averageRating?: number;
  totalUsers?: number;
  quotations?: Quotation[];
};

const WelcomeMenu: React.FC<WelcomeMenuProps> = () => {
  const { userRole } = useUser();
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [stats, setStats] = useState({
    eventsInProcess: 0,
    averageRating: 0,
    totalUsers: 0,
    quotations: [] as Quotation[]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos según el rol del usuario
        const response = await fetch(`/api/dashboard/${userRole}`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error al obtener datos del dashboard:', error);
      }
    };

    fetchData();
  }, [userRole]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment,
          rating,
          userId: localStorage.getItem('userId'), // Obtener el ID del usuario del localStorage
        }),
      });

      if (response.ok) {
        setShowCommentModal(false);
        setComment('');
        setRating(0);
        // Actualizar los datos del dashboard
        const updatedData = await fetch(`/api/dashboard/${userRole}`);
        const data = await updatedData.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error al enviar el comentario:', error);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return (
      <>
        {'★'.repeat(fullStars)}
        <span className="stars--empty">{'☆'.repeat(emptyStars)}</span>
      </>
    );
  };

  const renderClientDashboard = () => (
    <>
      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Mis Eventos Activos</span>
          <strong className="stat-card__number">{stats.eventsInProcess}</strong>
          <button className="stat-card__seeInfo">Ver detalles</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Total de Eventos Realizados</span>
          <strong className="stat-card__number">{stats.totalUsers}</strong>
          <button className="stat-card__seeInfo">Ver historial</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Comentarios Enviados</span>
          <strong className="stat-card__number">{stats.quotations.length}</strong>
          <button 
              className="stat-card__seeInfo2"
              onClick={() => setShowCommentModal(true)}
            >
              Agregar Comentario
            </button>
        </div>
      </div>

      
      <div className="comment-section">
        <h3>Mis Comentarios</h3>
        <div className="comment-list">
          {stats.quotations.map((comment, index) => (
            <div key={index} className="comment-card">
              <div className="comment-header">
                <div className="user-info">
                  <div className="user-avatar">
                    {comment.client.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{comment.client}</span>
                </div>
                <span className="comment-date">{comment.date}</span>
              </div>
              <div className="comment-rating">
                {renderStars(parseFloat(comment.status))}
              </div>
              <p className="comment-text">{comment.client}</p>
            </div>
          ))}
        </div>
      </div>

      {showCommentModal && (
        <div className="comment-modal">
          <div className="comment-modal__container">
            <button className="comment-modal__close" onClick={() => setShowCommentModal(false)}>×</button>
            <h3 className="comment-modal__title">Agregar Comentario</h3> <br />
            <form className="comment-modal__form" onSubmit={handleCommentSubmit}>
              <div className="comment-modal__rating">
                <span className="comment-modal__rating-label">Calificación:</span>
                <div className="comment-modal__rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= rating ? 'active' : 'inactive'}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <textarea
                className="comment-modal__textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe tu comentario aquí..."
                required
              />
              <div className="comment-modal__buttons">
                <button type="button" className="comment-modal__cancel" onClick={() => setShowCommentModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="comment-modal__submit">
                  Enviar Comentario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  const renderAdminDashboard = () => (
    <>
      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Total de Eventos Activos</span>
          <strong className="stat-card__number">{stats.eventsInProcess}</strong>
          <button className="stat-card__seeInfo">Ver detalles</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Calificación Promedio</span>
          <strong className="stat-card__number">{stats.averageRating.toFixed(1)}</strong>
          <div className="stat-card__stars">{renderStars(stats.averageRating)}</div>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Total de Usuarios</span>
          <strong className="stat-card__number">{stats.totalUsers}</strong>
          <button className="stat-card__seeInfo">Ver usuarios</button>
        </div>
      </div>

      <div className="quotationsSection">
        <h3 className="quotationsTitle">Cotizaciones Recientes</h3>
        <div className="tableContainer">
          {stats.quotations.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {stats.quotations.map((q, index) => (
                  <tr key={index}>
                    <td>{q.client}</td>
                    <td>{q.status}</td>
                    <td>{q.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data-message">No hay cotizaciones recientes</p>
          )}
        </div>
      </div>
    </>
  );

  const renderCoordinatorDashboard = () => (
    <>
      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Eventos Asignados</span>
          <strong className="stat-card__number">{stats.eventsInProcess}</strong>
          <button className="stat-card__seeInfo">Ver eventos</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Calificación Promedio</span>
          <strong className="stat-card__number">{stats.averageRating.toFixed(1)}</strong>
          <div className="stat-card__stars">{renderStars(stats.averageRating)}</div>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Eventos Supervisados</span>
          <strong className="stat-card__number">{stats.totalUsers}</strong>
          <button className="stat-card__seeInfo">Ver historial</button>
        </div>
      </div>
    </>
  );

  const renderInventoryDashboard = () => (
    <>
      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Elementos Disponibles</span>
          <strong className="stat-card__number">{stats.eventsInProcess}</strong>
          <button className="stat-card__seeInfo">Ver inventario</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Elementos en Uso</span>
          <strong className="stat-card__number">{stats.totalUsers}</strong>
          <button className="stat-card__seeInfo">Ver en uso</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Compras Pendientes</span>
          <strong className="stat-card__number">{stats.quotations.length}</strong>
          <button className="stat-card__seeInfo">Ver compras</button>
        </div>
      </div>
    </>
  );

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Bienvenido al Dashboard</h1>
      
      {userRole === 'client' && renderClientDashboard()}
      {userRole === 'admin' && renderAdminDashboard()}
      {userRole === 'coordinator' && renderCoordinatorDashboard()}
      {userRole === 'inventory' && renderInventoryDashboard()}
    </div>
  );
};

export default WelcomeMenu;
