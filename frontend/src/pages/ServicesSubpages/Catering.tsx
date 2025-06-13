import React from 'react';
import CateringAdmin from '../../components/DashboardComponents/Catering/CateringAdmin';
import CateringClient from '../../components/DashboardComponents/Catering/CateringClient';
import CateringEmployee from '../../components/DashboardComponents/Catering/CateringEmployee';

const Catering = () => {
  // Obtener el rol del usuario del localStorage
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const rolId = Number(userData.rol);

  // Determinar qué componente mostrar según el rol
  const renderComponent = () => {
    if (rolId === 1) { // Admin
      return <CateringAdmin />;
    } else if (rolId === 2) { // Cliente
      return <CateringClient />;
    } else if (rolId === 3) { // Organizador
      return <CateringEmployee />;
    }
    return null;
  };

  return (
    <div>
      {renderComponent()}
    </div>
  );
};

export default Catering;