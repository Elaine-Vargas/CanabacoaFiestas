import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Select,
  Space,
  Tag,
  Tooltip,
  Avatar,
  Descriptions,
  Typography,
  Divider,
  message,
  Card,
  Table,
  Spin,
  Badge,
  Row,
  Col,
  Drawer,
  Result
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  CloseOutlined
} from '@ant-design/icons';
import axios from 'axios';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { apiUrl } from '../../../config';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const StyledCard = styled(Card)`
  margin: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 8px var(--color-shadow);
  background-color: var(--color-background2);
  
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
`;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 15px;
    overflow: hidden;
  }
  
  .ant-modal-header {
    background-color: var(--beige);
    border-bottom: 2px solid var(--dark-gold);
    padding: 16px 24px;
    
    .ant-modal-title {
      color: var(--color-text2);
      font-family: "Montserrat Alternates", sans-serif;
      font-weight: 600;
    }
  }
`;

const CatalogModal = styled(Modal)`
  .ant-modal-content {
    width: 90vw;
    max-width: 1200px;
  }
`;

const ElementCard = styled(Card)`
  margin: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .ant-card-cover img {
    border-radius: 8px 8px 0 0;
    height: 200px;
    object-fit: cover;
  }
`;

const CartButton = styled(Button)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
`;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-content-wrapper {
    width: 500px !important;
  }
  
  .ant-drawer-body {
    padding: 24px;
  }
