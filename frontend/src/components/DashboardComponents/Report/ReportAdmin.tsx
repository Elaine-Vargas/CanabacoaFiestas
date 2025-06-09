import React, { useEffect, useState } from 'react';
import { Button, Select, Space, message, Card, Modal, Row, Col, Input } from 'antd';
import { DownloadOutlined, UserOutlined, TeamOutlined, CalendarOutlined, BarChartOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

interface Usuario {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
  usuario_login: string;
  correo_usuario: string;
  tel_usuario: string;
  estado_usuario: string;
  rol: string;
}

interface Cliente {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
}

interface Asesor {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
}

const ReportAdmin = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState<boolean>(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState<boolean>(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState<boolean>(false);
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [cedula, setCedula] = useState<string>('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingAsesores, setLoadingAsesores] = useState(false);
  const [selectedRoleForCombinedReport, setSelectedRoleForCombinedReport] = useState<string>('todos');
  const [selectedStatusForCombinedReport, setSelectedStatusForCombinedReport] = useState<string>('todos');

  const handleRoleAndStatusReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/reporte/usuario/rol/${selectedRoleForCombinedReport}/estado/${selectedStatusForCombinedReport}`, {
        responseType: 'blob'
      });
      
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
      message.error('Error al generar el reporte de usuarios por rol y estado');
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

  const [searchText, setSearchText] = useState('');
  const searchInputRef = React.useRef<any>(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchText]);

  const fetchClientes = async () => {
    try {
      setLoadingClientes(true);
      const response = await fetch(`${apiUrl}/usuario?rol=2`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar los clientes');
      }
      const data = await response.json();
      if (data.usuarios && Array.isArray(data.usuarios)) {
        setClientes(data.usuarios);
      } else {
        throw new Error('Formato de datos inválido');
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      message.error('Error al cargar los clientes');
      setClientes([]);
    } finally {
      setLoadingClientes(false);
    }
  };

  const fetchAsesores = async () => {
    try {
      setLoadingAsesores(true);
      const response = await fetch(`${apiUrl}/usuario?rol=3`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar los asesores');
      }
      const data = await response.json();
      if (data.usuarios && Array.isArray(data.usuarios)) {
        setAsesores(data.usuarios);
      } else {
        throw new Error('Formato de datos inválido');
      }
    } catch (error) {
      console.error('Error al cargar asesores:', error);
      message.error('Error al cargar los asesores');
      setAsesores([]);
    } finally {
      setLoadingAsesores(false);
    }
  };

  useEffect(() => {
    if (isEventModalVisible) {
      fetchClientes();
      fetchAsesores();
    }
  }, [isEventModalVisible]);

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
      let errorMessage = 'Error al generar el reporte específico de eventos';

      if (axios.isAxiosError(error)) {
        const { response } = error;

        if (response && response.data instanceof Blob) {
          try {
            const blobText = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (reader.result) {
                  resolve(reader.result as string);
                } else {
                  reject(new Error('Failed to read blob as text.'));
                }
              };
              reader.onerror = reject;
              reader.readAsText(response.data);
            });

            const errorData = JSON.parse(blobText);
            if (errorData.mensaje) {
              message.error(errorData.mensaje);
            } else {
              message.error(errorMessage + ': ' + blobText); 
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            message.error(errorMessage + ': El servidor respondió con un formato inesperado.');
          }
        } else {
          console.error('Axios error without blob data:', error);
          message.error(errorMessage + ': El servidor respondió con un formato inesperado o no hubo respuesta.');
        }
      } else {
        console.error('Non-Axios error:', error);
        message.error(errorMessage + ': Ocurrió un error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEventTypeChange = (value: string) => {
    setSelectedEventType(value);
    setCedula('');
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
            <h4 className='reportTitle'>Reporte de Usuarios por Rol y Estado</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un rol"
                value={selectedRoleForCombinedReport}
                onChange={setSelectedRoleForCombinedReport}
              >
                <Option value="todos">Todos los Roles</Option>
                <Option value="1">Administrador</Option>
                <Option value="3">Empleado</Option>
                <Option value="2">Cliente</Option>
              </Select>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un estado"
                value={selectedStatusForCombinedReport}
                onChange={setSelectedStatusForCombinedReport}
              >
                <Option value="todos">Todos los Estados</Option>
                <Option value="Activo">Activo</Option>
                <Option value="Inactivo">Inactivo</Option>
              </Select>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleRoleAndStatusReport}
                loading={loading}
                disabled={loading || !selectedRoleForCombinedReport || !selectedStatusForCombinedReport}
              >
                Generar Reporte por Rol y Estado
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
                onChange={handleEventTypeChange}
              >
                <Option value="cliente">Reporte por Cliente</Option>
                <Option value="asesor">Reporte por Asesor</Option>
                <Option value="personal">Reporte por Personal</Option>
              </Select>

              {selectedEventType === 'cliente' && (
                <Select
                  style={{ width: '100%' }}
                  placeholder="Seleccione un cliente"
                  loading={loadingClientes}
                  value={cedula}
                  onChange={setCedula}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    if (typeof option?.children === 'string') {
                      return (option.children as string).toLowerCase().includes(input.toLowerCase());
                    }
                    return false;
                  }}
                >
                  <Option value="todos">Todos los Clientes</Option>
                  {clientes.map(cliente => (
                    <Select.Option key={cliente.cedula_usuario} value={cliente.cedula_usuario}>
                      {`${cliente.nombre_usuario} ${cliente.apellido_usuario} (${cliente.cedula_usuario})`}
                    </Select.Option>
                  ))}
                </Select>
              )}

              {selectedEventType === 'asesor' && (
                <Select
                  style={{ width: '100%' }}
                  placeholder="Seleccione un asesor"
                  loading={loadingAsesores}
                  value={cedula}
                  onChange={setCedula}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    if (typeof option?.children === 'string') {
                      return (option.children as string).toLowerCase().includes(input.toLowerCase());
                    }
                    return false;
                  }}
                >
                  <Option value="todos">Todos los Asesores</Option>
                  {asesores.map(asesor => (
                    <Select.Option key={asesor.cedula_usuario} value={asesor.cedula_usuario}>
                      {`${asesor.nombre_usuario} ${asesor.apellido_usuario} (${asesor.cedula_usuario})`}
                    </Select.Option>
                  ))}
                </Select>
              )}

              {selectedEventType === 'personal' && (
                <Input
                  placeholder="Ingrese el ID del personal o 'todos' para todos"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                />
              )}

              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleSpecificEventReport}
                loading={loading}
                disabled={loading || !selectedEventType || !cedula}
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
