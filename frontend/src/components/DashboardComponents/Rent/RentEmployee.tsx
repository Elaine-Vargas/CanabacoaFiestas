import React, { useState, useEffect } from 'react';
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
  Table
} from 'antd';
import { PlusOutlined, RightOutlined, CloseOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, EyeOutlined, InboxOutlined } from '@ant-design/icons';
import axios from 'axios';
import '../../../styles/dashboard/ServicesSubpages.scss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { apiUrl } from '../../../config';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

const StyledCard = styled(Card)`
  margin: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 8px var(--color-shadow);
  background-color: var(--color-background2);
  
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

const CatalogModal = styled(StyledModal)`
  &.ant-modal {
    z-index: 1100 !important;
  }
  
  .ant-modal-wrap {
    z-index: 1100 !important;
  }
  
  .ant-modal-mask {
    z-index: 1099 !important;
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
    background: var(--color-background);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-shadow);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--gold);
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
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  
  &:hover {
    background-color: var(--gold) !important;
    border-color: var(--dark-gold) !important;
    color: white !important;
  }
`;

const ListItem = styled(List.Item)`
  margin: 8px 0;
  padding: 0;
  background-color: transparent;
  border: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }

  &.selected {
    .elemento-info {
      background-color: var(--color-background);
      border-color: var(--gold);
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
  font-family: "Montserrat", sans-serif;
  
  &:hover {
    background-color: var(--color-background) !important;
    border-color: var(--dark-gold) !important;
    color: var(--dark-gold) !important;
  }
`;

const HeaderButton = styled(Button)`
  margin-right: 8px;
  background-color: var(--dark-gold);
  border-color: var(--gold);
  color: white;
  font-family: "Montserrat", sans-serif;
  
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

const ModalContainer = styled.div`
  position: relative;
  z-index: 1100;
`;

const StyledButton = styled(Button)`
  &.ant-btn-primary {
    background-color: var(--dark-gold) !important;
    border-color: var(--dark-gold) !important;
    color: white !important;
    
    &:hover {
      background-color: var(--gold) !important;
      border-color: var(--dark-gold) !important;
      color: white !important;
    }
  }

  &.ant-btn-default {
    border-color: var(--dark-gold) !important;
    color: var(--dark-gold) !important;
    
    &:hover {
      background-color: var(--beige-light) !important;
      border-color: var(--dark-gold) !important;
      color: var(--dark-gold) !important;
    }
  }
`;

const CatalogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background-color: var(--beige);
  border-radius: 12px;
  border: 1px solid var(--dark-gold);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ElementoInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: white;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .elemento-imagen {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    object-fit: cover;
    border: 2px solid var(--beige);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .elemento-details {
    flex: 1;
    padding: 8px;
  }

  .elemento-title {
    color: var(--dark-gold);
    font-weight: 600;
    margin-bottom: 8px;
  }

  .elemento-price {
    color: var(--dark-gold);
    font-size: 1.2em;
    font-weight: 600;
  }

  .elemento-category {
    color: #666;
    font-size: 0.9em;
  }

  .elemento-stock {
    color: #666;
    font-size: 0.9em;
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

interface DetalleCompra {
  id_elemento: number;
  elemento: Elemento;
  cantidad_compra: number;
  precio_unitario: number;
  total_compra: number;
}

interface DetalleCompraForm {
  id_elemento: number;
  cantidad_compra: number;
  precio_unitario: number;
}

interface DetalleCompraData {
  id_elemento: number;
  cantidad_compra: number;
  precio_unitario: number;
  total_compra: number;
  precio_total: number;
}

interface Compra {
  id_compra: number;
  id_proveedor: number;
  fecha_compra: string;
  hora_compra: string;
  costo_compra: number;
  estado_compra: string;
  proveedor?: {
    nombre_proveedor: string;
  };
  detalles?: DetalleCompra[];
}

const RentEmployee: React.FC = () => {
  const [alquileres, setAlquileres] = useState<Alquiler[]>([]);
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [elementosSeleccionados, setElementosSeleccionados] = useState<ElementoSeleccionado[]>([]);
  const [showCatalogo, setShowCatalogo] = useState(false);
  const [showFormulario, setShowFormulario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [eventos, setEventos] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAlquiler, setEditingAlquiler] = useState<Alquiler | null>(null);
  const [searchAlquiler, setSearchAlquiler] = useState('');
  const [filterEvento, setFilterEvento] = useState<string | null>(null);
  const [filterEstado, setFilterEstado] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingAlquiler, setViewingAlquiler] = useState<Alquiler | null>(null);

  // Estados para compras
  const [compras, setCompras] = useState<Compra[]>([]);
  const [searchCompra, setSearchCompra] = useState('');
  const [loadingCompra, setLoadingCompra] = useState(false);
  const [showCompraModal, setShowCompraModal] = useState(false);
  const [showViewCompraModal, setShowViewCompraModal] = useState(false);
  const [viewingCompra, setViewingCompra] = useState<Compra | null>(null);
  const [loadingCompraSubmit, setLoadingCompraSubmit] = useState(false);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [compraForm] = Form.useForm();

  useEffect(() => {
    fetchAlquileres();
    fetchElementos();
    fetchEventos();
    fetchCategorias();
    fetchCompras();
    fetchProveedores();
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
      console.log('API URL:', apiUrl);
      console.log('Token:', token);
      console.log('Fetching elementos...');
      
      const response = await axios.get(`${apiUrl}/elemento`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Respuesta completa:', response);
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Elementos recibidos:', response.data);
      
      if (Array.isArray(response.data)) {
        const elementosFormateados = response.data.map(elemento => ({
          ...elemento,
          cantidad_disponible: elemento.cantidad_disponible ?? 0,
          precio_elemento: elemento.precio_elemento ?? 0
        }));
        console.log('Elementos formateados:', elementosFormateados);
        setElementos(elementosFormateados);
      } else {
        console.error('La respuesta no es un array:', response.data);
        message.error('Error en el formato de los elementos');
        setElementos([]);
      }
    } catch (error: any) {
      console.error('Error completo al cargar los elementos:', error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Headers:', error.response?.headers);
        message.error(`Error al cargar los elementos: ${error.response?.data?.mensaje || error.message}`);
      } else {
        message.error('Error al cargar los elementos');
      }
      setElementos([]);
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

  const fetchCompras = async () => {
    setLoadingCompra(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const response = await axios.get(`${apiUrl}/compra/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (Array.isArray(response.data)) {
        console.log('Compras recibidas:', response.data);
        setCompras(response.data);
      } else {
        console.warn('La respuesta no es un array:', response.data);
        setCompras([]);
      }
    } catch (error: any) {
      console.error('Error al cargar las compras:', error);
      if (axios.isAxiosError(error)) {
        message.error(`Error: ${error.response?.data?.mensaje || error.message}`);
      } else {
        message.error('Error al cargar las compras');
      }
      setCompras([]);
    } finally {
      setLoadingCompra(false);
    }
  };

  const fetchProveedores = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }
      const response = await axios.get(`${apiUrl}/proveedor/search?tipo=Elementos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        const proveedoresElementos = response.data
          .filter((proveedor: any) => proveedor.estado_proveedor === 'Activo')
          .sort((a: any, b: any) => a.nombre_proveedor.localeCompare(b.nombre_proveedor));
        setProveedores(proveedoresElementos);
      } else {
        setProveedores([]);
      }
    } catch (error: any) {
      console.error('Error al obtener proveedores:', error);
      message.error('Error al cargar los proveedores');
    }
  };

  const calcularCantidadDisponible = (elemento: Elemento, fecha: string) => {
    if (!fecha) return elemento.cantidad_disponible;

    // Filtrar alquileres por fecha y estado
    const alquileresEnFecha = alquileres.filter((alquiler: any) => {
      const fechaEvento = alquiler.evento?.fecha_evento;
      return fechaEvento === fecha && 
             alquiler.estado_alquiler !== 'Cancelado' &&
             alquiler.estado_alquiler !== 'Completado';
    });

    // Calcular cantidad reservada
    let cantidadReservada = 0;
    alquileresEnFecha.forEach((alquiler: any) => {
      if (alquiler.detalles) {
        const detalle = alquiler.detalles.find((d: any) => 
          d.elemento.id_elemento === elemento.id_elemento
        );
        if (detalle) {
          cantidadReservada += detalle.cantidad_alquiler;
        }
      }
    });

    return elemento.cantidad_disponible - cantidadReservada;
  };

  const handleCantidadChange = (elemento: Elemento, cantidad: number) => {
    if (editingAlquiler) {
      // Si estamos editando, actualizar los detalles del alquiler
      const newDetalles = [...(editingAlquiler.detalles || [])];
      const index = newDetalles.findIndex(d => d.elemento.id_elemento === elemento.id_elemento);
      
      if (cantidad === 0) {
        // Si la cantidad es 0, eliminar el detalle
        if (index !== -1) {
          newDetalles.splice(index, 1);
        }
      } else {
        const subtotal = cantidad * elemento.precio_elemento;
        // Si ya existe el detalle, actualizarlo
        if (index !== -1) {
          newDetalles[index] = {
            ...newDetalles[index],
            cantidad_alquiler: cantidad,
            precio_unitario: elemento.precio_elemento,
            total_alquiler: Number(subtotal.toFixed(2))
          };
        } else {
          // Si no existe, crear uno nuevo
          newDetalles.push({
            id_elemento: elemento.id_elemento,
            elemento: elemento,
            cantidad_alquiler: cantidad,
            precio_unitario: elemento.precio_elemento,
            total_alquiler: Number(subtotal.toFixed(2)),
            estado_detalquiler: 'Aceptado'
          });
        }
      }

      // Calcular totales
      const precioNeto = newDetalles.reduce<number>((sum, detalle) => 
        sum + (detalle.cantidad_alquiler * detalle.precio_unitario), 0
      );
      const itbis = precioNeto * 0.18;
      const total = precioNeto + itbis;
      const cantTotal = newDetalles.reduce<number>((sum, detalle) => sum + detalle.cantidad_alquiler, 0);

      console.log('Nuevos totales:', {
        precioNeto,
        itbis,
        total,
        cantTotal,
        detalles: newDetalles
      });

      // Actualizar el alquiler con los nuevos detalles y totales
      setEditingAlquiler({
        ...editingAlquiler,
        detalles: newDetalles,
        precioneto_alquiler: Number(precioNeto.toFixed(2)),
        itbis_alquiler: Number(itbis.toFixed(2)),
        total_alquiler: Number(total.toFixed(2)),
        cant_elementos_alquiler: cantTotal
      });
    } else {
      // Si estamos creando un nuevo alquiler
      if (cantidad === 0) {
        setElementosSeleccionados(prev => prev.filter(e => e.id_elemento !== elemento.id_elemento));
      } else {
        setElementosSeleccionados(prev => {
          const index = prev.findIndex(e => e.id_elemento === elemento.id_elemento);
          if (index !== -1) {
            return prev.map((e, i) => i === index ? { ...e, cantidad_seleccionada: cantidad } : e);
          } else {
            return [...prev, { ...elemento, cantidad_seleccionada: cantidad }];
          }
        });
      }
    }
  };

  const handleEdit = async (record: any) => {
    setShowFormulario(false);
    setShowCatalogo(false);
    setEditingAlquiler(null);
    
    // Obtener los elementos actuales del alquiler
    const fetchElementosAlquiler = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('No hay sesión activa');
          return;
        }

        console.log('Obteniendo elementos del alquiler:', record.id_alquiler);
        const response = await axios.get(`${apiUrl}/alquiler/${record.id_alquiler}/elementos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Elementos del alquiler recibidos:', response.data);

        if (!response.data || response.data.length === 0) {
          message.warning('Este alquiler no tiene elementos asociados');
          return;
        }

        // Mapear los elementos con su cantidad y estado
        const detalles = response.data.map((detalle: any) => ({
          id_elemento: detalle.id_elemento,
          elemento: {
            id_elemento: detalle.id_elemento,
            nombre_elemento: detalle.nombre_elemento,
            precio_elemento: detalle.precio_elemento,
            cantidad_disponible: detalle.cantidad_disponible,
            imagen_url: detalle.imagen_url,
            subcategoria: detalle.subcategoria
          },
          cantidad_alquiler: detalle.cantidad_alquiler,
          precio_unitario: detalle.precio_unitario,
          total_alquiler: detalle.total_alquiler,
          estado_detalquiler: detalle.estado_detalquiler
        }));

        console.log('Detalles formateados:', detalles);

        // Actualizar el alquiler con los detalles
        const alquilerConDetalles = {
          ...record,
          detalles: detalles
        };

        console.log('Alquiler con detalles:', alquilerConDetalles);

        setEditingAlquiler(alquilerConDetalles);
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

  const handleContinuar = () => {
    if (!editingAlquiler) {
      setShowCatalogo(false);
      setShowFormulario(true);
    } else {
      setShowCatalogo(false);
      setShowEditModal(true);
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
      const precioNeto = elementosSeleccionados.reduce<number>((sum, elem) => 
        sum + (elem.precio_elemento * elem.cantidad_seleccionada), 0
      );
      const itbis = precioNeto * 0.18; // 18% ITBIS
      const total = precioNeto + itbis;

      const alquilerData = {
        id_evento: values.id_evento,
        estado_alquiler: 'Solicitado',
        precioneto_alquiler: Number(precioNeto.toFixed(2)),
        itbis_alquiler: Number(itbis.toFixed(2)),
        total_alquiler: Number(total.toFixed(2)),
        cant_elementos_alquiler: elementosSeleccionados.reduce<number>((sum, elem) => sum + elem.cantidad_seleccionada, 0),
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
              <li>Los elementos volverán a estar disponibles</li>
              <li>Podrás reactivar el alquiler más tarde si lo necesitas</li>
            </ul>
          </div>
        ),
        okText: 'Sí, cancelar',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            const updateData = {
              estado_alquiler: 'Cancelado',
              precioneto_alquiler: record.precioneto_alquiler,
              itbis_alquiler: record.itbis_alquiler,
              total_alquiler: record.total_alquiler,
              cant_elementos_alquiler: record.cant_elementos_alquiler
            };

            const response = await axios.patch(
              `${apiUrl}/alquiler/${record.id_alquiler}`,
              updateData,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (response.data) {
              message.success('Alquiler cancelado correctamente');
              // Actualizar el alquiler en la lista local
              setAlquileres(prevAlquileres => 
                prevAlquileres.map(alq => 
                  alq.id_alquiler === record.id_alquiler ? response.data : alq
                )
              );
              // Recargar elementos para actualizar cantidades disponibles
              await fetchElementos();
            }
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

  const handleEditSubmit = async (values: any) => {
    console.log("Iniciando handleEditSubmit con valores:", values);
    setLoadingSubmit(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      if (!editingAlquiler?.detalles || editingAlquiler.detalles.length === 0) {
        message.error('El alquiler debe tener al menos un elemento');
        return;
      }

      // Preparar los datos de actualización
      const detalles = editingAlquiler.detalles.map((detalle: DetalleAlquiler) => ({
        id_elemento: detalle.elemento.id_elemento,
        cantidad: detalle.cantidad_alquiler,
        precio_unitario: detalle.precio_unitario,
        subtotal: Number((detalle.cantidad_alquiler * detalle.precio_unitario).toFixed(2))
      }));

      // Calcular totales
      const precioNeto = Number(detalles.reduce<number>((sum, detalle) => 
        sum + detalle.subtotal, 0).toFixed(2)
      );
      const itbis = Number((precioNeto * 0.18).toFixed(2));
      const total = Number((precioNeto + itbis).toFixed(2));
      const cantTotal = detalles.reduce<number>((sum, detalle) => sum + detalle.cantidad, 0);

      const updateData = {
        estado_alquiler: values.estado_alquiler,
        precioneto_alquiler: precioNeto,
        itbis_alquiler: itbis,
        total_alquiler: total,
        cant_elementos_alquiler: cantTotal,
        elementos: detalles
      };

      console.log('ID del alquiler a actualizar:', editingAlquiler.id_alquiler);
      console.log('Datos de actualización:', updateData);

      const response = await axios.patch(
        `${apiUrl}/alquiler/${editingAlquiler.id_alquiler}`, 
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        console.log('Respuesta de actualización:', response.data);
        message.success('Alquiler actualizado correctamente');
        
        // Actualizar el alquiler en la lista local
        setAlquileres(prevAlquileres => 
          prevAlquileres.map(alq => 
            alq.id_alquiler === editingAlquiler.id_alquiler ? response.data : alq
          )
        );
        
        // Limpiar estados
        setShowEditModal(false);
        setEditingAlquiler(null);
        setElementosSeleccionados([]);
        setShowFormulario(false);
        setShowCatalogo(false);
        form.resetFields();
        
        // Recargar elementos para actualizar cantidades disponibles
        await fetchElementos();
      } else {
        throw new Error('No se recibió respuesta del servidor');
      }
    } catch (error: any) {
      console.error('Error al actualizar el alquiler:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        message.error(error.response.data.mensaje || 'Error al actualizar el alquiler');
      } else if (error.request) {
        console.error('Error request:', error.request);
        message.error('Error de conexión al actualizar el alquiler');
      } else {
        console.error('Error:', error.message);
        message.error('Error al actualizar el alquiler');
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleView = async (record: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      console.log('Obteniendo detalles del alquiler:', record.id_alquiler);

      const response = await axios.get(`${apiUrl}/alquiler/${record.id_alquiler}/elementos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Respuesta de elementos:', response.data);

      if (!response.data || !Array.isArray(response.data)) {
        message.error('Error: Los datos recibidos no tienen el formato esperado');
        return;
      }

      const detalles = response.data.map((detalle: any) => ({
        id_elemento: detalle.id_elemento,
        elemento: {
          id_elemento: detalle.id_elemento,
          nombre_elemento: detalle.nombre_elemento || 'Sin nombre',
          precio_elemento: Number(detalle.precio_elemento || 0),
          cantidad_disponible: Number(detalle.cantidad_disponible || 0),
          imagen_url: detalle.imagen_url || null,
          subcategoria: detalle.subcategoria || {
            nombre_subcategoria: 'N/A',
            categoria: {
              nombre_categoria: 'N/A'
            }
          }
        },
        cantidad_alquiler: Number(detalle.cantidad_alquiler || 0),
        precio_unitario: Number(detalle.precio_unitario || 0),
        total_alquiler: Number(detalle.total_alquiler || 0),
        estado_detalquiler: detalle.estado_detalquiler || 'N/A'
      }));

      console.log('Detalles procesados:', detalles);

      const alquilerConDetalles = {
        ...record,
        detalles: detalles,
        // Asegurarse de que los valores numéricos sean números
        precioneto_alquiler: Number(record.precioneto_alquiler || 0),
        itbis_alquiler: Number(record.itbis_alquiler || 0),
        total_alquiler: Number(record.total_alquiler || 0),
        cant_elementos_alquiler: Number(record.cant_elementos_alquiler || 0)
      };

      console.log('Alquiler con detalles:', alquilerConDetalles);

      setViewingAlquiler(alquilerConDetalles);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error al obtener detalles del alquiler:', error);
      if (axios.isAxiosError(error) && error.response) {
        message.error(`Error: ${error.response.data.mensaje || 'Error al cargar los detalles del alquiler'}`);
      } else {
        message.error('Error al cargar los detalles del alquiler');
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
          {id_evento}
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
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Editar alquiler">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.estado_alquiler !== 'Cancelado' && (
            <Tooltip title="Cancelar alquiler">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
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

  const filteredAlquileres = alquileres.filter((alquiler: Alquiler) => {
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

  // Función para ver detalles de una compra
  const handleViewCompra = async (record: Compra) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const response = await axios.get(`${apiUrl}/compra/${record.id_compra}/detalles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const detalles = response.data.map((detalle: any) => ({
        ...detalle,
        cantidad_compra: Number(detalle.cantidad_compra || 0),
        precio_unitario: Number(detalle.precio_unitario || 0),
        total_compra: Number((detalle.cantidad_compra || 0) * (detalle.precio_unitario || 0))
      }));

      const totalGeneral = detalles.reduce((sum: number, detalle: any) => 
        sum + (detalle.cantidad_compra * detalle.precio_unitario), 0
      );

      setViewingCompra({
        ...record,
        detalles: detalles,
        costo_compra: Number(totalGeneral.toFixed(2))
      });
      setShowViewCompraModal(true);
    } catch (error) {
      console.error('Error al obtener detalles de la compra:', error);
      message.error('Error al cargar los detalles de la compra');
    }
  };

  // Función para filtrar compras
  const handleFilterCompras = (compras: Compra[]) => {
    return compras.filter(compra => {
      const searchLower = searchCompra ? searchCompra.toLowerCase() : '';
      return !searchCompra ||
        compra.id_compra.toString().includes(searchLower) ||
        (compra.proveedor?.nombre_proveedor || '').toLowerCase().includes(searchLower);
    });
  };

  // Columnas para la tabla de compras
  const compraColumns = [
    {
      title: 'ID',
      dataIndex: 'id_compra',
      key: 'id_compra',
      sorter: (a: Compra, b: Compra) => a.id_compra - b.id_compra,
    },
    {
      title: 'Proveedor',
      dataIndex: ['proveedor', 'nombre_proveedor'],
      key: 'proveedor',
      sorter: (a: Compra, b: Compra) => (a.proveedor?.nombre_proveedor || '').localeCompare(b.proveedor?.nombre_proveedor || ''),
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_compra',
      key: 'fecha_compra',
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY'),
      sorter: (a: Compra, b: Compra) => dayjs(a.fecha_compra).unix() - dayjs(b.fecha_compra).unix(),
    },
    {
      title: 'Hora',
      dataIndex: 'hora_compra',
      key: 'hora_compra',
      render: (hora: string) => dayjs(hora, 'HH:mm:ss').format('HH:mm'),
    },
    {
      title: 'Costo',
      dataIndex: 'costo_compra',
      key: 'costo_compra',
      render: (costo: number) => `$${Number(costo || 0).toFixed(2)}`,
      sorter: (a: Compra, b: Compra) => (a.costo_compra || 0) - (b.costo_compra || 0),
    },
    {
      title: 'Estado',
      dataIndex: 'estado_compra',
      key: 'estado_compra',
      render: (estado: string) => {
        let color = 'default';
        if (estado === 'Completada') color = 'success';
        else if (estado === 'Cancelada') color = 'error';
        return <Tag color={color}>{estado}</Tag>;
      },
      filters: [
        { text: 'Completada', value: 'Completada' },
        { text: 'Cancelada', value: 'Cancelada' }
      ],
      onFilter: (value: any, record: Compra) => record.estado_compra === value,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Compra) => (
        <Space>
          <Tooltip title="Ver compra">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewCompra(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <StyledCard title="Gestión de Alquileres">
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Space wrap>
            <StyledButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCatalogo(true)}
            >
              Nuevo Alquiler
            </StyledButton>
            <StyledButton
              type="primary"
              icon={<ReloadOutlined />}
              onClick={async () => {
                try {
                  setLoading(true);
                  await Promise.all([
                    fetchAlquileres(),
                    fetchElementos(),
                    fetchEventos(),
                    fetchCategorias()
                  ]);
                  message.success('Datos actualizados correctamente');
                } catch (error) {
                  console.error('Error al actualizar los datos:', error);
                  message.error('Error al actualizar los datos');
                } finally {
                  setLoading(false);
                }
              }}
            >
              Recargar
            </StyledButton>
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
                  ID: {evento.id_evento}
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
          locale={{ emptyText: <span style={{ color: '#999', fontWeight: 500, fontSize: 16 }}>No hay Registros</span> }}
        />
      </StyledCard>

      {/* Modal del catálogo */}
      <Modal
        title={editingAlquiler ? "Agregar Elementos al Alquiler" : "Catálogo de Elementos"}
        open={showCatalogo}
        onCancel={() => {
          setShowCatalogo(false);
          if (!editingAlquiler) {
            setElementosSeleccionados([]);
          }
        }}
        footer={null}
        width={800}
        zIndex={1100}
        style={{ top: 20 }}
      >
        <CatalogHeader>
          <Space>
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
          <StyledButton onClick={handleReset} icon={<ReloadOutlined />}>
            Resetear Filtros
          </StyledButton>
        </CatalogHeader>

        <ModalContent hasSelection={elementosSeleccionados.length > 0 || (editingAlquiler?.detalles?.length ?? 0) > 0}>
          <List
            dataSource={filteredElementos}
            renderItem={(elemento: Elemento) => {
              const detalleExistente = editingAlquiler?.detalles?.find(
                (d: any) => d.id_elemento === elemento.id_elemento && d.estado_detalquiler === 'Aceptado'
              );
              
              const elementoSeleccionado = !editingAlquiler 
                ? elementosSeleccionados.find(e => e.id_elemento === elemento.id_elemento)
                : null;

              const isSelected = !!detalleExistente || !!elementoSeleccionado;
              const cantidad = detalleExistente?.cantidad_alquiler || elementoSeleccionado?.cantidad_seleccionada || 0;

              return (
                <ListItem className={isSelected ? 'selected' : ''}>
                  <ElementoInfo>
                    {elemento.imagen_url ? (
                      <img src={elemento.imagen_url} alt={elemento.nombre_elemento} className="elemento-imagen" />
                    ) : (
                      <Avatar shape="square" size={100} icon={<InboxOutlined />} style={{ backgroundColor: 'var(--beige)' }} />
                    )}
                    <div className="elemento-details">
                      <Title level={4} className="elemento-title">{elemento.nombre_elemento}</Title>
                      <Space direction="vertical" size={4}>
                        <Typography.Text className="elemento-category">
                          Categoría: {elemento.subcategoria.categoria.nombre_categoria} - {elemento.subcategoria.nombre_subcategoria}
                        </Typography.Text>
                        <Typography.Text className="elemento-price">
                          Precio: ${elemento.precio_elemento.toFixed(2)}
                        </Typography.Text>
                        <Typography.Text className="elemento-stock">
                          Disponibles: {typeof elemento.cantidad_disponible === 'number' ? elemento.cantidad_disponible : 'N/A'}
                        </Typography.Text>
                      </Space>
                    </div>
                    <Space align="center" style={{ marginLeft: 'auto' }}>
                      <Typography.Text>Cantidad:</Typography.Text>
                      <InputNumber
                        min={0}
                        max={typeof elemento.cantidad_disponible === 'number' ? elemento.cantidad_disponible : 0}
                        value={cantidad}
                        onChange={(value: number | null) => {
                          if (editingAlquiler) {
                            handleCantidadChange(elemento, value || 0);
                          } else {
                            handleCantidadChange(elemento, value || 0);
                          }
                        }}
                        style={{ width: 80 }}
                        disabled={typeof elemento.cantidad_disponible !== 'number' || elemento.cantidad_disponible === 0}
                      />
                    </Space>
                  </ElementoInfo>
                </ListItem>
              );
            }}
          />
        </ModalContent>
        
        {(elementosSeleccionados.length > 0 || (editingAlquiler?.detalles?.length ?? 0) > 0) && (
          <StyledButton
            type="primary"
            onClick={handleContinuar}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              borderRadius: '25px',
              padding: '0 25px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              zIndex: 1000
            }}
          >
            Continuar <RightOutlined />
          </StyledButton>
        )}
      </Modal>

      {/* Modal de Formulario de Alquiler (solo para crear) */}
      <Modal
        title="Crear Nuevo Alquiler"
        open={showFormulario && !editingAlquiler}
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
            <Button 
              type="primary" 
              htmlType="submit"
              style={{ backgroundColor: 'var(--dark-gold)', borderColor: 'var(--dark-gold)' }}
            >
              Crear Alquiler
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Edición */}
      <StyledModal
        title="Editar Alquiler"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setEditingAlquiler(null);
          setElementosSeleccionados([]);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        {editingAlquiler && (
          <Form
            form={form}
            onFinish={handleEditSubmit}
            initialValues={{
              estado_alquiler: editingAlquiler.estado_alquiler
            }}
          >
            <Form.Item
              name="estado_alquiler"
              label="Estado del Alquiler"
              rules={[{ required: true, message: 'Por favor seleccione un estado' }]}
            >
              <Select>
                <Option value="Solicitado">Solicitado</Option>
                <Option value="Aceptado">Aceptado</Option>
                <Option value="Completado">Completado</Option>
                <Option value="Cancelado">Cancelado</Option>
              </Select>
            </Form.Item>

            {(editingAlquiler?.estado_alquiler === 'Solicitado' || 
              editingAlquiler?.estado_alquiler === 'Aceptado' || 
              editingAlquiler?.estado_alquiler === 'Cancelado') && (
              <Space style={{ marginTop: 16, marginBottom: 16 }}>
                <Button
                  type="primary"
                  onClick={() => setShowCatalogo(true)}
                  icon={<PlusOutlined />}
                >
                  Agregar Elementos
                </Button>
              </Space>
            )}

            {/* Lista de elementos actuales */}
            {editingAlquiler.detalles && editingAlquiler.detalles.length > 0 && (
              <>
                <Divider>Elementos del Alquiler</Divider>
                <List
                  dataSource={editingAlquiler.detalles}
                  renderItem={(detalle: any) => (
                    <ListItem>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div>
                          <Typography.Text strong>{detalle.elemento.nombre_elemento}</Typography.Text>
                          <div>Subtotal: ${detalle.total_alquiler}</div>
                        </div>
                        <Space>
                          <Typography.Text>Cantidad:</Typography.Text>
                          <InputNumber
                            min={0}
                            max={detalle.elemento.cantidad_disponible + detalle.cantidad_alquiler}
                            value={detalle.cantidad_alquiler}
                            onChange={(value) => handleCantidadChange(detalle.elemento, value || 0)}
                            style={{ width: 80 }}
                          />
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleCantidadChange(detalle.elemento, 0)}
                          />
                        </Space>
                      </div>
                    </ListItem>
                  )}
                />
              </>
            )}

            <div style={{ marginTop: 16, marginBottom: 16 }}>
              <Typography.Text strong>
                Precio Neto: ${editingAlquiler.precioneto_alquiler}
              </Typography.Text>
              <br />
              <Typography.Text strong>
                ITBIS: ${editingAlquiler.itbis_alquiler}
              </Typography.Text>
              <br />
              <Typography.Text strong>
                Total: ${editingAlquiler.total_alquiler}
              </Typography.Text>
            </div>

            <Form.Item>
              <Space>
                <StyledButton 
                  type="primary" 
                  htmlType="submit"
                  loading={loadingSubmit}
                >
                  Guardar Cambios
                </StyledButton>
                <StyledButton 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAlquiler(null);
                    setElementosSeleccionados([]);
                    form.resetFields();
                  }}
                >
                  Cancelar
                </StyledButton>
              </Space>
            </Form.Item>
          </Form>
        )}
      </StyledModal>

      {/* Modal de Vista Detallada */}
      <Modal
        title="Detalles del Alquiler"
        open={showViewModal}
        onCancel={() => {
          setShowViewModal(false);
          setViewingAlquiler(null);
        }}
        footer={[
          <StyledButton 
            key="close" 
            onClick={() => {
              setShowViewModal(false);
              setViewingAlquiler(null);
            }}
          >
            Cerrar
          </StyledButton>
        ]}
        width={800}
      >
        {viewingAlquiler && (
          <div>
            <Descriptions title="Información General" bordered column={2}>
              <Descriptions.Item label="ID Alquiler">
                {viewingAlquiler.id_alquiler}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={
                  viewingAlquiler.estado_alquiler === 'Solicitado' ? 'processing' :
                  viewingAlquiler.estado_alquiler === 'Aceptado' ? 'warning' :
                  viewingAlquiler.estado_alquiler === 'Completado' ? 'success' :
                  'error'
                }>
                  {viewingAlquiler.estado_alquiler}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Evento">
                {viewingAlquiler.evento?.nombre_evento || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha del Evento">
                {viewingAlquiler.evento?.fecha_evento ? 
                  new Date(viewingAlquiler.evento.fecha_evento).toLocaleDateString() : 
                  'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Cantidad de Elementos">
                {viewingAlquiler.cant_elementos_alquiler}
              </Descriptions.Item>
              <Descriptions.Item label="Precio Neto">
                ${viewingAlquiler.precioneto_alquiler.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="ITBIS">
                ${viewingAlquiler.itbis_alquiler.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Total">
                ${viewingAlquiler.total_alquiler.toFixed(2)}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Elementos del Alquiler</Divider>
            
            <List
              itemLayout="horizontal"
              dataSource={viewingAlquiler.detalles}
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
                        <Typography.Text>Cantidad: {detalle.cantidad_alquiler}</Typography.Text>
                        <Typography.Text>Precio Unitario: ${detalle.precio_unitario.toFixed(2)}</Typography.Text>
                        <Typography.Text>Subtotal: ${detalle.total_alquiler.toFixed(2)}</Typography.Text>
                        {detalle.elemento.subcategoria && (
                          <Typography.Text>Categoría: {detalle.elemento.subcategoria.categoria?.nombre_categoria} - {detalle.elemento.subcategoria.nombre_subcategoria}</Typography.Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>

      {/* Tabla de Compras */}
      <StyledCard
        title="Gestión de Compras"
        extra={
          <Space>
            <Search
              placeholder="Buscar por ID o proveedor..."
              allowClear
              value={searchCompra}
              onChange={(e) => setSearchCompra(e.target.value)}
              style={{ width: 200 }}
            />
            <Button
              onClick={fetchCompras}
              icon={<ReloadOutlined />}
            >
              Recargar
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text>
            Mostrando todas las compras ({compras.length} en total)
          </Typography.Text>
        </div>
        <Table
          columns={compraColumns}
          dataSource={handleFilterCompras(compras)}
          loading={loadingCompra}
          rowKey="id_compra"
          pagination={{ 
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} compras`
          }}
          locale={{ 
            emptyText: 'No hay compras registradas',
            filterConfirm: 'Aceptar',
            filterReset: 'Resetear',
            filterEmptyText: 'Sin filtros'
          }}
        />
      </StyledCard>

      {/* Modal para ver detalles de compra */}
      <Modal
        title="Detalles de la Compra"
        open={showViewCompraModal}
        onCancel={() => {
          setShowViewCompraModal(false);
          setViewingCompra(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setShowViewCompraModal(false);
            setViewingCompra(null);
          }}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {viewingCompra && (
          <div>
            <Card>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="ID Compra" span={1}>{viewingCompra.id_compra}</Descriptions.Item>
                <Descriptions.Item label="Proveedor" span={1}>{viewingCompra.proveedor?.nombre_proveedor}</Descriptions.Item>
                <Descriptions.Item label="Fecha" span={1}>{dayjs(viewingCompra.fecha_compra).format('DD/MM/YYYY')}</Descriptions.Item>
                <Descriptions.Item label="Hora" span={1}>{dayjs(viewingCompra.hora_compra, 'HH:mm:ss').format('HH:mm')}</Descriptions.Item>
                <Descriptions.Item label="Estado" span={1}>
                  <Tag color={
                    viewingCompra.estado_compra === 'Completada' ? 'success' :
                    viewingCompra.estado_compra === 'Cancelada' ? 'error' : 'default'
                  }>
                    {viewingCompra.estado_compra}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Costo Total" span={1}>
                  <Typography.Text strong>${Number(viewingCompra.costo_compra).toFixed(2)}</Typography.Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
            
            {viewingCompra.detalles && viewingCompra.detalles.length > 0 && (
              <Card title="Elementos de la Compra" style={{ marginTop: 16 }}>
                <Table
                  dataSource={viewingCompra.detalles}
                  columns={[
                    {
                      title: 'Elemento',
                      dataIndex: ['elemento', 'nombre_elemento'],
                      key: 'nombre_elemento',
                    },
                    {
                      title: 'Cantidad',
                      dataIndex: 'cantidad_compra',
                      key: 'cantidad_compra',
                    },
                    {
                      title: 'Precio Unitario',
                      dataIndex: 'precio_unitario',
                      key: 'precio_unitario',
                      render: (precio: number) => `$${Number(precio).toFixed(2)}`,
                    },
                    {
                      title: 'Total',
                      dataIndex: 'total_compra',
                      key: 'total_compra',
                      render: (total: number) => `$${Number(total).toFixed(2)}`,
                    },
                  ]}
                  pagination={false}
                  rowKey={(record) => record.elemento.id_elemento}
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default RentEmployee;