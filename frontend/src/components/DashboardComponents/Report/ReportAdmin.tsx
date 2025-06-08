import React, { useState } from 'react';
import { Button, Select, Space, message, Card, Modal, Row, Col } from 'antd';
import { DownloadOutlined, UserOutlined, TeamOutlined, CalendarOutlined, BarChartOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const ReportAdmin = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState<boolean>(false);

  const handleGeneralReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/reporte/usuario`, {
        responseType: 'blob'
      });
      
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
      message.error('Error al generar el reporte general de usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleReport = async () => {
    if (!selectedRole) {
      message.warning('Por favor seleccione un rol');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/reporte/usuario/rol/${selectedRole}`, {
        responseType: 'blob'
      });
      
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
      message.error('Error al generar el reporte de usuarios por rol');
    } finally {
      setLoading(false);
    }
  };

  const showUserModal = () => {
    setIsUserModalVisible(true);
  };

  const handleCancel = () => {
    setIsUserModalVisible(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Reportes del Sistema</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            onClick={showUserModal}
            style={{ textAlign: 'center' }}
          >
            <UserOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
            <h3>Reportes de Usuarios</h3>
            <p>Gestión de reportes de usuarios y roles</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            style={{ textAlign: 'center' }}
          >
            <TeamOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
            <h3>Reportes de Equipos</h3>
            <p>Análisis de equipos y sus eventos</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            style={{ textAlign: 'center' }}
          >
            <CalendarOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
            <h3>Reportes de Eventos</h3>
            <p>Estadísticas y métricas de eventos</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            style={{ textAlign: 'center' }}
          >
            <BarChartOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
            <h3>Reporte de Elementos</h3>
            <p>Gestión y análisis de elementos del sistema</p>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Reportes de Usuarios"
        open={isUserModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h3>Reporte General de Usuarios</h3>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={handleGeneralReport}
              loading={loading}
            >
              Generar Reporte General
            </Button>
          </div>

          <div>
            <h3>Reporte de Usuarios por Rol</h3>
            <Space>
              <Select
                style={{ width: 200 }}
                placeholder="Seleccione un rol"
                value={selectedRole}
                onChange={setSelectedRole}
              >
                <Option value="1">Administrador</Option>
                <Option value="3">Empleado</Option>
                <Option value="2">Cliente</Option>
              </Select>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleRoleReport}
                loading={loading}
                disabled={!selectedRole}
              >
                Generar Reporte por Rol
              </Button>
            </Space>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default ReportAdmin;
