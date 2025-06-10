import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RentAdmin from '../../components/DashboardComponents/Rent/RentAdmin';
import RentClient from '../../components/DashboardComponents/Rent/RentClient';
import { message, Spin, Result } from 'antd';
import styled from 'styled-components';

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
  const [userRole, setUserRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

      if (!token) {
        message.error('Sesión no iniciada');
        navigate('/auth/login');
        return;
      }

      const role = Number(userData.rol);
      
      // Verificar que el rol sea válido (1 para admin, 2 para cliente)
      if (role !== 1 && role !== 2) {
        message.error('Rol de usuario no válido');
        navigate('/auth/login');
        return;
      }

      setUserRole(role);
      setLoading(false);

    } catch (error) {
      console.error('Error checking user role:', error);
      message.error('Error al verificar los permisos');
      setLoading(false);
      navigate('/auth/login');
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spin size="large" />
      </LoadingContainer>
    );
  }

  if (!userRole) {
    return (
      <MainContent>
        <Result
          status="403"
          title="Acceso Restringido"
          subTitle="Lo sentimos, no tienes permisos para acceder a esta sección."
        />
      </MainContent>
    );
  }

  return (
    <MainContent>
      {userRole === 1 ? (
        <RentAdmin />
      ) : userRole === 2 ? (
        <RentClient />
      ) : (
        <Result
          status="403"
          title="Acceso Restringido"
          subTitle="Lo sentimos, no tienes permisos para acceder a esta sección."
        />
      )}
    </MainContent>
  );
};

export default RentPage;