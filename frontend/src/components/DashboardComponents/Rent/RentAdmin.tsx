import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Input,
  Select,
  Form,
  message,
  List,
  Card,
  InputNumber,
  Space,
  DatePicker,
  Typography,
} from 'antd';
import { PlusOutlined, RightOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import styled from 'styled-components';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

const apiUrl = import.meta.env.VITE_API_BASE_URL;

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

const ModalContent = styled.div`
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;
  margin-bottom: ${props => props.hasSelection ? '80px' : '0'};

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--beige);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--dark-gold);
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
  color: white;
  z-index: 1000;
  
  &:hover {
    background-color: var(--gold) !important;
    border-color: var(--dark-gold) !important;
    color: white !important;
  }
`;

const ListItem = styled(List.Item)`
  margin: 8px 0;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid var(--beige);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    background-color: var(--beige-light);
    border-color: var(--dark-gold);
    
    .ant-typography {
      color: var(--dark-gold);
    }
  }
`;

const ButtonGroup = styled(Space)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  gap: 12px;
`;

const ResetButton = styled(Button)`
  margin-right: 8px;
  border-color: var(--dark-gold);
  color: var(--dark-gold);
  
  &:hover {
    background-color: var(--beige-light) !important;
    border-color: var(--dark-gold) !important;
    color: var(--dark-gold) !important;
  }
`;

const HeaderButton = styled(Button)`
  margin-right: 8px;
  background-color: var(--dark-gold);
  border-color: var(--gold);
  color: white;
  
  &:hover {
    background-color: var(--gold) !important;
    border-color: var(--dark-gold) !important;
    color: white !important;
  }
`;

const ResetIcon = styled(ReloadOutlined)`
  margin-right: 16px;
  font-size: 18px;
  color: var(--dark-gold);
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: rotate(180deg);
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
      nombre_categoria: string;
    };
  };
}

interface ElementoSeleccionado extends Elemento {
  cantidad_seleccionada: number;
}

