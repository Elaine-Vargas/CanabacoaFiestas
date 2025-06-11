import React, { useState, useEffect } from 'react';
import { Input, Button, Dropdown, Space } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

interface TableFiltersProps {
  type: string;
  searchText: string;
  onSearchChange: (value: string) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
  filterContent: React.ReactNode;
}

const TableFilters: React.FC<TableFiltersProps> = React.memo(({
  type,
  searchText,
  onSearchChange,
  clearFilters,
  activeFiltersCount,
  filterContent
}) => {
  const [searchValue, setSearchValue] = useState(searchText);

  // Sincronizar el valor cuando cambia desde fuera
  useEffect(() => {
    setSearchValue(searchText);
  }, [searchText]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange(value);
  };

  const handleClear = () => {
    setSearchValue('');
    clearFilters();
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'eventos': return 'Buscar eventos...';
      case 'usuarios': return 'Buscar usuarios...';
      case 'proveedores': return 'Buscar proveedores...';
      case 'asignaciones': return 'Buscar asignaciones...';
      case 'decoraciones': return 'Buscar decoraciones...';
      default: return 'Buscar...';
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <Space>
        <Input
          placeholder={getPlaceholder()}
          prefix={<SearchOutlined />}
          value={searchValue}
          onChange={handleSearch}
          allowClear
          onClear={handleClear}
          style={{ width: 200 }}
        />
        <Dropdown
        dropdownRender={() => filterContent}
        trigger={['click']}
        placement="bottomRight"
        >
            <Button icon={<FilterOutlined />}>
            Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
            </Dropdown>
        {activeFiltersCount > 0 && (
          <Button type="link" onClick={handleClear}>
            Limpiar filtros
          </Button>
        )}
      </Space>
    </div>
  );
});

export default TableFilters;