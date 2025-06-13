import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RentAdmin from '../../components/DashboardComponents/Rent/RentAdmin';
import RentClient from '../../components/DashboardComponents/Rent/RentClient';
import RentEmployee from '../../components/DashboardComponents/Rent/RentEmployee';
import { message, Spin, Result, Modal } from 'antd';
import styled from 'styled-components';
import { useUser } from '../../contexts/UserContext';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background-color);
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  background-color: var(--background-color);
  overflow-x: hidden;
`;

const RentPage = () => {
  const navigate = useNavigate();
  const { userRole, isUserLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('Sesión no iniciada');
          navigate('/Login');
          return;
        }

        // Esperar a que el rol del usuario esté disponible
        if (!isUserLoading && !userRole) {
          message.error('No se pudo verificar el rol del usuario');
          navigate('/Login');
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        message.error('Error al verificar la autenticación');
        navigate('/Login');
      }
    };

    checkAuth();
  }, [navigate, isUserLoading, userRole]);

  if (loading || isUserLoading) {
    return (
      <LoadingContainer>
        <Spin size="large" />
      </LoadingContainer>
    );
  }

  const renderComponentByRole = () => {
    console.log('Rent - renderComponentByRole - userRole:', userRole);
    console.log('Rent - userData.rol:', userData.rol);
    
    if (!userRole) {
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

    switch (userRole) {
      case 'admin':
        return <RentAdmin />;
      case 'cliente':
        return <RentClient />;
      case 'empleado':
        return <RentEmployee />;
      default:
        return null;
    }
  };

  return (
    <MainContent>
      {renderComponentByRole()}
    </MainContent>
  );
};

export default RentPage;