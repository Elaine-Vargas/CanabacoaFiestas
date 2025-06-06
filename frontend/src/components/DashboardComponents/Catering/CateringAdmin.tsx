import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Card, Row, Col, message, Modal, Form, DatePicker, Space, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowRightOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_BASE_URL;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// Styled Components
const StyledCard = styled(Card)`
  margin: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 8px var(--color-shadow);
  background-color: var(--color-background2);
  overflow: hidden;
  
  .ant-card-head {
    background-color: var(--beige);
    border-radius: 15px 15px 0 0;
    border-bottom: 2px solid var(--dark-gold);
  }

  .ant-card-head-title {
    color: var(--color-text2);
    font-family: "Montserrat Alternates", sans-serif;
    font-weight: 600;
  }
  
  .ant-card-body {
    color: var(--color-text);
    overflow: hidden;
  }
`;

const TableActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ContinueButton = styled(Button)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  border-radius: 25px;
  padding: 0 25px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--dark-gold);
  border-color: var(--gold);
  color: var(--white);
  font-family: "Montserrat Alternates", sans-serif;
  font-weight: 600;
  
  &:hover {
    background-color: var(--gold);
    border-color: var(--dark-gold);
    color: var(--white);
  }
`;

// Interfaces
interface CateringService {
  id_catering_service: number;
  id_evento: number;
  estado_catering: string;
  fecha_catering: string;
  total_catering: number;
}

interface Menu {
  id_menu: number;
  nombre_menu: string;
  descripcion_menu: string;
  precio_menu: number;
  id_proveedor: number;
  proveedor: {
    nombre_proveedor: string;
  };
}

interface Plato {
  id_plato: number;
  nombre_plato: string;
  descripcion_plato: string;
  tipo_plato: string;
}

interface Event {
  id_evento: number;
  nombre_evento: string;
}

const CateringAdmin = () => {
  // Estados
  const [cateringServices, setCateringServices] = useState<CateringService[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMenuSelection, setShowMenuSelection] = useState(false);
  const [showCateringForm, setShowCateringForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showPlatoForm, setShowPlatoForm] = useState(false);
  const [selectedMenus, setSelectedMenus] = useState<Menu[]>([]);
  const [searchText, setSearchText] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [proveedorFilter, setProveedorFilter] = useState('');
  const [form] = Form.useForm();

  // Efectos
  useEffect(() => {
    fetchCateringServices();
    fetchMenus();
    fetchPlatos();
    fetchEvents();
  }, []);

  // Funciones de fetch
  const fetchCateringServices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/catering_service`);
      setCateringServices(response.data);
    } catch (error) {
      message.error('Error al cargar los servicios de catering');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await axios.get(`${apiUrl}/menu`);
      setMenus(response.data);
    } catch (error) {
      message.error('Error al cargar los menús');
    }
  };

  const fetchPlatos = async () => {
    try {
      const response = await axios.get(`${apiUrl}/plato`);
      setPlatos(response.data);
    } catch (error) {
      message.error('Error al cargar los platos');
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${apiUrl}/evento`);
      setEvents(response.data);
    } catch (error) {
      message.error('Error al cargar los eventos');
    }
  };

  // Handlers
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await axios.patch(`${apiUrl}/catering_service/${id}`, { estado_catering: newStatus });
      message.success('Estado actualizado correctamente');
      fetchCateringServices();
    } catch (error) {
      message.error('Error al actualizar el estado');
    }
  };

  const handleCreateCatering = () => {
    setSelectedMenus([]);
    setShowMenuSelection(true);
  };

  const handleMenuSelect = (menu: Menu) => {
    const menuIndex = selectedMenus.findIndex(m => m.id_menu === menu.id_menu);
    if (menuIndex === -1) {
      setSelectedMenus([...selectedMenus, menu]);
    } else {
      const newSelectedMenus = [...selectedMenus];
      newSelectedMenus.splice(menuIndex, 1);
      setSelectedMenus(newSelectedMenus);
    }
  };

  const handleContinueToForm = () => {
    if (selectedMenus.length === 0) {
      message.warning('Por favor, seleccione al menos un menú');
      return;
    }
    setShowMenuSelection(false);
    setShowCateringForm(true);
  };

  const handleCateringFormSubmit = async (values: any) => {
    try {
      const cateringData = {
        ...values,
        menus: selectedMenus.map(menu => menu.id_menu),
        total_catering: selectedMenus.reduce((sum, menu) => sum + menu.precio_menu, 0),
      };
      await axios.post(`${apiUrl}/catering_service`, cateringData);
      message.success('Servicio de catering creado correctamente');
      setShowCateringForm(false);
      form.resetFields();
      fetchCateringServices();
    } catch (error) {
      message.error('Error al crear el servicio de catering');
    }
  };

  // Columnas para las tablas
  const cateringColumns = [
    {
      title: 'ID',
      dataIndex: 'id_catering_service',
      key: 'id_catering_service',
    },
    {
      title: 'Evento',
      dataIndex: 'id_evento',
      key: 'id_evento',
      render: (eventId: number) => {
        const event = events.find(e => e.id_evento === eventId);
        return event ? event.nombre_evento : eventId;
      }
    },
    {
      title: 'Estado',
      dataIndex: 'estado_catering',
      key: 'estado_catering',
      render: (estado: string, record: CateringService) => (
        <Select
          defaultValue={estado}
          style={{ width: '100%' }}
          onChange={(value) => handleStatusChange(record.id_catering_service, value)}
        >
          <Option value="pendiente">Pendiente</Option>
          <Option value="confirmado">Confirmado</Option>
          <Option value="completado">Completado</Option>
          <Option value="cancelado">Cancelado</Option>
        </Select>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total_catering',
      key: 'total_catering',
      render: (total: number) => `$${total.toFixed(2)}`,
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_catering',
      key: 'fecha_catering',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (text: string, record: CateringService) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            type="link"
            danger
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const menuColumns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre_menu',
      key: 'nombre_menu',
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion_menu',
      key: 'descripcion_menu',
    },
    {
      title: 'Precio',
      dataIndex: 'precio_menu',
      key: 'precio_menu',
      render: (precio: number) => `$${precio.toFixed(2)}`,
    },
    {
      title: 'Proveedor',
      dataIndex: ['proveedor', 'nombre_proveedor'],
      key: 'proveedor',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (text: string, record: Menu) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => handleEditMenu(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            type="link"
            danger
            onClick={() => handleDeleteMenu(record)}
          />
          <Button
            type="link"
            onClick={() => handleAddPlatos(record)}
          >
            Agregar Platos
          </Button>
        </Space>
      ),
    },
  ];

  const platoColumns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre_plato',
      key: 'nombre_plato',
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion_plato',
      key: 'descripcion_plato',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_plato',
      key: 'tipo_plato',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (text: string, record: Plato) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => handleEditPlato(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            type="link"
            danger
            onClick={() => handleDeletePlato(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <StyledCard title="Servicios de Catering">
        <TableActions>
          <FilterContainer>
            <Search
              placeholder="Buscar servicio"
              onSearch={value => setSearchText(value)}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Filtrar por evento"
              value={eventFilter}
              onChange={value => setEventFilter(value)}
              allowClear
              style={{ width: 200 }}
            >
              {events.map(event => (
                <Option key={event.id_evento} value={event.id_evento}>
                  {event.nombre_evento}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Filtrar por estado"
              value={statusFilter}
              onChange={value => setStatusFilter(value)}
              allowClear
              style={{ width: 200 }}
            >
              <Option value="pendiente">Pendiente</Option>
              <Option value="confirmado">Confirmado</Option>
              <Option value="completado">Completado</Option>
              <Option value="cancelado">Cancelado</Option>
            </Select>
          </FilterContainer>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateCatering}
          >
            Nuevo Servicio de Catering
          </Button>
        </TableActions>

        <Table
          columns={cateringColumns}
          dataSource={cateringServices}
          loading={loading}
          rowKey="id_catering_service"
        />
      </StyledCard>

      <StyledCard title="Gestión de Menús y Platos">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Menús" key="1">
            <TableActions>
              <Search
                placeholder="Buscar menú"
                style={{ width: 200 }}
              />
              <Select
                placeholder="Filtrar por proveedor"
                value={proveedorFilter}
                onChange={value => setProveedorFilter(value)}
                allowClear
                style={{ width: 200 }}
              >
                {/* Opciones de proveedores */}
              </Select>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowMenuForm(true)}
              >
                Nuevo Menú
              </Button>
            </TableActions>
            <Table
              columns={menuColumns}
              dataSource={menus}
              rowKey="id_menu"
            />
          </TabPane>
          <TabPane tab="Platos" key="2">
            <TableActions>
              <Search
                placeholder="Buscar plato"
                style={{ width: 200 }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowPlatoForm(true)}
              >
                Nuevo Plato
              </Button>
            </TableActions>
            <Table
              columns={platoColumns}
              dataSource={platos}
              rowKey="id_plato"
            />
          </TabPane>
        </Tabs>
      </StyledCard>

      {/* Modal de Selección de Menús */}
      <Modal
        title="Seleccionar Menús"
        open={showMenuSelection}
        onCancel={() => setShowMenuSelection(false)}
        footer={null}
        width={800}
      >
        <Row gutter={[16, 16]}>
          {menus.map(menu => (
            <Col xs={24} sm={12} key={menu.id_menu}>
              <Card
                hoverable
                onClick={() => handleMenuSelect(menu)}
                style={{
                  borderColor: selectedMenus.some(m => m.id_menu === menu.id_menu)
                    ? 'var(--dark-gold)'
                    : undefined,
                }}
              >
                <h4>{menu.nombre_menu}</h4>
                <p>{menu.descripcion_menu}</p>
                <p>Precio: ${menu.precio_menu}</p>
                <p>Proveedor: {menu.proveedor.nombre_proveedor}</p>
              </Card>
            </Col>
          ))}
        </Row>
        {selectedMenus.length > 0 && (
          <ContinueButton onClick={handleContinueToForm}>
            Continuar <ArrowRightOutlined />
          </ContinueButton>
        )}
      </Modal>

      {/* Modal de Formulario de Catering */}
      <Modal
        title="Crear Servicio de Catering"
        open={showCateringForm}
        onCancel={() => setShowCateringForm(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCateringFormSubmit}
        >
          <Form.Item
            name="id_evento"
            label="Evento"
            rules={[{ required: true, message: 'Por favor seleccione un evento' }]}
          >
            <Select>
              {events.map(event => (
                <Option key={event.id_evento} value={event.id_evento}>
                  {event.nombre_evento}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="fecha_catering"
            label="Fecha"
            rules={[{ required: true, message: 'Por favor seleccione una fecha' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Crear Servicio
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Otros modales necesarios (formularios de menú, plato, etc.) */}
    </>
  );
};

export default CateringAdmin;
