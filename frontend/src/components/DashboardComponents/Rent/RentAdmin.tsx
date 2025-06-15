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
  Table,
  Upload,
  Radio
} from 'antd';
import { PlusOutlined, RightOutlined, CloseOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, EyeOutlined, InboxOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import styled from 'styled-components';
import '../../../styles/dashboard/ServicesSubpages.scss';
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

const ModalContainer = styled.div`
  position: relative;
  z-index: 1100;
`;

interface Elemento {
  id_elemento: number;
  nombre_elemento: string;
  precio_elemento: number;
  cantidad_disponible: number;
  cantidad_total: number;
  imagen_url?: string;
  estado_elemento: string;
  material: {
    id_material: number;
    nombre_material: string;
  };
  color: {
    id_color: number;
    nombre_color: string;
  };
  subcategoria: {
    id_subcategoria: number;
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

const RentAdmin: React.FC = () => {
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
  const [showViewAlquilerModal, setShowViewAlquilerModal] = useState(false);
  const [viewingAlquiler, setViewingAlquiler] = useState<Alquiler | null>(null);

  // New states for elements management
  const [showElementModal, setShowElementModal] = useState(false);
  const [editingElement, setEditingElement] = useState<Elemento | null>(null);
  const [elementForm] = Form.useForm();
  const [searchElement, setSearchElement] = useState('');
  const [filterElementCategoria, setFilterElementCategoria] = useState<string | null>(null);
  const [filterElementEstado, setFilterElementEstado] = useState<string | null>(null);
  const [loadingElement, setLoadingElement] = useState(false);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [colores, setColores] = useState<any[]>([]);
  const [showViewElementModal, setShowViewElementModal] = useState(false);
  const [viewingElement, setViewingElement] = useState<Elemento | null>(null);

  useEffect(() => {
    fetchAlquileres();
    fetchElementos();
    fetchEventos();
    fetchCategorias();
    fetchMateriales();
    fetchColores();
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          includeDeleted: true
        }
      });
      
      if (Array.isArray(response.data)) {
        const elementosFormateados = response.data.map(elemento => ({
          ...elemento,
          cantidad_disponible: elemento.cantidad_disponible ?? 0,
          precio_elemento: elemento.precio_elemento ?? 0
        }));
        setElementos(elementosFormateados);
      } else {
        console.error('La respuesta no es un array:', response.data);
        message.error('Error en el formato de los elementos');
        setElementos([]);
      }
    } catch (error: any) {
      console.error('Error al cargar los elementos:', error);
      if (axios.isAxiosError(error)) {
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

  const fetchMateriales = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/elemento/materiales/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setMateriales(response.data);
    } catch (error) {
      console.error('Error al obtener materiales:', error);
      message.error('Error al cargar los materiales');
    }
  };

  const fetchColores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/elemento/colores/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setColores(response.data);
    } catch (error) {
      console.error('Error al obtener colores:', error);
      message.error('Error al cargar los colores');
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
          },
          material: detalle.material || {
            nombre_material: 'N/A'
          },
          color: detalle.color || {
            nombre_color: 'N/A'
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
        precioneto_alquiler: Number(record.precioneto_alquiler || 0),
        itbis_alquiler: Number(record.itbis_alquiler || 0),
        total_alquiler: Number(record.total_alquiler || 0),
        cant_elementos_alquiler: Number(record.cant_elementos_alquiler || 0)
      };

      console.log('Alquiler con detalles:', alquilerConDetalles);

      setViewingAlquiler(alquilerConDetalles);
      setShowViewAlquilerModal(true);
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
          <Tooltip title="Ver alquiler">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setViewingAlquiler(null);
                handleView(record);
                setShowViewAlquilerModal(true);
              }}
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
    setSearchText('');
    setFilterCategoria('');
    setElementosSeleccionados([]);
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

  // Element management functions
  const handleElementStatusChange = async (elementId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const elemento = elementos.find(e => e.id_elemento === elementId);
      if (!elemento) {
        message.error('Elemento no encontrado');
        return;
      }

      if (elemento.estado_elemento === 'Eliminado') {
        let selectedState = 'Activo';
        Modal.confirm({
          title: 'Cambiar Estado del Elemento',
          content: (
            <div>
              <p>¿A qué estado deseas cambiar este elemento?</p>
              <Radio.Group 
                defaultValue="Activo"
                onChange={(e) => {
                  selectedState = e.target.value;
                }}
              >
                <Space direction="vertical">
                  <Radio value="Activo">Activo</Radio>
                  <Radio value="Inactivo">Inactivo</Radio>
                </Space>
              </Radio.Group>
            </div>
          ),
          okText: 'Cambiar Estado',
          cancelText: 'Cancelar',
          onOk: async () => {
            try {
              await axios.put(`${apiUrl}/elemento/${elementId}`, 
                { estado_elemento: selectedState },
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              message.success(`Estado del elemento cambiado a ${selectedState}`);
              fetchElementos();
            } catch (error) {
              console.error('Error al cambiar el estado del elemento:', error);
              message.error('Error al cambiar el estado del elemento');
            }
          }
        });
      } else {
        Modal.confirm({
          title: '¿Estás seguro de eliminar este elemento?',
          content: 'Esta acción cambiará el estado del elemento a "Eliminado". El elemento seguirá visible en la tabla pero marcado como eliminado.',
          okText: 'Sí, eliminar',
          cancelText: 'No, cancelar',
          okType: 'danger',
          onOk: async () => {
            try {
              await axios.put(`${apiUrl}/elemento/${elementId}`, 
                { estado_elemento: 'Eliminado' },
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              message.success('Elemento eliminado correctamente');
              fetchElementos();
            } catch (error) {
              console.error('Error al eliminar el elemento:', error);
              message.error('Error al eliminar el elemento');
            }
          }
        });
      }
    } catch (error) {
      console.error('Error al cambiar el estado del elemento:', error);
      message.error('Error al cambiar el estado del elemento');
    }
  };

  const handleElementSubmit = async (values: any) => {
    try {
      setLoadingElement(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      // Usar el estado del formulario si está presente, de lo contrario mantener el estado actual
      const estado = values.estado_elemento || editingElement?.estado_elemento || 'Activo';

      const elementData = {
        nombre_elemento: values.nombre_elemento,
        id_subcategoria: values.id_subcategoria,
        id_material: values.id_material,
        id_color: values.id_color,
        precio_elemento: values.precio_elemento,
        cantidad_disponible: values.cantidad_disponible,
        cantidad_total: values.cantidad_disponible,
        imagen_url: values.imagen_url || null,
        estado_elemento: estado
      };

      console.log('Intentando actualizar elemento:', editingElement?.id_elemento);
      console.log('URL:', `${apiUrl}/elemento/${editingElement?.id_elemento}`);
      console.log('Datos:', elementData);
      
      if (editingElement) {
        const response = await axios.put(`${apiUrl}/elemento/${editingElement.id_elemento}`, elementData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Respuesta:', response.data);
        
        if (response.data) {
          message.success('Elemento actualizado correctamente');
          await fetchElementos();
          setShowElementModal(false);
          setEditingElement(null);
          elementForm.resetFields();
        }
      } else {
        try {
          const response = await axios.post(`${apiUrl}/elemento`, elementData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.data) {
            message.success('Elemento creado correctamente');
            await fetchElementos();
            setShowElementModal(false);
            elementForm.resetFields();
          }
        } catch (error: any) {
          console.error('Error al crear:', error);
          if (error.response) {
            console.error('Error response:', error.response.data);
            message.error(error.response.data.mensaje || 'Error al crear el elemento');
          } else {
            message.error('Error al crear el elemento');
          }
        }
      }
    } catch (error: any) {
      console.error('Error al actualizar:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
        message.error(error.response.data.mensaje || 'Error al actualizar el elemento');
      } else {
        message.error('Error al actualizar el elemento');
      }
    } finally {
      setLoadingElement(false);
    }
  };

  // Columns for elements table
  const elementColumns = [
    {
      title: 'ID',
      dataIndex: 'id_elemento',
      key: 'id_elemento',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre_elemento',
      key: 'nombre_elemento',
    },
    {
      title: 'Categoría',
      dataIndex: ['subcategoria', 'categoria', 'nombre_categoria'],
      key: 'categoria',
    },
    {
      title: 'Subcategoría',
      dataIndex: ['subcategoria', 'nombre_subcategoria'],
      key: 'subcategoria',
    },
    {
      title: 'Material',
      dataIndex: ['material', 'nombre_material'],
      key: 'material',
    },
    {
      title: 'Color',
      dataIndex: ['color', 'nombre_color'],
      key: 'color',
    },
    {
      title: 'Precio',
      dataIndex: 'precio_elemento',
      key: 'precio_elemento',
      render: (precio: number) => `$${Number(precio).toFixed(2)}`,
    },
    {
      title: 'Cantidad Disponible',
      dataIndex: 'cantidad_disponible',
      key: 'cantidad_disponible',
    },
    {
      title: 'Estado',
      dataIndex: 'estado_elemento',
      key: 'estado_elemento',
      render: (estado: string) => {
        let color = 'default';
        switch (estado) {
          case 'Activo':
            color = 'success';
            break;
          case 'Inactivo':
            color = 'warning';
            break;
          case 'Eliminado':
            color = 'error';
            break;
        }
        return <Tag color={color}>{estado}</Tag>;
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Elemento) => (
        <Space>
          <Tooltip title="Ver">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setViewingElement(record);
                setShowViewElementModal(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingElement(record);
                elementForm.resetFields();
                const formValues = {
                  nombre_elemento: record.nombre_elemento,
                  id_subcategoria: record.subcategoria.id_subcategoria,
                  id_material: record.material.id_material,
                  id_color: record.color.id_color,
                  precio_elemento: record.precio_elemento,
                  cantidad_disponible: record.cantidad_disponible,
                  imagen_url: record.imagen_url,
                  estado_elemento: record.estado_elemento
                };
                console.log('Valores del formulario:', formValues);
                elementForm.setFieldsValue(formValues);
                setShowElementModal(true);
              }}
            />
          </Tooltip>
          {record.estado_elemento !== 'Eliminado' && (
            <Tooltip title="Eliminar">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleElementStatusChange(record.id_elemento)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Function to filter elements
  const filterElements = (elements: Elemento[]) => {
    return elements.filter(elemento => {
      // Búsqueda por nombre, subcategoría, material o color
      const searchLower = searchElement ? searchElement.toLowerCase() : '';
      const matchesSearch = !searchElement || 
        elemento.nombre_elemento.toLowerCase().includes(searchLower) ||
        elemento.subcategoria.nombre_subcategoria.toLowerCase().includes(searchLower) ||
        elemento.material.nombre_material.toLowerCase().includes(searchLower) ||
        elemento.color.nombre_color.toLowerCase().includes(searchLower);

      // Filtro por categoría
      const matchesCategoria = !filterElementCategoria ||
        elemento.subcategoria.categoria.id_categoria.toString() === filterElementCategoria;

      // Filtro por estado (mostramos todos los estados si no hay filtro)
      const matchesEstado = !filterElementEstado ||
        elemento.estado_elemento === filterElementEstado;

      // Mostramos todos los elementos, incluyendo los eliminados
      return matchesSearch && matchesCategoria && matchesEstado;
    });
  };

  return (
    <>
      {/* Elements Section */}
      <StyledCard
        title="Gestión de Elementos"
        extra={
          <Space>
            <Search
              placeholder="Buscar elementos..."
              onChange={(e) => setSearchElement(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              style={{ width: 200 }}
              placeholder="Filtrar por categoría"
              allowClear
              value={filterElementCategoria}
              onChange={setFilterElementCategoria}
            >
              {categorias.map((categoria: any) => (
                <Option key={categoria.id_categoria} value={categoria.id_categoria.toString()}>
                  {categoria.nombre_categoria}
                </Option>
              ))}
            </Select>
            <Select
              style={{ width: 150 }}
              placeholder="Filtrar por estado"
              allowClear
              value={filterElementEstado}
              onChange={setFilterElementEstado}
            >
              <Option value="Activo">Activo</Option>
              <Option value="Inactivo">Inactivo</Option>
              <Option value="Eliminado">Eliminado</Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ backgroundColor: 'var(--dark-gold)', borderColor: 'var(--dark-gold)' }}
              onClick={() => {
                setEditingElement(null);
                elementForm.resetFields();
                setShowElementModal(true);
              }}
            >
              Nuevo Elemento
            </Button>
          </Space>
        }
      >
        <Table
          columns={elementColumns}
          dataSource={filterElements(elementos)}
          loading={loadingElement}
          rowKey="id_elemento"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No hay elementos registrados' }}
        />
      </StyledCard>

      {/* View Element Modal */}
      <Modal
        title="Ver Elemento"
        open={showViewElementModal}
        onCancel={() => {
          setShowViewElementModal(false);
          setViewingElement(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setShowViewElementModal(false);
            setViewingElement(null);
          }}>
            Cerrar
          </Button>
        ]}
      >
        {viewingElement && (
          <Descriptions column={1}>
            <Descriptions.Item label="Nombre">{viewingElement.nombre_elemento}</Descriptions.Item>
            <Descriptions.Item label="Categoría">{viewingElement.subcategoria.categoria.nombre_categoria}</Descriptions.Item>
            <Descriptions.Item label="Subcategoría">{viewingElement.subcategoria.nombre_subcategoria}</Descriptions.Item>
            <Descriptions.Item label="Material">{viewingElement.material?.nombre_material}</Descriptions.Item>
            <Descriptions.Item label="Color">{viewingElement.color?.nombre_color}</Descriptions.Item>
            <Descriptions.Item label="Precio">${Number(viewingElement.precio_elemento).toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="Cantidad Total">{viewingElement.cantidad_total}</Descriptions.Item>
            <Descriptions.Item label="Cantidad Disponible">{viewingElement.cantidad_disponible}</Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color={
                viewingElement.estado_elemento === 'Activo' ? 'success' :
                viewingElement.estado_elemento === 'Inactivo' ? 'warning' : 'error'
              }>
                {viewingElement.estado_elemento}
              </Tag>
            </Descriptions.Item>
            {viewingElement.imagen_url && (
              <Descriptions.Item label="Imagen">
                <img src={viewingElement.imagen_url} alt={viewingElement.nombre_elemento} style={{ maxWidth: '100%', height: 'auto' }} />
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* View Rent Modal */}
      <Modal
        title="Ver Alquiler"
        open={showViewAlquilerModal}
        onCancel={() => {
          setShowViewAlquilerModal(false);
          setViewingAlquiler(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setShowViewAlquilerModal(false);
            setViewingAlquiler(null);
          }}>
            Cerrar
          </Button>
        ]}
      >
        {viewingAlquiler && (
          <Descriptions column={1}>
            <Descriptions.Item label="ID Alquiler">{viewingAlquiler.id_alquiler}</Descriptions.Item>
            <Descriptions.Item label="ID Evento">{viewingAlquiler.evento?.id_evento}</Descriptions.Item>
            <Descriptions.Item label="Nombre Evento">{viewingAlquiler.evento?.nombre_evento}</Descriptions.Item>
            <Descriptions.Item label="Fecha Evento">{viewingAlquiler.evento?.fecha_evento}</Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color={
                viewingAlquiler.estado_alquiler === 'Solicitado' ? 'processing' :
                viewingAlquiler.estado_alquiler === 'Aceptado' ? 'warning' :
                viewingAlquiler.estado_alquiler === 'Completado' ? 'success' : 'error'
              }>
                {viewingAlquiler.estado_alquiler}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Precio Neto">${Number(viewingAlquiler.precioneto_alquiler).toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="ITBIS">${Number(viewingAlquiler.itbis_alquiler).toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="Total">${Number(viewingAlquiler.total_alquiler).toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="Cantidad de Elementos">{viewingAlquiler.cant_elementos_alquiler}</Descriptions.Item>
            
            {viewingAlquiler.detalles && viewingAlquiler.detalles.length > 0 && (
              <Descriptions.Item label="Elementos">
                <List
                  dataSource={viewingAlquiler.detalles}
                  renderItem={(detalle: DetalleAlquiler) => (
                    <List.Item>
                      <div style={{ width: '100%' }}>
                        <Typography.Text strong>{detalle.elemento.nombre_elemento}</Typography.Text>
                        <div>Cantidad: {detalle.cantidad_alquiler}</div>
                        <div>Precio Unitario: ${Number(detalle.precio_unitario).toFixed(2)}</div>
                        <div>Total: ${Number(detalle.total_alquiler).toFixed(2)}</div>
                      </div>
                    </List.Item>
                  )}
                />
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Edit/Create Element Modal */}
      <Modal
        title={editingElement ? "Editar Elemento" : "Nuevo Elemento"}
        open={showElementModal}
        onCancel={() => {
          setShowElementModal(false);
          setEditingElement(null);
          elementForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={elementForm}
          layout="vertical"
          onFinish={handleElementSubmit}
        >
          <Form.Item
            name="nombre_elemento"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre del elemento' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="id_subcategoria"
            label="Subcategoría"
            rules={[{ required: true, message: 'Por favor seleccione la subcategoría' }]}
          >
            <Select>
              {categorias.flatMap((categoria: any) =>
                categoria.subcategorias.map((sub: any) => (
                  <Option key={sub.id_subcategoria} value={sub.id_subcategoria}>
                    {`${categoria.nombre_categoria} - ${sub.nombre_subcategoria}`}
                  </Option>
                )))
              }
            </Select>
          </Form.Item>

          <Form.Item
            name="id_material"
            label="Material"
            rules={[{ required: true, message: 'Por favor seleccione el material' }]}
          >
            <Select>
              {materiales.map((material: any) => (
                <Option key={material.id_material} value={material.id_material}>
                  {material.nombre_material}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="id_color"
            label="Color"
            rules={[{ required: true, message: 'Por favor seleccione el color' }]}
          >
            <Select>
              {colores.map((color: any) => (
                <Option key={color.id_color} value={color.id_color}>
                  {color.nombre_color}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="precio_elemento"
            label="Precio"
            rules={[{ required: true, message: 'Por favor ingrese el precio' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value: string | undefined): number => value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0}
            />
          </Form.Item>

          <Form.Item
            name="cantidad_disponible"
            label="Cantidad Disponible"
            rules={[{ required: true, message: 'Por favor ingrese la cantidad disponible' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="imagen_url"
            label="URL de la Imagen"
          >
            <Input placeholder="https://ejemplo.com/imagen.jpg" />
          </Form.Item>

          {/* Campo de estado siempre visible en edición */}
          {editingElement && (
            <Form.Item
              name="estado_elemento"
              label="Estado"
              rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
              initialValue={editingElement?.estado_elemento || 'Activo'}
            >
              <Select>
                <Option value="Activo">Activo</Option>
                <Option value="Inactivo">Inactivo</Option>
                <Option value="Eliminado">Eliminado</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setShowElementModal(false);
                setEditingElement(null);
                elementForm.resetFields();
              }}>
                Cancelar
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loadingElement}
                style={{ backgroundColor: 'var(--dark-gold)', borderColor: 'var(--dark-gold)' }}
              >
                {editingElement ? 'Actualizar' : 'Crear'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <StyledCard title="Gestión de Alquileres">
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCatalogo(true)}
              style={{ backgroundColor: 'var(--dark-gold)', borderColor: 'var(--dark-gold)' }}
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
          <Button onClick={handleReset} icon={<ReloadOutlined />}>
            Resetear Filtros
          </Button>
        </Space>

        <ModalContent hasSelection={elementosSeleccionados.length > 0 || (editingAlquiler?.detalles?.length ?? 0) > 0}>
          <List
            dataSource={elementos.filter((elemento: Elemento) => {
              const matchesSearch = elemento.nombre_elemento.toLowerCase().includes(searchText.toLowerCase());
              const matchesCategoria = !filterCategoria || 
                elemento.subcategoria.categoria.nombre_categoria === filterCategoria;
              return matchesSearch && matchesCategoria;
            })}
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
                          Disponibles: <Typography.Text strong>{typeof elemento.cantidad_disponible === 'number' ? elemento.cantidad_disponible : 'N/A'}</Typography.Text>
                        </Typography.Text>
                      </Space>
                    </div>
                    <Space align="center">
                      <Typography.Text>Cantidad:</Typography.Text>
                      <InputNumber
                        min={0}
                        max={typeof elemento.cantidad_disponible === 'number' ? elemento.cantidad_disponible : 0}
                        value={cantidad}
                        onChange={(value: number | null) => {
                          if (editingAlquiler) {
                            const newDetalles = [...(editingAlquiler.detalles || [])];
                            const index = newDetalles.findIndex(d => d.id_elemento === elemento.id_elemento);
                            
                            if (!value || value === 0) {
                              if (index !== -1) {
                                newDetalles.splice(index, 1);
                              }
                            } else {
                              const subtotal = Number((value * elemento.precio_elemento).toFixed(2));
                              if (index !== -1) {
                                newDetalles[index] = {
                                  ...newDetalles[index],
                                  cantidad_alquiler: value,
                                  precio_unitario: elemento.precio_elemento,
                                  total_alquiler: subtotal
                                };
                              } else {
                                newDetalles.push({
                                  id_elemento: elemento.id_elemento,
                                  elemento: elemento,
                                  cantidad_alquiler: value,
                                  precio_unitario: elemento.precio_elemento,
                                  total_alquiler: subtotal,
                                  estado_detalquiler: 'Aceptado'
                                });
                              }
                            }
                            setEditingAlquiler({
                              ...editingAlquiler,
                              detalles: newDetalles
                            });
                          } else {
                            handleCantidadChange(elemento, value || 0);
                          }
                        }}
                        style={{ width: 80 }}
                        disabled={typeof elemento.cantidad_disponible !== 'number' || elemento.cantidad_disponible === 0}
                      />
                    </Space>
                  </div>
                </ListItem>
              );
            }}
          />
        </ModalContent>
        
        {(elementosSeleccionados.length > 0 || (editingAlquiler?.detalles?.length ?? 0) > 0) && (
          <ContinueButton onClick={handleContinuar}>
            Continuar <RightOutlined />
          </ContinueButton>
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
            <Button type="primary" htmlType="submit">
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
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={loadingSubmit}
                  style={{ backgroundColor: 'var(--dark-gold)', borderColor: 'var(--dark-gold)' }}
                >
                  Guardar Cambios
                </Button>
                <Button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAlquiler(null);
                    setElementosSeleccionados([]);
                    form.resetFields();
                  }}
                >
                  Cancelar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </StyledModal>
    </>
  );
};

export default RentAdmin;