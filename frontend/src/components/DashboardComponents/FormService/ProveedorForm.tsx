import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import '../../../styles/dashboard/DashboardForms.scss';
import { validateEmail, validatePhoneNumber, formatPhoneNumber } from '../../../utils/validation';

interface Provincia {
  id_provincia: number;
  nombre_provincia: string;
}

interface Ciudad {
  id_ciudad: number;
  nombre_ciudad: string;
  id_provincia: number;
}

interface Proveedor {
  id_proveedor: number;
  tipo_proveedor: string;
  nombre_proveedor: string;
  tel_proveedor: string;
  correo_proveedor: string;
  id_direccion: number;
}

interface ProveedorFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
  initialValues?: Proveedor | null;
}

const ProveedorForm: React.FC<ProveedorFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
  initialValues,
}) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [form] = Form.useForm();
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState<Ciudad[]>([]);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
      if (initialValues.id_provincia) {
        handleProvinciaChange(initialValues.id_provincia);
      }
    }
  }, [visible, initialValues, form]);

  useEffect(() => {
    if (visible) {
      fetchProvincias();
      fetchCiudades();
    }
  }, [visible]);

  const fetchProvincias = async () => {
    try {
      setLoadingProvincias(true);
      const response = await fetch(`${apiUrl}/direccion/provincias`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar las provincias');
      }
      const data = await response.json();
      setProvincias(data);
    } catch (error) {
      console.error('Error al cargar provincias:', error);
      message.error('Error al cargar las provincias');
    } finally {
      setLoadingProvincias(false);
    }
  };

  const fetchCiudades = async () => {
    try {
      setLoadingCiudades(true);
      const response = await fetch(`${apiUrl}/direccion/ciudades`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar las ciudades');
      }
      const data = await response.json();
      setCiudades(data);
      setCiudadesFiltradas(data);
    } catch (error) {
      console.error('Error al cargar ciudades:', error);
      message.error('Error al cargar las ciudades');
    } finally {
      setLoadingCiudades(false);
    }
  };

  const handleProvinciaChange = (value: number) => {
    const ciudadesFiltradas = ciudades.filter(ciudad => ciudad.id_provincia === value);
    setCiudadesFiltradas(ciudadesFiltradas);
    form.setFieldsValue({ id_ciudad: undefined });
  };

  const formatTelefono = (value: string) => {
    // Eliminar todos los caracteres no numéricos
    const numbers = value.replace(/\D/g, '');
    // Aplicar formato XXX-XXX-XXXX
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatTelefono(e.target.value);
    form.setFieldValue('telefono_proveedor', formattedValue);
  };

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      // Preparar los datos de la dirección
      const direccionData = {
        id_provincia: values.id_provincia,
        id_ciudad: values.id_ciudad,
        sector: values.sector,
        calle: values.calle,
        detalles: values.detalles || null
      };

      let id_direccion;

      if (initialValues) {
        // Si estamos editando, actualizamos la dirección existente
        const direccionResponse = await fetch(`${apiUrl}/direccion/${initialValues.id_direccion}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(direccionData)
        });

        if (!direccionResponse.ok) {
          const errorData = await direccionResponse.json();
          throw new Error(errorData.mensaje || 'Error al actualizar la dirección');
        }

        id_direccion = initialValues.id_direccion;
      } else {
        // Si estamos creando, insertamos una nueva dirección
        const direccionResponse = await fetch(`${apiUrl}/direccion`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(direccionData)
        });

        if (!direccionResponse.ok) {
          const errorData = await direccionResponse.json();
          throw new Error(errorData.mensaje || 'Error al crear la dirección');
        }

        const direccionResult = await direccionResponse.json();
        id_direccion = direccionResult.id_direccion;
      }

      // Preparar los datos del proveedor
      const proveedorData = {
        tipo_proveedor: values.tipo_proveedor,
        nombre_proveedor: values.nombre_proveedor,
        tel_proveedor: values.telefono_proveedor,
        correo_proveedor: values.correo_proveedor,
        id_direccion: id_direccion
      };

      let proveedorResponse;
      if (initialValues) {
        // Si estamos editando, actualizamos el proveedor existente
        proveedorResponse = await fetch(`${apiUrl}/proveedor/${initialValues.id_proveedor}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(proveedorData)
        });
      } else {
        // Si estamos creando, insertamos un nuevo proveedor
        proveedorResponse = await fetch(`${apiUrl}/proveedor`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(proveedorData)
        });
      }

      if (!proveedorResponse.ok) {
        const errorData = await proveedorResponse.json();
        throw new Error(errorData.mensaje || `Error al ${initialValues ? 'actualizar' : 'crear'} el proveedor`);
      }

      const data = await proveedorResponse.json();
      message.success(`Proveedor ${initialValues ? 'actualizado' : 'creado'} exitosamente`);
      onSubmit(data.proveedor);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error(`Error al ${initialValues ? 'actualizar' : 'crear'} proveedor:`, error);
      message.error(error instanceof Error ? error.message : `Error al ${initialValues ? 'actualizar' : 'crear'} el proveedor`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={initialValues ? "Editar Proveedor" : "Crear Nuevo Proveedor"}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="proveedor-form"
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
            { max: 50, message: 'El nombre no puede exceder los 50 caracteres' },
            { 
              pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
              message: 'El nombre solo puede contener letras y espacios'
            }
          ]}
        >
          <Input placeholder="Ingrese el nombre del proveedor" maxLength={50} />
        </Form.Item>

        <Form.Item
          name="telefono_proveedor"
          label="Teléfono"
          rules={[
            { required: true, message: 'Por favor ingrese el teléfono' },
            { pattern: /^\d{3}-\d{3}-\d{4}$/, message: 'Formato de teléfono inválido (XXX-XXX-XXXX)' }
          ]}
        >
          <Input 
            placeholder="XXX-XXX-XXXX" 
            maxLength={12}
            onChange={handleTelefonoChange}
          />
        </Form.Item>

        <Form.Item
          name="correo_proveedor"
          label="Correo Electronico"
          rules={[
            { required: true, message: 'Por favor ingrese el correo electronico' },
            { validator: (_, value) => {
              const error = validateEmail(value);
              return error ? Promise.reject(error) : Promise.resolve();
            }},
            { max: 100, message: 'El correo no puede exceder los 100 caracteres' }
          ]}
        >
          <Input placeholder="Ingrese el correo electronico" maxLength={100} />
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
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              if (typeof option?.children === 'string') {
                return (option.children as string).toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
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
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              if (typeof option?.children === 'string') {
                return (option.children as string).toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
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
            { max: 50, message: 'El sector no puede exceder los 50 caracteres' },
            {
              pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/,
              message: 'El sector solo puede contener letras, números y espacios'
            }
          ]}
        >
          <Input placeholder="Ingrese el sector" maxLength={50} />
        </Form.Item>

        <Form.Item
          name="calle"
          label="Calle"
          rules={[
            { required: true, message: 'Por favor ingrese la calle' },
            { max: 50, message: 'La calle no puede exceder los 50 caracteres' },
            {
              pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/,
              message: 'La calle solo puede contener letras, números y espacios'
            }
          ]}
        >
          <Input placeholder="Ingrese la calle" maxLength={50} />
        </Form.Item>

        <Form.Item
          name="detalles"
          label="Detalles de la Direccion"
          rules={[
            { max: 200, message: 'Los detalles no pueden exceder los 200 caracteres' }
          ]}
        >
          <Input.TextArea 
            rows={2} 
            placeholder="Ingrese detalles adicionales de la direccion" 
            maxLength={200}
          />
        </Form.Item>

        <Form.Item>
          <div className="form-buttons">
            <Button onClick={handleCancel}>Cancelar</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {initialValues ? "Actualizar Proveedor" : "Crear Proveedor"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProveedorForm;