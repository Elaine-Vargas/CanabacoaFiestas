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
}

const UsuarioForm: React.FC<UsuarioFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchRoles();
    }
  }, [visible]);

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
      console.log('Datos de roles recibidos:', data);
      setRoles(Array.isArray(data.roles) ? data.roles : []);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      const response = await fetch(`${apiUrl}/auth/register-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      const responseText = await response.text();
      console.log('Respuesta completa del servidor (ERROR DUPLICADO):', responseText);

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData.mensaje = responseText;
        }
        throw errorData;
      }

      const data = JSON.parse(responseText);

      message.success('Usuario creado exitosamente');
      onSubmit(data.usuario);
      form.resetFields();
      onCancel();
    } catch (error: any) {
      console.error('Error al crear usuario:', error);

      let globalErrorMessage = 'Error al crear el usuario.';
      let specificBackendErrorMessage = '';
      let fieldErrors: { name: string; errors: string[] }[] = [];

      if (error.error) {
        specificBackendErrorMessage = error.error;
      } else if (error.message) {
        specificBackendErrorMessage = error.message;
      } else if (error.mensaje) {
        specificBackendErrorMessage = error.mensaje;
      } else if (typeof error === 'string') {
        specificBackendErrorMessage = error;
      }

      globalErrorMessage = specificBackendErrorMessage || globalErrorMessage;

      if (error.errors && typeof error.errors === 'object' && Object.keys(error.errors).length > 0) {
        for (const fieldName in error.errors) {
          if (Object.prototype.hasOwnProperty.call(error.errors, fieldName)) {
            fieldErrors.push({
              name: fieldName,
              errors: [error.errors[fieldName]]
            });
          }
        }
        globalErrorMessage = specificBackendErrorMessage || 'Errores de validación. Por favor, revise los campos.';
      } else if (specificBackendErrorMessage) {
        const lowerCaseErrorMessage = specificBackendErrorMessage.toLowerCase();

        if (lowerCaseErrorMessage.includes('usuario ya existe') || lowerCaseErrorMessage.includes('nombre de usuario ya está en uso') || lowerCaseErrorMessage.includes('duplicate entry') || lowerCaseErrorMessage.includes('unique constraint failed')) {
          fieldErrors.push({ name: 'usuario_login', errors: [specificBackendErrorMessage] });
        }
        if (lowerCaseErrorMessage.includes('cédula ya existe') || lowerCaseErrorMessage.includes('cédula ya está registrada') || lowerCaseErrorMessage.includes('duplicate entry') || lowerCaseErrorMessage.includes('unique constraint failed')) {
          fieldErrors.push({ name: 'cedula_usuario', errors: [specificBackendErrorMessage] });
        }
        if (lowerCaseErrorMessage.includes('correo ya existe') || lowerCaseErrorMessage.includes('correo ya está en uso') || lowerCaseErrorMessage.includes('duplicate entry') || lowerCaseErrorMessage.includes('unique constraint failed')) {
          fieldErrors.push({ name: 'correo_usuario', errors: [specificBackendErrorMessage] });
        }

        if (specificBackendErrorMessage.startsWith('<!DOCTYPE html>')) {
            globalErrorMessage = 'Error de servidor: No se pudo procesar la solicitud. Por favor, intente más tarde.';
            form.setFields(Object.keys(form.getFieldsValue()).map(name => ({ name, errors: [] })));
            fieldErrors = [];
        }
      }

      if (fieldErrors.length > 0) {
        form.setFields(fieldErrors);
      } else {
        if (!specificBackendErrorMessage.startsWith('<!DOCTYPE html>')) {
          form.setFields(Object.keys(form.getFieldsValue()).map(name => ({ name, errors: [] })));
        }
      }
      message.error(globalErrorMessage);
    } finally {
      setIsSubmitting(false);
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
          loading={loading || isSubmitting}
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
            { validator: async (_, value) => {
                if (!value) return Promise.resolve();
                const error = validateCedula(value);
                if (error) return Promise.reject(new Error(error));
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input placeholder="Ingrese la cédula" maxLength={13} />
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
            allowClear
            filterOption={(input, option) => {
              if (typeof option?.children === 'string') {
                return (option.children as string).toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
          >
            {Array.isArray(roles) && roles.map(rol => (
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

        <Form.Item
          name="tel_usuario"
          label="Teléfono"
          rules={[
            { required: true, message: 'Por favor ingrese el teléfono' },
            { validator: async (_, value) => {
                if (!value) return Promise.resolve();
                const error = validatePhoneNumber(value);
                if (error) return Promise.reject(new Error(error));
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input placeholder="Ingrese el teléfono" maxLength={12} />
        </Form.Item>

        <Form.Item
          name="correo_usuario"
          label="Correo Electrónico"
          rules={[
            { required: true, message: 'Por favor ingrese el correo electrónico' },
            { validator: async (_, value) => {
                if (!value) return Promise.resolve();
                const error = validateEmail(value);
                if (error) return Promise.reject(new Error(error));
                return Promise.resolve();
              }
            }
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