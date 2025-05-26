import React from 'react';
import '../../styles/welcome-menu.scss';

export type Quotation = {
  client: string;
  status: string;
  date: string;
};

type WelcomeMenuProps = {
  eventsInProcess: number;
  averageRating: number;
  totalUsers: number;
  quotations: Quotation[];
};

const WelcomeMenu: React.FC<WelcomeMenuProps> = ({
  eventsInProcess,
  averageRating,
  totalUsers,
  quotations,
}) => {
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

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Bienvenido al Dashboard</h1>

      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Eventos en proceso</span>
          <strong className="stat-card__number">{eventsInProcess}</strong> <br />
          <button className="stat-card__seeInfo2">Ver datos</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Calificación promedio</span>
          <strong className="stat-card__number">{averageRating.toFixed(1)}</strong>
          <div className="stat-card__stars">{renderStars(averageRating)}</div>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Usuarios registrados</span>
          <strong className="stat-card__number">{totalUsers}</strong> <br />
          <button className="stat-card__seeInfo2">Ver datos</button>
        </div>
      </div>

      <div className="quotationsSection">
        <h3 className="quotationsTitle">Cotizaciones</h3>
        <div className="tableContainer">
          {quotations.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Fecha pedido</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((q, index) => (
                  <tr key={index}>
                    <td>{q.client}</td>
                    <td>{q.status}</td>
                    <td>{q.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data-message">No hay datos registrados</p>
          )}
        </div>
        {quotations.length > 0 && (
          <button className="seeAllButton">Ver todo</button>
          )}
      </div>
    </div>
  );
};

export default WelcomeMenu;
