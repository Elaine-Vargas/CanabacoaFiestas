import React, { useEffect, useState } from 'react';
import { Button, Select, Space, message, Card, Modal, Row, Col, Input, Typography, DatePicker } from 'antd';
import { DownloadOutlined, UserOutlined, TeamOutlined, CalendarOutlined, TruckOutlined, ShoppingCartOutlined, PrinterOutlined, InboxOutlined, ShopOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import '../../../styles/dashboard/ServicesSubpages.scss';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

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

interface TipoEvento {
  id_tipo_evento: number;
  tipo_evento: string;
}

interface Subcategoria {
  id_subcategoria: number;
  nombre_subcategoria: string;
}

interface Color {
  id_color: number;
  nombre_color: string;
}

interface Material {
  id_material: number;
  nombre_material: string;
}

interface Empleado {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
}

interface Evento {
  id_evento: number;
  fecha_evento: string;
  cliente?: {
    nombre_usuario: string;
    apellido_usuario: string;
  };
}

interface Proveedor {
  id_proveedor: number;
  nombre_proveedor: string;
  tipo_proveedor: 'Catering' | 'Elementos';
  tel_proveedor: string;
  correo_proveedor: string;
  estado_proveedor: 'Activo' | 'Inactivo' | 'Eliminado';
  direccion?: {
    calle: string;
    sector: string;
  };
}

interface Compra {
  id_compra: number;
  fecha_compra: string;
  estado_compra: string;
  id_proveedor: number;
}

interface ElementoCompra {
  id_elemento: number;
  nombre_elemento: string;
}

const ReportEmployee = () => {
    const apiUrl = `${import.meta.env.VITE_API_URL}/${import.meta.env.BACKEND_PORT}/${import.meta.env.VITE_API_BASE_URL}`;
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<number | null>(null);
  const [userCedula, setUserCedula] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState<boolean>(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState<boolean>(false);
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [cedula, setCedula] = useState<string>('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [empleados, setEmpleados] = useState<Asesor[]>([]);
  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingAsesores, setLoadingAsesores] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const [loadingTiposEvento, setLoadingTiposEvento] = useState(false);
  const [selectedRoleForCombinedReport, setSelectedRoleForCombinedReport] = useState<string>('todos');
  const [selectedStatusForCombinedReport, setSelectedStatusForCombinedReport] = useState<string>('todos');
  const [selectedTipoEvento, setSelectedTipoEvento] = useState<string>('todos');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [isElementoModalVisible, setIsElementoModalVisible] = useState<boolean>(false);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<string>('todos');
  const [selectedColor, setSelectedColor] = useState<string>('todos');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('todos');
  const [selectedAgruparPor, setSelectedAgruparPor] = useState<string>('');
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [colores, setColores] = useState<Color[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [loadingSubcategorias, setLoadingSubcategorias] = useState(false);
  const [loadingColores, setLoadingColores] = useState(false);
  const [loadingMateriales, setLoadingMateriales] = useState(false);
  const [isEquipoModalVisible, setIsEquipoModalVisible] = useState<boolean>(false);
  const [isFacturaModalVisible, setIsFacturaModalVisible] = useState<boolean>(false);
  const [isProveedorModalVisible, setIsProveedorModalVisible] = useState<boolean>(false);
  const [selectedEquipoReport, setSelectedEquipoReport] = useState<string>('');
  const [selectedEventoId, setSelectedEventoId] = useState<string>('todos');
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState<string>('todos');
  const [selectedFacturaReport, setSelectedFacturaReport] = useState<string>('');
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [selectedMetodoPago, setSelectedMetodoPago] = useState<string>('');
  const [precioRange, setPrecioRange] = useState<[number, number]>([0, 0]);
  const [selectedTipoProveedor, setSelectedTipoProveedor] = useState<string>('todos');
  const [selectedEstadoProveedor, setSelectedEstadoProveedor] = useState<string>('todos');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [loadingProveedores, setLoadingProveedores] = useState(false);
  const [isCompraModalVisible, setIsCompraModalVisible] = useState<boolean>(false);
  const [selectedCompraId, setSelectedCompraId] = useState<string>('');
  const [selectedElementoId, setSelectedElementoId] = useState<string>('');
  const [selectedEstadoCompra, setSelectedEstadoCompra] = useState<string>('todos');
  const [selectedProveedorCompra, setSelectedProveedorCompra] = useState<string>('todos');
  const [compras, setCompras] = useState<Compra[]>([]);
  const [elementosCompra, setElementosCompra] = useState<ElementoCompra[]>([]);
  const [loadingCompras, setLoadingCompras] = useState(false);
  const [loadingElementosCompra, setLoadingElementosCompra] = useState(false);
  const [selectedPuesto, setSelectedPuesto] = useState<string>('todos');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todos');
  const [precioRangeElemento, setPrecioRangeElemento] = useState<[number, number]>([0, 0]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [isAlquilerModalVisible, setIsAlquilerModalVisible] = useState<boolean>(false);
  const [selectedAlquilerId, setSelectedAlquilerId] = useState<string>('');
  const [alquileres, setAlquileres] = useState<any[]>([]);
  const [loadingAlquileres, setLoadingAlquileres] = useState(false);
  const [filteredCompras, setFilteredCompras] = useState<Compra[]>([]);
  const [filteredProveedores, setFilteredProveedores] = useState<Proveedor[]>([]);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${apiUrl}/auth/user-data`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const { id_rol, cedula_usuario } = response.data;
        setUserRole(id_rol);
        setUserCedula(cedula_usuario);

        if (id_rol !== 3) { // 3 is the role for advisors
          message.error('No tienes permisos para acceder a esta página');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        message.error('Error al verificar permisos');
        navigate('/login');
      }
    };

    checkUserRole();
  }, [navigate]);

  const handleRoleAndStatusReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/reporte/usuario/rol/2/estado/${selectedStatusForCombinedReport}`, {
        responseType: 'blob'
      });
      
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
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
              message.error('Error al generar el reporte de usuarios por rol y estado');
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            message.error('Error al generar el reporte de usuarios por rol y estado');
          }
        } else {
          message.error('Error al generar el reporte de usuarios por rol y estado');
        }
      } else {
        message.error('Error al generar el reporte de usuarios por rol y estado');
      }
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
    setSelectedTipoEvento('todos');
    setDateRange([null, null]);
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

  const fetchEmpleados = async () => {
    try {
      setLoadingEmpleados(true);
      const response = await fetch(`${apiUrl}/usuario?rol=3`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar los empleados');
      }
      const data = await response.json();
      if (data.usuarios && Array.isArray(data.usuarios)) {
        setEmpleados(data.usuarios);
      } else {
        throw new Error('Formato de datos inválido');
      }
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      message.error('Error al cargar los empleados');
      setEmpleados([]);
    } finally {
      setLoadingEmpleados(false);
    }
  };

  const fetchTiposEvento = async () => {
    try {
      setLoadingTiposEvento(true);
      const response = await fetch(`${apiUrl}/evento/tipo-eventos/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar los tipos de evento');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setTiposEvento(data);
      } else {
        throw new Error('Formato de datos inválido');
      }
    } catch (error) {
      console.error('Error al cargar tipos de evento:', error);
      message.error('Error al cargar los tipos de evento');
      setTiposEvento([]);
    } finally {
      setLoadingTiposEvento(false);
    }
  };

  useEffect(() => {
    if (isEventModalVisible) {
      fetchClientes();
      fetchAsesores();
      fetchTiposEvento();
    }
  }, [isEventModalVisible]);

  const handleEventReport = async () => {
    try {
      setLoading(true);
      let url = `${apiUrl}/reporte/eventos/asesor/${userCedula}`;
      const params = new URLSearchParams();

      if (selectedTipoEvento && selectedTipoEvento !== 'todos') {
        params.append('tipo_evento', selectedTipoEvento);
      }

      if (dateRange[0] && dateRange[1]) {
        params.append('fecha_inicio', dateRange[0].format('YYYY-MM-DD'));
        params.append('fecha_fin', dateRange[1].format('YYYY-MM-DD'));
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
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
              message.error('Error al generar el reporte de eventos');
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            message.error('Error al generar el reporte de eventos');
          }
        } else {
          message.error('Error al generar el reporte de eventos');
        }
      } else {
        message.error('Error al generar el reporte de eventos');
      }
    } finally {
      setLoading(false);
    }
  };

  const showElementoModal = () => {
    setIsElementoModalVisible(true);
  };

  const handleElementoModalCancel = () => {
    setIsElementoModalVisible(false);
    setSelectedSubcategoria('todos');
    setSelectedColor('todos');
    setSelectedMaterial('todos');
    setSelectedAgruparPor('');
    setSelectedCategoria('todos');
    setPrecioRangeElemento([0, 0]);
  };

  useEffect(() => {
    if (isElementoModalVisible) {
      fetchSubcategorias();
      fetchColores();
      fetchMateriales();
      fetchCategorias();
    }
  }, [isElementoModalVisible]);

  const fetchSubcategorias = async () => {
    try {
      setLoadingSubcategorias(true);
      if (selectedCategoria === 'todos') {
        setSubcategorias([]);
        return;
      }
      const response = await axios.get(`${apiUrl}/elemento/subcategorias/categoria/${selectedCategoria}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Respuesta de subcategorías:', response.data);
      if (response.data) {
        const subcategoriasData = Array.isArray(response.data) ? response.data : 
                                 response.data.subcategorias ? response.data.subcategorias : [];
        
        const validSubcategorias = subcategoriasData.filter((sub: Subcategoria) => 
          sub && typeof sub.id_subcategoria !== 'undefined' && sub.id_subcategoria !== null
        );
        
        setSubcategorias(validSubcategorias);
      }
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
      message.error('Error al cargar las subcategorías');
    } finally {
      setLoadingSubcategorias(false);
    }
  };

  useEffect(() => {
    if (isElementoModalVisible && selectedCategoria !== 'todos') {
      fetchSubcategorias();
    } else {
      setSubcategorias([]);
    }
  }, [selectedCategoria, isElementoModalVisible]);

  const fetchColores = async () => {
    try {
      setLoadingColores(true);
      const response = await axios.get(`${apiUrl}/elemento/colores/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data) {
        setColores(response.data);
      }
    } catch (error) {
      console.error('Error al cargar colores:', error);
      message.error('Error al cargar los colores');
    } finally {
      setLoadingColores(false);
    }
  };

  const fetchMateriales = async () => {
    try {
      setLoadingMateriales(true);
      const response = await axios.get(`${apiUrl}/elemento/materiales/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data) {
        setMateriales(response.data);
      }
    } catch (error) {
      console.error('Error al cargar materiales:', error);
      message.error('Error al cargar los materiales');
    } finally {
      setLoadingMateriales(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const response = await axios.get(`${apiUrl}/elemento/categorias/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data && Array.isArray(response.data)) {
        setCategorias(response.data);
      } else {
        console.error('Formato de datos inválido para categorías', response.data);
        message.error('Error al cargar las categorías');
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      message.error('Error al cargar las categorías');
      setCategorias([]);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const handleElementoReport = async () => {
    try {
      setLoading(true);
      let url = `${apiUrl}/reporte/elementos`;
      const params = new URLSearchParams();

      if (selectedSubcategoria && selectedSubcategoria !== 'todos') {
        params.append('subcategoria', selectedSubcategoria);
      }
      if (selectedColor && selectedColor !== 'todos') {
        params.append('color', selectedColor);
      }
      if (selectedMaterial && selectedMaterial !== 'todos') {
        params.append('material', selectedMaterial);
      }
      if (selectedAgruparPor) {
        params.append('agrupar_por', selectedAgruparPor);
      }
      if (selectedCategoria && selectedCategoria !== 'todos') {
        params.append('categoria', selectedCategoria);
      }
      if (precioRangeElemento[0] > 0) {
        params.append('precio_min', precioRangeElemento[0].toString());
      }
      if (precioRangeElemento[1] > 0) {
        params.append('precio_max', precioRangeElemento[1].toString());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('URL del reporte de elementos:', url);
      console.log('Parámetros:', {
        subcategoria: selectedSubcategoria,
        color: selectedColor,
        material: selectedMaterial,
        agrupar_por: selectedAgruparPor,
        categoria: selectedCategoria,
        precioRangeElemento: precioRangeElemento
      });

      const response = await axios.get(url, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
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
              message.error('Error al generar el reporte de elementos');
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            message.error('Error al generar el reporte de elementos');
          }
        } else {
          message.error('Error al generar el reporte de elementos');
        }
      } else {
        message.error('Error al generar el reporte de elementos');
      }
    } finally {
      setLoading(false);
    }
  };

  const showEquipoModal = () => {
    setIsEquipoModalVisible(true);
  };

  const handleEquipoModalCancel = () => {
    setIsEquipoModalVisible(false);
    setSelectedEventoId('todos');
    setSelectedEmpleadoId('todos');
    setSelectedPuesto('todos');
  };

  const showFacturaModal = () => {
    setIsFacturaModalVisible(true);
  };

  const handleFacturaModalCancel = () => {
    setIsFacturaModalVisible(false);
    setSelectedEventoId('todos');
  };

  useEffect(() => {
    if (isFacturaModalVisible) {
      fetchEventos();
    }
  }, [isFacturaModalVisible]);

  const showProveedorModal = () => {
    setIsProveedorModalVisible(true);
  };

  const handleProveedorModalCancel = () => {
    setIsProveedorModalVisible(false);
    setSelectedTipoProveedor('todos');
    setSelectedEstadoProveedor('todos');
  };

  const fetchEventos = async () => {
    try {
      setLoadingEventos(true);
      const response = await fetch(`${apiUrl}/evento/asesor/${userCedula}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar los eventos');
      }
      const data = await response.json();
      // Sort events by ID in descending order (most recent first)
      const sortedEvents = data.sort((a: Evento, b: Evento) => b.id_evento - a.id_evento);
      setEventos(sortedEvents);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      message.error('Error al cargar los eventos');
    } finally {
      setLoadingEventos(false);
    }
  };

  const fetchProveedores = async () => {
    try {
      setLoadingProveedores(true);
      const response = await axios.get(`${apiUrl}/proveedor/search?tipo=Elementos`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && Array.isArray(response.data)) {
        // Filtrar solo proveedores activos y ordenar por nombre
        const proveedoresElementos = response.data
          .filter((proveedor: Proveedor) => proveedor.estado_proveedor === 'Activo')
          .sort((a: Proveedor, b: Proveedor) => 
            a.nombre_proveedor.localeCompare(b.nombre_proveedor)
          );
        console.log('Proveedores filtrados:', proveedoresElementos); // Para debugging
        setProveedores(proveedoresElementos);
      } else {
        console.error('La respuesta no es un array:', response.data);
        setProveedores([]);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      message.error('Error al cargar los proveedores');
      setProveedores([]);
    } finally {
      setLoadingProveedores(false);
    }
  };

  useEffect(() => {
    if (isEquipoModalVisible) {
      fetchEventos();
      fetchEmpleados();
    }
  }, [isEquipoModalVisible]);

  useEffect(() => {
    if (isProveedorModalVisible) {
      fetchProveedores();
    }
  }, [isProveedorModalVisible]);

  const handleEquipoReport = async () => {
    try {
      setLoading(true);
      let url = `${apiUrl}/reporte/equipos/asesor/${userCedula}`;
      
      const params = new URLSearchParams();
      if (selectedEventoId && selectedEventoId !== 'todos') {
        params.append('evento_id', selectedEventoId);
      }
      if (selectedEmpleadoId && selectedEmpleadoId !== 'todos') {
        params.append('empleado_id', selectedEmpleadoId);
      }
      if (selectedPuesto && selectedPuesto !== 'todos') {
        params.append('puesto', selectedPuesto);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
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
              message.error('Error al generar el reporte de equipos');
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            message.error('Error al generar el reporte de equipos');
          }
        } else {
          message.error('Error al generar el reporte de equipos');
        }
      } else {
        message.error('Error al generar el reporte de equipos');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacturaReport = async () => {
    try {
      setLoading(true);
      let url = `${apiUrl}/reporte/factura/asesor/${userCedula}`;

      if (selectedEventoId && selectedEventoId !== 'todos') {
        url = `${apiUrl}/reporte/factura/evento/${selectedEventoId}`;
      }

      const response = await axios.get(url, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
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
              message.error('Error al generar el reporte de factura');
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            message.error('Error al generar el reporte de factura');
          }
        } else {
          message.error('Error al generar el reporte de factura');
        }
      } else {
        message.error('Error al generar el reporte de factura');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProveedorReport = async () => {
    try {
      setLoading(true);
      let url = `${apiUrl}/reporte/proveedores`;

      // Si hay filtros seleccionados, usar la ruta específica
      if (selectedTipoProveedor !== 'todos' || selectedEstadoProveedor !== 'todos') {
        url = `${apiUrl}/reporte/proveedores/filtro/tipo/${selectedTipoProveedor}/estado/${selectedEstadoProveedor}`;
      }

      const response = await axios.get(url, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
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
              message.error('Error al generar el reporte de proveedores');
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            message.error('Error al generar el reporte de proveedores');
          }
        } else {
          message.error('Error al generar el reporte de proveedores');
        }
      } else {
        message.error('Error al generar el reporte de proveedores');
      }
    } finally {
      setLoading(false);
    }
  };

  const showCompraModal = () => {
    setIsCompraModalVisible(true);
  };

  const handleCompraModalCancel = () => {
    setIsCompraModalVisible(false);
    setSelectedCompraId('');
    setSelectedEstadoCompra('todos');
    setSelectedProveedorCompra('todos');
    setDateRange([null, null]);
    setFilteredCompras([]);
    setFilteredProveedores([]);
  };

  const handleCompraReport = async () => {
    try {
      setLoading(true);
      let url = `${apiUrl}/reporte/compras`;

      // Si hay un ID de compra específico seleccionado
      if (selectedCompraId && selectedCompraId !== 'todos') {
        url = `${apiUrl}/reporte/compras/${selectedCompraId}`;
      } else {
        url = `${apiUrl}/reporte/compras/todos`;
      }

      // Construir query params para los filtros
      const params = new URLSearchParams();
      
      if (selectedEstadoCompra && selectedEstadoCompra !== 'todos') {
        params.append('estado', selectedEstadoCompra);
      }
      
      if (selectedProveedorCompra && selectedProveedorCompra !== 'todos') {
        params.append('id_proveedor', selectedProveedorCompra);
      }
      
      if (dateRange[0] && dateRange[1]) {
        params.append('fecha_inicio', dateRange[0].format('YYYY-MM-DD'));
        params.append('fecha_fin', dateRange[1].format('YYYY-MM-DD'));
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
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
              message.error('Error al generar el reporte de compras');
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            message.error('Error al generar el reporte de compras');
          }
        } else {
          message.error('Error al generar el reporte de compras');
        }
      } else {
        message.error('Error al generar el reporte de compras');
      }
    } finally {
      setLoading(false);
    }
  };

  const showAlquilerModal = () => {
    setIsAlquilerModalVisible(true);
  };

  const handleAlquilerModalCancel = () => {
    setIsAlquilerModalVisible(false);
    setSelectedAlquilerId('');
  };

  const fetchAlquileres = async () => {
    try {
      setLoadingAlquileres(true);
      // Primero obtenemos todos los alquileres
      const response = await axios.get(`${apiUrl}/alquiler`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        // Obtenemos los eventos del asesor actual
        const eventosResponse = await axios.get(`${apiUrl}/evento/asesor/${userCedula}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        // Creamos un Set con los IDs de eventos donde el usuario es asesor
        const eventosAsesorIds = new Set(eventosResponse.data.map((evento: Evento) => evento.id_evento));

        // Filtramos los alquileres para mantener solo aquellos cuyo evento tiene al usuario como asesor
        const alquileresFiltrados = response.data.filter((alquiler: any) => 
          eventosAsesorIds.has(alquiler.id_evento)
        );

        // Ordenamos los eventos por ID de forma descendente
        const sortedEvents = eventosResponse.data.sort((a: Evento, b: Evento) => b.id_evento - a.id_evento);
        
        setEventos(sortedEvents);
        setAlquileres(alquileresFiltrados);
      }
    } catch (error) {
      console.error('Error al cargar alquileres:', error);
      message.error('Error al cargar los alquileres');
    } finally {
      setLoadingAlquileres(false);
    }
  };

  useEffect(() => {
    if (isAlquilerModalVisible) {
      fetchAlquileres();
    }
  }, [isAlquilerModalVisible]);

  const handleAlquilerReport = async () => {
    try {
      setLoading(true);
      let url = `${apiUrl}/reporte/alquiler`;

      // Si hay un evento seleccionado, obtenemos sus alquileres
      if (selectedEventoId && selectedEventoId !== 'todos') {
        url = `${url}/${selectedEventoId}`;
      } else {
        url = `${url}/todos`;
      }

      // Agregamos el parámetro de asesor
      const params = new URLSearchParams();
      params.append('cedula_asesor', userCedula);
      url += `?${params.toString()}`;

      const response = await axios.get(url, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
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

            try {
              const errorData = JSON.parse(blobText);
              if (errorData.mensaje) {
                message.error(errorData.mensaje);
              } else {
                message.error('Error al generar el reporte de alquileres');
              }
            } catch (parseError) {
              console.error('Error parsing error response:', parseError);
              message.error('Error al generar el reporte de alquileres');
            }
          } catch (readError) {
            console.error('Error reading error response:', readError);
            message.error('Error al generar el reporte de alquileres');
          }
        } else {
          message.error('Error al generar el reporte de alquileres');
        }
      } else {
        message.error('Error al generar el reporte de alquileres');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update the event selection component to be reused across modals
  const EventSelect = ({ value, onChange, loading }: { value: string, onChange: (value: string) => void, loading: boolean }) => (
    <Select
      style={{ width: '100%' }}
      placeholder="Seleccione un evento"
      value={value}
      onChange={onChange}
      loading={loading}
      showSearch
      optionFilterProp="label"
      filterOption={(input, option) => 
        (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
      }
    >
      <Option value="todos">Todos los Eventos</Option>
      {eventos.map(evento => (
        <Option 
          key={evento.id_evento} 
          value={evento.id_evento.toString()}
          label={`#${evento.id_evento} - ${evento.cliente?.nombre_usuario} ${evento.cliente?.apellido_usuario}`}
        >
          {`#${evento.id_evento} - ${evento.cliente?.nombre_usuario} ${evento.cliente?.apellido_usuario}`}
        </Option>
      ))}
    </Select>
  );

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2} className="welcome-title">
          Reportes del Sistema
        </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            onClick={showUserModal}
            className="dashboard-card"
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '200px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <UserOutlined style={{ fontSize: '48px', color: 'var(--gold)' }} />
            </div>
            <h3 className="reportTitle">Reportes de Clientes</h3>
            <p>Gestión de reportes de clientes y estados</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            onClick={showEventModal}
            className="dashboard-card"
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '200px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <CalendarOutlined style={{ fontSize: '48px', color: 'var(--gold)' }} />
            </div>
            <h3 className="reportTitle">Reportes de Eventos</h3>
            <p>Estadísticas y métricas de eventos</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            onClick={showEquipoModal}
            className="dashboard-card"
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '200px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <TeamOutlined style={{ fontSize: '48px', color: 'var(--gold)' }} />
            </div>
            <h3 className="reportTitle">Reportes de Equipos</h3>
            <p>Análisis de equipos y sus eventos</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            onClick={showElementoModal}
            className="dashboard-card"
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '200px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <InboxOutlined style={{ fontSize: '48px', color: 'var(--gold)' }} />
            </div>
            <h3 className="reportTitle">Reporte de Elementos</h3>
            <p>Gestión de elementos del sistema</p>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            onClick={showFacturaModal}
            className="dashboard-card"
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '200px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <PrinterOutlined style={{ fontSize: '48px', color: 'var(--gold)' }} />
            </div>
            <h3 className="reportTitle">Facturas de Pagos</h3>
            <p>Gestión de facturación y pagos</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            onClick={showCompraModal}
            className="dashboard-card"
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '200px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <ShoppingCartOutlined style={{ fontSize: '48px', color: 'var(--gold)' }} />
            </div>
            <h3 className="reportTitle">Reportes de Compras</h3>
            <p>Entrada y suministro de elementos</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            onClick={showProveedorModal}
            className="dashboard-card"
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '200px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <TruckOutlined style={{ fontSize: '48px', color: 'var(--gold)' }} />
            </div>
            <h3 className="reportTitle">Reportes de Proveedores</h3>
            <p>Gestión de reportes de proveedores</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            onClick={showAlquilerModal}
            className="dashboard-card"
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '200px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <ShopOutlined style={{ fontSize: '48px', color: 'var(--gold)' }} />
            </div>
            <h3 className="reportTitle">Reporte de Alquileres</h3>
            <p>Gestión y análisis de alquileres del sistema</p>
          </Card>
        </Col>
      </Row>


      <Modal className='ReportsModal'
        title="Reportes de Clientes"
        open={isUserModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h4 className='reportTitle'>Reporte de Clientes por Estado</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
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
                disabled={loading || !selectedStatusForCombinedReport}
              >
                Generar Reporte de Clientes
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
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h4 className='reportTitle'>Filtros Generales</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione el tipo de evento"
                value={selectedTipoEvento}
                onChange={setSelectedTipoEvento}
                loading={loadingTiposEvento}
              >
                <Option value="todos">Todos los Tipos de Evento</Option>
                {tiposEvento.map(tipo => (
                  <Option key={tipo.id_tipo_evento} value={tipo.id_tipo_evento.toString()}>
                    {tipo.tipo_evento}
                  </Option>
                ))}
              </Select>

              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Fecha Inicio', 'Fecha Fin']}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              />

              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleEventReport}
                loading={loading}
              >
                Generar Reporte de Eventos
              </Button>
            </Space>
          </div>
        </Space>
      </Modal>

      <Modal className='ReportsModal'
        title="Reportes de Elementos"
        open={isElementoModalVisible}
        onCancel={handleElementoModalCancel}
        footer={null}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h4 className='reportTitle'>Reporte de Elementos</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
               <Select
                style={{ width: '100%' }}
                placeholder="Seleccione una categoría"
                value={selectedCategoria}
                onChange={setSelectedCategoria}
                loading={loadingCategorias}
              >
                <Option value="todos">Todas las Categorías</Option>
                {categorias.map(categoria => (
                  <Option key={categoria.id_categoria} value={categoria.id_categoria.toString()}>
                    {categoria.nombre_categoria}
                  </Option>
                ))}
              </Select>
               <Select
                style={{ width: '100%' }}
                placeholder="Seleccione una subcategoría"
                value={selectedSubcategoria}
                onChange={setSelectedSubcategoria}
                loading={loadingSubcategorias}
              >
                <Option key="todos" value="todos">Todas las Subcategorías</Option>
                {subcategorias && subcategorias.map(subcategoria => {
                  if (!subcategoria || !subcategoria.id_subcategoria) return null;
                  return (
                    <Option 
                      key={`subcat-${subcategoria.id_subcategoria}`}
                      value={subcategoria.id_subcategoria.toString()}
                    >
                      {subcategoria.nombre_subcategoria || 'Sin nombre'}
                    </Option>
                  );
                })}
              </Select>

            

              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un color"
                value={selectedColor}
                onChange={setSelectedColor}
                loading={loadingColores}
              >
                <Option value="todos">Todos los Colores</Option>
                {colores && colores.map(color => (
                  <Option 
                    key={color?.id_color} 
                    value={(color?.id_color).toString()}
                  >
                    {color?.nombre_color}
                  </Option>
                ))}
              </Select>

              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un material"
                value={selectedMaterial}
                onChange={setSelectedMaterial}
                loading={loadingMateriales}
              >
                <Option value="todos">Todos los Materiales</Option>
                {materiales && materiales.map(material => (
                  <Option 
                    key={material?.id_material} 
                    value={(material?.id_material).toString()}
                  >
                    {material?.nombre_material}
                  </Option>
                ))}
              </Select>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleElementoReport}
                loading={loading}
              >
                Generar Reporte de Elementos
              </Button>
            </Space>
          </div>
        </Space>
      </Modal>

      <Modal className='ReportsModal'
        title="Reportes de Equipos"
        open={isEquipoModalVisible}
        onCancel={handleEquipoModalCancel}
        footer={null}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h4 className='reportTitle'>Generar Reporte de Equipos</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
            <h4 className='reportTitle'>Reporte por Evento</h4>
            <p style={{ fontSize: '12px', color: 'var(--color-text2)', lineHeight: '0.5', marginBottom: '0px'}}>ID evento y Cliente</p>
              <EventSelect 
                value={selectedEventoId}
                onChange={(value) => setSelectedEventoId(value)}
                loading={loadingEventos}
              />

              <h4 className='reportTitle'>Reporte por Empleado</h4>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un empleado"
                value={selectedEmpleadoId}
                onChange={(value) => {
                  setSelectedEmpleadoId(value);
                }}
                loading={loadingEmpleados}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) => 
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option value="todos">Todos los Empleados</Option>
                {empleados.map(empleado => (
                  <Option 
                    key={empleado.cedula_usuario} 
                    value={empleado.cedula_usuario}
                    label={`${empleado.nombre_usuario} ${empleado.apellido_usuario} (${empleado.cedula_usuario})`}
                  >
                    {`${empleado.nombre_usuario} ${empleado.apellido_usuario} (${empleado.cedula_usuario})`} 
                  </Option>
                ))}
              </Select>

              <h4 className='reportTitle'>Reporte por Puesto</h4>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un puesto"
                value={selectedPuesto}
                onChange={(value) => {
                  setSelectedPuesto(value);
                }}
              >
                <Option value="todos">Todos los Puestos</Option>
                <Option value="Decorador">Decorador</Option>
                <Option value="Camarero">Camarero</Option>
                <Option value="Conductor">Conductor</Option>
                <Option value="Supervisor">Supervisor</Option>
                <Option value="Encargado de Logística">Encargado de Logística</Option>
                <Option value="Encargado de Limpieza">Encargado de Limpieza</Option>
              </Select>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleEquipoReport}
                loading={loading}
              >
                Generar Reporte
              </Button>
            </Space>
          </div>
        </Space>
      </Modal>

      <Modal className='ReportsModal'
        title="Reportes de Facturas"
        open={isFacturaModalVisible}
        onCancel={handleFacturaModalCancel}
        footer={null}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h4 className='reportTitle'>Generar Reporte de Factura</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
             
            <h4 className='reportTitle'>Reporte por Evento</h4>
            <p style={{ fontSize: '12px', color: 'var(--color-text2)', lineHeight: '0.5', marginBottom: '0px'}}>ID evento y Cliente</p>
              <EventSelect 
                value={selectedEventoId}
                onChange={(value) => setSelectedEventoId(value)}
                loading={loadingEventos}
              />

              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleFacturaReport}
                loading={loading}
                disabled={!selectedEventoId || selectedEventoId === 'todos'}
              >
                Generar Reporte
              </Button>
            </Space>
          </div>
        </Space>
      </Modal>

      <Modal className='ReportsModal'
        title="Reportes de Proveedores"
        open={isProveedorModalVisible}
        onCancel={handleProveedorModalCancel}
        footer={null}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h4 className='reportTitle'>Filtros de Proveedores</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un tipo de proveedor"
                value={selectedTipoProveedor}
                onChange={setSelectedTipoProveedor}
              >
                <Option value="todos">Todos los Tipos</Option>
                <Option value="Catering">Catering</Option>
                <Option value="Elementos">Elementos</Option>
              </Select>

              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un estado"
                value={selectedEstadoProveedor}
                onChange={setSelectedEstadoProveedor}
              >
                <Option value="todos">Todos los Estados</Option>
                <Option value="Activo">Activo</Option>
                <Option value="Inactivo">Inactivo</Option>
                <Option value="Eliminado">Eliminado</Option>
              </Select>

              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleProveedorReport}
                loading={loading}
              >
                Generar Reporte de Proveedores
              </Button>
            </Space>
          </div>
        </Space>
      </Modal>

      <Modal className='ReportsModal'
        title="Reportes de Compras"
        open={isCompraModalVisible}
        onCancel={handleCompraModalCancel}
        footer={null}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h4 className='reportTitle'>Filtros Generales</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un estado"
                value={selectedEstadoCompra}
                onChange={setSelectedEstadoCompra}
              >
                <Option value="todos">Todos los Estados</Option>
                <Option value="En proceso">En proceso</Option>
                <Option value="Completada">Completada</Option>
                <Option value="Cancelada">Cancelada</Option>
              </Select>

              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un proveedor de elementos"
                value={selectedProveedorCompra}
                onChange={setSelectedProveedorCompra}
                loading={loadingProveedores}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) => 
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option value="todos">Todos los Proveedores de Elementos</Option>
                {filteredProveedores.map(proveedor => (
                  <Option 
                    key={proveedor.id_proveedor} 
                    value={proveedor.id_proveedor.toString()}
                    label={proveedor.nombre_proveedor}
                  >
                    {proveedor.nombre_proveedor}
                  </Option>
                ))}
              </Select>

              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Fecha Inicio', 'Fecha Fin']}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              />
            </Space>
          </div>

          <div>
            <h4 className='reportTitle'>Reporte General de Compras</h4>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => {
                setSelectedCompraId('todos');
                handleCompraReport();
              }}
              loading={loading}
            >
              Generar Reporte General
            </Button>
          </div>

          <div>
            <h4 className='reportTitle'>Reporte de Detalle de Compra</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione una compra"
                value={selectedCompraId}
                onChange={setSelectedCompraId}
                loading={loadingCompras}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) => 
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option value="todos">Todas las Compras</Option>
                {filteredCompras.map(compra => {
                  const fecha = new Date(compra.fecha_compra).toLocaleDateString('es-DO');
                  const proveedor = proveedores.find(p => p.id_proveedor === compra.id_proveedor);
                  return (
                    <Option 
                      key={compra.id_compra} 
                      value={compra.id_compra.toString()}
                      label={`Compra #${compra.id_compra} - ${fecha} - ${proveedor?.nombre_proveedor} - ${compra.estado_compra}`}
                    >
                      {`Compra #${compra.id_compra} - ${fecha} - ${proveedor?.nombre_proveedor} - ${compra.estado_compra}`}
                    </Option>
                  );
                })}
              </Select>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleCompraReport}
                loading={loading}
                disabled={!selectedCompraId || selectedCompraId === 'todos'}
              >
                Generar Reporte de Detalle
              </Button>
            </Space>
          </div>
        </Space>
      </Modal>

      <Modal className='ReportsModal'
        title="Reportes de Alquileres"
        open={isAlquilerModalVisible}
        onCancel={handleAlquilerModalCancel}
        footer={null}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h4 className='reportTitle'>Filtros de Alquileres</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <h4 className='reportTitle'>Reporte por Evento</h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text2)', lineHeight: '0.5', marginBottom: '0px'}}>ID evento y Cliente</p>
              <EventSelect 
                value={selectedEventoId}
                onChange={(value) => setSelectedEventoId(value)}
                loading={loadingEventos}
              />

              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleAlquilerReport}
                loading={loading}
              >
                Generar Reporte de Alquileres
              </Button>
            </Space>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default ReportEmployee;
