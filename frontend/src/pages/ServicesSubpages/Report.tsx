import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useUser } from '../../contexts/UserContext';

// Lazy loading de componentes
const ReportAdmin = lazy(() => import('../../components/DashboardComponents/Report/ReportAdmin'));
const ReportClient = lazy(() => import('../../components/DashboardComponents/Report/ReportClient'));
const ReportEmployee = lazy(() => import('../../components/DashboardComponents/Report/ReportEmployee'));

// Definición de roles
export type UserRole = 'admin' | 'cliente' | 'empleado' ;

const Report: React.FC = () => {
  const { userRole } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userRole) {
      setIsLoading(false);
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
        return <div>Rol no válido: {userRole}</div>;
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
