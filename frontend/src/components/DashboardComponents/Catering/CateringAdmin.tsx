import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  message,
  Modal,
  Form,
  DatePicker,
  Space,
  Tabs,
  InputNumber,
  Typography,
  Tag,
  List
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import axios from 'axios';
import dayjs from 'dayjs';
import { apiUrl } from '../../../config';

const { Search } = Input;
const { Option } = Select;

const { Title } = Typography;

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
  id_catering: number;
  id_evento: number;
  personas_catering: number;
  precioneto_catering: number;
  itbis_catering: number;
  total_catering: number;
  estado_catering: string;
  fecha_catering?: string;
  evento?: {
    nombre_evento: string;
  };
  menus_catering?: Array<{
    menu: Menu;
  }>;
}

interface Menu {
  id_menu: number;
  desc_menu: string;
  precio_menu: number;
  id_proveedor: number;
  proveedor: {
    nombre_proveedor: string;
  };
  platos_menu?: Array<{
    plato: Plato;
  }>;
}

interface Plato {
  id_plato: number;
  desc_plato: string;
  platos_menu?: Array<{
    menu: Menu;
  }>;
}

interface Event {
  id_evento: number;
  nombre_evento: string;
}

interface Proveedor {
  id_proveedor: number;
  nombre_proveedor: string;
  tipo_proveedor: string;
}

