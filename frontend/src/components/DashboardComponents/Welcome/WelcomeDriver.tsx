import React from 'react';
import '../../../styles/dashboard/ServicesSubpages.scss';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const WelcomeDriver = () => {
  return (
    <div className="welcome-container">
      <Card className="welcome-card">
        <Title level={2} className="welcome-title">
          ¡Te damos la bienvenida a tu panel de Conductor!
        </Title>
        <p className="welcome-subtitle">
          Aquí podrás ver tus rutas y servicios de transporte asignados
        </p>
      </Card>
    </div>
  );
};

export default WelcomeDriver;
  