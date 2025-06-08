import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RentAdmin from '../../components/DashboardComponents/Rent/RentAdmin';
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      console.log('User Data:', userData); // Debug log

      if (!token) {
        message.error('Sesión no iniciada');
        navigate('/auth/login');
        return;
      }

      // Verificar directamente del userData
      const userRole = Number(userData.rol);
      console.log('User Role:', userRole); // Debug log

      // Si el rol es 1 (admin) o 4 (empleado de inventario)
      if (userRole === 1 || userRole === 4) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      setLoading(false);

    } catch (error) {
      console.error('Error checking user role:', error);
      message.error('Error al verificar los permisos');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spin size="large" />
      </LoadingContainer>
    );
  }

  return (
    <MainContent>
      {isAdmin ? (
        <RentAdmin />
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