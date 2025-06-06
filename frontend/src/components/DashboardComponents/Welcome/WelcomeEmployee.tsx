import React from "react";
import { Card, Typography } from "antd";
import "../../../styles/dashboard/ServicesSubpages.scss";

const { Title } = Typography;

export default function WelcomeEmployee() {
  return (
    <div className="welcome-container">
      <Card className="welcome-card">
        <Title level={2} className="welcome-title">
          ¡Te damos la bienvenida a tu panel de Empleado!
        </Title>
        <p className="welcome-subtitle">
          Aquí podrás gestionar tus tareas y servicios asignados
        </p>
      </Card>
    </div>
  );
}