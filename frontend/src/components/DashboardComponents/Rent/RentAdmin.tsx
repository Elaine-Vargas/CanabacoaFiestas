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
  Popconfirm,
  Divider,
  Tag,
  Tooltip,
} from 'antd';
import { PlusOutlined, RightOutlined, CloseOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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

const ModalContent = styled.div<{ hasSelection?: boolean }>`
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAlquiler, setEditingAlquiler] = useState<any>(null);
  const [searchAlquiler, setSearchAlquiler] = useState('');
  const [filterEvento, setFilterEvento] = useState<string | null>(null);
  const [filterEstado, setFilterEstado] = useState<string | null>(null);

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
    if (cantidad < 0 || cantidad > elemento.cantidad_disponible) {
      message.error(`La cantidad debe estar entre 0 y ${elemento.cantidad_disponible}`);
      return;
    }

    setElementosSeleccionados(prevElementos => {
      if (cantidad === 0) {
        // Si la cantidad es 0, remover el elemento
        return prevElementos.filter(e => e.id_elemento !== elemento.id_elemento);
      }

      const elementoExistente = prevElementos.find(e => e.id_elemento === elemento.id_elemento);
      if (elementoExistente) {
        // Si el elemento ya existe, actualizar su cantidad
        return prevElementos.map(e =>
          e.id_elemento === elemento.id_elemento
            ? { ...e, cantidad_seleccionada: cantidad }
            : e
        );
      } else {
        // Si el elemento no existe, agregarlo
        return [...prevElementos, { ...elemento, cantidad_seleccionada: cantidad }];
      }
    });
  };

  const handleContinuar = () => {
    if (!editingAlquiler) {
      setShowCatalogo(false);
      setShowFormulario(true);
    } else {
      setShowCatalogo(false);
    }
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

  const handleDelete = async (record: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      // Mostrar mensaje de confirmación con más detalles
      Modal.confirm({
        title: '¿Estás seguro de cancelar este alquiler?',
        content: (
          <div>
            <p>Al cancelar el alquiler:</p>
            <ul>
              <li>El estado cambiará a "Cancelado"</li>
              <li>No se podrá editar posteriormente</li>
              <li>Los elementos volverán a estar disponibles</li>
            </ul>
            <p>Esta acción no se puede deshacer.</p>
          </div>
        ),
        okText: 'Sí, cancelar',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            await axios.delete(
              `${apiUrl}/alquiler/${record.id_alquiler}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            message.success('Alquiler cancelado correctamente');
            // Esperar un momento antes de recargar los datos
            setTimeout(() => {
              fetchAlquileres();
              fetchElementos(); // Actualizar también la lista de elementos disponibles
            }, 500);
          } catch (error) {
            console.error('Error al cancelar el alquiler:', error);
            message.error('Error al cancelar el alquiler');
          }
        }
      });
    } catch (error) {
      console.error('Error al cancelar el alquiler:', error);
      message.error('Error al cancelar el alquiler');
    }
  };

  const handleEdit = (record: any) => {
    // Asegurarse de que el formulario de agregar alquiler no se muestre
    setShowFormulario(false);
    
    // Obtener los elementos actuales del alquiler
    const fetchElementosAlquiler = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('No hay sesión activa');
          return;
        }

        const response = await axios.get(`${apiUrl}/alquiler/${record.id_alquiler}/elementos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.data || response.data.length === 0) {
          message.warning('Este alquiler no tiene elementos asociados');
          return;
        }

        // Mapear los elementos con su cantidad
        const elementosConCantidad = response.data.map((detalle: any) => ({
          id_elemento: detalle.id_elemento,
          nombre_elemento: detalle.nombre_elemento,
          precio_elemento: detalle.precio_elemento,
          cantidad_disponible: detalle.cantidad_disponible + detalle.cantidad_alquiler, // Sumar la cantidad actual del alquiler
          imagen_url: detalle.imagen_url,
          subcategoria: detalle.subcategoria,
          cantidad_seleccionada: detalle.cantidad_alquiler,
          estado_detalquiler: detalle.estado_detalquiler
        }));

        console.log('Elementos cargados:', elementosConCantidad);
        setElementosSeleccionados(elementosConCantidad);
        setEditingAlquiler(record);
        setShowEditModal(true);
      } catch (error) {
        console.error('Error al obtener elementos del alquiler:', error);
        if (axios.isAxiosError(error) && error.response) {
          message.error(error.response.data.mensaje || 'Error al cargar los elementos del alquiler');
        } else {
          message.error('Error al cargar los elementos del alquiler');
        }
      }
    };

    fetchElementosAlquiler();
  };

  const handleEditSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      // Calcular subtotales y totales solo si hay elementos nuevos
      let updateData: any = {
        estado_alquiler: values.estado_alquiler
      };

      if (elementosSeleccionados.length > 0) {
        const precioNeto = elementosSeleccionados.reduce((sum, elem) => 
          sum + (elem.precio_elemento * elem.cantidad_seleccionada), 0
        );
        const itbis = precioNeto * 0.18;
        const total = precioNeto + itbis;

        updateData = {
          ...updateData,
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
      }

      console.log('Enviando datos de actualización:', JSON.stringify(updateData, null, 2));

      await axios.patch(`${apiUrl}/alquiler/${editingAlquiler.id_alquiler}`, 
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
      setElementosSeleccionados([]);
      setShowFormulario(false);
      
      // Esperar un momento antes de recargar los alquileres
      setTimeout(() => {
        fetchAlquileres();
        fetchElementos(); // Actualizar también la lista de elementos disponibles
      }, 500);
    } catch (error) {
      console.error('Error al actualizar el alquiler:', error);
      if (axios.isAxiosError(error) && error.response) {
        message.error(error.response.data.mensaje || 'Error al actualizar el alquiler');
      } else {
        message.error('Error al actualizar el alquiler');
      }
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id_alquiler',
      key: 'id_alquiler',
    },
    {
      title: 'ID Evento',
      dataIndex: ['evento', 'id_evento'],
      key: 'evento',
      render: (id_evento: number, record: any) => (
        <span>
          {id_evento} - {record.evento?.nombre_evento || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado_alquiler',
      key: 'estado_alquiler',
      render: (estado: string) => {
        let color = 'default';
        let text = estado;
        switch (estado) {
          case 'Solicitado':
            color = 'processing';
            break;
          case 'Aceptado':
            color = 'warning';
            break;
          case 'Completado':
            color = 'success';
            break;
          case 'Cancelado':
            color = 'error';
            text = 'Cancelado';
            break;
        }
        return <Tag color={color}>{text}</Tag>;
      },
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
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: any) => {
        // Si el alquiler está cancelado, mostrar mensaje informativo
        if (record.estado_alquiler === 'Cancelado') {
          return (
            <Tooltip title="Los alquileres cancelados no pueden ser modificados">
              <Typography.Text type="secondary">
                <CloseOutlined style={{ marginRight: 8 }} />
                Alquiler cancelado
              </Typography.Text>
            </Tooltip>
          );
        }

        return (
          <Space>
            <Tooltip title="Editar alquiler">
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
            <Tooltip title="Cancelar alquiler">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

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

  const filteredAlquileres = alquileres.filter((alquiler: any) => {
    const matchesSearch = searchAlquiler 
      ? alquiler.id_alquiler.toString().includes(searchAlquiler) ||
        (alquiler.evento?.id_evento.toString() || '').includes(searchAlquiler)
      : true;

    const matchesEvento = filterEvento
      ? alquiler.evento?.id_evento.toString() === filterEvento
      : true;

    const matchesEstado = filterEstado
      ? alquiler.estado_alquiler === filterEstado
      : true;

    return matchesSearch && matchesEvento && matchesEstado;
  });

  return (
    <>
      <StyledCard title="Gestión de Alquileres">
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
                  {evento.nombre_evento} (ID: {evento.id_evento})
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Filtrar por estado"
              allowClear
              style={{ width: 200 }}
              value={filterEstado}
              onChange={setFilterEstado}
            >
              <Option value="Solicitado">Solicitado</Option>
              <Option value="Aceptado">Aceptado</Option>
              <Option value="Completado">Completado</Option>
              <Option value="Cancelado">Cancelado</Option>
            </Select>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredAlquileres}
          loading={loading}
          rowKey="id_alquiler"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No hay alquileres registrados' }}
        />
      </StyledCard>

      {/* Modal de Catálogo */}
      <Modal
        title="Catálogo de Elementos"
        open={showCatalogo}
        onCancel={() => {
          setShowCatalogo(false);
          // Solo resetear elementos si no estamos en modo edición
          if (!editingAlquiler) {
            setElementosSeleccionados([]);
          }
        }}
        footer={null}
        width={800}
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
            {categorias.map((categoria: any) => (
              <Option key={categoria.id_categoria} value={categoria.id_categoria}>
                {categoria.nombre_categoria}
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
          <ButtonGroup>
            <ResetButton onClick={handleReset}>
              <ResetIcon />
              Resetear Selección
            </ResetButton>
            <HeaderButton onClick={() => {
              setShowCatalogo(false);
              // Solo mostrar el formulario si no estamos en modo edición
              if (!editingAlquiler) {
                setShowFormulario(true);
              }
            }}>
              Continuar <RightOutlined />
            </HeaderButton>
          </ButtonGroup>
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

      {/* Modal de Edición */}
      <Modal
        title="Editar Alquiler"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setEditingAlquiler(null);
          setElementosSeleccionados([]);
        }}
        footer={null}
        width={800}
      >
        {editingAlquiler && (
          <Form
            initialValues={{
              ...editingAlquiler,
            }}
            onFinish={handleEditSubmit}
            layout="vertical"
          >
            <Form.Item
              name="estado_alquiler"
              label="Estado"
              rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
            >
              <Select>
                <Option value="Solicitado">Solicitado</Option>
                <Option value="Aceptado">Aceptado</Option>
                <Option value="Completado">Completado</Option>
              </Select>
            </Form.Item>

            <Divider>Elementos del Alquiler</Divider>

            {/* Lista de elementos actuales */}
            <List
              dataSource={editingAlquiler.detalles || []}
              renderItem={(detalle: any) => (
                <ListItem>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                      <Typography.Text strong>{detalle.elemento.nombre_elemento}</Typography.Text>
                      <div>
                        <Typography.Text type="secondary">
                          Cantidad: {detalle.cantidad_alquiler} | 
                          Precio unitario: ${detalle.precio_unitario} |
                          Subtotal: ${detalle.total_alquiler}
                        </Typography.Text>
                      </div>
                      {detalle.estado_detalquiler === 'Cancelado' && (
                        <Tag color="error">Cancelado</Tag>
                      )}
                    </div>
                  </div>
                </ListItem>
              )}
            />

            <Space style={{ marginTop: 16, marginBottom: 16 }}>
              <Button
                type="primary"
                onClick={() => setShowCatalogo(true)}
                icon={<PlusOutlined />}
                disabled={editingAlquiler.estado_alquiler === 'Cancelado'}
              >
                Agregar Elementos
              </Button>
            </Space>

            {/* Lista de elementos seleccionados */}
            {elementosSeleccionados.length > 0 && (
              <>
                <Divider>Elementos Adicionales</Divider>
                <List
                  dataSource={elementosSeleccionados}
                  renderItem={(elemento) => (
                    <ListItem>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div>
                          <Typography.Text strong>{elemento.nombre_elemento}</Typography.Text>
                          <div>
                            <Typography.Text type="secondary">
                              Cantidad: {elemento.cantidad_seleccionada} | 
                              Precio unitario: ${elemento.precio_elemento} |
                              Subtotal: ${(elemento.precio_elemento * elemento.cantidad_seleccionada).toFixed(2)}
                            </Typography.Text>
                          </div>
                        </div>
                        <Space>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleCantidadChange(elemento, 0)}
                          />
                        </Space>
                      </div>
                    </ListItem>
                  )}
                />

                <div style={{ marginTop: 16, marginBottom: 16 }}>
                  <Typography.Text strong>
                    Total Adicional: $
                    {elementosSeleccionados.reduce((total, elem) => 
                      total + (elem.precio_elemento * elem.cantidad_seleccionada), 0).toFixed(2)}
                  </Typography.Text>
                </div>
              </>
            )}

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                disabled={editingAlquiler.estado_alquiler === 'Cancelado'}
              >
                Guardar Cambios
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default RentAdmin;