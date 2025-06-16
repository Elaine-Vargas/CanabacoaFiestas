import React, { useEffect, useState } from 'react';
import { Button, Typography, Select, Space, message, Card, Modal, Row, Col, Input, DatePicker } from 'antd';
import { DownloadOutlined, UserOutlined, TeamOutlined, CalendarOutlined, TruckOutlined, ShoppingCartOutlined, PrinterOutlined, InboxOutlined, ShopOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
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

const ReportAdmin = () => {
    const apiUrl = `${import.meta.env.VITE_API_URL}/${import.meta.env.BACKEND_PORT}/${import.meta.env.VITE_API_BASE_URL}`;
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
      let url = `${apiUrl}/reporte/eventos`;
      const params = new URLSearchParams();

      if (selectedEventType === 'cliente' && cedula && cedula !== 'todos') {
        url = `${apiUrl}/reporte/eventos/cliente/${cedula}`;
      } else if (selectedEventType === 'asesor' && cedula && cedula !== 'todos') {
        url = `${apiUrl}/reporte/eventos/asesor/${cedula}`;
      } else if (selectedEventType === 'personal' && cedula && cedula !== 'todos') {
        url = `${apiUrl}/reporte/eventos/personal/${cedula}`;
      }

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

      console.log('URL del reporte de eventos:', url);

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

  const handleEventTypeChange = (value: string) => {
    setSelectedEventType(value);
    setCedula('');
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

  const handleDetalleAlquilerReport = async () => {
    try {
      setLoading(true);
      let url = `${apiUrl}/reporte/elementos/alquiler/todos`;
      const params = new URLSearchParams();

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
              message.error('Error al generar el reporte de detalles de alquiler');
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            message.error('Error al generar el reporte de detalles de alquiler');
          }
        } else {
          message.error('Error al generar el reporte de detalles de alquiler');
        }
      } else {
        message.error('Error al generar el reporte de detalles de alquiler');
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
      const response = await fetch(`${apiUrl}/evento`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar los eventos');
      }
      const data = await response.json();
      setEventos(data);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      message.error('Error al cargar los eventos');
    } finally {
      setLoadingEventos(false);
    }
  };

  const fetchCompras = async () => {
    try {
      setLoadingCompras(true);
      const response = await axios.get(`${apiUrl}/compra`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        // Ordenar las compras por ID de forma descendente (más recientes primero)
        const comprasOrdenadas = response.data.sort((a: Compra, b: Compra) => b.id_compra - a.id_compra);
        console.log('Compras cargadas:', comprasOrdenadas); // Para debugging
        setCompras(comprasOrdenadas);
      } else {
        console.error('La respuesta no es un array:', response.data);
        setCompras([]);
      }
    } catch (error) {
      console.error('Error al cargar compras:', error);
      message.error('Error al cargar las compras');
      setCompras([]);
    } finally {
      setLoadingCompras(false);
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
      const token = localStorage.getItem('token');
      
      if (!token) {
        message.error('No hay una sesión activa');
        return;
      }

      // Obtener datos del usuario actual
      const userResponse = await fetch(`${apiUrl}/auth/user-data`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.mensaje || 'Error al obtener datos del usuario');
      }

      const userData = await userResponse.json();
      
      if (!userData || userData.id_rol !== 1) {
        message.error('No tienes permisos para generar este reporte. Solo los administradores pueden generar reportes de equipos.');
        return;
      }

      let url = `${apiUrl}/reporte/equipos`;
      
      // Agregar parámetros de filtro si están presentes
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

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          message.warning(errorData.mensaje);
        } else {
          throw new Error(errorData.mensaje || 'Error al generar el reporte');
        }
        return;
      }

      const blob = await response.blob();
      const fileURL = window.URL.createObjectURL(blob);
      window.open(fileURL);

      message.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      message.error(error instanceof Error ? error.message : 'Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleFacturaReport = async () => {
    try {
      setLoading(true);
      let url = `${apiUrl}/reporte/factura/evento/${selectedEventoId}`;

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

  const fetchElementosCompra = async () => {
    try {
      setLoadingElementosCompra(true);
      const response = await axios.get(`${apiUrl}/elemento/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data) {
        setElementosCompra(response.data);
      }
    } catch (error) {
      console.error('Error al cargar elementos:', error);
      message.error('Error al cargar los elementos');
    } finally {
      setLoadingElementosCompra(false);
    }
  };

  useEffect(() => {
    if (isCompraModalVisible) {
      fetchProveedores();
      fetchCompras();
    }
  }, [isCompraModalVisible]);

  useEffect(() => {
    if (selectedProveedorCompra && selectedProveedorCompra !== 'todos') {
      const comprasFiltradas = compras.filter(compra => 
        compra.id_proveedor.toString() === selectedProveedorCompra
      );
      setFilteredCompras(comprasFiltradas);
    } else {
      setFilteredCompras(compras);
    }
  }, [selectedProveedorCompra, compras]);

  useEffect(() => {
    if (selectedCompraId && selectedCompraId !== 'todos') {
      const compraSeleccionada = compras.find(compra => 
        compra.id_compra.toString() === selectedCompraId
      );
      if (compraSeleccionada) {
        const proveedorCompra = proveedores.find(prov => 
          prov.id_proveedor === compraSeleccionada.id_proveedor
        );
        if (proveedorCompra) {
          setFilteredProveedores([proveedorCompra]);
          setSelectedProveedorCompra(proveedorCompra.id_proveedor.toString());
        }
      }
    } else {
      setFilteredProveedores(proveedores);
    }
  }, [selectedCompraId, compras, proveedores]);

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
      const response = await axios.get(`${apiUrl}/alquiler`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data) {
        setAlquileres(response.data);
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
    setLoading(true);
    let url = `${apiUrl}/reporte/alquiler`;
    if (selectedAlquilerId && selectedAlquilerId !== 'todos') {
      url = `${apiUrl}/reporte/alquiler/${selectedAlquilerId}`;
    } else {
      url = `${apiUrl}/reporte/alquiler/todos`;
    }
    try {
      const response = await axios.get(url, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Always try to read the blob as text and parse as JSON error first
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
        if (errorData && errorData.mensaje) {
          message.error(errorData.mensaje);
          return;
        }
      } catch {
        // Not JSON, treat as PDF
        const file = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = window.URL.createObjectURL(file);
        window.open(fileURL);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        message.error('Error al generar el reporte de alquileres');
      } else {
        message.error('Error al generar el reporte de alquileres');
      }
    } finally {
      setLoading(false);
    }
  };

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
            <h3 className="reportTitle">Reportes de Usuarios</h3>
            <p>Gestión de reportes de usuarios y roles</p>
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
        title="Reportes de Usuarios"
        open={isUserModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
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
            </Space>
          </div>

          <div>
            <h4 className='reportTitle'>Generar Reporte de Eventos</h4>
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
                  optionFilterProp="label"
                  filterOption={(input, option) => 
                    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option value="todos">Todos los Clientes</Option>
                  {clientes.map(cliente => (
                    <Option key={cliente.cedula_usuario} value={cliente.cedula_usuario}>
                      {`${cliente.nombre_usuario} ${cliente.apellido_usuario} (${cliente.cedula_usuario})`}
                    </Option>
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
                  optionFilterProp="label"
                  filterOption={(input, option) => 
                    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option value="todos">Todos los Asesores</Option>
                  {asesores.map(asesor => (
                    <Option key={asesor.cedula_usuario} value={asesor.cedula_usuario}>
                      {`${asesor.nombre_usuario} ${asesor.apellido_usuario} (${asesor.cedula_usuario})`}
                    </Option>
                  ))}
                </Select>
              )}

              {selectedEventType === 'personal' && (
                <Select
                  style={{ width: '100%' }}
                  placeholder="Seleccione un personal"
                  loading={loadingAsesores}
                  value={cedula}
                  onChange={setCedula}
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) => 
                    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option value="todos">Todos los Personal</Option>
                  {asesores.map(personal => (
                    <Option key={personal.cedula_usuario} value={personal.cedula_usuario}>
                      {`${personal.nombre_usuario} ${personal.apellido_usuario} (${personal.cedula_usuario})`}
                    </Option>
                  ))}
                </Select>
              )}

              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleEventReport}
                loading={loading}
              >
                Generar Reporte
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
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un evento"
                value={selectedEventoId}
                onChange={(value) => {
                  setSelectedEventoId(value);
                }}
                loading={loadingEventos}
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
              {/* Selector de evento */}
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un evento"
                value={selectedEventoId}
                onChange={setSelectedEventoId}
                loading={loadingEventos}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
              >
                <Option value="todos">Seleccione un evento</Option>
                {eventos.map(evento => (
                  <Option key={evento.id_evento} value={evento.id_evento.toString()} label={evento.cliente ? `${evento.cliente.nombre_usuario} ${evento.cliente.apellido_usuario}` : evento.id_evento}>
                    {evento.cliente ? `${evento.cliente.nombre_usuario} ${evento.cliente.apellido_usuario}` : evento.id_evento}
                  </Option>
                ))}
              </Select>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleFacturaReport}
                loading={loading}
                disabled={loading || !selectedEventoId || selectedEventoId === 'todos'}
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
            <h4 className='reportTitle'>Reporte General de Alquileres</h4>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => {
                setSelectedAlquilerId('todos');
                handleAlquilerReport();
              }}
              loading={loading}
            >
              Generar Reporte General
            </Button>
          </div>

          <div>
            <h4 className='reportTitle'>Reporte de Detalle de Alquiler</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un alquiler"
                value={selectedAlquilerId}
                onChange={setSelectedAlquilerId}
                loading={loadingAlquileres}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) => 
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option value="todos">Todos los Alquileres</Option>
                {alquileres
                  .sort((a, b) => b.id_alquiler - a.id_alquiler)
                  .map(alquiler => {
                    return (
                      <Option 
                        key={alquiler.id_alquiler} 
                        value={alquiler.id_alquiler.toString()}
                        label={`#${alquiler.id_alquiler} - Evento #${alquiler.id_evento}`}
                      >
                        {`#${alquiler.id_alquiler} - Evento #${alquiler.id_evento}`}

                      </Option>
                    );
                  })}
              </Select>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleAlquilerReport}
                loading={loading}
                disabled={!selectedAlquilerId || selectedAlquilerId === 'todos'}
              >
                Generar Reporte de Detalle de Alquiler
              </Button>
            </Space>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default ReportAdmin;
