//import React from 'react';
import '../../../styles/dashboard/ServicesSubpages.scss';
import { Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const WelcomeClient = () => {
  return (
    <div className="welcome-container">
      <Card title="Bienvenido Cliente" className="welcome-card">
        <div className="welcome-content">
          <h2>¡Bienvenido a Canabacoa Fiestas!</h2>
          <p>Aquí podrás gestionar tus reservas y servicios</p>
          <Button type="primary" icon={<PlusOutlined />}>
            Nueva Reserva
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeClient;