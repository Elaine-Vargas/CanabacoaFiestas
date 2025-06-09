import React, { useEffect, useState } from 'react';
import { Button, Select, Space, message, Card, Modal, Row, Col, Input, DatePicker } from 'antd';
import { DownloadOutlined, UserOutlined, TeamOutlined, CalendarOutlined, TruckOutlined, ShoppingCartOutlined, PrinterOutlined, InboxOutlined, ShopOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

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
  tipo_proveedor: string;
  estado_proveedor: string;
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
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
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
  const [selectedEventoId, setSelectedEventoId] = useState<string>('');
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState<string>('');
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
  const [selectedProveedorCompra, setSelectedProveedorCompra] = useState<string>('');
  const [compras, setCompras] = useState<Compra[]>([]);
  const [elementosCompra, setElementosCompra] = useState<ElementoCompra[]>([]);
  const [loadingCompras, setLoadingCompras] = useState(false);
  const [loadingElementosCompra, setLoadingElementosCompra] = useState(false);
  const [selectedPuesto, setSelectedPuesto] = useState<string>('');

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

  const handleGeneralEventReport = async () => {
    try {
      setLoading(true);
      let url = `${apiUrl}/reporte/eventos`;
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
              message.error('Error al generar el reporte general de eventos');
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            message.error('Error al generar el reporte general de eventos');
          }
        } else {
          message.error('Error al generar el reporte general de eventos');
        }
      } else {
        message.error('Error al generar el reporte general de eventos');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSpecificEventReport = async () => {
    if (!selectedEventType || !cedula) {
      message.warning('Por favor complete todos los campos');
      return;
    }

    try {
      setLoading(true);
      let endpoint;
      if (selectedEventType === 'cliente') {
        endpoint = `/reporte/eventos/cliente/${cedula}`;
      } else if (selectedEventType === 'asesor') {
        endpoint = `/reporte/eventos/asesor/${cedula}`;
      } else if (selectedEventType === 'personal') {
        endpoint = `/reporte/eventos/personal/${cedula}`;
      }

      const params = new URLSearchParams();

      if (selectedTipoEvento && selectedTipoEvento !== 'todos') {
        params.append('tipo_evento', selectedTipoEvento);
      }

      if (dateRange[0] && dateRange[1]) {
        params.append('fecha_inicio', dateRange[0].format('YYYY-MM-DD'));
        params.append('fecha_fin', dateRange[1].format('YYYY-MM-DD'));
      }

      const url = `${apiUrl}${endpoint}${params.toString() ? `?${params.toString()}` : ''}`;

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
              message.error('Error al generar el reporte específico de eventos');
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            message.error('Error al generar el reporte específico de eventos');
          }
        } else {
          message.error('Error al generar el reporte específico de eventos');
        }
      } else {
        message.error('Error al generar el reporte específico de eventos');
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
  };

  useEffect(() => {
    if (isElementoModalVisible) {
      fetchSubcategorias();
      fetchColores();
      fetchMateriales();
    }
  }, [isElementoModalVisible]);

  const fetchSubcategorias = async () => {
    try {
      setLoadingSubcategorias(true);
      const response = await axios.get(`${apiUrl}/elemento/categorias/list`, {
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

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('URL del reporte:', url);
      console.log('Parámetros:', {
        subcategoria: selectedSubcategoria,
        color: selectedColor,
        material: selectedMaterial,
        agrupar_por: selectedAgruparPor
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
    setSelectedEquipoReport('');
    setSelectedEventoId('');
    setSelectedEmpleadoId('');
    setSelectedPuesto('');
  };

  const showFacturaModal = () => {
    setIsFacturaModalVisible(true);
  };

  const handleFacturaModalCancel = () => {
    setIsFacturaModalVisible(false);
    setSelectedFacturaReport('');
    setSelectedClienteId('');
    setSelectedMetodoPago('');
    setPrecioRange([0, 0]);
  };

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

  const fetchProveedores = async () => {
    try {
      setLoadingProveedores(true);
      const response = await axios.get(`${apiUrl}/proveedor/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data) {
        setProveedores(response.data);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      message.error('Error al cargar los proveedores');
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
      let url = `${apiUrl}/reporte/equipos`;
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

      console.log('URL del reporte:', url);

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
      let url = `${apiUrl}/reporte/facturas`;
      const params = new URLSearchParams();

      if (selectedFacturaReport === 'cliente' && selectedClienteId) {
        params.append('cliente_id', selectedClienteId);
      } else if (selectedFacturaReport === 'evento' && selectedEventoId) {
        params.append('evento_id', selectedEventoId);
      } else if (selectedFacturaReport === 'metodo') {
        params.append('metodo_pago', selectedMetodoPago);
        if (precioRange[0] > 0) params.append('precio_min', precioRange[0].toString());
        if (precioRange[1] > 0) params.append('precio_max', precioRange[1].toString());
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
      message.error('Error al generar el reporte de facturas');
    } finally {
      setLoading(false);
    }
  };

  const handleProveedorReport = async () => {
    try {
      setLoading(true);
      let url = `${apiUrl}/reporte/proveedores`;
      const params = new URLSearchParams();

      if (selectedTipoProveedor !== 'todos') {
        params.append('tipo', selectedTipoProveedor);
      }

      if (selectedEstadoProveedor !== 'todos') {
        params.append('estado', selectedEstadoProveedor);
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
      message.error('Error al generar el reporte de proveedores');
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
    setSelectedElementoId('');
    setSelectedEstadoCompra('todos');
    setSelectedProveedorCompra('');
  };

  const fetchCompras = async () => {
    try {
      setLoadingCompras(true);
      const response = await axios.get(`${apiUrl}/compra/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data) {
        setCompras(response.data);
      }
    } catch (error) {
      console.error('Error al cargar compras:', error);
      message.error('Error al cargar las compras');
    } finally {
      setLoadingCompras(false);
    }
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
      fetchCompras();
      fetchElementosCompra();
      fetchProveedores();
    }
  }, [isCompraModalVisible]);

  const handleCompraReport = async (type: string) => {
    try {
      setLoading(true);
      let url = `${apiUrl}/reporte/compras`;
      const params = new URLSearchParams();

      switch (type) {
        case 'general':
          // No additional parameters needed
          break;
        case 'detalle':
          if (selectedCompraId) {
            params.append('compra_id', selectedCompraId);
          }
          break;
        case 'elemento':
          if (selectedElementoId) {
            params.append('elemento_id', selectedElementoId);
          }
          break;
        case 'estado':
          if (selectedEstadoCompra !== 'todos') {
            params.append('estado', selectedEstadoCompra);
          }
          break;
        case 'proveedor':
          if (selectedProveedorCompra) {
            params.append('proveedor_id', selectedProveedorCompra);
          }
          break;
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
      message.error('Error al generar el reporte de compras');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Reportes del Sistema</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            onClick={showUserModal}
            style={{backgroundColor:'green', textAlign: 'center' }}
          >
            <UserOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
            <h3>Reportes de Usuarios</h3>
            <p>Gestión de reportes de usuarios y roles</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            onClick={showEventModal}
            style={{backgroundColor:'green', textAlign: 'center' }}
          >
            <CalendarOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
            <h3>Reportes de Eventos</h3>
            <p>Estadísticas y métricas de eventos</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            
            hoverable
            onClick={showEquipoModal}
            style={{backgroundColor:'green', textAlign: 'center' }}
          >
            <TeamOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
            <h3>Reportes de Equipos</h3>
            <p>Análisis de equipos y sus eventos</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            onClick={showElementoModal}
            style={{ textAlign: 'center' }}
          >
            <InboxOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
            <h3>Reporte de Elementos</h3>
            <p>Gestión de elementos del sistema</p>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            onClick={showFacturaModal}
            style={{ textAlign: 'center' }}
          >
            <PrinterOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
            <h3>Facturas de Pagos</h3>
            <p>Gestión de facturación y pagos</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            onClick={showCompraModal}
            style={{ textAlign: 'center' }}
          >
            <ShoppingCartOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
            <h3>Reportes de Compras</h3>
            <p>Entrada y suministro de elementos</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            onClick={showProveedorModal}
            style={{ textAlign: 'center' }}
          >
            <TruckOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
            <h3>Reportes de Proveedores</h3>
            <p>Gestión de reportes de proveedores</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            onClick={showElementoModal}
            style={{ textAlign: 'center' }}
          >
            <ShopOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
            <h3>Reporte de Menus</h3>
            <p>Gestión y análisis de menus del sistema</p>
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
            <h4 className='reportTitle'>Reporte General de Eventos</h4>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={handleGeneralEventReport}
              loading={loading}
            >
              Generar Reporte General
            </Button>
          </div>

          <div>
            <h4 className='reportTitle'>Reporte Específico de Eventos</h4>
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
                onClick={handleSpecificEventReport}
                loading={loading}
                disabled={loading || !selectedEventType || !cedula}
              >
                Generar Reporte Específico
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
                    key={color?.id_color || ''} 
                    value={(color?.id_color || '').toString()}
                  >
                    {color?.nombre_color || 'Sin nombre'}
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
                    key={material?.id_material || ''} 
                    value={(material?.id_material || '').toString()}
                  >
                    {material?.nombre_material || 'Sin nombre'}
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

          <div>
            <h4 className='reportTitle'>Reporte de Detalles de Alquiler</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Fecha Inicio', 'Fecha Fin']}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              />

              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleDetalleAlquilerReport}
                loading={loading}
              >
                Generar Reporte de Detalles de Alquiler
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
            <h4 className='reportTitle'>Reporte General de Equipos</h4>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => {
                setSelectedEquipoReport('general');
                handleEquipoReport();
              }}
              loading={loading}
            >
              Generar Reporte General
            </Button>
          </div>

          <div>
            <h4 className='reportTitle'>Reporte por Evento</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
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
                    label={`${evento.cliente?.nombre_usuario || ''} ${evento.cliente?.apellido_usuario || ''} - ${new Date(evento.fecha_evento).toLocaleDateString()}`}
                  >
                    {`${evento.cliente?.nombre_usuario || ''} ${evento.cliente?.apellido_usuario || ''} - ${new Date(evento.fecha_evento).toLocaleDateString()}`}
                  </Option>
                ))}
              </Select>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleEquipoReport}
                loading={loading}
                disabled={!selectedEventoId}
              >
                Generar Reporte por Evento
              </Button>
            </Space>
          </div>

          <div>
            <h4 className='reportTitle'>Reporte por Empleado</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
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
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleEquipoReport}
                loading={loading}
                disabled={!selectedEmpleadoId}
              >
                Generar Reporte por Empleado
              </Button>
            </Space>
          </div>

          <div>
            <h4 className='reportTitle'>Reporte por Puesto</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
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
                disabled={!selectedPuesto}
              >
                Generar Reporte por Puesto
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
            <h4 className='reportTitle'>Reporte por Cliente</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un cliente"
                value={selectedClienteId}
                onChange={setSelectedClienteId}
                loading={loadingClientes}
              >
                {clientes.map(cliente => (
                  <Option key={cliente.cedula_usuario} value={cliente.cedula_usuario}>
                    {`${cliente.nombre_usuario} ${cliente.apellido_usuario}`}
                  </Option>
                ))}
              </Select>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => {
                  setSelectedFacturaReport('cliente');
                  handleFacturaReport();
                }}
                loading={loading}
                disabled={!selectedClienteId}
              >
                Generar Reporte por Cliente
              </Button>
            </Space>
          </div>

          <div>
            <h4 className='reportTitle'>Reporte por Evento</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un evento"
                value={selectedEventoId}
                onChange={setSelectedEventoId}
                loading={loadingEventos}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) => 
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
              >
                {eventos.map(evento => (
                  <Option key={evento.id_evento} value={evento.id_evento.toString()}>
                    {`${evento.cliente?.nombre_usuario || ''} ${evento.cliente?.apellido_usuario || ''} - ${new Date(evento.fecha_evento).toLocaleDateString()}`}
                  </Option>
                ))}
              </Select>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => {
                  setSelectedFacturaReport('evento');
                  handleFacturaReport();
                }}
                loading={loading}
                disabled={!selectedEventoId}
              >
                Generar Reporte por Evento
              </Button>
            </Space>
          </div>

          <div>
            <h4 className='reportTitle'>Reporte por Método de Pago</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un método de pago"
                value={selectedMetodoPago}
                onChange={setSelectedMetodoPago}
              >
                <Option value="efectivo">Efectivo</Option>
                <Option value="tarjeta">Tarjeta</Option>
                <Option value="transferencia">Transferencia</Option>
              </Select>
              <Input.Group compact>
                <Input
                  style={{ width: '50%' }}
                  placeholder="Precio mínimo"
                  type="number"
                  value={precioRange[0]}
                  onChange={(e) => setPrecioRange([Number(e.target.value), precioRange[1]])}
                />
                <Input
                  style={{ width: '50%' }}
                  placeholder="Precio máximo"
                  type="number"
                  value={precioRange[1]}
                  onChange={(e) => setPrecioRange([precioRange[0], Number(e.target.value)])}
                />
              </Input.Group>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => {
                  setSelectedFacturaReport('metodo');
                  handleFacturaReport();
                }}
                loading={loading}
                disabled={!selectedMetodoPago}
              >
                Generar Reporte por Método de Pago
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
                <Option value="equipos">Equipos</Option>
                <Option value="alimentos">Alimentos</Option>
                <Option value="decoracion">Decoración</Option>
                <Option value="otros">Otros</Option>
              </Select>

              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un estado"
                value={selectedEstadoProveedor}
                onChange={setSelectedEstadoProveedor}
              >
                <Option value="todos">Todos los Estados</Option>
                <Option value="activo">Activo</Option>
                <Option value="inactivo">Inactivo</Option>
                <Option value="suspendido">Suspendido</Option>
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
            <h4 className='reportTitle'>Reporte General de Compras</h4>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => handleCompraReport('general')}
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
              >
                {compras.map(compra => (
                  <Option key={compra.id_compra} value={compra.id_compra.toString()}>
                    {`Compra ID: ${compra.id_compra}, Fecha: ${compra.fecha_compra}, Estado: ${compra.estado_compra}`}
                  </Option>
                ))}
              </Select>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => handleCompraReport('detalle')}
                loading={loading}
                disabled={!selectedCompraId}
              >
                Generar Reporte de Detalle de Compra
              </Button>
            </Space>
          </div>

          <div>
            <h4 className='reportTitle'>Reporte de Elemento de Compra</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un elemento"
                value={selectedElementoId}
                onChange={setSelectedElementoId}
                loading={loadingElementosCompra}
              >
                {elementosCompra.map(elemento => (
                  <Option key={elemento.id_elemento} value={elemento.id_elemento.toString()}>
                    {elemento.nombre_elemento}
                  </Option>
                ))}
              </Select>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => handleCompraReport('elemento')}
                loading={loading}
                disabled={!selectedElementoId}
              >
                Generar Reporte de Elemento de Compra
              </Button>
            </Space>
          </div>

          <div>
            <h4 className='reportTitle'>Reporte de Estado de Compra</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un estado"
                value={selectedEstadoCompra}
                onChange={setSelectedEstadoCompra}
              >
                <Option value="todos">Todos los Estados</Option>
                <Option value="pendiente">Pendiente</Option>
                <Option value="en proceso">En proceso</Option>
                <Option value="completado">Completado</Option>
                <Option value="cancelado">Cancelado</Option>
              </Select>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => handleCompraReport('estado')}
                loading={loading}
              >
                Generar Reporte de Estado de Compra
              </Button>
            </Space>
          </div>

          <div>
            <h4 className='reportTitle'>Reporte de Proveedor de Compra</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un proveedor"
                value={selectedProveedorCompra}
                onChange={setSelectedProveedorCompra}
                loading={loadingProveedores}
              >
                {proveedores.map(proveedor => (
                  <Option key={proveedor.id_proveedor} value={proveedor.id_proveedor.toString()}>
                    {proveedor.nombre_proveedor}
                  </Option>
                ))}
              </Select>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => handleCompraReport('proveedor')}
                loading={loading}
              >
                Generar Reporte de Proveedor de Compra
              </Button>
            </Space>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default ReportAdmin;
