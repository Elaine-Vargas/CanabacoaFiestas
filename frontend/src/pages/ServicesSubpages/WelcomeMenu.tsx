import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useUser } from '../../contexts/UserContext';

// Lazy loading de componentes
const WelcomeAdmin = lazy(() => import('../../components/DashboardComponents/Welcome/WelcomeAdmin'));
const WelcomeClient = lazy(() => import('../../components/DashboardComponents/Welcome/WelcomeClient'));
const WelcomeEmployee = lazy(() => import('../../components/DashboardComponents/Welcome/WelcomeEmployee'));
const WelcomeDriver = lazy(() => import('../../components/DashboardComponents/Welcome/WelcomeDriver'));

// Definición de roles
export type UserRole = 'admin' | 'client' | 'empleado'| 'chofer' ;

interface UserData {
  rol: string;
  // Agrega aquí otros campos que necesites
}

const Welcome: React.FC = () => {
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
        return <WelcomeAdmin />;
      case 'client':
        return <WelcomeClient />;
      case 'supervisor':
        return <WelcomeEmployee />;
      case 'chofer':
        return <WelcomeDriver />;
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

export default Welcome;