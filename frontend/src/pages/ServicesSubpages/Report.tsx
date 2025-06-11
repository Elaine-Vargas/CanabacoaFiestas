import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useUser } from '../../contexts/UserContext';
import '../../styles/dashboard/ServicesSubpages.scss';

// Lazy loading de componentes
const ReportAdmin = lazy(() => import('../../components/DashboardComponents/Report/ReportAdmin'));
const ReportClient = lazy(() => import('../../components/DashboardComponents/Report/ReportClient'));
const ReportEmployee = lazy(() => import('../../components/DashboardComponents/Report/ReportEmployee'));

export type UserRole = 'admin' | 'cliente' | 'empleado';

const Report: React.FC = () => {
  const { userRole } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Solo establecer loading como false si tenemos un rol válido
    if (userRole && ['admin', 'cliente', 'empleado'].includes(userRole)) {
      setIsLoading(false);
    } else {
      // Si no hay rol válido, redirigir al login
      localStorage.removeItem('userData');
      localStorage.removeItem('token');
      window.location.href = '/Login';
    }
  }, [userRole]);

  const renderComponentByRole = () => {
    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          width: '100%'
        }}>
          <Spin size="large" />
        </div>
      );
    }

    switch (userRole) {
      case 'admin':
        return <ReportAdmin />;
      case 'cliente':
        return <ReportClient />;
      case 'empleado':
        return <ReportEmployee />;
      default:
        return null;
    }
  };

  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        width: '100%'
      }}>
        <Spin size="large" />
      </div>
    }>
      {renderComponentByRole()}
    </Suspense>
  );
};

export default Report;