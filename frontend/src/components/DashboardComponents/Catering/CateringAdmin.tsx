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
import '../../../styles/dashboard/ServicesSubpages.scss';
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
    background-color: var(--color-background);
    border-radius: 15px 15px 0 0;
    border-bottom: 2px solid var(--color-shadow);
  }

  .ant-card-head-title {
    color: var(--color-text);
    font-family: "Montserrat", sans-serif;
    font-weight: 600;
  }
  
  .ant-card-body {
    color: var(--color-text);
    overflow: hidden;
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 15px;
    overflow: hidden;
  }
  
  .ant-modal-header {
    background-color: var(--color-background);
    border-bottom: 2px solid var(--color-shadow);
    padding: 16px 24px;
    
    .ant-modal-title {
      color: var(--color-text);
      font-family: "Montserrat", sans-serif;
      font-weight: 600;
    }
  }
`;

const StyledButton = styled(Button)`
  &.ant-btn-primary {
    background-color: var(--dark-gold);
    border-color: var(--dark-gold);
    color: white;
    font-family: "Montserrat", sans-serif;
    
    &:hover {
      background-color: var(--gold);
      border-color: var(--gold);
      color: white;
    }
  }

  &.ant-btn-default {
    border-color: var(--dark-gold);
    color: var(--dark-gold);
    font-family: "Montserrat", sans-serif;
    
    &:hover {
      background-color: var(--color-background);
      border-color: var(--dark-gold);
      color: var(--dark-gold);
    }
  }
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background-color: var(--color-background);
    color: var(--color-text);
    font-family: "Montserrat", sans-serif;
    font-weight: 600;
  }

  .ant-table-tbody > tr > td {
    color: var(--color-text);
    font-family: "Nunito Sans", sans-serif;
  }

  .ant-table-tbody > tr:hover > td {
    background-color: var(--color-background);
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
  platos?: Array<{
    id: number;
    nombre: string;
  }>;
  estado_menu: string;
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

interface MenuWithQuantity extends Menu {
  quantity?: number;
}

interface FormData {
  id_catering?: number;
  id_evento: number;
  personas_catering: number;
  precioneto_catering: number;
  itbis_catering: number;
  total_catering: number;
  estado_catering: string;
  menus: number[];
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
  const [selectedMenus, setSelectedMenus] = useState<MenuWithQuantity[]>([]);
  const [searchText, setSearchText] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [proveedorFilter, setProveedorFilter] = useState('');
  const [menuStatusFilter, setMenuStatusFilter] = useState<string>('');
  const [form] = Form.useForm();
  const [showViewMenuModal, setShowViewMenuModal] = useState(false);
  const [viewMenu, setViewMenu] = useState<Menu | null>(null);
  const [formData, setFormData] = useState<FormData>({
    id_catering: 0,
    id_evento: 0,
    personas_catering: 0,
    precioneto_catering: 0,
    itbis_catering: 0,
    total_catering: 0,
    estado_catering: 'Solicitado',
    menus: []
  });
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platoSearchText, setPlatoSearchText] = useState('');

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
        console.log('Datos actualizados:', response.data);
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

      // Modificamos la URL para asegurarnos de obtener todos los menús, incluyendo inactivos
      const response = await axios.get(`${apiUrl}/menu`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          includeInactive: true // Añadimos este parámetro para indicar que queremos todos los menús
        }
      });
      
      // Normaliza la estructura de los menús para que siempre tengan platos_menu y platos
      let menusData = Array.isArray(response.data) ? response.data : 
                     Array.isArray(response.data.data) ? response.data.data : [];

      // Asegurarse de que cada menú tenga un estado definido
      menusData = menusData.map((menu: any) => {
        const menuWithState = {
          ...menu,
          estado_menu: menu.estado_menu || 'Activo' // Asignar 'Activo' si no tiene estado
        };

        // Si la API devuelve platos_menu, úsalo para crear un array de platos
        if (Array.isArray(menu.platos_menu) && menu.platos_menu.length > 0) {
          menuWithState.platos = menu.platos_menu
            .filter((pm: any) => pm.plato)
            .map((pm: any) => ({
              id: pm.plato.id_plato,
              nombre: pm.plato.desc_plato
            }));
        }
        // Si la API devuelve platos, úsalo para crear platos_menu
        if (Array.isArray(menu.platos) && menu.platos.length > 0) {
          menuWithState.platos_menu = menu.platos.map((plato: any) => ({
            plato: {
              id_plato: plato.id || plato.id_plato,
              desc_plato: plato.nombre || plato.desc_plato
            }
          }));
        }
        return menuWithState;
      });

      console.log('Menús cargados (incluyendo inactivos):', menusData); // Para debug
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

      // Actualizar el estado en el servidor
      const response = await axios.put(`${apiUrl}/catering/${id}`, 
        { estado_catering: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Actualizar el estado local inmediatamente
      setCateringServices(prev => 
        prev.map(c => c.id_catering === id ? { ...c, estado_catering: newStatus } : c)
      );

      message.success('Estado actualizado correctamente');

      // Recargar los datos después de un breve retraso
      setTimeout(async () => {
        await fetchCateringServices();
      }, 500);

    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      message.error('Error al actualizar el estado');
    }
  };

  const handleCreateCatering = () => {
    setSelectedMenus([]);
    form.resetFields();
    setShowCateringForm(true);
  };

  const handleDelete = async (record: CateringService) => {
    Modal.confirm({
      title: '¿Está seguro que desea cancelar este servicio de catering?',
      content: 'Esta acción cambiará el estado del servicio a "Cancelado". ¿Desea continuar?',
      okText: 'Sí, cancelar',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
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
          message.success('Servicio de catering cancelado correctamente');
          fetchCateringServices();
        } catch (error) {
          console.error('Error al cancelar el servicio:', error);
          message.error('Error al cancelar el servicio');
        }
      }
    });
  };

  const handleEdit = (catering: CateringService) => {
    form.resetFields();

    // Eliminar duplicados de los IDs de menús
    const menuIds = (catering.menus_catering?.map(mc => mc.menu.id_menu) || []);
    const uniqueMenuIds = [...new Set(menuIds)];

    form.setFieldsValue({
      id_catering: catering.id_catering,
      id_evento: catering.id_evento,
      personas_catering: catering.personas_catering,
      estado_catering: catering.estado_catering,
      menus: uniqueMenuIds
    });

    setFormData({
      id_catering: catering.id_catering,
      id_evento: catering.id_evento,
      personas_catering: catering.personas_catering,
      precioneto_catering: catering.precioneto_catering,
      itbis_catering: catering.itbis_catering,
      total_catering: catering.total_catering,
      estado_catering: catering.estado_catering,
      menus: uniqueMenuIds
    });

    const selectedMenus = menus.filter(menu => uniqueMenuIds.includes(menu.id_menu)).map(menu => ({ ...menu, quantity: 1 }));
    const uniqueSelectedMenus = Array.from(
      new Map(selectedMenus.map(menu => [menu.id_menu, menu])).values()
    );
    setSelectedMenus(uniqueSelectedMenus);
    setShowCateringForm(true);
  };

  const handleMenuQuantityChange = (menuId: number, quantity: number) => {
    setSelectedMenus(prev => 
      prev.map(menu => 
        menu.id_menu === menuId 
          ? { ...menu, quantity: quantity }
          : menu
      )
    );
  };

  const handleMenuSelect = (menu: Menu) => {
    const menuIndex = selectedMenus.findIndex(m => m.id_menu === menu.id_menu);
    if (menuIndex === -1) {
      setSelectedMenus([...selectedMenus, { ...menu, quantity: 1 }]);
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
      console.log('Valores del formulario:', values);
      
      // Usar los valores del formulario en lugar de formData
      const cateringData = {
        id_catering: values.id_catering || formData.id_catering,
        id_evento: values.id_evento,
        personas_catering: values.personas_catering,
        estado_catering: values.estado_catering,
        menus: values.menus || formData.menus
      };

      // Calcular precios basados en los menús seleccionados
      const selectedMenus = menus.filter(menu => cateringData.menus.includes(menu.id_menu));
      const totalNeto = selectedMenus.reduce((sum, menu) => sum + menu.precio_menu, 0);
      const itbis = totalNeto * 0.18;
      const total = totalNeto + itbis;

      // Agregar los precios calculados
      const finalData = {
        ...cateringData,
        precioneto_catering: totalNeto,
        itbis_catering: itbis,
        total_catering: total
      };

      console.log('Datos a enviar:', finalData);

      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      if (finalData.id_catering) {
        // Actualizar catering existente
        const response = await axios.put(`${apiUrl}/catering/${finalData.id_catering}`, finalData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Respuesta del servidor:', response.data);
        message.success('Servicio de catering actualizado correctamente');
        
        // Actualizar el estado local inmediatamente
        setCateringServices(prev => 
          prev.map(c => c.id_catering === finalData.id_catering ? response.data : c)
        );
      } else {
        // Crear nuevo catering
        const response = await axios.post(`${apiUrl}/catering`, finalData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Respuesta del servidor:', response.data);
        message.success('Servicio de catering creado correctamente');
        setCateringServices(prev => [...prev, response.data]);
      }

      // Cerrar el modal y limpiar el formulario
      setShowCateringForm(false);
      setFormData({
        id_catering: 0,
        id_evento: 0,
        personas_catering: 0,
        precioneto_catering: 0,
        itbis_catering: 0,
        total_catering: 0,
        estado_catering: 'Solicitado',
        menus: []
      });
      form.resetFields();

      // Recargar los datos después de un breve retraso
      setTimeout(async () => {
        await fetchCateringServices();
      }, 500);

    } catch (error) {
      console.error('Error al guardar el catering:', error);
      if (axios.isAxiosError(error)) {
        message.error(error.response?.data?.mensaje || 'Error al guardar el catering');
      } else {
        message.error('Error al guardar el catering');
      }
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
      content: 'Esta acción cambiará el estado del menú a "Inactivo". ¿Desea continuar?',
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

          // Armar el payload simplificado
          const payload = {
            estado_menu: 'Inactivo'
          };

          // PUT para inactivar
          const putResponse = await axios.put(`${apiUrl}/menu/${record.id_menu}`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (putResponse.data) {
            message.success('Menú inactivado exitosamente');
            await fetchMenus(); // Recargar los menús después de la actualización
          } else {
            message.error('No se pudo inactivar el menú');
          }
        } catch (error) {
          console.error('Error al inactivar el menú:', error);
          if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.mensaje || 'Error al inactivar el menú';
            message.error(errorMessage);
          } else {
            message.error('Error al inactivar el menú');
          }
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
              <Option key={`plato-${plato.id_plato}`} value={plato.id_plato}>
                {plato.desc_plato}
              </Option>
            ))}
          </Select>
        ),
        okText: 'Guardar',
        cancelText: 'Cancelar',
        okButtonProps: {
          style: { backgroundColor: 'var(--dark-gold)', borderColor: 'var(--dark-gold)' }
        },
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
          {record.id_evento}{nombre ? ` - ${nombre}` : ''}
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
      render: (_: any, record: CateringService) => {
        const isCanceled = record.estado_catering.toLowerCase() === 'cancelado';
        
        return (
          <Space>
            <Button
              icon={<EditOutlined />}
              type="link"
              onClick={() => handleEdit(record)}
              style={{ color: 'var(--dark-gold)' }}
            />
            {!isCanceled && (
              <Button
                icon={<DeleteOutlined />}
                type="link"
                danger
                onClick={() => handleDelete(record)}
                style={{ color: 'var(--dark-gold)' }}
              />
            )}
          </Space>
        );
      }
    }
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
      title: 'Estado',
      dataIndex: 'estado_menu',
      key: 'estado_menu',
      render: (estado: string) => {
        let color = 'default';
        const estadoFinal = (estado || 'Activo');
        switch (estadoFinal.toLowerCase()) {
          case 'activo':
            color = 'success';
            break;
          case 'inactivo':
            color = 'error';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{estadoFinal}</Tag>;
      },
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
            style={{ color: 'var(--dark-gold)' }}
          />
          <Button
            icon={<DeleteOutlined />}
            type="link"
            danger
            onClick={() => handleDeleteMenu(record)}
            style={{ color: 'var(--dark-gold)' }}
          />
          <Button
            icon={<ArrowRightOutlined />}
            type="link"
            onClick={() => handleViewMenu(record)}
            style={{ color: 'var(--dark-gold)' }}
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
            style={{ color: 'var(--dark-gold)' }}
          />
        </Space>
      ),
    },
  ];

  // Función para filtrar los menús
  const getFilteredMenus = () => {
    return menus.filter(menu => {
      // Filtro por texto de búsqueda (nombre de menú o proveedor)
      const matchesSearch = !searchText
        || menu.desc_menu.toLowerCase().includes(searchText.toLowerCase())
        || (menu.proveedor?.nombre_proveedor?.toLowerCase().includes(searchText.toLowerCase()));

      // Filtro por proveedor
      const matchesProveedor = !proveedorFilter || menu.id_proveedor.toString() === proveedorFilter;

      // Filtro por estado
      const menuEstado = (menu.estado_menu || 'Activo').toLowerCase();
      const filterEstado = menuStatusFilter?.toLowerCase() || '';
      const matchesEstado = !filterEstado || menuEstado === filterEstado;

      console.log('Menu:', menu.desc_menu, 'Estado:', menuEstado, 'Filtro:', filterEstado, 'Matches:', matchesEstado); // Para debug

      return matchesSearch && matchesProveedor && matchesEstado;
    });
  };

  // Función para filtrar los platos
  const getFilteredPlatos = () => {
    return platos.filter(plato => {
      return !platoSearchText || plato.desc_plato.toLowerCase().includes(platoSearchText.toLowerCase());
    });
  };

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
            <Option key={`proveedor-${proveedor.id_proveedor}`} value={proveedor.id_proveedor}>
              {proveedor.nombre_proveedor}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="estado_menu"
        label="Estado"
        rules={[{ required: true, message: 'Por favor seleccione un estado' }]}
      >
        <Select placeholder="Seleccione un estado">
          <Option value="Activo">Activo</Option>
          <Option value="Inactivo">Inactivo</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="platos"
        label="Platos"
        rules={[{ required: true, message: 'Por favor seleccione al menos un plato' }]}
      >
        <Select mode="multiple" placeholder="Seleccione los platos">
          {Array.isArray(platos) && platos.map(plato => (
            <Option key={`plato-${plato.id_plato}`} value={plato.id_plato}>
              {plato.desc_plato}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit"
          style={{ backgroundColor: 'var(--dark-gold)', borderColor: 'var(--dark-gold)' }}
        >
          Guardar Menú
        </Button>
      </Form.Item>
    </Form>
  );

  const platoForm = (
    <Form form={form} onFinish={handlePlatoFormSubmit} layout="vertical">
      <Form.Item
        name="nombre_plato"
        label="Nombre del Plato"
        rules={[{ required: true, message: 'Por favor ingrese el nombre del plato' }]}
      >
        <Input placeholder="Ej: Arroz con Pollo" />
      </Form.Item>
      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit"
          style={{ backgroundColor: 'var(--dark-gold)', borderColor: 'var(--dark-gold)' }}
        >
          Guardar Plato
        </Button>
      </Form.Item>
    </Form>
  );

  const cateringForm = (
    <Form 
      form={form} 
      onFinish={handleCateringFormSubmit} 
      layout="vertical"
      initialValues={formData}
    >
      <Form.Item name="id_catering" hidden>
        <Input />
      </Form.Item>
      <Form.Item
        name="id_evento"
        label="Evento"
        rules={[{ required: true, message: 'Por favor seleccione un evento' }]}
      >
        <Select placeholder="Seleccione un evento">
          {events.map(evento => (
            <Option key={`event-${evento.id_evento}`} value={evento.id_evento}>
              {evento.nombre_evento}
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
        name="estado_catering"
        label="Estado"
        rules={[{ required: true, message: 'Por favor seleccione un estado' }]}
      >
        <Select placeholder="Seleccione un estado">
          <Option key="estado-solicitado" value="Solicitado">Solicitado</Option>
          <Option key="estado-aceptado" value="Aceptado">Aceptado</Option>
          <Option key="estado-completado" value="Completado">Completado</Option>
          <Option key="estado-cancelado" value="Cancelado">Cancelado</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="menus"
        label="Menús"
        required
        tooltip="Seleccione los menús y especifique la cantidad deseada para cada uno"
      >
        <Select
          mode="multiple"
          placeholder="Seleccione los menús"
          style={{ width: '100%', marginBottom: 16 }}
          onChange={menuIds => {
            // Eliminamos duplicados de los IDs seleccionados
            const uniqueMenuIds = [...new Set(menuIds)];
            const selected = menus.filter(m => uniqueMenuIds.includes(m.id_menu));
            // Eliminamos duplicados basándonos en id_menu
            const uniqueSelected = Array.from(
              new Map(selected.map(menu => [menu.id_menu, { ...menu, quantity: 1 }])).values()
            );
            setSelectedMenus(uniqueSelected);
          }}
        >
          {menus.map(menu => (
            <Option key={`menu-option-${menu.id_menu}`} value={menu.id_menu}>
              {menu.desc_menu} (${menu.precio_menu})
            </Option>
          ))}
        </Select>
      </Form.Item>
      {selectedMenus.length > 0 && (
        <List
          dataSource={selectedMenus}
          renderItem={menu => (
            <List.Item key={`selected-menu-${menu.id_menu}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>{menu.desc_menu}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Cantidad:</span>
                  <InputNumber
                    min={1}
                    value={menu.quantity}
                    onChange={(value) => {
                      setSelectedMenus(prev => 
                        prev.map(m => 
                          m.id_menu === menu.id_menu 
                            ? { ...m, quantity: value || 1 }
                            : m
                        )
                      );
                    }}
                  />
                  <span>Precio: ${(menu.precio_menu * (menu.quantity || 1)).toFixed(2)}</span>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {formData.id_catering ? 'Actualizar Servicio' : 'Crear Servicio'}
        </Button>
      </Form.Item>
    </Form>
  );

  // Función para filtrar los servicios de catering
  const getFilteredCateringServices = () => {
    return cateringServices.filter(service => {
      // Filtro por texto de búsqueda (evento o ID)
      const matchesSearch = !searchText
        || (service.evento?.nombre_evento?.toLowerCase().includes(searchText.toLowerCase()))
        || service.id_evento?.toString().includes(searchText);

      // Filtro por estado
      const matchesStatus = !statusFilter
        || service.estado_catering === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  return (
    <div>
      <Tabs defaultActiveKey="1" items={[
        {
          key: 'catering-services',
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
                    <Option key="filter-solicitado" value="Solicitado">Solicitado</Option>
                    <Option key="filter-aceptado" value="Aceptado">Aceptado</Option>
                    <Option key="filter-completado" value="Completado">Completado</Option>
                    <Option key="filter-cancelado" value="Cancelado">Cancelado</Option>
                  </Select>
                </FilterContainer>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateCatering}
                  style={{ backgroundColor: 'var(--dark-gold)', borderColor: 'var(--dark-gold)' }}
                >
                  Nuevo Servicio
                </Button>
              </TableActions>
              <Table
                columns={cateringColumns}
                dataSource={getFilteredCateringServices()}
                loading={loading}
                rowKey="id_catering"
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: <span style={{ color: '#999', fontWeight: 500, fontSize: 16 }}>No hay Registros</span> }}
              />
            </StyledCard>
          ),
        },
        {
          key: 'menus',
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
                      <Option key={`proveedor-${proveedor.id_proveedor}`} value={proveedor.id_proveedor}>
                        {proveedor.nombre_proveedor}
                      </Option>
                    ))}
                  </Select>
                  <Select
                    placeholder="Filtrar por estado"
                    allowClear
                    style={{ width: 200 }}
                    value={menuStatusFilter || undefined}
                    onChange={value => setMenuStatusFilter(value || '')}
                  >
                    <Option key="menu-filter-activo" value="Activo">Activo</Option>
                    <Option key="menu-filter-inactivo" value="Inactivo">Inactivo</Option>
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
                dataSource={getFilteredMenus()}
                loading={loadingMenus}
                rowKey="id_menu"
              />
            </StyledCard>
          ),
        },
        {
          key: 'platos',
          label: 'Platos',
          children: (
            <StyledCard title="Platos">
              <TableActions>
                <FilterContainer>
                  <Search
                    placeholder="Buscar plato"
                    allowClear
                    onSearch={value => setPlatoSearchText(value)}
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
                  style={{ backgroundColor: 'var(--dark-gold)', borderColor: 'var(--dark-gold)' }}
                >
                  Nuevo Plato
                </Button>
              </TableActions>
              <Table
                columns={platoColumns}
                dataSource={getFilteredPlatos()}
                loading={loadingPlatos}
                rowKey="id_plato"
              />
            </StyledCard>
          ),
        },
      ]} style={{ color: 'var(--dark-gold)' }} />
      
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

      {/* Modal para crear/editar catering */}
      <Modal
        title={form.getFieldValue('id_catering') ? 'Editar Servicio de Catering' : 'Nuevo Servicio de Catering'}
        open={showCateringForm}
        onCancel={() => {
          setShowCateringForm(false);
          form.resetFields();
          setSelectedMenus([]);
        }}
        footer={null}
      >
        {cateringForm}
      </Modal>
    </div>
  );
};

export default CateringAdmin;