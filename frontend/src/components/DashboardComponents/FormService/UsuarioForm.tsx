import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import '../../../styles/dashboard/DashboardForms.scss';

interface Rol {
  id_rol: number;
  nombre_rol: string;
}

interface UsuarioFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
}

const UsuarioForm: React.FC<UsuarioFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchRoles();
    }
  }, [visible]);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/roles`);
      if (!response.ok) {
        throw new Error('Error al cargar los roles');
      }
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    } finally {
      setLoadingRoles(false);
    }
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
      title="Nuevo Usuario"
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
          Crear Usuario
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
          name="cedula_usuario"
          label="Cédula"
          rules={[
            { required: true, message: 'Por favor ingrese la cédula' },
            { pattern: /^\d{11}$/, message: 'La cédula debe tener 11 dígitos' }
          ]}
        >
          <Input placeholder="Ingrese la cédula" maxLength={11} />
        </Form.Item>

        <Form.Item
          name="nombre_usuario"
          label="Nombre"
          rules={[
            { required: true, message: 'Por favor ingrese el nombre' },
            { max: 50, message: 'El nombre no puede exceder los 50 caracteres' }
          ]}
        >
          <Input placeholder="Ingrese el nombre" maxLength={50} />
        </Form.Item>

        <Form.Item
          name="apellido_usuario"
          label="Apellido"
          rules={[
            { required: true, message: 'Por favor ingrese el apellido' },
            { max: 50, message: 'El apellido no puede exceder los 50 caracteres' }
          ]}
        >
          <Input placeholder="Ingrese el apellido" maxLength={50} />
        </Form.Item>

        <Form.Item
          name="id_rol"
          label="Rol"
          rules={[{ required: true, message: 'Por favor seleccione el rol' }]}
        >
          <Select
            placeholder="Seleccione el rol"
            loading={loadingRoles}
          >
            {roles.map(rol => (
              <Select.Option key={rol.id_rol} value={rol.id_rol}>
                {rol.nombre_rol}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="usuario_login"
          label="Usuario"
          rules={[
            { required: true, message: 'Crea un nombre de usuario' },
            { max: 25, message: 'El nombre de usuario no puede exceder los 25 caracteres' }
          ]}
        >
          <Input placeholder="Ingrese el nombre de usuario" maxLength={25} />
        </Form.Item>

        <Form.Item
          name="contrasena_login"
          label="Contraseña"
          rules={[
            { required: true, message: 'Crea una contraseña' },
            { min: 8, message: 'La contraseña debe tener al menos 8 caracteres' }
          ]}
        >
          <Input.Password placeholder="Ingrese la contraseña" />
        </Form.Item>

        <Form.Item
          name="tel_usuario"
          label="Teléfono"
          rules={[
            { required: true, message: 'Por favor ingrese el teléfono' },
            { pattern: /^\d{10}$/, message: 'El teléfono debe tener 10 dígitos' }
          ]}
        >
          <Input placeholder="Ingrese el teléfono" maxLength={10} />
        </Form.Item>

        <Form.Item
          name="correo_usuario"
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
          name="estado_usuario"
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

export default UsuarioForm; 