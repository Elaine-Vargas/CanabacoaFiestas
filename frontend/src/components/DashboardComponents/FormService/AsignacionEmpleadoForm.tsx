import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Button } from 'antd';
import '../../../styles/dashboard/DashboardForms.scss';

interface Evento {
  id_evento: number;
  nombre_evento: string;
  fecha_evento: string;
}

interface Empleado {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
}

interface AsignacionEmpleadoFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
}

const AsignacionEmpleadoForm: React.FC<AsignacionEmpleadoFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchEventos();
      fetchEmpleados();
    }
  }, [visible]);

  const fetchEventos = async () => {
    try {
      setLoadingEventos(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/eventos`);
      if (!response.ok) {
        throw new Error('Error al cargar los eventos');
      }
      const data = await response.json();
      setEventos(data);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setLoadingEventos(false);
    }
  };

  const fetchEmpleados = async () => {
    try {
      setLoadingEmpleados(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usuarios/empleados`);
      if (!response.ok) {
        throw new Error('Error al cargar los empleados');
      }
      const data = await response.json();
      setEmpleados(data);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    } finally {
      setLoadingEmpleados(false);
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
      title="Asignar Empleado a Evento"
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
          Asignar Empleado
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
          name="id_evento"
          label="Evento"
          rules={[{ required: true, message: 'Por favor seleccione el evento' }]}
        >
          <Select
            placeholder="Seleccione el evento"
            loading={loadingEventos}
            showSearch
            optionFilterProp="children"
          >
            {eventos.map(evento => (
              <Select.Option key={evento.id_evento} value={evento.id_evento}>
                {`${evento.nombre_evento} - ${new Date(evento.fecha_evento).toLocaleDateString()}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="empleado_evento"
          label="Empleado"
          rules={[{ required: true, message: 'Por favor seleccione el empleado' }]}
        >
          <Select
            placeholder="Seleccione el empleado"
            loading={loadingEmpleados}
            showSearch
            optionFilterProp="children"
          >
            {empleados.map(empleado => (
              <Select.Option key={empleado.cedula_usuario} value={empleado.cedula_usuario}>
                {`${empleado.nombre_usuario} ${empleado.apellido_usuario}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="puesto_evento"
          label="Puesto"
          rules={[{ required: true, message: 'Por favor seleccione el puesto' }]}
        >
          <Select placeholder="Seleccione el puesto">
            <Select.Option value="Decorador">Decorador</Select.Option>
            <Select.Option value="Camarero">Camarero</Select.Option>
            <Select.Option value="Conductor">Conductor</Select.Option>
            <Select.Option value="Supervisor">Supervisor</Select.Option>
            <Select.Option value="Encargado de Logística">Encargado de Logística</Select.Option>
            <Select.Option value="Encargado de Limpieza">Encargado de Limpieza</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AsignacionEmpleadoForm; 