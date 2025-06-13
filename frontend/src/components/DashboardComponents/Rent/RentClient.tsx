import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Spin,
  Typography,
  List,
  Avatar,
  Divider,
  Descriptions,
  Row,
  Col,
  Badge,
  Drawer,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import axios from 'axios';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { apiUrl } from '../../../config';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

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

const CatalogCard = styled(Card)`
  margin: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .ant-card-cover img {
    border-radius: 8px 8px 0 0;
    height: 200px;
    object-fit: cover;
  }

  .ant-card-meta-title {
    font-family: "Montserrat Alternates", sans-serif;
    font-weight: 600;
    color: var(--color-text2);
  }

  .ant-card-meta-description {
    color: var(--color-text);
  }
`;

const CartButton = styled(Button)`
  position: fixed;
  top: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  background-color: var(--gold);
  border-color: var(--gold);

  &:hover {
    background-color: var(--dark-gold);
    border-color: var(--dark-gold);
  }
`;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-content-wrapper {
    width: 400px !important;
  }
  
  .ant-drawer-body {
    padding: 24px;
  }

  .ant-drawer-header {
    background-color: var(--beige);
    border-bottom: 2px solid var(--dark-gold);
  }

  .ant-drawer-title {
    color: var(--color-text2);
    font-family: "Montserrat Alternates", sans-serif;
    font-weight: 600;
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

interface Evento {
  id_evento: number;
  nombre_evento: string;
  fecha_evento: string;
  estado_evento: string;
}

const RentClient: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alquileres, setAlquileres] = useState<Alquiler[]>([]);
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [elementosSeleccionados, setElementosSeleccionados] = useState<ElementoSeleccionado[]>([]);
  const [showCatalogo, setShowCatalogo] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Alquiler | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [eventosDisponibles, setEventosDisponibles] = useState<Evento[]>([]);
  const [showEventoSelect, setShowEventoSelect] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchAlquilerId, setSearchAlquilerId] = useState<string>('');
  const [searchEventoId, setSearchEventoId] = useState<string>('');
  const [filterEstado, setFilterEstado] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        navigate('/Login');
        return null;
      }

      const response = await axios.get(`${apiUrl}/auth/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.cedula_usuario) {
        setUserData(response.data);
        return response.data;
      } else {
        message.error('Error al obtener datos del usuario');
        navigate('/Login');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      message.error('Error al obtener datos del usuario');
      navigate('/Login');
      return null;
    }
  };

  const fetchAlquileres = async () => {
    try {
      if (!userData?.cedula_usuario) {
        console.log('No hay cedula_usuario disponible');
        return;
      }

      const token = localStorage.getItem('token');
      // Primero obtenemos los eventos del cliente
      const eventosResponse = await axios.get(`${apiUrl}/evento/cliente/${userData.cedula_usuario}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!eventosResponse.data || eventosResponse.data.length === 0) {
        setAlquileres([]);
        return;
      }

      // Obtenemos los IDs de los eventos del cliente
      const eventosClienteIds = eventosResponse.data.map((evento: any) => evento.id_evento);

      // Obtenemos todos los alquileres
      const alquileresResponse = await axios.get(`${apiUrl}/alquiler`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (alquileresResponse.data) {
        // Filtramos los alquileres para mantener solo aquellos cuyo evento pertenece al cliente
        const alquileresFiltrados = alquileresResponse.data.filter((alquiler: any) => 
          eventosClienteIds.includes(alquiler.id_evento)
        ).map((alquiler: any) => ({
          ...alquiler,
          total_alquiler: Number(alquiler.total_alquiler) || 0
        }));

        setAlquileres(alquileresFiltrados);
        message.success('Datos actualizados correctamente');
      }
    } catch (error) {
      console.error('Error al cargar los alquileres:', error);
      message.error('Error al cargar los alquileres');
    }
  };

  const fetchElementos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/elemento`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setElementos(response.data);
      }
    } catch (error) {
      console.error('Error al cargar los elementos:', error);
      message.error('Error al cargar los elementos');
    }
  };

  const fetchEventosDisponibles = async () => {
    try {
      if (!userData?.cedula_usuario) {
        message.error('No hay datos de usuario disponibles');
        return;
      }
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/evento/cliente/${userData.cedula_usuario}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        // Filtrar eventos pendientes o aceptados, considerando ambos campos y case-insensitive
        const eventosFiltrados = response.data.filter((evento: any) => {
          const estado = (evento.estado_evento || evento.estado_solicitud || '').toLowerCase();
          return estado === 'pendiente' || estado === 'aceptada' || estado === 'aprobado';
        });
        if (eventosFiltrados.length === 0) {
          message.warning('No hay eventos disponibles para realizar un alquiler. Por favor, asegúrese de tener un evento pendiente o aceptado.');
          setShowEventoSelect(false);
          return;
        }
        setEventosDisponibles(eventosFiltrados);
      }
    } catch (error) {
      console.error('Error al cargar eventos disponibles:', error);
      message.error('Error al cargar eventos disponibles. Por favor, intente nuevamente.');
      setShowEventoSelect(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const user = await fetchUserData();
        if (user) {
          await Promise.all([
            fetchAlquileres(),
            fetchElementos(),
            fetchEventosDisponibles()
          ]);
        }
      } catch (error) {
        console.error('Error al inicializar datos:', error);
        message.error('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Efecto para recargar alquileres cuando cambia userData
  useEffect(() => {
    if (userData?.cedula_usuario) {
      fetchAlquileres();
    }
  }, [userData]);

  const handleCantidadChange = (elemento: Elemento, cantidad: number) => {
    const elementoExistente = elementosSeleccionados.find(
      (item) => item.id_elemento === elemento.id_elemento
    );

    if (elementoExistente) {
      setElementosSeleccionados(
        elementosSeleccionados.map((item) =>
          item.id_elemento === elemento.id_elemento
            ? { ...item, cantidad_seleccionada: cantidad }
            : item
        )
      );
    } else {
      setElementosSeleccionados([
        ...elementosSeleccionados,
        { ...elemento, cantidad_seleccionada: cantidad }
      ]);
    }
  };

  const handleView = async (record: Alquiler) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/alquiler/${record.id_alquiler}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setSelectedRecord(response.data);
        setShowViewModal(true);
      } else {
        message.error('No se pudieron cargar los detalles del alquiler');
      }
    } catch (error) {
      console.error('Error al cargar los detalles del alquiler:', error);
      message.error('Error al cargar los detalles del alquiler');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRental = async () => {
    if (!selectedEvento) {
      message.error('Por favor seleccione un evento');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Verificar si ya existe un alquiler para este evento
      const alquilerExistente = alquileres.find(alq => 
        alq.evento?.id_evento === selectedEvento && 
        alq.estado_alquiler !== 'Cancelado'
      );

      if (alquilerExistente) {
        Modal.confirm({
          title: 'Ya existe un alquiler para este evento',
          content: 'Ya existe un alquiler activo para este evento. ¿Desea editar el alquiler existente?',
          okText: 'Sí, editar',
          cancelText: 'No',
          onOk: () => {
            setShowEventoSelect(false);
            setShowCart(false);
            setShowCatalogo(false);
            handleEditRental(alquilerExistente);
          }
        });
        return;
      }

      // Validar que haya elementos seleccionados y cantidades válidas
      if (elementosSeleccionados.length === 0) {
        message.error('Debe seleccionar al menos un elemento');
        return;
      }

      const detallesValidos = elementosSeleccionados.map(elemento => ({
        id_elemento: elemento.id_elemento,
        cantidad_alquiler: elemento.cantidad_seleccionada,
        precio_unitario: elemento.precio_elemento,
        total_alquiler: elemento.cantidad_seleccionada * elemento.precio_elemento
      }));

      const response = await axios.post(`${apiUrl}/alquiler`, {
        id_evento: selectedEvento,
        detalles: detallesValidos,
        precioneto_alquiler: calculateTotal(),
        itbis_alquiler: calculateTotal() * 0.18,
        total_alquiler: calculateTotal() * 1.18,
        cant_elementos_alquiler: elementosSeleccionados.reduce((total, elem) => total + elem.cantidad_seleccionada, 0)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        message.success('Alquiler procesado exitosamente');
        setShowEventoSelect(false);
        setShowCart(false);
        setShowCatalogo(false);
        setElementosSeleccionados([]);
        setSelectedEvento(null);
        // Actualizar solo el nuevo alquiler en lugar de recargar todos
        setAlquileres([...alquileres, response.data]);
      }
    } catch (error) {
      console.error('Error al procesar el alquiler:', error);
      message.error('Error al procesar el alquiler. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (elemento: Elemento) => {
    const cantidad = 1;
    if (selectedRecord) {
      // Si estamos en modo edición, solo actualizamos los elementos seleccionados
      handleCantidadChange(elemento, cantidad);
      message.success(`${elemento.nombre_elemento} agregado al alquiler`);
    } else {
      // Si estamos en modo creación, usamos el flujo normal del carrito
      handleCantidadChange(elemento, cantidad);
      message.success(`${elemento.nombre_elemento} agregado al carrito`);
    }
  };

  const handleRemoveFromCart = (elemento: Elemento) => {
    setElementosSeleccionados(elementosSeleccionados.filter(e => e.id_elemento !== elemento.id_elemento));
    message.success(`${elemento.nombre_elemento} removido del carrito`);
  };

  const handleEmptyCart = () => {
    Modal.confirm({
      title: '¿Está seguro de vaciar el carrito?',
      content: 'Esta acción eliminará todos los elementos seleccionados.',
      okText: 'Sí, vaciar',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        setElementosSeleccionados([]);
        message.success('Carrito vaciado exitosamente');
      }
    });
  };

  const calculateTotal = () => {
    return elementosSeleccionados.reduce((total, elemento) => {
      return total + (elemento.precio_elemento * elemento.cantidad_seleccionada);
    }, 0);
  };

  const handleCancelRental = async (id_alquiler: number) => {
    Modal.confirm({
      title: '¿Está seguro de cancelar este alquiler?',
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, cancelar',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          if (!token) {
            message.error('No hay sesión activa');
            return;
          }

          const response = await axios.patch(
            `${apiUrl}/alquiler/${id_alquiler}`,
            {
              estado_alquiler: 'Cancelado'
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (response.data) {
            message.success('Alquiler cancelado exitosamente');
            // Actualizar solo el alquiler modificado en lugar de recargar todos
            setAlquileres(alquileres.map(alq => 
              alq.id_alquiler === id_alquiler ? response.data : alq
            ));
          } else {
            message.error('No se pudo cancelar el alquiler');
          }
        } catch (error) {
          console.error('Error al cancelar el alquiler:', error);
          message.error('Error al cancelar el alquiler');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleEditRental = async (record: Alquiler) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/alquiler/${record.id_alquiler}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        // Mapear los elementos del alquiler al formato de elementos seleccionados
        const elementosEdit = response.data.detalles.map((detalle: any) => ({
          id_elemento: detalle.elemento.id_elemento,
          nombre_elemento: detalle.elemento.nombre_elemento,
          precio_elemento: detalle.precio_unitario,
          cantidad_disponible: detalle.elemento.cantidad_disponible,
          imagen_url: detalle.elemento.imagen_url,
          subcategoria: detalle.elemento.subcategoria,
          cantidad_seleccionada: detalle.cantidad_alquiler
        }));

        setElementosSeleccionados(elementosEdit);
        setSelectedRecord(response.data);
        setShowEditModal(true);
        setShowCatalogo(false);
      } else {
        message.error('No se pudieron cargar los detalles del alquiler');
      }
    } catch (error) {
      console.error('Error al cargar los detalles del alquiler:', error);
      message.error('Error al cargar los detalles del alquiler');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      if (!selectedRecord) {
        message.error('No hay alquiler seleccionado');
        return;
      }

      if (elementosSeleccionados.length === 0) {
        message.error('Debe seleccionar al menos un elemento');
        return;
      }

      const detalles = elementosSeleccionados.map(elemento => ({
        id_elemento: elemento.id_elemento,
        cantidad: elemento.cantidad_seleccionada,
        precio_unitario: elemento.precio_elemento,
        subtotal: Number((elemento.cantidad_seleccionada * elemento.precio_elemento).toFixed(2))
      }));

      const precioNeto = Number(detalles.reduce<number>((sum, detalle) => 
        sum + detalle.subtotal, 0).toFixed(2)
      );
      const itbis = Number((precioNeto * 0.18).toFixed(2));
      const total = Number((precioNeto + itbis).toFixed(2));
      const cantTotal = detalles.reduce<number>((sum, detalle) => sum + detalle.cantidad, 0);

      const updateData = {
        estado_alquiler: selectedRecord.estado_alquiler,
        precioneto_alquiler: precioNeto,
        itbis_alquiler: itbis,
        total_alquiler: total,
        cant_elementos_alquiler: cantTotal,
        elementos: detalles
      };

      const response = await axios.patch(
        `${apiUrl}/alquiler/${selectedRecord.id_alquiler}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        message.success('Alquiler actualizado exitosamente');
        setShowEditModal(false);
        setSelectedRecord(null);
        setElementosSeleccionados([]);
        // Actualizar solo el alquiler modificado en lugar de recargar todos
        setAlquileres(alquileres.map(alq => 
          alq.id_alquiler === selectedRecord.id_alquiler ? response.data : alq
        ));
      } else {
        message.error('No se pudo actualizar el alquiler');
      }
    } catch (error) {
      console.error('Error al actualizar el alquiler:', error);
      message.error('Error al actualizar el alquiler');
    } finally {
      setLoading(false);
    }
  };

  const handleRevertRental = async (id_alquiler: number) => {
    Modal.confirm({
      title: '¿Está seguro de revertir este alquiler?',
      content: 'El alquiler volverá a estado "Solicitado".',
      okText: 'Sí, revertir',
      okType: 'primary',
      cancelText: 'No',
      onOk: async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          if (!token) {
            message.error('No hay sesión activa');
            return;
          }

          const response = await axios.patch(
            `${apiUrl}/alquiler/${id_alquiler}`,
            {
              estado_alquiler: 'Solicitado'
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (response.data) {
            message.success('Alquiler revertido exitosamente');
            // Actualizar solo el alquiler modificado en lugar de recargar todos
            setAlquileres(alquileres.map(alq => 
              alq.id_alquiler === id_alquiler ? response.data : alq
            ));
          } else {
            message.error('No se pudo revertir el alquiler');
          }
        } catch (error) {
          console.error('Error al revertir el alquiler:', error);
          message.error('Error al revertir el alquiler');
        } finally {
          setLoading(false);
        }
      }
    });
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
      render: (_: any, record: Alquiler) => (
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
              onClick={() => handleEditRental(record)}
            />
          </Tooltip>
          {record.estado_alquiler === 'Cancelado' ? (
            <Tooltip title="Revertir alquiler">
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => handleRevertRental(record.id_alquiler)}
              />
            </Tooltip>
          ) : record.estado_alquiler !== 'Completado' && (
            <Tooltip title="Cancelar alquiler">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleCancelRental(record.id_alquiler)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const filteredAlquileres = alquileres.filter(alquiler => {
    const matchesAlquilerId = !searchAlquilerId || 
      alquiler.id_alquiler.toString().includes(searchAlquilerId);
    const matchesEventoId = !searchEventoId || 
      alquiler.evento?.id_evento.toString().includes(searchEventoId);
    const matchesEstado = !filterEstado || 
      alquiler.estado_alquiler === filterEstado;
    return matchesAlquilerId && matchesEventoId && matchesEstado;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <StyledCard title="Mis Alquileres">
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
              icon={<ReloadOutlined />}
              onClick={fetchAlquileres}
            >
              Recargar
            </StyledButton>
          </Space>
          <Space wrap style={{ marginTop: 16 }}>
            <Input
              placeholder="Buscar por ID de alquiler"
              value={searchAlquilerId}
              onChange={(e) => setSearchAlquilerId(e.target.value)}
              style={{ width: 200 }}
            />
            <Input
              placeholder="Buscar por ID de evento"
              value={searchEventoId}
              onChange={(e) => setSearchEventoId(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Filtrar por estado"
              allowClear
              style={{ width: 200 }}
              onChange={(value) => setFilterEstado(value)}
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
        />
      </StyledCard>

      <Modal
        title={selectedRecord ? "Agregar Elementos al Alquiler" : "Catálogo de Elementos"}
        open={showCatalogo}
        onCancel={() => {
          setShowCatalogo(false);
          if (selectedRecord) {
            setShowEditModal(true);
          } else {
            setElementosSeleccionados([]);
          }
        }}
        footer={[
          <StyledButton key="close" onClick={() => {
            setShowCatalogo(false);
            if (selectedRecord) {
              setShowEditModal(true);
            } else {
              setElementosSeleccionados([]);
            }
          }}>
            Cerrar
          </StyledButton>,
          !selectedRecord && (
            <StyledButton
              key="process"
              type="primary"
              onClick={() => {
                setShowCatalogo(false);
                setShowCart(true);
              }}
            >
              Ver Carrito
            </StyledButton>
          )
        ]}
        width={1200}
      >
        <div style={{ position: 'relative' }}>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
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
                {elementos.map((elemento) => (
                  <Option 
                    key={`cat-${elemento.subcategoria.categoria.id_categoria}`} 
                    value={elemento.subcategoria.categoria.nombre_categoria}
                  >
                    {elemento.subcategoria.categoria.nombre_categoria}
                  </Option>
                ))}
              </Select>
            </Space>
            {!selectedRecord && (
              <StyledButton
                type="primary"
                icon={
                  <Badge count={elementosSeleccionados.length} offset={[-2, 2]}>
                    <ShoppingCartOutlined style={{ fontSize: 24 }} />
                  </Badge>
                }
                onClick={() => setShowCart(true)}
                style={{
                  position: 'fixed',
                  top: 24,
                  right: 24,
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 1000
                }}
              />
            )}
          </Space>

          <Row gutter={[16, 16]}>
            {elementos.map((elemento) => (
              <Col xs={24} sm={12} md={8} lg={6} key={elemento.id_elemento}>
                <Card
                  hoverable
                  style={{
                    margin: 8,
                    borderRadius: 8,
                    transition: 'all 0.3s ease'
                  }}
                  cover={
                    elemento.imagen_url ? (
                      <img 
                        alt={elemento.nombre_elemento} 
                        src={elemento.imagen_url}
                        style={{
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: '8px 8px 0 0'
                        }}
                      />
                    ) : (
                      <div style={{ 
                        height: 200, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        background: '#f5f5f5',
                        borderRadius: '8px 8px 0 0'
                      }}>
                        <InboxOutlined style={{ fontSize: 48, color: '#999' }} />
                      </div>
                    )
                  }
                >
                  <Card.Meta
                    title={elemento.nombre_elemento}
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>Precio: ${elemento.precio_elemento}</Text>
                        <Text type="secondary">Disponibles: {elemento.cantidad_disponible}</Text>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <InputNumber
                            min={0}
                            max={elemento.cantidad_disponible}
                            value={elementosSeleccionados.find(e => e.id_elemento === elemento.id_elemento)?.cantidad_seleccionada || 0}
                            onChange={(value) => handleCantidadChange(elemento, value || 0)}
                            style={{ width: 100 }}
                          />
                          <StyledButton
                            type={elementosSeleccionados.find(e => e.id_elemento === elemento.id_elemento) ? 'default' : 'primary'}
                            onClick={() => {
                              const isInCart = elementosSeleccionados.find(e => e.id_elemento === elemento.id_elemento);
                              if (isInCart) {
                                handleRemoveFromCart(elemento);
                              } else {
                                handleAddToCart(elemento);
                              }
                            }}
                          >
                            {elementosSeleccionados.find(e => e.id_elemento === elemento.id_elemento) ? 'Quitar' : 'Agregar'}
                          </StyledButton>
                        </Space>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Modal>

      <Drawer
        title="Carrito de Alquiler"
        placement="right"
        onClose={() => setShowCart(false)}
        open={showCart}
        width={400}
        footer={
          <Space>
            <StyledButton onClick={() => setShowCart(false)}>
              Cancelar
            </StyledButton>
            <StyledButton
              type="primary"
              onClick={() => {
                if (elementosSeleccionados.length === 0) {
                  message.error('Por favor seleccione al menos un elemento');
                  return;
                }
                setShowCart(false);
                setShowEventoSelect(true);
              }}
            >
              Procesar Alquiler
            </StyledButton>
          </Space>
        }
      >
        <div style={{ position: 'relative' }}>
          <Title level={4}>Carrito de Alquiler</Title>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setShowCart(false)}
            style={{ position: 'absolute', right: 0, top: 0 }}
          />
        </div>

        {elementosSeleccionados.length > 0 && (
          <Button
            type="primary"
            danger
            onClick={handleEmptyCart}
            style={{ marginBottom: 16 }}
          >
            Vaciar Carrito
          </Button>
        )}

        <List
          dataSource={elementosSeleccionados}
          renderItem={(elemento) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  elemento.imagen_url ? (
                    <Avatar src={elemento.imagen_url} />
                  ) : (
                    <Avatar icon={<InboxOutlined />} />
                  )
                }
                title={elemento.nombre_elemento}
                description={
                  <Space direction="vertical">
                    <Text>Cantidad: {elemento.cantidad_seleccionada}</Text>
                    <Text>Precio Unitario: ${elemento.precio_elemento}</Text>
                    <Text strong>Subtotal: ${(elemento.precio_elemento * elemento.cantidad_seleccionada).toFixed(2)}</Text>
                  </Space>
                }
              />
              <Space>
                <InputNumber
                  min={0}
                  max={elemento.cantidad_disponible}
                  value={elemento.cantidad_seleccionada}
                  onChange={(value) => handleCantidadChange(elemento, value || 0)}
                />
                <StyledButton
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveFromCart(elemento)}
                />
              </Space>
            </List.Item>
          )}
        />

        <Divider />

        <div style={{ marginTop: 16 }}>
          <Text strong>Subtotal: </Text>
          <Text>${calculateTotal().toFixed(2)}</Text>
          <br />
          <Text strong>ITBIS (18%): </Text>
          <Text>${(calculateTotal() * 0.18).toFixed(2)}</Text>
          <br />
          <Text strong>Total: </Text>
          <Text>${(calculateTotal() * 1.18).toFixed(2)}</Text>
        </div>
      </Drawer>

      <Modal
        title="Seleccionar Evento"
        open={showEventoSelect}
        onCancel={() => {
          setShowEventoSelect(false);
          setSelectedEvento(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setShowEventoSelect(false);
            setSelectedEvento(null);
          }}>
            Cancelar
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleProcessRental}
            disabled={!selectedEvento || loading}
            loading={loading}
          >
            Procesar Alquiler
          </Button>
        ]}
      >
        <Spin spinning={loading}>
          <Form layout="vertical">
            <Form.Item
              label="Seleccione el evento"
              required
              tooltip="Debe seleccionar un evento para procesar el alquiler"
            >
              <Select
                placeholder="Seleccione un evento"
                onChange={(value) => setSelectedEvento(value)}
                value={selectedEvento}
                loading={loading}
                style={{ width: '100%' }}
                notFoundContent={loading ? <Spin size="small" /> : "No hay eventos disponibles"}
              >
                {eventosDisponibles.map((evento) => (
                  <Option key={evento.id_evento} value={evento.id_evento}>
                    {evento.nombre_evento} - {dayjs(evento.fecha_evento).format('DD/MM/YYYY')} ({evento.estado_evento})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      <Modal
        title="Detalles del Alquiler"
        open={showViewModal}
        onCancel={() => {
          setShowViewModal(false);
          setSelectedRecord(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setShowViewModal(false);
            setSelectedRecord(null);
          }}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        <Spin spinning={loading}>
          {selectedRecord && (
            <div>
              <Descriptions title="Información General" bordered column={2}>
                <Descriptions.Item label="ID Alquiler">
                  {selectedRecord.id_alquiler}
                </Descriptions.Item>
                <Descriptions.Item label="Estado">
                  <Tag color={
                    selectedRecord.estado_alquiler === 'Solicitado' ? 'gold' :
                    selectedRecord.estado_alquiler === 'Aceptado' ? 'green' :
                    selectedRecord.estado_alquiler === 'Completado' ? 'blue' :
                    selectedRecord.estado_alquiler === 'Cancelado' ? 'gray' : 'default'
                  }>
                    {selectedRecord.estado_alquiler}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Evento">
                  {selectedRecord.evento?.nombre_evento || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Fecha del Evento">
                  {selectedRecord.evento?.fecha_evento ? 
                    dayjs(selectedRecord.evento.fecha_evento).format('DD/MM/YYYY') : 
                    'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Cantidad de Elementos">
                  {selectedRecord.cant_elementos_alquiler}
                </Descriptions.Item>
                <Descriptions.Item label="Precio Neto">
                  ${Number(selectedRecord.precioneto_alquiler || 0).toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="ITBIS">
                  ${Number(selectedRecord.itbis_alquiler || 0).toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="Total">
                  ${Number(selectedRecord.total_alquiler || 0).toFixed(2)}
                </Descriptions.Item>
              </Descriptions>

              <Divider>Elementos del Alquiler</Divider>
              
              <List
                itemLayout="horizontal"
                dataSource={selectedRecord.detalles}
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
                          <Text>Cantidad: {detalle.cantidad_alquiler}</Text>
                          <Text>Precio Unitario: ${Number(detalle.precio_unitario || 0).toFixed(2)}</Text>
                          <Text>Subtotal: ${Number(detalle.total_alquiler || 0).toFixed(2)}</Text>
                          <Text>Categoría: {
                            detalle.elemento?.subcategoria?.categoria?.nombre_categoria 
                              ? `${detalle.elemento.subcategoria.categoria.nombre_categoria} - ${detalle.elemento.subcategoria.nombre_subcategoria}`
                              : 'No especificada'
                          }</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
        </Spin>
      </Modal>

      <Modal
        title="Editar Alquiler"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedRecord(null);
          setElementosSeleccionados([]);
        }}
        footer={[
          <StyledButton 
            key="cancel" 
            onClick={() => {
              setShowEditModal(false);
              setSelectedRecord(null);
              setElementosSeleccionados([]);
            }}
          >
            Cancelar
          </StyledButton>,
          <StyledButton 
            key="submit" 
            type="primary" 
            onClick={handleEditSubmit}
            loading={loading}
          >
            Guardar Cambios
          </StyledButton>
        ]}
        width={800}
      >
        <Spin spinning={loading}>
          <div style={{ marginBottom: 16 }}>
            <Title level={4}>Estado del Alquiler</Title>
            <Text>{selectedRecord?.estado_alquiler}</Text>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Title level={4}>Elementos del Alquiler</Title>
            <List
              dataSource={elementosSeleccionados}
              renderItem={(elemento) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      elemento.imagen_url ? (
                        <Avatar src={elemento.imagen_url} />
                      ) : (
                        <Avatar icon={<InboxOutlined />} />
                      )
                    }
                    title={elemento.nombre_elemento}
                    description={
                      <Space direction="vertical">
                        <Text>Cantidad: {elemento.cantidad_seleccionada}</Text>
                        <Text>Precio Unitario: ${elemento.precio_elemento}</Text>
                        <Text strong>Subtotal: ${(elemento.precio_elemento * elemento.cantidad_seleccionada).toFixed(2)}</Text>
                      </Space>
                    }
                  />
                  <Space>
                    <InputNumber
                      min={0}
                      max={elemento.cantidad_disponible}
                      value={elemento.cantidad_seleccionada}
                      onChange={(value) => handleCantidadChange(elemento, value || 0)}
                    />
                    <StyledButton
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveFromCart(elemento)}
                    />
                  </Space>
                </List.Item>
              )}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <StyledButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setShowCatalogo(true);
                setShowEditModal(false);
              }}
            >
              Agregar Elementos
            </StyledButton>
          </div>

          <Divider />

          <div style={{ marginTop: 16 }}>
            <Text strong>Subtotal: </Text>
            <Text>${calculateTotal().toFixed(2)}</Text>
            <br />
            <Text strong>ITBIS (18%): </Text>
            <Text>${(calculateTotal() * 0.18).toFixed(2)}</Text>
            <br />
            <Text strong>Total: </Text>
            <Text>${(calculateTotal() * 1.18).toFixed(2)}</Text>
          </div>
        </Spin>
      </Modal>
    </>
  );
};

export default RentClient; 