const CateringAdmin = () => {
  // Estados
  const [cateringServices, setCateringServices] = useState<CateringService[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [loadingPlatos, setLoadingPlatos] = useState(false);
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
    const fetchData = async () => {
      setLoading(true);
      setLoadingMenus(true);
      setLoadingPlatos(true);
      try {
        await Promise.all([
          fetchCateringServices(),
          fetchMenus(),
          fetchPlatos(),
          fetchEvents(),
          fetchProveedores()
        ]);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
        setLoadingMenus(false);
        setLoadingPlatos(false);
      }
    };
    
    fetchData();
  }, []);

  // Funciones de fetch
  const fetchCateringServices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const response = await axios.get(`${apiUrl}/catering`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setCateringServices(response.data);
      } else {
        setCateringServices([]);
      }
    } catch (error) {
      console.error('Error al cargar los servicios de catering:', error);
      message.error('Error al cargar los servicios de catering');
      setCateringServices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenus = async () => {
    try {
      setLoadingMenus(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const response = await axios.get(`${apiUrl}/catering/menu`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Respuesta de menús:', response.data);
      setMenus(response.data || []);
    } catch (error) {
      console.error('Error al cargar los menús:', error);
      message.error('Error al cargar los menús');
      setMenus([]);
    } finally {
      setLoadingMenus(false);
    }
  };

  const fetchPlatos = async () => {
    try {
      setLoadingPlatos(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const response = await axios.get(`${apiUrl}/catering/plato`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Respuesta de platos:', response.data);
      setPlatos(response.data || []);
    } catch (error) {
      console.error('Error al cargar los platos:', error);
      message.error('Error al cargar los platos');
      setPlatos([]);
    } finally {
      setLoadingPlatos(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const response = await axios.get(`${apiUrl}/evento`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error al cargar los eventos:', error);
      message.error('Error al cargar los eventos');
    }
  };

  const fetchProveedores = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const response = await axios.get(`${apiUrl}/proveedor`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Filtrar solo proveedores de tipo Catering
      const proveedoresCatering = response.data.filter(
        (proveedor: Proveedor) => proveedor.tipo_proveedor === 'Catering'
      );
      setProveedores(proveedoresCatering);
    } catch (error) {
      console.error('Error al cargar los proveedores:', error);
      message.error('Error al cargar los proveedores');
    }
  };

  // Handlers
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }
      await axios.put(`${apiUrl}/catering/${id}`, 
        { estado_catering: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      message.success('Estado actualizado correctamente');
      fetchCateringServices();
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
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
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }
      const cateringData = {
        id_evento: values.id_evento,
        personas_catering: values.personas_catering || 0,
        precioneto_catering: selectedMenus.reduce((sum, menu) => sum + menu.precio_menu, 0),
        itbis_catering: selectedMenus.reduce((sum, menu) => sum + menu.precio_menu, 0) * 0.18,
        total_catering: selectedMenus.reduce((sum, menu) => sum + menu.precio_menu, 0) * 1.18,
        menus: selectedMenus.map(menu => menu.id_menu)
      };

      await axios.post(`${apiUrl}/catering`, cateringData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      message.success('Servicio de catering creado correctamente');
      setShowCateringForm(false);
      form.resetFields();
      fetchCateringServices();
    } catch (error) {
      console.error('Error al crear el servicio de catering:', error);
      message.error('Error al crear el servicio de catering');
    }
  };

  const handleMenuFormSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }
      await axios.post(`${apiUrl}/catering/menu`, values, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      message.success('Menú creado correctamente');
      setShowMenuForm(false);
      form.resetFields();
      fetchMenus();
    } catch (error) {
      console.error('Error al crear el menú:', error);
      message.error('Error al crear el menú');
    }
  };

  const handlePlatoFormSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }
      await axios.post(`${apiUrl}/catering/plato`, values, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      message.success('Plato creado correctamente');
      setShowPlatoForm(false);
      form.resetFields();
      fetchPlatos();
    } catch (error) {
      console.error('Error al crear el plato:', error);
      message.error('Error al crear el plato');
    }
  };

  // Handlers para Catering Service
  const handleEdit = (record: CateringService) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }
      
      // Obtener los menús del servicio
      const fetchMenusService = async () => {
        const response = await axios.get(`${apiUrl}/catering/menu/catering/${record.id_catering}/menus`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data) {
          setSelectedMenus(response.data);
          form.setFieldsValue({
            id_evento: record.id_evento,
            estado_catering: record.estado_catering
          });
          setShowCateringForm(true);
        }
      };
      
      fetchMenusService();
    } catch (error) {
      message.error('Error al cargar los datos del servicio');
    }
  };

  const handleDelete = async (record: CateringService) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      await axios.delete(`${apiUrl}/catering/${record.id_catering}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      message.success('Servicio de catering eliminado exitosamente');
      fetchCateringServices();
    } catch (error) {
      console.error('Error al eliminar el servicio de catering:', error);
      message.error('Error al eliminar el servicio de catering');
    }
  };

  // Handlers para Menús
  const handleEditMenu = (record: Menu) => {
    try {
      form.setFieldsValue({
        nombre_menu: record.desc_menu,
        precio_menu: record.precio_menu,
        id_proveedor: record.id_proveedor
      });
      setShowMenuForm(true);
    } catch (error) {
      message.error('Error al cargar los datos del menú');
    }
  };

  const handleDeleteMenu = async (record: Menu) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      await axios.delete(`${apiUrl}/catering/menu/${record.id_menu}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      message.success('Menú eliminado exitosamente');
      fetchMenus();
    } catch (error) {
      console.error('Error al eliminar el menú:', error);
      message.error('Error al eliminar el menú');
    }
  };

  // Handlers para Platos
  const handleEditPlato = (record: Plato) => {
    try {
      form.setFieldsValue({
        nombre_plato: record.desc_plato,
      });
      setShowPlatoForm(true);
    } catch (error) {
      message.error('Error al cargar los datos del plato');
    }
  };

  const handleDeletePlato = async (record: Plato) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      await axios.delete(`${apiUrl}/catering/plato/${record.id_plato}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      message.success('Plato eliminado exitosamente');
      fetchPlatos();
    } catch (error) {
      console.error('Error al eliminar el plato:', error);
      message.error('Error al eliminar el plato');
    }
  };

  const handleAddPlatos = (menu: Menu) => {
    // Implementar lógica para agregar platos al menú
    message.info('Funcionalidad en desarrollo');
  };

  // Columnas para las tablas
  const cateringColumns = [
    {
      title: 'ID',
      dataIndex: 'id_catering',
      key: 'id_catering',
    },
    {
      title: 'Evento',
      dataIndex: ['evento', 'nombre_evento'],
      key: 'evento',
      render: (nombre: string, record: CateringService) => (
        <span>
          {record.id_evento} - {nombre || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado_catering',
      key: 'estado_catering',
      render: (estado: string) => {
        let color = 'default';
        switch (estado.toLowerCase()) {
          case 'solicitado':
            color = 'processing';
            break;
          case 'confirmado':
            color = 'warning';
            break;
          case 'completado':
            color = 'success';
            break;
          case 'cancelado':
            color = 'error';
            break;
        }
        return <Tag color={color}>{estado}</Tag>;
      },
    },
    {
      title: 'Personas',
      dataIndex: 'personas_catering',
      key: 'personas_catering',
    },
    {
      title: 'Precio Neto',
      dataIndex: 'precioneto_catering',
      key: 'precioneto_catering',
      render: (precio: number) => `$${Number(precio).toFixed(2)}`,
    },
    {
      title: 'ITBIS',
      dataIndex: 'itbis_catering',
      key: 'itbis_catering',
      render: (itbis: number) => `$${Number(itbis).toFixed(2)}`,
    },
    {
      title: 'Total',
      dataIndex: 'total_catering',
      key: 'total_catering',
      render: (total: number) => `$${Number(total).toFixed(2)}`,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: CateringService) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => handleEdit(record)}
            disabled={record.estado_catering.toLowerCase() === 'cancelado'}
          />
          <Button
            icon={<DeleteOutlined />}
            type="link"
            danger
            onClick={() => handleDelete(record)}
            disabled={record.estado_catering.toLowerCase() === 'cancelado'}
          />
        </Space>
      ),
    },
  ];

  const menuColumns = [
    {
      title: 'Nombre',
      dataIndex: 'desc_menu',
      key: 'desc_menu',
    },
    {
      title: 'Precio',
      dataIndex: 'precio_menu',
      key: 'precio_menu',
      render: (precio: number) => `$${Number(precio).toFixed(2)}`,
    },
    {
      title: 'Proveedor',
      dataIndex: ['proveedor', 'nombre_proveedor'],
      key: 'proveedor',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Menu) => (
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
        </Space>
      ),
    },
  ];

  const platoColumns = [
    {
      title: 'Nombre',
      dataIndex: 'desc_plato',
      key: 'desc_plato',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Plato) => (
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

  const filteredMenus = menus.filter(menu => {
    const matchesSearch = menu.desc_menu.toLowerCase().includes(searchText.toLowerCase());
    const matchesProveedor = !proveedorFilter || menu.id_proveedor.toString() === proveedorFilter;
    return matchesSearch && matchesProveedor;
  });

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
                <Option key={event.id_evento} value={event.id_evento.toString()}>
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
              <Option value="solicitado">Solicitado</Option>
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
          dataSource={cateringServices.filter(service => {
            const matchesSearch = searchText
              ? service.id_catering.toString().includes(searchText) ||
                service.evento?.nombre_evento.toLowerCase().includes(searchText.toLowerCase())
              : true;
            const matchesEvent = eventFilter
              ? service.id_evento.toString() === eventFilter
              : true;
            const matchesStatus = statusFilter
              ? service.estado_catering.toLowerCase() === statusFilter
              : true;
            return matchesSearch && matchesEvent && matchesStatus;
          })}
          loading={loading}
          rowKey="id_catering"
        />
      </StyledCard>

      <StyledCard>
        <Tabs defaultActiveKey="1" items={[
          {
            key: '1',
            label: 'Menús',
            children: (
              <>
                <TableActions>
                  <FilterContainer>
                    <Search
                      placeholder="Buscar menú"
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      style={{ width: 200 }}
                    />
                    <Select
                      placeholder="Filtrar por proveedor"
                      value={proveedorFilter}
                      onChange={value => setProveedorFilter(value)}
                      allowClear
                      style={{ width: 200 }}
                    >
                      {proveedores.map(proveedor => (
                        <Option key={proveedor.id_proveedor} value={proveedor.id_proveedor.toString()}>
                          {proveedor.nombre_proveedor}
                        </Option>
                      ))}
                    </Select>
                  </FilterContainer>
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
                  dataSource={menus.filter(menu => {
                    const matchesSearch = searchText
                      ? menu.desc_menu.toLowerCase().includes(searchText.toLowerCase())
                      : true;
                    const matchesProveedor = proveedorFilter
                      ? menu.id_proveedor.toString() === proveedorFilter
                      : true;
                    return matchesSearch && matchesProveedor;
                  })}
                  rowKey="id_menu"
                  loading={loadingMenus}
                  locale={{
                    emptyText: 'No hay menús disponibles'
                  }}
                />
              </>
            )
          },
          {
            key: '2',
            label: 'Platos',
            children: (
              <>
                <TableActions>
                  <FilterContainer>
                    <Search
                      placeholder="Buscar plato"
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      style={{ width: 200 }}
                    />
                  </FilterContainer>
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
                  dataSource={platos.filter(plato =>
                    searchText
                      ? plato.desc_plato.toLowerCase().includes(searchText.toLowerCase())
                      : true
                  )}
                  rowKey="id_plato"
                  loading={loadingPlatos}
                  locale={{
                    emptyText: 'No hay platos disponibles'
                  }}
                />
              </>
            )
          }
        ]} />
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
                <h4>{menu.desc_menu}</h4>
                <p>{menu.desc_menu}</p>
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
            name="personas_catering"
            label="Número de Personas"
            rules={[{ required: true, message: 'Por favor ingrese el número de personas' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="Menús Seleccionados"
          >
            <List
              dataSource={selectedMenus}
              renderItem={menu => (
                <List.Item>
                  <div>{menu.desc_menu} - ${menu.precio_menu}</div>
                </List.Item>
              )}
            />
            <div style={{ marginTop: 16 }}>
              <strong>Total: $
                {(selectedMenus.reduce((sum, menu) => sum + menu.precio_menu, 0) * 1.18).toFixed(2)}
              </strong> (Incluye ITBIS)
            </div>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Crear Servicio
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Formulario de Menú */}
      <Modal
        title="Menú"
        open={showMenuForm}
        onCancel={() => {
          setShowMenuForm(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleMenuFormSubmit}
        >
          <Form.Item
            name="desc_menu"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="precio_menu"
            label="Precio"
            rules={[{ required: true, message: 'Por favor ingrese el precio' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item
            name="id_proveedor"
            label="Proveedor"
            rules={[{ required: true, message: 'Por favor seleccione un proveedor' }]}
          >
            <Select>
              {proveedores.map(proveedor => (
                <Option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                  {proveedor.nombre_proveedor}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Guardar Menú
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Formulario de Plato */}
      <Modal
        title="Plato"
        open={showPlatoForm}
        onCancel={() => {
          setShowPlatoForm(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePlatoFormSubmit}
        >
          <Form.Item
            name="desc_plato"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Guardar Plato
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CateringAdmin;