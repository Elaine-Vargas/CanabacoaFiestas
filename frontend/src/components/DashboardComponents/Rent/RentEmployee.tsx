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
  Radio,
  Grid
} from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { SelectProps } from 'antd/es/select';
import type { TableProps } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { PlusOutlined, RightOutlined, CloseOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, EyeOutlined, InboxOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import styled from 'styled-components';
import '../../../styles/dashboard/ServicesSubpages.scss';
import dayjs from 'dayjs';
import { apiUrl } from '../../../config';

// Define responsive breakpoints
type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

// Define types for Select components
type ValueType = string | undefined;
type OptionType = { value: string; label: string };

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

interface CompraData {
  id_proveedor: number;
  fecha_compra: string;
  hora_compra: string;
  costo_compra: number;
  estado_compra: string;
  detalles: DetalleCompraData[];
}

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
    tipo_evento?: {
      tipo_evento: string;
    };
    cliente?: {
      nombre_usuario: string;
      apellido_usuario: string;
    };
  };
  detalles?: DetalleAlquiler[];
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

interface DetalleCompra {
  id_elemento: number;
  elemento: Elemento;
  cantidad_compra: number;
  precio_unitario: number;
  total_compra: number;
}

interface Evento {
  id_evento: number;
  nombre_evento: string;
  fecha_evento: string;
  tipo_evento?: {
    tipo_evento: string;
  };
  cliente?: {
    nombre_usuario: string;
    apellido_usuario: string;
  };
}

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

  @media (max-width: 768px) {
    margin: 10px;
    
    .ant-card-head-wrapper {
      flex-direction: column;
      align-items: stretch;
      
      .ant-card-head-title {
        padding-bottom: 0;
      }
      
      .ant-card-extra {
        margin-left: 0;
        padding-top: 16px;
        width: 100%;
      }
    }

    .ant-card-body {
      padding: 12px;
    }
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

  @media (max-width: 768px) {
    margin: 0;
    padding: 0;
    max-width: 100vw !important;
    top: 0;
    
    .ant-modal-content {
      border-radius: 0;
      min-height: 100vh;
      
      .ant-modal-header {
        padding: 12px 16px;
        
        .ant-modal-title {
          font-size: 16px;
        }
      }
      
      .ant-modal-body {
        padding: 16px;
        
        .ant-form-item {
          margin-bottom: 16px;
        }
        
        .ant-input,
        .ant-select-selector,
        .ant-input-number {
          height: 32px;
          font-size: 14px;
        }
        
        .ant-input-number {
          width: 100%;
        }
        
        .ant-form-item-label {
          padding-bottom: 4px;
          
          label {
            font-size: 14px;
          }
        }
      }
      
      .ant-modal-footer {
        padding: 12px 16px;
        
        .ant-btn {
          height: 32px;
          font-size: 14px;
          padding: 4px 15px;
        }
      }
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

  @media (max-width: 768px) {
    width: 100%;
    height: 32px;
    padding: 4px 15px;
    font-size: 14px;
    border-radius: 6px;
    margin-bottom: 8px;

    &.ant-btn-icon-only {
      width: 32px;
      padding: 0;
      margin-bottom: 0;
    }

    .anticon {
      font-size: 14px;
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

  @media (max-width: 768px) {
    .ant-table {
      font-size: 12px;
      
      .ant-table-container {
        border-radius: 8px;
        overflow: hidden;
      }
    }

    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 8px 4px;
      white-space: nowrap;
      
      &:first-child {
        padding-left: 8px;
      }
      
      &:last-child {
        padding-right: 8px;
      }
    }

    .ant-table-thead > tr > th {
      font-size: 12px;
      background-color: var(--color-background);
      
      &[colspan] {
        text-align: center;
      }
    }

    .ant-table-tbody > tr > td {
      font-size: 12px;
      
      .ant-tag {
        margin: 0;
        padding: 0 4px;
        font-size: 11px;
        line-height: 18px;
      }
    }

    .ant-table-cell {
      .ant-space {
        gap: 4px !important;
      }
    }

    .ant-table-content {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      
      &::-webkit-scrollbar {
        height: 6px;
      }
      
      &::-webkit-scrollbar-thumb {
        background-color: var(--dark-gold);
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-track {
        background-color: var(--color-background);
      }
    }

    .ant-pagination {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      padding: 8px 0;
      
      .ant-pagination-item,
      .ant-pagination-prev,
      .ant-pagination-next {
        margin: 4px;
        min-width: 28px;
        height: 28px;
        line-height: 26px;
        
        a {
          padding: 0 4px;
        }
      }
      
      .ant-pagination-options {
        margin: 4px;
        
        .ant-select {
          width: 80px !important;
        }
      }
    }

    .ant-table-fixed-left,
    .ant-table-fixed-right {
      .ant-table-cell {
        background-color: var(--color-background2) !important;
      }
    }
  }
`;

const ResponsiveSpace = styled(Space)`
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    margin-bottom: 16px;
    
    .ant-space-item {
      width: 100%;
      margin-right: 0 !important;
    }

    &.ant-space-horizontal {
      gap: 8px !important;
    }
  }
`;

const ActionButtons = styled(Space)`
  @media (max-width: 768px) {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 4px;
    
    .ant-btn {
      padding: 4px 8px;
      font-size: 12px;
      width: auto;
      margin-bottom: 0;
      
      &.ant-btn-icon-only {
        width: 24px;
        height: 24px;
        padding: 0;
        
        .anticon {
          font-size: 12px;
        }
      }
    }
  }
`;

const StyledSearch = styled(Search)`
  @media (max-width: 768px) {
    width: 100% !important;
    margin-bottom: 8px !important;
    
    .ant-input-wrapper {
      display: flex;
      
      .ant-input {
        flex: 1;
        font-size: 14px;
      }
      
      .ant-input-group-addon {
        width: auto;
      }
      
      .ant-btn {
        height: 32px;
        padding: 0 8px;
        
        .anticon {
          font-size: 14px;
        }
      }
    }
  }
`;

const StyledSelect = styled(Select)`
  @media (max-width: 768px) {
    width: 100% !important;
    margin-bottom: 8px !important;
    
    .ant-select-selector {
      height: 32px !important;
      padding: 0 11px !important;
      
      .ant-select-selection-item {
        line-height: 30px !important;
        font-size: 14px;
      }
    }
    
    &.ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
      padding: 0 11px;
    }
  }
`;

const ResponsivePagination = styled.div`
  @media (max-width: 768px) {
    .ant-pagination {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      
      .ant-pagination-item,
      .ant-pagination-prev,
      .ant-pagination-next {
        margin: 4px;
        min-width: 28px;
        height: 28px;
        line-height: 26px;
        
        a {
          padding: 0 4px;
        }
      }
      
      .ant-pagination-options {
        margin: 4px;
        
        .ant-select {
          width: 80px !important;
        }
      }
    }
  }
`;

const FilterContainer = styled.div`
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
    
    .ant-radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .ant-radio-button-wrapper {
        width: 100%;
        text-align: center;
        margin-right: 0;
        height: 32px;
        line-height: 30px;
        font-size: 14px;
        
        &:first-child {
          border-radius: 6px 6px 0 0;
        }
        
        &:last-child {
          border-radius: 0 0 6px 6px;
        }
      }
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

  @media (max-width: 768px) {
    .ant-modal-content {
      .ant-modal-body {
        padding: 12px;
        
        .ant-card {
          margin: 0;
          border-radius: 8px;
          
          .ant-card-body {
            padding: 12px;
          }
        }
      }
    }
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

  @media (max-width: 768px) {
    max-height: none;
    margin-bottom: 0;
  }
`;

const ContinueButton = styled(Button)`
  background-color: var(--dark-gold);
  border-color: var(--gold);
  color: white;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 16px;
  border-radius: 8px;
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  
  &:hover {
    background-color: var(--gold) !important;
    border-color: var(--dark-gold) !important;
    color: white !important;
  }

  @media (min-width: 769px) {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: auto;
    margin-top: 0;
    border-radius: 25px;
    padding: 0 25px;
    z-index: 1000;
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

  @media (max-width: 768px) {
    .ant-btn {
      .ant-btn-icon {
        margin-right: 0;
      }
      
      span:not(.anticon) {
        display: none;
      }
    }
  }
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

  @media (max-width: 768px) {
    margin-right: 0;
    width: 40px;
    height: 40px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .anticon {
      margin-right: 0;
    }
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
    tipo_evento?: {
      tipo_evento: string;
    };
    cliente?: {
      nombre_usuario: string;
      apellido_usuario: string;
    };
  };
  detalles?: DetalleAlquiler[];
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

interface DetalleCompra {
  id_elemento: number;
  elemento: Elemento;
  cantidad_compra: number;
  precio_unitario: number;
  total_compra: number;
}

const ScrollableContent = styled.div<{ hasSelection: boolean }>`
  position: relative;
  z-index: 1100;
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

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    
    .ant-space {
      width: 100%;
      flex-direction: column !important;
      
      .ant-space-item {
        width: 100%;
        margin-right: 0 !important;

        .ant-input-search {
          width: 100% !important;
        }

        .ant-select {
          width: 100% !important;
        }
      }
    }

    .ant-btn {
      width: 100%;
    }
  }
`;

const CompraModal = styled(Modal)`
  .ant-modal-content {
    @media (max-width: 768px) {
      margin: 10px;
      padding: 16px;
      
      .ant-modal-header {
        padding: 16px 0;
      }
      
      .ant-modal-body {
        padding: 0;
        max-height: calc(100vh - 200px);
        overflow-y: auto;
      }

      .ant-form {
        .ant-form-item {
          margin-bottom: 16px;
        }

        .ant-space {
          width: 100%;
          
          .ant-space-item {
            width: 100%;
            
            .ant-btn {
              width: 100%;
              margin-bottom: 8px;
            }
          }
        }
      }
    }
  }
`;

const RentEmployee: React.FC = () => {
  const [alquileres, setAlquileres] = useState<Alquiler[]>([]);
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [elementosSeleccionados, setElementosSeleccionados] = useState<ElementoSeleccionado[]>([]);
  const [showCatalogo, setShowCatalogo] = useState(false);
  const [showFormulario, setShowFormulario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [eventos, setEventos] = useState<Evento[]>([]);
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

  // Estados para compras
  const [compras, setCompras] = useState<Compra[]>([]);
  const [searchCompra, setSearchCompra] = useState('');
  const [filterCompraEstado, setFilterCompraEstado] = useState<string | null>(null);
  const [loadingCompra, setLoadingCompra] = useState(false);
  const [editingCompra, setEditingCompra] = useState<Compra | null>(null);
  const [showCompraModal, setShowCompraModal] = useState(false);
  const [compraForm] = Form.useForm();
  const [showViewCompraModal, setShowViewCompraModal] = useState(false);
  const [viewingCompra, setViewingCompra] = useState<Compra | null>(null);
  const [showEditCompraModal, setShowEditCompraModal] = useState(false);
  const [loadingCompraSubmit, setLoadingCompraSubmit] = useState(false);
  const [proveedores, setProveedores] = useState<any[]>([]);

  useEffect(() => {
    fetchAlquileres();
    fetchElementos();
    fetchEventos();
    fetchCategorias();
    fetchMateriales();
    fetchColores();
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
        },
        params: {
          includeCliente: true,
          includeTipoEvento: true
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
        // Filtrar solo proveedores activos y ordenar por nombre
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

      // Asegurarse de que id_evento sea un número
      const id_evento = Number(values.id_evento);
      if (isNaN(id_evento)) {
        message.error('ID de evento inválido');
        return;
      }

      const alquilerData = {
        id_evento: id_evento,
        detalles: elementosSeleccionados.map(elemento => ({
          id_elemento: elemento.id_elemento,
          cantidad_alquiler: elemento.cantidad_seleccionada,
          precio_unitario: elemento.precio_elemento
        }))
      };

      console.log('Enviando datos de alquiler:', alquilerData);

      const response = await axios.post(`${apiUrl}/alquiler`, alquilerData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201) {
        message.success('Alquiler creado exitosamente');
        setShowFormulario(false);
        setElementosSeleccionados([]);
        form.resetFields();
        fetchAlquileres();
      }
    } catch (error) {
      console.error('Error al crear el alquiler:', error);
      if (axios.isAxiosError(error)) {
        message.error(`Error: ${error.response?.data?.mensaje || 'Error al crear el alquiler'}`);
      } else {
        message.error('Error al crear el alquiler');
      }
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

  const alquilerColumns: ColumnType<Alquiler>[] = [
    {
      title: 'ID',
      dataIndex: 'id_alquiler',
      key: 'id_alquiler',
      width: 80,
    },
    {
      title: 'Evento',
      dataIndex: ['evento', 'id_evento'],
      key: 'evento',
      width: 300,
      render: (_: any, record: Alquiler) => {
        const evento = eventos.find(e => e.id_evento === record.evento?.id_evento);
        return evento ? (
          <span>
            ID: {evento.id_evento} - {evento.nombre_evento}
            {evento.tipo_evento && (
              <div style={{ fontSize: '0.85em', color: 'rgba(0, 0, 0, 0.45)' }}>
                {evento.tipo_evento.tipo_evento}
              </div>
            )}
            {evento.cliente && (
              <div style={{ fontSize: '0.85em', color: 'rgba(0, 0, 0, 0.45)' }}>
                Cliente: {evento.cliente.nombre_usuario} {evento.cliente.apellido_usuario}
              </div>
            )}
          </span>
        ) : (
          <span>Evento no encontrado</span>
        );
      },
    },
    {
      title: 'Estado',
      dataIndex: 'estado_alquiler',
      key: 'estado_alquiler',
      width: 120,
      render: (estado: string) => (
        <Tag color={
          estado === 'Solicitado' ? 'processing' :
          estado === 'Aceptado' ? 'warning' :
          estado === 'Completado' ? 'success' : 'error'
        }>
          {estado}
        </Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total_alquiler',
      key: 'total_alquiler',
      width: 120,
      render: (total: number) => `$${Number(total).toFixed(2)}`,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 150,
      render: (_: any, record: Alquiler) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={record.estado_alquiler === 'Completado'}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            disabled={record.estado_alquiler === 'Completado' || record.estado_alquiler === 'Cancelado'}
          />
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
  const elementColumns: ColumnType<Elemento>[] = [
    {
      title: 'ID',
      dataIndex: 'id_elemento',
      key: 'id_elemento',
      responsive: ['md' as Breakpoint],
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
      responsive: ['md' as Breakpoint],
    },
    {
      title: 'Precio',
      dataIndex: 'precio_elemento',
      key: 'precio_elemento',
      render: (precio: number) => `$${Number(precio).toFixed(2)}`,
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
      fixed: 'left',
      render: (_: any, record: Elemento) => (
        <ActionButtons>
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
        </ActionButtons>
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

  // Función para filtrar compras
  const handleFilterCompras = (compras: Compra[]) => {
    return compras.filter(compra => {
      const searchLower = searchCompra ? searchCompra.toLowerCase() : '';
      return !searchCompra ||
        compra.id_compra.toString().includes(searchLower) ||
        (compra.proveedor?.nombre_proveedor || '').toLowerCase().includes(searchLower);
    });
  };

  // Actualizar las columnas de la tabla de compras
  const compraColumns: ColumnType<Compra>[] = [
    {
      title: 'ID',
      dataIndex: 'id_compra',
      key: 'id_compra',
      responsive: ['md' as Breakpoint],
      sorter: (a: Compra, b: Compra) => a.id_compra - b.id_compra,
    },
    {
      title: 'Proveedor',
      dataIndex: ['proveedor', 'nombre_proveedor'],
      key: 'proveedor',
      responsive: ['md' as Breakpoint],
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
      title: 'Total',
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
        else if (estado === 'Pendiente') color = 'processing';
        return <Tag color={color}>{estado}</Tag>;
      },
      filters: [
        { text: 'Pendiente', value: 'Pendiente' },
        { text: 'Completada', value: 'Completada' },
        { text: 'Cancelada', value: 'Cancelada' }
      ],
      onFilter: (value: any, record: Compra) => record.estado_compra === value,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'left',
      render: (_: any, record: Compra) => (
        <ActionButtons>
          <Tooltip title="Ver compra">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewCompra(record)}
            />
          </Tooltip>
              <Tooltip title="Editar compra">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditCompra(record)}
                />
              </Tooltip>
          {record.estado_compra !== 'Cancelada' && (
              <Tooltip title="Cancelar compra">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleCancelarCompra(record)}
                />
              </Tooltip>
          )}
        </ActionButtons>
      ),
    },
  ];

  // Función para manejar la cancelación de una compra
  const handleCancelarCompra = async (record: Compra) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      // Obtener los detalles actuales de la compra
      const detallesResponse = await axios.get(`${apiUrl}/compra/${record.id_compra}/detalles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      Modal.confirm({
        title: '¿Estás seguro de cancelar esta compra?',
        content: 'Esta acción no se puede deshacer',
        okText: 'Sí, cancelar',
        cancelText: 'No',
        onOk: async () => {
          try {
            // Preparar los datos manteniendo toda la información original
            const updateData = {
              id_proveedor: record.id_proveedor,
              fecha_compra: record.fecha_compra,
              hora_compra: record.hora_compra,
              costo_compra: record.costo_compra,
              estado_compra: 'Cancelada',
              detalles: detallesResponse.data.map((detalle: any) => ({
                id_elemento: detalle.id_elemento,
                cantidad_compra: detalle.cantidad_compra,
                precio_unitario: detalle.precio_unitario,
                precio_total: detalle.cantidad_compra * detalle.precio_unitario
              }))
            };

            await axios.put(
              `${apiUrl}/compra/${record.id_compra}`,
              updateData,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            message.success('Compra cancelada exitosamente');
            fetchCompras();
          } catch (error) {
            console.error('Error al cancelar la compra:', error);
            message.error('Error al cancelar la compra');
          }
        }
      });
    } catch (error) {
      console.error('Error al cancelar la compra:', error);
      message.error('Error al cancelar la compra');
    }
  };

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

      // Asegurarse de que los números sean válidos
      const detalles = response.data.map((detalle: any) => ({
        ...detalle,
        cantidad_compra: Number(detalle.cantidad_compra || 0),
        precio_unitario: Number(detalle.precio_unitario || 0),
        total_compra: Number((detalle.cantidad_compra || 0) * (detalle.precio_unitario || 0))
      }));

      // Calcular el total general
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

  // Función para editar una compra
  const handleEditCompra = async (record: Compra) => {
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

      // Formatear los detalles para el formulario
      const detalles = response.data.map((detalle: any) => ({
        id_elemento: detalle.id_elemento,
        cantidad_compra: Number(detalle.cantidad_compra),
        precio_unitario: Number(detalle.precio_unitario)
      }));

      // Calcular el costo total
      const costoTotal = detalles.reduce((sum: number, detalle: any) => 
        sum + (detalle.cantidad_compra * detalle.precio_unitario), 0
      );

      setEditingCompra({
        ...record,
        detalles: response.data
      });
      
      // Establecer los valores iniciales en el formulario
      compraForm.setFieldsValue({
        id_proveedor: record.id_proveedor,
        estado_compra: record.estado_compra,
        costo_compra: Number(costoTotal.toFixed(2)),
        detalles: detalles // Establecer los detalles en el formulario
      });
      
      setShowCompraModal(true);
    } catch (error) {
      console.error('Error al obtener detalles de la compra:', error);
      message.error('Error al cargar los detalles de la compra');
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoadingCompraSubmit(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      console.log('Valores del formulario:', values);

      // Validar el proveedor
      if (!values.id_proveedor) {
        message.error('Por favor seleccione un proveedor');
        return;
      }

      // Validar que haya detalles
      if (!values.detalles || values.detalles.length === 0) {
        message.error('Debe agregar al menos un elemento a la compra');
        return;
      }

      // Validar y formatear los detalles
      const detallesValidados = values.detalles.map((detalle: {
        id_elemento: number;
        cantidad_compra: number;
        precio_unitario: number;
      }) => {
        // Asegurarse de que todos los campos necesarios existan
        if (!detalle.id_elemento || !detalle.cantidad_compra || !detalle.precio_unitario) {
          throw new Error('Todos los campos de los elementos son requeridos');
        }
        
        // Convertir a números y validar
        const cantidad = Number(detalle.cantidad_compra);
        const precio = Number(detalle.precio_unitario);
        const total = Number((cantidad * precio).toFixed(2));
        
        if (isNaN(cantidad) || cantidad <= 0) {
          throw new Error('La cantidad debe ser un número mayor a 0');
        }
        if (isNaN(precio) || precio <= 0) {
          throw new Error('El precio debe ser un número mayor a 0');
        }

        return {
          id_elemento: Number(detalle.id_elemento),
          cantidad_compra: cantidad,
          precio_unitario: precio,
          precio_total: total
        };
      });

      // Calcular el costo total
      const costoTotal = detallesValidados.reduce((sum: number, detalle: DetalleCompraData) => 
        sum + (detalle.precio_total || detalle.total_compra), 0
      );

      // Preparar los datos para enviar
      const compraData = {
        id_proveedor: Number(values.id_proveedor),
        fecha_compra: editingCompra ? editingCompra.fecha_compra : dayjs().format('YYYY-MM-DD'),
        hora_compra: editingCompra ? editingCompra.hora_compra : dayjs().format('HH:mm:ss'),
        costo_compra: Number(costoTotal.toFixed(2)),
        estado_compra: values.estado_compra || 'Completada',
        detalles: detallesValidados
      };

      console.log('Datos a enviar:', compraData);

      try {
        let response;
        if (editingCompra) {
          // Si estamos editando, hacer un PUT para actualizar la compra y sus detalles
          response = await axios.put(
            `${apiUrl}/compra/${editingCompra.id_compra}`,
            compraData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          message.success('Compra actualizada exitosamente');
        } else {
          // Si estamos creando, hacer un POST
          response = await axios.post(
          `${apiUrl}/compra`,
          compraData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
          message.success('Compra creada exitosamente');
        }

        if (response.data) {
          setShowCompraModal(false);
          setEditingCompra(null);
          compraForm.resetFields();
          fetchCompras();
        }
      } catch (error: any) {
        console.error('Error en la petición HTTP:', error);
        if (error.response?.data?.mensaje) {
          message.error(`Error del servidor: ${error.response.data.mensaje}`);
        } else if (error.message) {
          message.error(`Error: ${error.message}`);
        } else {
          message.error(editingCompra ? 'Error al actualizar la compra' : 'Error al crear la compra');
        }
      }
    } catch (error: any) {
      console.error('Error al procesar la compra:', error);
      if (!error.isAxiosError) {
        message.error(error.message);
      }
    } finally {
      setLoadingCompraSubmit(false);
    }
  };

  const handleCategoriaChange = (value: string) => {
    setFilterElementCategoria(value);
  };

  const handleEstadoChange = (value: string) => {
    setFilterElementEstado(value);
  };

  const handleEventoChange = (value: string) => {
    setFilterEvento(value);
  };

  const handleEstadoAlquilerChange = (value: string) => {
    setFilterEstado(value);
  };

  return (
    <>

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
            <Descriptions.Item label="Evento">
              ID: {viewingAlquiler.evento?.id_evento} - {viewingAlquiler.evento?.nombre_evento}
              {viewingAlquiler.evento?.tipo_evento && (
                <div style={{ fontSize: '0.85em', color: 'rgba(0, 0, 0, 0.45)' }}>
                  Tipo: {viewingAlquiler.evento.tipo_evento.tipo_evento}
                </div>
              )}
              {viewingAlquiler.evento?.cliente && (
                <div style={{ fontSize: '0.85em', color: 'rgba(0, 0, 0, 0.45)' }}>
                  Cliente: {viewingAlquiler.evento.cliente.nombre_usuario} {viewingAlquiler.evento.cliente.apellido_usuario}
                </div>
              )}
            </Descriptions.Item>
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

      {/* Tabla de Alquileres */}
      <StyledCard
        title="Gestión de Alquileres"
        extra={
          <ResponsiveSpace>
            <StyledSearch
              placeholder="Buscar alquileres..."
              onChange={(e) => setSearchAlquiler(e.target.value)}
              style={{ width: 200 }}
            />
            <StyledSelect
              style={{ width: 300 }}
              placeholder="Filtrar por evento"
              allowClear
              value={filterEvento || undefined}
              onChange={(value: unknown) => handleEventoChange(value as string)}
              showSearch
              optionFilterProp="children"
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ minWidth: '300px' }}
            >
              {eventos.map((evento: Evento) => (
                <Option key={evento.id_evento} value={evento.id_evento.toString()}>
                  ID: {evento.id_evento} - {evento.nombre_evento}
                  {evento.tipo_evento && ` (${evento.tipo_evento.tipo_evento})`}
                  {evento.cliente && ` - ${evento.cliente.nombre_usuario} ${evento.cliente.apellido_usuario}`}
                </Option>
              ))}
            </StyledSelect>
            <StyledSelect
              style={{ width: 150 }}
              placeholder="Filtrar por estado"
              allowClear
              value={filterEstado || undefined}
              onChange={(value: unknown) => handleEstadoAlquilerChange(value as string)}
            >
              <Option value="Solicitado">Solicitado</Option>
              <Option value="Aceptado">Aceptado</Option>
              <Option value="Completado">Completado</Option>
              <Option value="Cancelado">Cancelado</Option>
            </StyledSelect>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setElementosSeleccionados([]);
                setShowCatalogo(true);
              }}
            >
              Nuevo Alquiler
            </Button>
            <Button
              onClick={fetchAlquileres}
              icon={<ReloadOutlined />}
            >
              Recargar
            </Button>
          </ResponsiveSpace>
        }
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <Table<Alquiler>
            columns={alquilerColumns}
            dataSource={filteredAlquileres}
            loading={loading}
            rowKey="id_alquiler"
            scroll={{ x: 1000 }}
            pagination={{
              total: filteredAlquileres.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} registros`,
              position: ['bottomLeft']
            }}
            style={{ minWidth: '800px' }}
          />
        </div>
      </StyledCard>

      {/* Tabla de Compras */}
      <StyledCard
        title="Gestión de Compras"
        extra={
          <ResponsiveSpace>
            <StyledSearch
              placeholder="Buscar por ID o proveedor..."
              allowClear
              value={searchCompra}
              onChange={(e) => setSearchCompra(e.target.value)}
              style={{ width: 200 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ backgroundColor: 'var(--dark-gold)', borderColor: 'var(--dark-gold)' }}
              onClick={() => {
                setEditingCompra(null);
                compraForm.resetFields();
                setShowCompraModal(true);
              }}
            >
              Nueva Compra
            </Button>
            <Button
              onClick={fetchCompras}
              icon={<ReloadOutlined />}
            >
              Recargar
            </Button>
          </ResponsiveSpace>
        }
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <Table<Compra>
            columns={compraColumns}
            dataSource={handleFilterCompras(compras)}
            loading={loadingCompra}
            rowKey="id_compra"
            scroll={{ x: 1000 }}
            pagination={{
              total: compras.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} registros`,
              position: ['bottomLeft']
            }}
            style={{ minWidth: '800px' }}
          />
        </div>
      </StyledCard>

      {/* Modal de Crear/Editar Compra */}
      <CompraModal
        title={editingCompra ? "Editar Compra" : "Nueva Compra"}
        open={showCompraModal}
        onCancel={() => {
          setShowCompraModal(false);
          setEditingCompra(null);
          compraForm.resetFields();
        }}
        footer={null}
        width="100%"
        style={{ 
          maxWidth: '800px',
          top: 20
        }}
      >
        <Form
          form={compraForm}
          layout="vertical"
          onFinish={onFinish}
          style={{ width: '100%' }}
        >
          <Form.Item
            name="id_proveedor"
            label="Proveedor"
            rules={[{ required: true, message: 'Por favor seleccione un proveedor' }]}
            style={{ width: '100%' }}
          >
            <Select placeholder="Seleccione un proveedor" style={{ width: '100%' }}>
              {proveedores.map((proveedor: any) => (
                <Option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                  {proveedor.nombre_proveedor}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.List name="detalles">
            {(fields, { add, remove }) => (
              <div style={{ width: '100%' }}>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'id_elemento']}
                      rules={[{ required: true, message: 'Seleccione un elemento' }]}
                      style={{ width: '100%' }}
                    >
                      <Select placeholder="Seleccione un elemento" style={{ width: '100%' }}>
                        {elementos.map((elemento: Elemento) => (
                          <Option key={elemento.id_elemento} value={elemento.id_elemento}>
                            {elemento.nombre_elemento}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    
                    <Space style={{ width: '100%', gap: 8 }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'cantidad_compra']}
                        rules={[{ required: true, message: 'Ingrese cantidad' }]}
                        style={{ flex: 1 }}
                      >
                        <InputNumber 
                          min={1} 
                          placeholder="Cantidad"
                          style={{ width: '100%' }}
                          onChange={(value) => {
                            const values = compraForm.getFieldsValue();
                            if (values.detalles) {
                              const detalles = values.detalles.map((detalle: DetalleCompraForm) => ({
                                ...detalle,
                                total_compra: detalle.cantidad_compra * detalle.precio_unitario
                              }));
                              const total = detalles.reduce((sum: number, detalle: any) => 
                                sum + (detalle.total_compra || 0), 0
                              );
                              compraForm.setFieldsValue({ 
                                costo_compra: Number(total.toFixed(2)),
                                detalles: detalles
                              });
                            }
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'precio_unitario']}
                        rules={[{ required: true, message: 'Ingrese precio' }]}
                        style={{ flex: 1 }}
                      >
                        <InputNumber
                          min={0.01}
                          step={0.01}
                          placeholder="Precio unitario"
                          style={{ width: '100%' }}
                          onChange={(value) => {
                            const values = compraForm.getFieldsValue();
                            if (values.detalles) {
                              const detalles = values.detalles.map((detalle: DetalleCompraForm) => ({
                                ...detalle,
                                total_compra: detalle.cantidad_compra * detalle.precio_unitario
                              }));
                              const total = detalles.reduce((sum: number, detalle: any) => 
                                sum + (detalle.total_compra || 0), 0
                              );
                              compraForm.setFieldsValue({ 
                                costo_compra: Number(total.toFixed(2)),
                                detalles: detalles
                              });
                            }
                          }}
                        />
                      </Form.Item>

                      <Button type="link" danger onClick={() => remove(name)} style={{ padding: 0 }}>
                        <DeleteOutlined />
                      </Button>
                    </Space>
                  </Space>
                ))}
                <Form.Item style={{ marginTop: 16 }}>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Agregar Elemento
                  </Button>
                </Form.Item>
              </div>
            )}
          </Form.List>

          {editingCompra && (
            <Form.Item
              name="estado_compra"
              label="Estado"
              rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
              style={{ width: '100%' }}
            >
              <Select style={{ width: '100%' }}>
                <Option value="Completada">Completada</Option>
                <Option value="Cancelada">Cancelada</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end', flexDirection: 'column' }}>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loadingCompraSubmit}
                style={{ 
                  backgroundColor: 'var(--dark-gold)', 
                  borderColor: 'var(--dark-gold)',
                  width: '100%'
                }}
              >
                {editingCompra ? 'Actualizar' : 'Crear'}
              </Button>
              <Button 
                onClick={() => {
                  setShowCompraModal(false);
                  compraForm.resetFields();
                }}
                style={{ width: '100%' }}
              >
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </CompraModal>

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
          <Space direction="horizontal" size={16} style={{ width: 'auto' }}>
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
          <ResetButton onClick={handleReset} icon={<ReloadOutlined />}>
            Resetear Filtros
          </ResetButton>
        </CatalogHeader>

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
            <Select style={{ width: '100%' }}>
              {eventos.map((evento: Evento) => (
                <Option key={evento.id_evento} value={evento.id_evento}>
                  ID: {evento.id_evento} - {evento.nombre_evento}
                  {evento.tipo_evento && ` (${evento.tipo_evento.tipo_evento})`}
                  {evento.cliente && ` - ${evento.cliente.nombre_usuario} ${evento.cliente.apellido_usuario}`}
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
                    viewingCompra.estado_compra === 'Cancelada' ? 'error' : 'processing'
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