//import React from 'react';
import '../../../styles/dashboard/ServicesSubpages.scss';
import { Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const WelcomeEmployee = () => {
  return (
    <div className="welcome-container">
      <Card title="Bienvenido Empleado" className="welcome-card">
        <div className="welcome-content">
          <h2>¡Bienvenido a Canabacoa Fiestas!</h2>
          <p>Aquí podrás gestionar los servicios y reservas.</p>
          <Button type="primary" icon={<PlusOutlined />}>
            Gestionar Servicios
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeEmployee;