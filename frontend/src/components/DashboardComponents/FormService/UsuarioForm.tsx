import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { validateCedula, validateEmail, validatePhoneNumber, validateUsername, validatePassword } from '../../../utils/validation';
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
  initialValues?: any;
}

const UsuarioForm: React.FC<UsuarioFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
  initialValues,
}) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchRoles();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await fetch(`${apiUrl}/usuario/roles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar los roles');
      }
      const data = await response.json();
      setRoles(Array.isArray(data.roles) ? data.roles : []);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      message.error('Error al cargar los roles');
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const formatCedula = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 10) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 10)}-${numbers.slice(10, 11)}`;
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCedula(e.target.value);
    form.setFieldValue('cedula_usuario', formattedValue);
  };

  const formatTelefono = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatTelefono(e.target.value);
    form.setFieldValue('tel_usuario', formattedValue);
  };

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      const userData = {
        cedula_usuario: values.cedula_usuario,
        nombre_usuario: values.nombre_usuario,
        apellido_usuario: values.apellido_usuario,
        usuario_login: values.usuario_login,
        correo_usuario: values.correo_usuario,
        tel_usuario: values.tel_usuario,
        id_rol: values.id_rol,
        estado_usuario: values.estado_usuario
      };

      if (!initialValues) {
        userData.contrasena_login = values.contrasena_login;
      }

      let response;
      if (initialValues) {
        response = await fetch(`${apiUrl}/usuario/${initialValues.cedula_usuario}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
      } else {
        response = await fetch(`${apiUrl}/auth/register-user`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
      }

      if (response.ok) {
        const data = await response.json();
        message.success(initialValues ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
        form.resetFields();
        onCancel();
        onSubmit(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || `Error al ${initialValues ? 'actualizar' : 'crear'} el usuario`);
      }
    } catch (error) {
      console.error(`Error al ${initialValues ? 'actualizar' : 'crear'} usuario:`, error);
      message.error(error instanceof Error ? error.message : `Error al ${initialValues ? 'actualizar' : 'crear'} el usuario`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={initialValues ? "Editar Usuario" : "Crear Nuevo Usuario"}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="dashboard-form"
      >
        <Form.Item
          name="cedula_usuario"
          label="Cédula"
          rules={[
            { required: true, message: 'Por favor ingrese la cédula' },
            { pattern: /^\d{3}-\d{7}-\d{1}$/, message: 'Formato de cédula inválido (XXX-XXXXXXX-X)' }
          ]}
        >
          <Input 
            placeholder="XXX-XXXXXXX-X" 
            maxLength={13}
            onChange={handleCedulaChange}
          />
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
            showSearch
            optionFilterProp="children"
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
            { required: true, message: 'Por favor creele un nombre de usuario' },
            { validator: async (_, value) => {
                if (!value) return Promise.resolve();
                const error = validateUsername(value);
                if (error) return Promise.reject(new Error(error));
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input placeholder="Crea un nombre de usuario" maxLength={25} />
        </Form.Item>

        {!initialValues && (
        <Form.Item
          name="contrasena_login"
          label="Contraseña"
          rules={[
            { required: true, message: 'Por favor creele una contraseña' },
            { validator: async (_, value) => {
                if (!value) return Promise.resolve();
                const error = validatePassword(value);
                if (error) return Promise.reject(new Error(error));
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input.Password placeholder="Crea una contraseña" />
          </Form.Item>
        )}

        <Form.Item
          name="estado_usuario"
          label="Estado"
          rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
        >
          <Select
            placeholder="Seleccione el estado"
            options={[
              { value: 'Activo', label: 'Activo' },
              { value: 'Inactivo', label: 'Inactivo' }
            ]}
          />
        </Form.Item>

        <Form.Item
          name="tel_usuario"
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
          name="correo_usuario"
          label="Correo Electrónico"
          rules={[
            { required: true, message: 'Por favor ingrese el correo electrónico' },
            { type: 'email', message: 'Correo electrónico inválido' },
            { validator: async (_, value) => {
                if (!value) return Promise.resolve();
                const error = validateEmail(value);
                if (error) return Promise.reject(new Error(error));
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input placeholder="ejemplo@correo.com" />
        </Form.Item>

        <Form.Item>
          <div className="form-buttons">
            <Button onClick={onCancel}>Cancelar</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {initialValues ? "Actualizar Usuario" : "Crear Usuario"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UsuarioForm; 