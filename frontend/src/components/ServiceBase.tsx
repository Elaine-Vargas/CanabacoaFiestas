import React from 'react';
import { useUser } from '../context/UserContext';
import '../styles/services-subpages.scss';

export type UserRole = 'admin' | 'coordinator' | 'inventory' | 'client';

interface ServiceBaseProps {
  title: string;
  children: React.ReactNode;
  stats: {
    eventsInProcess: number;
    averageRating: number;
    totalUsers: number;
    quotations: any[];
  };
}

const ServiceBase: React.FC<ServiceBaseProps> = ({ title, children, stats }) => {
  const { userRole } = useUser();

  return (
    <div className="service-base">
      <h1 className="service-title">{title}</h1>
      
      {userRole !== 'client' && (
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Eventos en Proceso</span>
            <strong className="stat-card__number">{stats.eventsInProcess}</strong>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Calificación Promedio</span>
            <strong className="stat-card__number">{stats.averageRating.toFixed(1)}</strong>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Total de Usuarios</span>
            <strong className="stat-card__number">{stats.totalUsers}</strong>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export default ServiceBase; 