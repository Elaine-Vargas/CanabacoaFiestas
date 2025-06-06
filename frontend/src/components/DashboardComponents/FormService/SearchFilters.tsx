import React from 'react';
import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import '../../../styles/dashboard/DashboardForms.scss';

interface SearchFiltersProps {
  onSearch: (value: string) => void;
  onEstadoChange?: (value: string) => void;
  onRolChange?: (value: string) => void;
  onClienteChange?: (value: string) => void;
  onAsesorChange?: (value: string) => void;
  onTipoChange?: (value: string) => void;
  onEventoChange?: (value: string) => void;
  onCargoChange?: (value: string) => void;
  roles?: { value: string; label: string }[];
  clientes?: { value: string; label: string }[];
  asesores?: { value: string; label: string }[];
  tipos?: { value: string; label: string }[];
  eventos?: { value: string; label: string }[];
  cargos?: { value: string; label: string }[];
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  onSearch,
  onEstadoChange,
  onRolChange,
  onClienteChange,
  onAsesorChange,
  onTipoChange,
  onEventoChange,
  onCargoChange,
  roles,
  clientes,
  asesores,
  tipos,
  eventos,
  cargos
}) => {
  return (
    <div className="search-filters">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input.Search
          placeholder="Buscar..."
          onSearch={onSearch}
          style={{ width: '100%' }}
        />
        <Space wrap>
          {onEstadoChange && (
            <Select
              defaultValue="todos"
              style={{ width: 120 }}
              onChange={onEstadoChange}
              options={[
                { value: 'todos', label: 'Todos' },
                { value: 'Activo', label: 'Activo' },
                { value: 'Inactivo', label: 'Inactivo' },
                { value: 'Eliminado', label: 'Eliminado' }
              ]}
            />
          )}
          {onRolChange && roles && (
            <Select
              placeholder="Filtrar por rol"
              style={{ width: 150 }}
              onChange={onRolChange}
              options={roles}
            />
          )}
          {onClienteChange && clientes && (
            <Select
              placeholder="Filtrar por cliente"
              style={{ width: 200 }}
              onChange={onClienteChange}
              options={clientes}
            />
          )}
          {onAsesorChange && asesores && (
            <Select
              placeholder="Filtrar por asesor"
              style={{ width: 200 }}
              onChange={onAsesorChange}
              options={asesores}
            />
          )}
          {onTipoChange && tipos && (
            <Select
              placeholder="Filtrar por tipo"
              style={{ width: 150 }}
              onChange={onTipoChange}
              options={tipos}
            />
          )}
          {onEventoChange && eventos && (
            <Select
              placeholder="Filtrar por evento"
              style={{ width: 200 }}
              onChange={onEventoChange}
              options={eventos}
            />
          )}
          {onCargoChange && cargos && (
            <Select
              placeholder="Filtrar por cargo"
              style={{ width: 150 }}
              onChange={onCargoChange}
              options={cargos}
            />
          )}
        </Space>
      </Space>
    </div>
  );
};

export default SearchFilters; 