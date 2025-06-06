import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import '../../../styles/dashboard/DashboardForms.scss';

interface Provincia {
  id_provincia: number;
  nombre_provincia: string;
}

interface Ciudad {
  id_ciudad: number;
  nombre_ciudad: string;
  id_provincia: number;
}

interface ProveedorFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
}

const ProveedorForm: React.FC<ProveedorFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState<Ciudad[]>([]);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingCiudades, setLoadingCiudades] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchProvincias();
      fetchCiudades();
    }
  }, [visible]);

  const fetchProvincias = async () => {
    try {
      setLoadingProvincias(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/provincias`);
      if (!response.ok) {
        throw new Error('Error al cargar las provincias');
      }
      const data = await response.json();
      setProvincias(data);
    } catch (error) {
      console.error('Error al cargar provincias:', error);
    } finally {
      setLoadingProvincias(false);
    }
  };

  const fetchCiudades = async () => {
    try {
      setLoadingCiudades(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ciudades`);
      if (!response.ok) {
        throw new Error('Error al cargar las ciudades');
      }
      const data = await response.json();
      setCiudades(data);
      setCiudadesFiltradas(data);
    } catch (error) {
      console.error('Error al cargar ciudades:', error);
    } finally {
      setLoadingCiudades(false);
    }
  };

  const handleProvinciaChange = (value: number) => {
    const ciudadesFiltradas = ciudades.filter(ciudad => ciudad.id_provincia === value);
    setCiudadesFiltradas(ciudadesFiltradas);
    form.setFieldsValue({ id_ciudad: undefined });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Error al validar el formulario:', error);
    }
  };

  return (
    <Modal
      title="Nuevo Proveedor"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} className="cancel-button">
          Cancelar
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
          className="submit-button"
        >
          Crear Proveedor
        </Button>
      ]}
      width={600}
      className="dashboard-modal"
    >
      <Form
        form={form}
        layout="vertical"
        className="dashboard-form"
      >
        <Form.Item
          name="tipo_proveedor"
          label="Tipo de Proveedor"
          rules={[{ required: true, message: 'Por favor seleccione el tipo de proveedor' }]}
        >
          <Select placeholder="Seleccione el tipo de proveedor">
            <Select.Option value="Catering">Catering</Select.Option>
            <Select.Option value="Elementos">Elementos</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="nombre_proveedor"
          label="Nombre del Proveedor"
          rules={[
            { required: true, message: 'Por favor ingrese el nombre del proveedor' },
            { max: 50, message: 'El nombre no puede exceder los 50 caracteres' }
          ]}
        >
          <Input placeholder="Ingrese el nombre del proveedor" maxLength={50} />
        </Form.Item>

        <Form.Item
          name="tel_proveedor"
          label="Teléfono"
          rules={[
            { required: true, message: 'Por favor ingrese el teléfono' },
            { pattern: /^\d{10}$/, message: 'El teléfono debe tener 10 dígitos' }
          ]}
        >
          <Input placeholder="Ingrese el teléfono" maxLength={10} />
        </Form.Item>

        <Form.Item
          name="correo_proveedor"
          label="Correo Electrónico"
          rules={[
            { required: true, message: 'Por favor ingrese el correo electrónico' },
            { type: 'email', message: 'Por favor ingrese un correo electrónico válido' },
            { max: 100, message: 'El correo no puede exceder los 100 caracteres' }
          ]}
        >
          <Input placeholder="Ingrese el correo electrónico" maxLength={100} />
        </Form.Item>

        <Form.Item
          name="id_provincia"
          label="Provincia"
          rules={[{ required: true, message: 'Por favor seleccione la provincia' }]}
        >
          <Select
            placeholder="Seleccione la provincia"
            loading={loadingProvincias}
            onChange={handleProvinciaChange}
          >
            {provincias.map(provincia => (
              <Select.Option key={provincia.id_provincia} value={provincia.id_provincia}>
                {provincia.nombre_provincia}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="id_ciudad"
          label="Ciudad"
          rules={[{ required: true, message: 'Por favor seleccione la ciudad' }]}
        >
          <Select
            placeholder="Seleccione la ciudad"
            loading={loadingCiudades}
            disabled={!form.getFieldValue('id_provincia')}
          >
            {ciudadesFiltradas.map(ciudad => (
              <Select.Option key={ciudad.id_ciudad} value={ciudad.id_ciudad}>
                {ciudad.nombre_ciudad}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="sector"
          label="Sector"
          rules={[
            { required: true, message: 'Por favor ingrese el sector' },
            { max: 50, message: 'El sector no puede exceder los 50 caracteres' }
          ]}
        >
          <Input placeholder="Ingrese el sector" maxLength={50} />
        </Form.Item>

        <Form.Item
          name="calle"
          label="Calle"
          rules={[
            { required: true, message: 'Por favor ingrese la calle' },
            { max: 50, message: 'La calle no puede exceder los 50 caracteres' }
          ]}
        >
          <Input placeholder="Ingrese la calle" maxLength={50} />
        </Form.Item>

        <Form.Item
          name="detalles"
          label="Detalles de la Dirección"
        >
          <Input.TextArea 
            rows={2} 
            placeholder="Ingrese detalles adicionales de la dirección" 
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          name="estado_proveedor"
          label="Estado"
          initialValue="Activo"
        >
          <Select>
            <Select.Option value="Activo">Activo</Select.Option>
            <Select.Option value="Inactivo">Inactivo</Select.Option>
            <Select.Option value="Eliminado">Eliminado</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProveedorForm; 