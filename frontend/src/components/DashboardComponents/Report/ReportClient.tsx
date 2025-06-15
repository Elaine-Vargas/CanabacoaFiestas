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

const ReportClient = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
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
  const [isCompraModalVisible, setIsCompraModalVisible] = useState<boolean>(false);
  const [selectedCompraId, setSelectedCompraId] = useState<string>('');
  const [selectedElementoId, setSelectedElementoId] = useState<string>('');
  const [selectedEstadoCompra, setSelectedEstadoCompra] = useState<string>('todos');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todos');
  const [precioRangeElemento, setPrecioRangeElemento] = useState<[number, number]>([0, 0]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [isAlquilerModalVisible, setIsAlquilerModalVisible] = useState<boolean>(false);
  const [selectedAlquilerId, setSelectedAlquilerId] = useState<string>('');
  const [alquileres, setAlquileres] = useState<any[]>([]);
  const [loadingAlquileres, setLoadingAlquileres] = useState(false);

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

        if (id_rol !== 2) { 
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
      const response = await fetch(`${apiUrl}/usuario`, {
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
        setEmpleados(data.usuarios.filter((u: any) => u.rol_usuario === '3'));
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
      fetchAsesores();
      fetchTiposEvento();
    }
  }, [isEventModalVisible]);

  const handleEventReport = async () => {
    try {
      setLoading(true);
      let url = `${apiUrl}/reporte/eventos/cliente/${userCedula}`;
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


  const fetchEventos = async () => {
    try {
      setLoadingEventos(true);
      const response = await fetch(`${apiUrl}/evento/cliente/${userCedula}`, {
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

  useEffect(() => {
    if (isEquipoModalVisible) {
      fetchEventos();
      fetchEmpleados();
    }
  }, [isEquipoModalVisible]);

  const handleEquipoReport = async () => {
    try {
      setLoading(true);
      let url = `${apiUrl}/reporte/equipos`;

      // Construir los parámetros de la consulta
      const params = new URLSearchParams();
      params.append('cedula_cliente', userCedula);

      if (selectedEventoId && selectedEventoId !== 'todos') {
        params.append('evento_id', selectedEventoId);
      }

      // Agregar los parámetros a la URL
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
      let url = `${apiUrl}/reporte/factura/cliente/${userCedula}`;

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
        // Obtenemos los eventos del cliente actual
        const eventosResponse = await axios.get(`${apiUrl}/evento/cliente/${userCedula}`, {
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
            onClick={showFacturaModal}
            className="dashboard-card"
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '200px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <ShoppingCartOutlined style={{ fontSize: '48px', color: 'var(--gold)' }} />
            </div>
            <h3 className="reportTitle">Reportes de Facturas</h3>
            <p>Historial de pagos y facturas</p>
          </Card>
        </Col>
      </Row>

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
              >
                Generar Reporte
              </Button>
            </Space>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default ReportClient;