const RentAdmin: React.FC = () => {
  const [alquileres, setAlquileres] = useState([]);
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [elementosSeleccionados, setElementosSeleccionados] = useState<ElementoSeleccionado[]>([]);
  const [showCatalogo, setShowCatalogo] = useState(false);
  const [showFormulario, setShowFormulario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetchAlquileres();
    fetchElementos();
    fetchEventos();
    fetchCategorias();
  }, []);

  const fetchAlquileres = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }
      console.log('Fetching alquileres with token...');
      const response = await axios.get(`${apiUrl}/alquiler`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Response from /alquiler:', response.data);
      if (response.data) {
        setAlquileres(response.data);
      } else {
        setAlquileres([]);
      }
    } catch (error) {
      console.error('Error al cargar los alquileres:', error);
      message.error('Error al cargar los alquileres');
      setAlquileres([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchElementos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }
      const response = await axios.get(`${apiUrl}/elemento`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setElementos(response.data);
    } catch (error) {
      message.error('Error al cargar los elementos');
    }
  };

  const fetchEventos = async () => {
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
      setEventos(response.data);
    } catch (error) {
      message.error('Error al cargar los eventos');
    }
  };

  const fetchCategorias = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }
      const response = await axios.get(`${apiUrl}/elemento/categorias/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCategorias(response.data);
    } catch (error) {
      message.error('Error al cargar las categorías');
    }
  };

  const handleCantidadChange = (elemento: Elemento, cantidad: number) => {
    if (cantidad === 0) {
      setElementosSeleccionados(prev => 
        prev.filter(item => item.id_elemento !== elemento.id_elemento)
      );
    } else {
      setElementosSeleccionados(prev => {
        const exists = prev.find(item => item.id_elemento === elemento.id_elemento);
        if (exists) {
          return prev.map(item =>
            item.id_elemento === elemento.id_elemento
              ? { ...item, cantidad_seleccionada: cantidad }
              : item
          );
        } else {
          return [...prev, { ...elemento, cantidad_seleccionada: cantidad }];
        }
      });
    }
  };

  const handleContinuar = () => {
    if (elementosSeleccionados.length === 0) {
      message.warning('Seleccione al menos un elemento');
      return;
    }
    setShowCatalogo(false);
    setShowFormulario(true);
  };

  const handleSubmitAlquiler = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      if (!values.id_evento) {
        message.error('Por favor seleccione un evento');
        return;
      }

      if (!values.fecha_inicio || !values.fecha_fin) {
        message.error('Por favor seleccione las fechas de inicio y fin');
        return;
      }

      if (elementosSeleccionados.length === 0) {
        message.error('Por favor seleccione al menos un elemento');
        return;
      }

      // Calcular subtotales y totales
      const precioNeto = elementosSeleccionados.reduce((sum, elem) => 
        sum + (elem.precio_elemento * elem.cantidad_seleccionada), 0
      );
      const itbis = precioNeto * 0.18; // 18% ITBIS
      const total = precioNeto + itbis;

      const alquilerData = {
        id_evento: values.id_evento,
        fecha_inicio: values.fecha_inicio.format('YYYY-MM-DD'),
        fecha_fin: values.fecha_fin.format('YYYY-MM-DD'),
        estado_alquiler: 'Solicitado',
        precioneto_alquiler: precioNeto.toFixed(2),
        itbis_alquiler: itbis.toFixed(2),
        total_alquiler: total.toFixed(2),
        cant_elementos_alquiler: elementosSeleccionados.reduce((sum, elem) => sum + elem.cantidad_seleccionada, 0),
        elementos: elementosSeleccionados.map(elem => ({
          id_elemento: elem.id_elemento,
          cantidad: elem.cantidad_seleccionada,
          precio_unitario: elem.precio_elemento,
          subtotal: (elem.precio_elemento * elem.cantidad_seleccionada).toFixed(2)
        }))
      };

      console.log('Enviando datos de alquiler:', JSON.stringify(alquilerData, null, 2));

      const response = await axios.post(`${apiUrl}/alquiler`, alquilerData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Respuesta del servidor:', response.data);

      message.success('Alquiler creado exitosamente');
      setShowFormulario(false);
      setElementosSeleccionados([]);
      form.resetFields();
      fetchAlquileres();
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Error response:', error.response?.data);
      message.error(error.response?.data?.message || 'Error al crear el alquiler. Por favor, verifica los datos e intenta nuevamente.');
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
      title: 'Fecha Inicio',
      dataIndex: 'fecha_inicio',
      key: 'fecha_inicio',
    },
    {
      title: 'Fecha Fin',
      dataIndex: 'fecha_fin',
      key: 'fecha_fin',
    },
    {
      title: 'Estado',
      dataIndex: 'estado_alquiler',
      key: 'estado_alquiler',
      render: (estado: string, record: any) => (
        <Select
          defaultValue={estado}
          style={{ width: 120 }}
          onChange={(value) => handleEstadoChange(record.id_alquiler, value)}
        >
          <Option value="Solicitado">Solicitado</Option>
          <Option value="Aceptado">Aceptado</Option>
          <Option value="Completado">Completado</Option>
          <Option value="Cancelado">Cancelado</Option>
        </Select>
      ),
    },
    {
      title: 'Cantidad Elementos',
      dataIndex: 'cant_elementos_alquiler',
      key: 'cant_elementos_alquiler',
    },
    {
      title: 'Precio Neto',
      dataIndex: 'precioneto_alquiler',
      key: 'precioneto_alquiler',
      render: (precio: number) => `$${Number(precio).toFixed(2)}`,
    },
    {
      title: 'ITBIS',
      dataIndex: 'itbis_alquiler',
      key: 'itbis_alquiler',
      render: (itbis: number) => `$${Number(itbis).toFixed(2)}`,
    },
    {
      title: 'Total',
      dataIndex: 'total_alquiler',
      key: 'total_alquiler',
      render: (total: number) => `$${Number(total).toFixed(2)}`,
    },
  ];

  const handleEstadoChange = async (id: number, estado: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${apiUrl}/alquiler/${id}`, 
        { estado_alquiler: estado },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      message.success('Estado actualizado correctamente');
      fetchAlquileres();
    } catch (error) {
      message.error('Error al actualizar el estado');
    }
  };

  const handleReset = () => {
    setElementosSeleccionados([]);
    message.success('Selección reiniciada');
  };

  const filteredElementos = elementos.filter(elemento => {
    const matchesSearch = elemento.nombre_elemento.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategoria = !filterCategoria || 
      elemento.subcategoria.categoria.nombre_categoria === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

  return (
    <>
      <StyledCard title="Gestión de Alquileres">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowCatalogo(true)}
          style={{ marginBottom: 16 }}
        >
          Nuevo Alquiler
        </Button>

        <Table
          columns={columns}
          dataSource={alquileres}
          loading={loading}
          rowKey="id_alquiler"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No hay alquileres registrados' }}
        />
      </StyledCard>

      {/* Modal de Catálogo */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 'auto' }}>Seleccionar Elementos</span>
            <ResetIcon 
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              title="Reiniciar selección"
            />
          </div>
        }
        open={showCatalogo}
        onCancel={() => {
          setShowCatalogo(false);
          setElementosSeleccionados([]);
        }}
        width={800}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Search
            placeholder="Buscar elementos"
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Filtrar por categoría"
            onChange={setFilterCategoria}
            allowClear
            style={{ width: 200 }}
          >
            {categorias.map((cat: any) => (
              <Option key={cat.id_categoria} value={cat.nombre_categoria}>
                {cat.nombre_categoria}
              </Option>
            ))}
          </Select>
        </Space>

        <ModalContent hasSelection={elementosSeleccionados.length > 0}>
          <List
            dataSource={filteredElementos}
            renderItem={(elemento: Elemento) => (
              <ListItem
                className={elementosSeleccionados.some(e => e.id_elemento === elemento.id_elemento) ? 'selected' : ''}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ flex: 1 }}>
                    <Title level={5} style={{ margin: 0 }}>{elemento.nombre_elemento}</Title>
                    <Space direction="vertical" size={0} style={{ marginTop: 8 }}>
                      <Typography.Text type="secondary">
                        Categoría: {elemento.subcategoria.categoria.nombre_categoria} - {elemento.subcategoria.nombre_subcategoria}
                      </Typography.Text>
                      <Typography.Text>
                        Precio: <Typography.Text strong>${elemento.precio_elemento}</Typography.Text>
                      </Typography.Text>
                      <Typography.Text>
                        Disponibles: <Typography.Text strong>{elemento.cantidad_disponible}</Typography.Text>
                      </Typography.Text>
                    </Space>
                  </div>
                  <Space align="center">
                    <Typography.Text>Cantidad:</Typography.Text>
                    <InputNumber
                      min={0}
                      max={elemento.cantidad_disponible}
                      value={elementosSeleccionados.find(e => e.id_elemento === elemento.id_elemento)?.cantidad_seleccionada || 0}
                      onChange={(value) => handleCantidadChange(elemento, value || 0)}
                      style={{ width: 80 }}
                    />
                  </Space>
                </div>
              </ListItem>
            )}
          />
        </ModalContent>

        {elementosSeleccionados.length > 0 && (
          <ContinueButton onClick={handleContinuar}>
            Continuar con el Alquiler <RightOutlined />
          </ContinueButton>
        )}
      </Modal>

      {/* Modal de Formulario de Alquiler */}
      <Modal
        title="Completar Alquiler"
        open={showFormulario}
        onCancel={() => {
          setShowFormulario(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitAlquiler}
        >
          <Form.Item
            name="id_evento"
            label="Evento"
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

          <Form.Item
            name="fecha_inicio"
            label="Fecha de Inicio"
            rules={[{ required: true, message: 'Por favor seleccione la fecha de inicio' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="fecha_fin"
            label="Fecha de Fin"
            rules={[{ required: true, message: 'Por favor seleccione la fecha de fin' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Title level={5}>Elementos Seleccionados:</Title>
          <List
            dataSource={elementosSeleccionados}
            renderItem={(elemento) => (
              <List.Item>
                <div>
                  {elemento.nombre_elemento} - Cantidad: {elemento.cantidad_seleccionada}
                  <div>Subtotal: ${(elemento.precio_elemento * elemento.cantidad_seleccionada).toFixed(2)}</div>
                </div>
              </List.Item>
            )}
          />

          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <strong>Total: $
              {elementosSeleccionados.reduce((total, elem) => 
                total + (elem.precio_elemento * elem.cantidad_seleccionada), 0).toFixed(2)}
            </strong>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Crear Alquiler
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default RentAdmin;