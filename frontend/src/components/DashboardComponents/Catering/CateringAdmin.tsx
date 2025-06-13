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
    nombre?: string;
  };
  platos_menu: Array<{
    plato: Plato;
  }>;
  // Permitir también la estructura de la API para compatibilidad
  platos?: Array<{
    id: number;
    nombre: string;
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
  const [showViewMenuModal, setShowViewMenuModal] = useState(false);
  const [viewMenu, setViewMenu] = useState<Menu | null>(null);

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

      const response = await axios.get(`${apiUrl}/menu`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Normaliza la estructura de los menús para que siempre tengan platos_menu y platos
      let menusData = Array.isArray(response.data) ? response.data : 
                     Array.isArray(response.data.data) ? response.data.data : [];
      menusData = menusData.map((menu: any) => {
        // Si la API devuelve platos_menu, úsalo para crear un array de platos
        if (Array.isArray(menu.platos_menu) && menu.platos_menu.length > 0) {
          menu.platos = menu.platos_menu
            .filter((pm: any) => pm.plato)
            .map((pm: any) => ({
              id: pm.plato.id_plato,
              nombre: pm.plato.desc_plato
            }));
        }
        // Si la API devuelve platos, úsalo para crear platos_menu
        if (Array.isArray(menu.platos) && menu.platos.length > 0) {
          menu.platos_menu = menu.platos.map((plato: any) => ({
            plato: {
              id_plato: plato.id || plato.id_plato,
              desc_plato: plato.nombre || plato.desc_plato
            }
          }));
        }
        return menu;
      });
      setMenus(menusData);
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

      // Solicita todos los platos (ajusta el límite según lo que soporte tu backend)
      const response = await axios.get(`${apiUrl}/plato?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Soporta respuesta paginada o directa
      const platosData = Array.isArray(response.data) ? response.data
        : Array.isArray(response.data.data) ? response.data.data
        : Array.isArray(response.data.rows) ? response.data.rows
        : [];
      setPlatos(platosData);
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
      
      // Ensure we're setting an array and filter for Catering providers
      const proveedoresData = Array.isArray(response.data) ? response.data : 
                            Array.isArray(response.data.data) ? response.data.data : [];
      
      // Filter only Catering providers
      const proveedoresCatering = proveedoresData.filter(
        (proveedor: Proveedor) => proveedor.tipo_proveedor === 'Catering'
      );
      
      setProveedores(proveedoresCatering);
    } catch (error) {
      console.error('Error al cargar los proveedores:', error);
      message.error('Error al cargar los proveedores');
      setProveedores([]);
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
      const menuData = {
        desc_menu: values.desc_menu,
        precio_menu: values.precio_menu,
        id_proveedor: values.id_proveedor,
        platos: values.platos || [] // Array de IDs de platos
      };
      if (values.id_menu) {
        // Actualizar menú existente (PUT)
        await axios.put(`${apiUrl}/menu/${values.id_menu}`, menuData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        message.success('Menú actualizado correctamente');
      } else {
        // Crear nuevo menú (POST)
        await axios.post(`${apiUrl}/menu`, menuData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        message.success('Menú creado correctamente');
      }
      setShowMenuForm(false);
      form.resetFields();
      fetchMenus();
    } catch (error) {
      console.error('Error al guardar el menú:', error);
      message.error('Error al guardar el menú');
    }
  };

  const handlePlatoFormSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }
      await axios.post(`${apiUrl}/plato`, { desc_plato: values.nombre_plato }, {
        headers: { 'Authorization': `Bearer ${token}` }
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
        id_menu: record.id_menu,
        desc_menu: record.desc_menu,
        precio_menu: record.precio_menu,
        id_proveedor: record.id_proveedor,
        platos: record.platos_menu?.map(pm => pm.plato.id_plato) || []
      });
      setShowMenuForm(true);
    } catch (error) {
      message.error('Error al cargar los datos del menú');
    }
  };

  const handleDeleteMenu = async (record: Menu) => {
    Modal.confirm({
      title: '¿Está seguro que desea inactivar este menú?',
      content: 'Esta acción no se puede deshacer. ¿Desea continuar?',
      okText: 'Sí, inactivar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            message.error('No hay sesión activa');
            return;
          }
          await axios.put(`${apiUrl}/menu/${record.id_menu}`, { estado_menu: 'Inactivo' }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          message.success('Menú inactivado exitosamente');
          fetchMenus();
        } catch (error) {
          console.error('Error al inactivar el menú:', error);
          message.error('Error al inactivar el menú');
        }
      }
    });
  };

  const handleViewMenu = async (menu: Menu) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }
      // Pide el menú por id para obtener los platos actualizados
      const response = await axios.get(`${apiUrl}/menu/${menu.id_menu}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Soporta respuesta con data o directa
      const menuData = response.data && response.data.data ? response.data.data : response.data;
      setViewMenu(menuData);
      setShowViewMenuModal(true);
    } catch (error) {
      console.error('Error al obtener detalles del menú:', error);
      message.error('Error al obtener detalles del menú');
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

  const handleAddPlatos = async (menu: Menu) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      // Get current platos for the menu
      const response = await axios.get(`${apiUrl}/menu/${menu.id_menu}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const currentPlatos = response.data.platos_menu?.map((p: any) => p.plato.id_plato) || [];
      
      Modal.confirm({
        title: 'Agregar platos al menú',
        content: (
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Seleccione los platos"
            defaultValue={currentPlatos}
            onChange={async (selectedPlatos) => {
              try {
                // Add new platos
                const newPlatos = selectedPlatos.filter((p: number) => !currentPlatos.includes(p));
                // Remove unselected platos
                const removedPlatos = currentPlatos.filter((p: number) => !selectedPlatos.includes(p));

                // Update platos
                await Promise.all([
                  // Add new platos
                  ...newPlatos.map((id_plato: number) =>
                    axios.post(`${apiUrl}/menu/${menu.id_menu}/plato`, {
                      id_plato
                    }, {
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    })
                  ),
                  // Remove unselected platos
                  ...removedPlatos.map((id_plato: number) =>
                    axios.delete(`${apiUrl}/menu/${menu.id_menu}/plato/${id_plato}`, {
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    })
                  )
                ]);

                message.success('Platos actualizados correctamente');
                fetchMenus(); // Refresh the menus list
              } catch (error) {
                console.error('Error al actualizar platos:', error);
                message.error('Error al actualizar los platos');
              }
            }}
          >
            {platos.map(plato => (
              <Option key={plato.id_plato} value={plato.id_plato}>
                {plato.desc_plato}
              </Option>
            ))}
          </Select>
        ),
        onOk() {
          return Promise.resolve();
        }
      });
    } catch (error) {
      console.error('Error al cargar platos del menú:', error);
      message.error('Error al cargar los platos del menú');
    }
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
      key: 'proveedor',
      render: (_: any, record: Menu) => (
        <span>
          {(record.proveedor && (record.proveedor.nombre || record.proveedor.nombre_proveedor)) || 'Sin proveedor'}
        </span>
      ),
    },
    {
      title: 'Platos',
      key: 'platos',
      render: (_: any, record: Menu) => (
        <div>
          {Array.isArray(record.platos_menu) && record.platos_menu.length > 0 && (
            <List
              size="small"
              dataSource={record.platos_menu}
              renderItem={(pm: any) => (
                <List.Item>
                  {pm.plato && pm.plato.desc_plato}
                </List.Item>
              )}
            />
          )}
          {(!record.platos_menu || record.platos_menu.length === 0) && (
            <span style={{ color: '#888' }}>Sin platos</span>
          )}
        </div>
      ),
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
          <Button
            icon={<ArrowRightOutlined />}
            type="link"
            onClick={() => handleViewMenu(record)}
          >
            Ver
          </Button>
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
        </Space>
      ),
    },
  ];

  const filteredMenus = menus.filter(menu => {
    const matchesSearch = menu.desc_menu.toLowerCase().includes(searchText.toLowerCase());
    const matchesProveedor = !proveedorFilter || menu.id_proveedor.toString() === proveedorFilter;
    return matchesSearch && matchesProveedor;
  });

  const menuForm = (
    <Form form={form} onFinish={handleMenuFormSubmit} layout="vertical">
      <Form.Item name="id_menu" hidden>
        <Input />
      </Form.Item>
      <Form.Item
        name="desc_menu"
        label="Nombre del Menú"
        rules={[{ required: true, message: 'Por favor ingrese el nombre del menú' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="precio_menu"
        label="Precio"
        rules={[{ required: true, message: 'Por favor ingrese el precio' }]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item
        name="id_proveedor"
        label="Proveedor"
        rules={[{ required: true, message: 'Por favor seleccione un proveedor' }]}
      >
        <Select placeholder="Seleccione un proveedor">
          {proveedores.map(proveedor => (
            <Option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
              {proveedor.nombre_proveedor}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="platos"
        label="Platos"
        rules={[{ required: true, message: 'Por favor seleccione al menos un plato' }]}
      >
        <Select mode="multiple" placeholder="Seleccione los platos">
          {Array.isArray(platos) && platos.map(plato => (
            <Option key={plato.id_plato} value={plato.id_plato}>
              {plato.desc_plato}
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
  );

  const platoForm = (
    <Form
      form={form}
      onFinish={handlePlatoFormSubmit}
      layout="vertical"
    >
      <Form.Item
        name="nombre_plato"
        label="Nombre del Plato"
        rules={[{ required: true, message: 'Por favor ingrese el nombre del plato' }]}
      >
        <Input placeholder="Ej: Arroz con Pollo" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Guardar Plato
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div>
      <Tabs defaultActiveKey="1" items={[
        {
          key: '1',
          label: 'Servicios de Catering',
          children: (
            <StyledCard title="Servicios de Catering">
              <TableActions>
                <FilterContainer>
                  <Search
                    placeholder="Buscar por evento"
                    allowClear
                    onSearch={value => setSearchText(value)}
                    style={{ width: 200 }}
                  />
                  <Select
                    placeholder="Filtrar por estado"
                    allowClear
                    style={{ width: 200 }}
                    onChange={value => setStatusFilter(value)}
                  >
                    <Option value="Solicitado">Solicitado</Option>
                    <Option value="Confirmado">Confirmado</Option>
                    <Option value="Completado">Completado</Option>
                    <Option value="Cancelado">Cancelado</Option>
                  </Select>
                </FilterContainer>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateCatering}
                >
                  Nuevo Servicio
                </Button>
              </TableActions>
              <Table
                columns={cateringColumns}
                dataSource={cateringServices}
                loading={loading}
                rowKey="id_catering"
              />
            </StyledCard>
          ),
        },
        {
          key: '2',
          label: 'Menús',
          children: (
            <StyledCard title="Menús">
              <TableActions>
                <FilterContainer>
                  <Search
                    placeholder="Buscar menú"
                    allowClear
                    onSearch={value => setSearchText(value)}
                    style={{ width: 200 }}
                  />
                  <Select
                    placeholder="Filtrar por proveedor"
                    allowClear
                    style={{ width: 200 }}
                    onChange={value => setProveedorFilter(value)}
                  >
                    {proveedores.map(proveedor => (
                      <Option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                        {proveedor.nombre_proveedor}
                      </Option>
                    ))}
                  </Select>
                </FilterContainer>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    form.resetFields();
                    setShowMenuForm(true);
                  }}
                >
                  Nuevo Menú
                </Button>
              </TableActions>
              <Table
                columns={menuColumns}
                dataSource={menus}
                loading={loadingMenus}
                rowKey="id_menu"
              />
            </StyledCard>
          ),
        },
        {
          key: '3',
          label: 'Platos',
          children: (
            <StyledCard title="Platos">
              <TableActions>
                <FilterContainer>
                  <Search
                    placeholder="Buscar plato"
                    allowClear
                    onSearch={value => setSearchText(value)}
                    style={{ width: 200 }}
                  />
                </FilterContainer>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    form.resetFields();
                    setShowPlatoForm(true);
                  }}
                >
                  Nuevo Plato
                </Button>
              </TableActions>
              <Table
                columns={platoColumns}
                dataSource={platos}
                loading={loadingPlatos}
                rowKey="id_plato"
              />
            </StyledCard>
          ),
        },
      ]} />
      
      {/* Modal para crear/editar menú */}
      <Modal
        title={form.getFieldValue('id_menu') ? 'Editar Menú' : 'Nuevo Menú'}
        open={showMenuForm}
        onCancel={() => {
          setShowMenuForm(false);
          form.resetFields();
        }}
        footer={null}
      >
        {menuForm}
      </Modal>

      {/* Modal para crear/editar plato */}
      <Modal
        title={form.getFieldValue('id_plato') ? 'Editar Plato' : 'Nuevo Plato'}
        open={showPlatoForm}
        onCancel={() => {
          setShowPlatoForm(false);
          form.resetFields();
        }}
        footer={null}
      >
        {platoForm}
      </Modal>

      {/* Modal para ver detalles de menú */}
      <Modal
        title={viewMenu ? `Detalles del Menú: ${viewMenu.desc_menu}` : 'Detalles del Menú'}
        open={showViewMenuModal}
        onCancel={() => setShowViewMenuModal(false)}
        footer={null}
      >
        {viewMenu && (
          <div>
            <p><b>Nombre:</b> {viewMenu.desc_menu}</p>
            <p><b>Precio:</b> ${viewMenu.precio_menu}</p>
            <p><b>Proveedor:</b> {viewMenu.proveedor?.nombre || viewMenu.proveedor?.nombre_proveedor || 'Sin proveedor'}</p>
            <p><b>Platos:</b></p>
            {Array.isArray(viewMenu.platos_menu) && viewMenu.platos_menu.length > 0 ? (
              <List
                size="small"
                dataSource={viewMenu.platos_menu}
                renderItem={(pm: any) => (
                  <List.Item>
                    {pm.plato && pm.plato.desc_plato}
                  </List.Item>
                )}
              />
            ) : (
              <span style={{ color: '#888' }}>Sin platos</span>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CateringAdmin;