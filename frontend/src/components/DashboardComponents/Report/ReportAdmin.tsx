import React, { useState } from 'react';
import { Button, Select, Space, message, Card, Modal, Row, Col, Input } from 'antd';
import { DownloadOutlined, UserOutlined, TeamOutlined, CalendarOutlined, BarChartOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const ReportAdmin = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState<boolean>(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState<boolean>(false);
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [cedula, setCedula] = useState<string>('');

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

  const showEventModal = () => {
    setIsEventModalVisible(true);
  };

  const handleEventModalCancel = () => {
    setIsEventModalVisible(false);
    setSelectedEventType('');
    setCedula('');
  };

  const handleGeneralEventReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/reporte/eventos`, {
        responseType: 'blob'
      });
      
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
      message.error('Error al generar el reporte general de eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleSpecificEventReport = async () => {
    if (!selectedEventType || !cedula) {
      message.warning('Por favor complete todos los campos');
      return;
    }

    try {
      setLoading(true);
      let endpoint;
      if (selectedEventType === 'cliente') {
        endpoint = `/reporte/eventos/cliente/${cedula}`;
      } else {
        endpoint = `/reporte/eventos/${selectedEventType}/${cedula}`;
      }
      const response = await axios.get(`${apiUrl}${endpoint}`, {
        responseType: 'blob'
      });
      
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
      message.error('Error al generar el reporte específico de eventos');
    } finally {
      setLoading(false);
    }
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
            onClick={showEventModal}
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

      <Modal className='ReportsModal'
        title="Reportes de Usuarios"
        open={isUserModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h4 className='reportTitle'>Reporte General de Usuarios</h4>
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
            <h4 className='reportTitle'>Reporte de Usuarios por Rol</h4>
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

      <Modal className='ReportsModal'
        title="Reportes de Eventos"
        open={isEventModalVisible}
        onCancel={handleEventModalCancel}
        footer={null}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h4 className='reportTitle'>Reporte General de Eventos</h4>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={handleGeneralEventReport}
              loading={loading}
            >
              Generar Reporte General
            </Button>
          </div>

          <div>
            <h4 className='reportTitle'>Reporte Específico de Eventos</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione el tipo de reporte"
                value={selectedEventType}
                onChange={setSelectedEventType}
              >
                <Option value="cliente">Reporte por Cliente</Option>
                <Option value="asesor">Reporte por Asesor</Option>
                <Option value="personal">Reporte por Personal</Option>
              </Select>
              <Input
                placeholder={selectedEventType === 'cliente' ? "Ingrese la cédula del cliente" : "Ingrese el ID"}
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
              />
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleSpecificEventReport}
                loading={loading}
                disabled={!selectedEventType || !cedula}
              >
                Generar Reporte Específico
              </Button>
            </Space>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default ReportAdmin;