`;

interface Elemento {
  id_elemento: number;
  nombre_elemento: string;
  precio_elemento: number;
  cantidad_disponible: number;
  imagen_url?: string;
  subcategoria: {
    nombre_subcategoria: string;
    categoria: {
      id_categoria: number;
      nombre_categoria: string;
    };
  };
}

interface ElementoSeleccionado extends Elemento {
  cantidad_seleccionada: number;
}

interface DetalleAlquiler {
  id_elemento: number;
  elemento: Elemento;
  cantidad_alquiler: number;
  precio_unitario: number;
  total_alquiler: number;
  estado_detalquiler: string;
}

interface Alquiler {
  id_alquiler: number;
  estado_alquiler: string;
  precioneto_alquiler: number;
  itbis_alquiler: number;
  total_alquiler: number;
  cant_elementos_alquiler: number;
  evento?: {
    id_evento: number;
    nombre_evento: string;
    fecha_evento: string;
  };
  detalles?: DetalleAlquiler[];
}

interface Evento {
  id_evento: number;
  nombre_evento: string;
  tipo_evento: string;
  fecha_evento: string;
  hora_inicio: string;
  hora_fin: string;
  lugar_evento: string;
  descripcion: string;
  estado_evento: string;
}

const RentClient: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [alquileres, setAlquileres] = useState<Alquiler[]>([]);
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [elementosSeleccionados, setElementosSeleccionados] = useState<ElementoSeleccionado[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [catalogModalVisible, setCatalogModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Alquiler | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [showCatalogo, setShowCatalogo] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAlquiler, setEditingAlquiler] = useState<Alquiler | null>(null);
  const [searchAlquiler, setSearchAlquiler] = useState('');
  const [filterEvento, setFilterEvento] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userRole = Number(userData.rol);

        if (!token || userRole !== 2) {
          setError('No tienes permisos para acceder a esta sección');
          navigate('/Login');
          return;
        }

        if (!userData.id_usuario) {
          setError('No se encontró información del usuario');
          navigate('/Login');
          return;
        }

        await fetchInitialData();
      } catch (error) {
        console.error('Error en la autenticación:', error);
        setError('Error al verificar la autenticación');
        navigate('/Login');
      }
    };

    checkAuth();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token disponible');
      }

      const headers = { Authorization: `Bearer ${token}` };
      await Promise.all([
        fetchAlquileres(),
        fetchElementos(),
        fetchEventos()
      ]);
    } catch (error) {
      console.error('Error al cargar los datos iniciales:', error);
      message.error('Error al cargar los datos iniciales');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchAlquileres = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/alquiler/usuario/${userData.id_usuario}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlquileres(response.data);
    } catch (error) {
      message.error('Error al cargar los alquileres');
    }
  };

  const fetchElementos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/elemento`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setElementos(response.data);
    } catch (error) {
      message.error('Error al cargar los elementos');
    }
  };

  const fetchEventos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/eventos/usuario/${userData.id_usuario}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEventos(response.data);
    } catch (error) {
      message.error('Error al cargar los eventos');
    }
  };

  const handleCantidadChange = (elemento: Elemento, cantidad: number) => {
    const elementoExistente = elementosSeleccionados.find(
      (item) => item.id_elemento === elemento.id_elemento
    );

    if (elementoExistente) {
      setElementosSeleccionados(
        elementosSeleccionados.map((item) =>
          item.id_elemento === elemento.id_elemento
            ? { ...item, cantidad_seleccionada: cantidad }
            : item
        )
      );
    } else {
      setElementosSeleccionados([
        ...elementosSeleccionados,
        { ...elemento, cantidad_seleccionada: cantidad }
      ]);
    }
  };

  const handleEdit = async (record: Alquiler) => {
    setSelectedRecord(record);
    setEditModalVisible(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/alquiler/${record.id_alquiler}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const alquilerData = response.data;
      editForm.setFieldsValue({
        evento_id: alquilerData.evento?.id_evento,
        elementos: alquilerData.detalles?.map((detalle: DetalleAlquiler) => ({
          elemento_id: detalle.id_elemento,
          cantidad: detalle.cantidad_alquiler
        }))
      });
      setElementosSeleccionados(
        alquilerData.detalles?.map((detalle: DetalleAlquiler) => ({
          ...detalle.elemento,
          cantidad_seleccionada: detalle.cantidad_alquiler
        })) || []
      );
    } catch (error) {
      message.error('Error al cargar los detalles del alquiler');
    }
  };

  const handleView = async (record: Alquiler) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/alquiler/${record.id_alquiler}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedRecord(response.data);
      setViewModalVisible(true);
    } catch (error) {
      message.error('Error al cargar los detalles del alquiler');
    }
  };

  const handleEditSubmit = async (values: any) => {
    try {
      if (elementosSeleccionados.length === 0) {
        message.error('Debe seleccionar al menos un elemento');
        return;
      }

      const token = localStorage.getItem('token');
      const detalles = elementosSeleccionados.map(elemento => ({
        id_elemento: elemento.id_elemento,
        cantidad_alquiler: elemento.cantidad_seleccionada,
        precio_unitario: elemento.precio_elemento
      }));

      const total = detalles.reduce(
        (sum, detalle) => sum + detalle.cantidad_alquiler * detalle.precio_unitario,
        0
      );

      const alquilerData = {
        evento_id: values.evento_id,
        detalles: detalles,
        precioneto_alquiler: total,
        itbis_alquiler: total * 0.18,
        total_alquiler: total * 1.18,
        cant_elementos_alquiler: detalles.reduce((sum, detalle) => sum + detalle.cantidad_alquiler, 0)
      };

      if (!selectedRecord) {
        message.error('Error: No se encontró el alquiler a editar');
        return;
      }

      await axios.put(
        `${apiUrl}/alquiler/${selectedRecord.id_alquiler}`,
        alquilerData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success('Alquiler actualizado exitosamente');
      setEditModalVisible(false);
      setElementosSeleccionados([]);
      editForm.resetFields();
      fetchAlquileres();
    } catch (error) {
      message.error('Error al actualizar el alquiler');
    }
  };

  const handleSubmitAlquiler = async (values: any) => {
    try {
      if (elementosSeleccionados.length === 0) {
        message.error('Debe seleccionar al menos un elemento');
        return;
      }

      const token = localStorage.getItem('token');
      const detalles = elementosSeleccionados.map(elemento => ({
        id_elemento: elemento.id_elemento,
        cantidad_alquiler: elemento.cantidad_seleccionada,
        precio_unitario: elemento.precio_elemento
      }));

      const total = detalles.reduce(
        (sum, detalle) => sum + detalle.cantidad_alquiler * detalle.precio_unitario,
        0
      );

      const alquilerData = {
        evento_id: values.evento_id,
        detalles: detalles,
        precioneto_alquiler: total,
        itbis_alquiler: total * 0.18,
        total_alquiler: total * 1.18,
        cant_elementos_alquiler: detalles.reduce((sum, detalle) => sum + detalle.cantidad_alquiler, 0),
        estado_alquiler: 'Pendiente'
      };

      await axios.post(`${apiUrl}/alquiler`, alquilerData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success('Alquiler creado exitosamente');
      setModalVisible(false);
      setElementosSeleccionados([]);
      form.resetFields();
      fetchAlquileres();
    } catch (error) {
      message.error('Error al crear el alquiler');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id_alquiler',
      key: 'id_alquiler',
    },
    {
      title: 'Evento',
      dataIndex: ['evento', 'nombre_evento'],
      key: 'evento',
    },
    {
      title: 'Estado',
      dataIndex: 'estado_alquiler',
      key: 'estado_alquiler',
      render: (estado: string) => (
        <Tag color={
          estado === 'Pendiente' ? 'gold' :
          estado === 'Aprobado' ? 'green' :
          estado === 'Rechazado' ? 'red' :
          estado === 'Completado' ? 'blue' : 'default'
        }>
          {estado}
        </Tag>
      ),
    },
    {
      title: 'Cantidad de Elementos',
      dataIndex: 'cant_elementos_alquiler',
      key: 'cant_elementos_alquiler',
    },
    {
      title: 'Total',
      dataIndex: 'total_alquiler',
      key: 'total_alquiler',
      render: (total: number) => `$${total.toFixed(2)}`,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Alquiler) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={record.estado_alquiler !== 'Pendiente'}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderCatalogo = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
      {elementos.map((elemento) => (
        <ElementCard
          key={elemento.id_elemento}
          hoverable
          style={{ width: 240 }}
          cover={
            <img
              alt={elemento.nombre_elemento}
              src={elemento.imagen_url || 'https://via.placeholder.com/200'}
            />
          }
        >
          <Card.Meta
            title={elemento.nombre_elemento}
            description={`$${elemento.precio_elemento.toFixed(2)}`}
          />
          <div style={{ marginTop: '16px' }}>
            <InputNumber
              min={0}
              max={elemento.cantidad_disponible}
              defaultValue={
                elementosSeleccionados.find(
                  (item) => item.id_elemento === elemento.id_elemento
                )?.cantidad_seleccionada || 0
              }
              onChange={(value) => handleCantidadChange(elemento, value || 0)}
              style={{ width: '100%' }}
            />
          </div>
        </ElementCard>
      ))}
    </div>
  );

  const filteredElementos = elementos.filter(elemento => {
    const matchesSearch = elemento.nombre_elemento.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategoria = !filterCategoria || 
      elemento.subcategoria.categoria.nombre_categoria === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="403"
        title="Error de Acceso"
        subTitle={error}
        extra={
          <Button type="primary" onClick={() => navigate('/Login')}>
            Volver al Login
          </Button>
        }
      />
    );
  }

  return (
    <>
      <StyledCard title="Mis Alquileres">
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCatalogo(true)}
            >
              Nuevo Alquiler
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchAlquileres}
            >
              Recargar
            </Button>
          </Space>

          <Space wrap>
            <Input.Search
              placeholder="Buscar por ID de alquiler"
              allowClear
              style={{ width: 200 }}
              value={searchAlquiler}
              onChange={(e) => setSearchAlquiler(e.target.value)}
            />
            <Select
              placeholder="Filtrar por evento"
              allowClear
              style={{ width: 200 }}
              value={filterEvento}
              onChange={setFilterEvento}
            >
              {eventos.map((evento: any) => (
                <Option key={evento.id_evento} value={evento.id_evento.toString()}>
                  {evento.nombre_evento}
                </Option>
              ))}
            </Select>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={alquileres.filter(alquiler => 
            searchAlquiler ? 
              alquiler.id_alquiler.toString().includes(searchAlquiler) : true
          )}
          loading={loading}
          rowKey="id_alquiler"
          pagination={{ pageSize: 10 }}
        />
      </StyledCard>

      {/* Modal del catálogo */}
      <Modal
        title="Catálogo de Elementos"
        open={showCatalogo}
        onCancel={() => {
          setShowCatalogo(false);
          setElementosSeleccionados([]);
        }}
        footer={null}
        width={1000}
      >
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="Buscar elementos..."
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            style={{ width: 200 }}
            placeholder="Filtrar por categoría"
            allowClear
            onChange={(value) => setFilterCategoria(value)}
          >
            {elementos.map((elemento: any) => (
              <Option 
                key={`cat-${elemento.subcategoria.categoria.id_categoria}`} 
                value={elemento.subcategoria.categoria.nombre_categoria}
              >
                {elemento.subcategoria.categoria.nombre_categoria}
              </Option>
            ))}
          </Select>
        </Space>

        <Row gutter={[16, 16]}>
          {filteredElementos.map(elemento => (
            <Col xs={24} sm={12} md={8} lg={6} key={elemento.id_elemento}>
              <ElementCard
                hoverable
                cover={
                  elemento.imagen_url ? (
                    <img alt={elemento.nombre_elemento} src={elemento.imagen_url} />
                  ) : (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                      <InboxOutlined style={{ fontSize: 48, color: '#999' }} />
                    </div>
                  )
                }
              >
                <Card.Meta
                  title={elemento.nombre_elemento}
                  description={
                    <Space direction="vertical">
                      <Text>Precio: ${elemento.precio_elemento}</Text>
                      <Text>Disponibles: {elemento.cantidad_disponible}</Text>
                      <InputNumber
                        min={0}
                        max={elemento.cantidad_disponible}
                        value={elementosSeleccionados.find(e => e.id_elemento === elemento.id_elemento)?.cantidad_seleccionada || 0}
                        onChange={(value) => handleCantidadChange(elemento, value || 0)}
                        style={{ width: '100%' }}
                      />
                    </Space>
                  }
                />
              </ElementCard>
            </Col>
          ))}
        </Row>

        {elementosSeleccionados.length > 0 && (
          <Button
            type="primary"
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000
            }}
            icon={
              <Badge count={elementosSeleccionados.length}>
                <ShoppingCartOutlined style={{ fontSize: 24, color: 'white' }} />
              </Badge>
            }
            onClick={() => setShowCart(true)}
          />
        )}
      </Modal>

      {/* Carrito */}
      <StyledDrawer 
        title="Carrito de Alquiler"
        placement="right"
        onClose={() => setShowCart(false)}
        open={showCart}
      >
        <div style={{ position: 'relative' }}>
          <Title level={4}>Carrito de Alquiler</Title>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setShowCart(false)}
            style={{ position: 'absolute', right: 0, top: 0 }}
          />
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitAlquiler}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="id_evento"
            label="Seleccionar Evento"
            rules={[{ required: true, message: 'Por favor seleccione un evento' }]}
          >
            <Select>
              {eventos.map((evento: any) => (
                <Option key={evento.id_evento} value={evento.id_evento}>
                  {evento.nombre_evento}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <List
            dataSource={elementosSeleccionados}
            renderItem={(elemento) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    elemento.imagen_url ? (
                      <Avatar src={elemento.imagen_url} />
                    ) : (
                      <Avatar icon={<InboxOutlined />} />
                    )
                  }
                  title={elemento.nombre_elemento}
                  description={`Cantidad: ${elemento.cantidad_seleccionada}`}
                />
                <div>${(elemento.precio_elemento * elemento.cantidad_seleccionada).toFixed(2)}</div>
              </List.Item>
            )}
          />

          <Divider />

          <div style={{ marginBottom: 16 }}>
            <Text strong>Subtotal: </Text>
            <Text>
              ${elementosSeleccionados.reduce((sum, elem) => 
                sum + (elem.precio_elemento * elem.cantidad_seleccionada), 0).toFixed(2)}
            </Text>
            <br />
            <Text strong>ITBIS (18%): </Text>
            <Text>
              ${(elementosSeleccionados.reduce((sum, elem) => 
                sum + (elem.precio_elemento * elem.cantidad_seleccionada), 0) * 0.18).toFixed(2)}
            </Text>
            <br />
            <Text strong>Total: </Text>
            <Text>
              ${(elementosSeleccionados.reduce((sum, elem) => 
                sum + (elem.precio_elemento * elem.cantidad_seleccionada), 0) * 1.18).toFixed(2)}
            </Text>
          </div>

          <Button type="primary" htmlType="submit" block>
            Crear Alquiler
          </Button>
        </Form>
      </StyledDrawer>

      {/* Modal de Vista Detallada */}
      <Modal
        title="Detalles del Alquiler"
        open={showViewModal}
        onCancel={() => {
          setShowViewModal(false);
          setSelectedRecord(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setShowViewModal(false);
            setSelectedRecord(null);
          }}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Descriptions title="Información General" bordered column={2}>
              <Descriptions.Item label="ID Alquiler">
                {selectedRecord.id_alquiler}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={
                  selectedRecord.estado_alquiler === 'Solicitado' ? 'processing' :
                  selectedRecord.estado_alquiler === 'Aceptado' ? 'warning' :
                  selectedRecord.estado_alquiler === 'Completado' ? 'success' :
                  'error'
                }>
                  {selectedRecord.estado_alquiler}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Evento">
                {selectedRecord.evento?.nombre_evento || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha del Evento">
                {selectedRecord.evento?.fecha_evento ? 
                  dayjs(selectedRecord.evento.fecha_evento).format('DD/MM/YYYY') : 
                  'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Cantidad de Elementos">
                {selectedRecord.cant_elementos_alquiler}
              </Descriptions.Item>
              <Descriptions.Item label="Precio Neto">
                ${selectedRecord.precioneto_alquiler.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="ITBIS">
                ${selectedRecord.itbis_alquiler.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Total">
                ${selectedRecord.total_alquiler.toFixed(2)}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Elementos del Alquiler</Divider>
            
            <List
              itemLayout="horizontal"
              dataSource={selectedRecord.detalles}
              renderItem={(detalle: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      detalle.elemento.imagen_url ? (
                        <Avatar shape="square" size={64} src={detalle.elemento.imagen_url} />
                      ) : (
                        <Avatar shape="square" size={64} icon={<InboxOutlined />} />
                      )
                    }
                    title={detalle.elemento.nombre_elemento}
                    description={
                      <Space direction="vertical">
                        <Text>Cantidad: {detalle.cantidad_alquiler}</Text>
                        <Text>Precio Unitario: ${detalle.precio_unitario.toFixed(2)}</Text>
                        <Text>Subtotal: ${detalle.total_alquiler.toFixed(2)}</Text>
                        <Text>Categoría: {detalle.elemento.subcategoria.categoria.nombre_categoria} - {detalle.elemento.subcategoria.nombre_subcategoria}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>

      {/* Modal de Edición */}
      <Modal
        title="Editar Alquiler"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setEditingAlquiler(null);
        }}
        footer={null}
        width={800}
      >
        {editingAlquiler && (
          <div>
            <Title level={5}>Estado del Alquiler: {editingAlquiler.estado_alquiler}</Title>
            
            <List
              dataSource={editingAlquiler.detalles}
              renderItem={(detalle: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      detalle.elemento.imagen_url ? (
                        <Avatar shape="square" size={64} src={detalle.elemento.imagen_url} />
                      ) : (
                        <Avatar shape="square" size={64} icon={<InboxOutlined />} />
                      )
                    }
                    title={detalle.elemento.nombre_elemento}
                    description={
                      <Space direction="vertical">
                        <InputNumber
                          min={0}
                          max={detalle.elemento.cantidad_disponible + detalle.cantidad_alquiler}
                          value={detalle.cantidad_alquiler}
                          onChange={(value) => {
                            const newDetalles = editingAlquiler.detalles?.map(d => 
                              d.id_elemento === detalle.id_elemento
                                ? { ...d, cantidad_alquiler: value || 0 }
                                : d
                            );
                            setEditingAlquiler({
                              ...editingAlquiler,
                              detalles: newDetalles
                            });
                          }}
                        />
                        <Text>Precio Unitario: ${detalle.precio_unitario.toFixed(2)}</Text>
                      </Space>
                    }
                  />
                  <div>${((detalle.cantidad_alquiler || 0) * detalle.precio_unitario).toFixed(2)}</div>
                </List.Item>
              )}
            />

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <Text strong>Total: </Text>
              <Text>
                ${(editingAlquiler.detalles?.reduce((sum, detalle) => 
                  sum + ((detalle.cantidad_alquiler || 0) * detalle.precio_unitario), 0) || 0).toFixed(2)}
              </Text>
            </div>

            <Button 
              type="primary"
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    message.error('No hay sesión activa');
                    return;
                  }

                  const detalles = editingAlquiler.detalles?.map(detalle => ({
                    id_elemento: detalle.id_elemento,
                    cantidad: detalle.cantidad_alquiler,
                    precio_unitario: detalle.precio_unitario,
                    subtotal: (detalle.cantidad_alquiler * detalle.precio_unitario).toFixed(2)
                  }));

                  const precioNeto = editingAlquiler.detalles?.reduce((sum, detalle) => 
                    sum + (detalle.cantidad_alquiler * detalle.precio_unitario), 0) || 0;
                  const itbis = precioNeto * 0.18;
                  const total = precioNeto + itbis;

                  const updateData = {
                    estado_alquiler: editingAlquiler.estado_alquiler,
                    precioneto_alquiler: Number(precioNeto.toFixed(2)),
                    itbis_alquiler: Number(itbis.toFixed(2)),
                    total_alquiler: Number(total.toFixed(2)),
                    cant_elementos_alquiler: editingAlquiler.detalles?.reduce((sum, detalle) => 
                      sum + detalle.cantidad_alquiler, 0) || 0,
                    elementos: detalles
                  };

                  await axios.patch(
                    `${apiUrl}/alquiler/${editingAlquiler.id_alquiler}`,
                    updateData,
                    {
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    }
                  );

                  message.success('Alquiler actualizado correctamente');
                  setShowEditModal(false);
                  setEditingAlquiler(null);
                  fetchAlquileres();
                } catch (error) {
                  console.error('Error al actualizar el alquiler:', error);
                  message.error('Error al actualizar el alquiler');
                }
              }}
            >
              Guardar Cambios
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
};

export default RentClient; 