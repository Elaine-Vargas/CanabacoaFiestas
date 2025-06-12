import React, { lazy, Suspense } from 'react';
import { Modal, Spin } from 'antd';
import { useUser } from '../../contexts/UserContext';

// Importación directa del componente WelcomeEmployee
import WelcomeEmployee from '../../components/DashboardComponents/Welcome/WelcomeEmployee';

// Lazy loading de componentes con manejo de errores
const WelcomeAdmin = lazy(() => import('../../components/DashboardComponents/Welcome/WelcomeAdmin').catch(() => {
  console.error('Error al cargar WelcomeAdmin');
  return { default: () => <div>Error al cargar el componente</div> };
}));

const WelcomeClient = lazy(() => import('../../components/DashboardComponents/Welcome/WelcomeClient').catch(() => {
  console.error('Error al cargar WelcomeClient');
  return { default: () => <div>Error al cargar el componente</div> };
}));

// Definición de roles
export type UserRole = 'admin' | 'cliente' | 'empleado';

const Welcome: React.FC = () => {
  const { userRole, isUserLoading } = useUser();
  
  console.log('WelcomeMenu - userRole:', userRole);
  console.log('WelcomeMenu - isUserLoading:', isUserLoading);

  if (isUserLoading) {
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

  const renderComponentByRole = () => {
    console.log('renderComponentByRole - userRole:', userRole);
    
    switch (userRole) {
      case 'admin':
        return <WelcomeAdmin />;
      case 'cliente':
        return <WelcomeClient />;
      case 'empleado':
        return <WelcomeEmployee />;
      default:
        console.log('Rol no válido:', userRole);
        Modal.confirm({
          title: 'Sesión inválida',
          content: 'Su sesión no es válida o ha expirado. Será redirigido al inicio de sesión.',
          okText: 'Entendido',
          cancelButtonProps: { style: { display: 'none' } },
          onOk: () => {
            localStorage.removeItem('userData');
            localStorage.removeItem('token');
            window.location.href = '/Login';
          }
        });
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

export default Welcome;
