import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Button, message } from 'antd';
import '../../../styles/dashboard/DashboardForms.scss';

interface Evento {
  id_evento: number;
  nombre_cliente: string;
  fecha_evento: string;
  cliente?: {
    nombre_usuario: string;
    apellido_usuario: string;
  };
}

interface Empleado {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
}

interface AsignacionExistente {
  id_evento: number;
  cedula_empleado: string;
  puesto_evento: string;
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
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [form] = Form.useForm();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [asignacionesExistentes, setAsignacionesExistentes] = useState<AsignacionExistente[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchEventos();
      fetchEmpleados();
    }
  }, [visible]);

  // Observar cambios en el campo id_evento
  useEffect(() => {
    const eventoSeleccionado = form.getFieldValue('id_evento');
    if (eventoSeleccionado) {
      fetchAsignacionesExistentes(eventoSeleccionado);
    } else {
      setAsignacionesExistentes([]);
    }
  }, [form.getFieldValue('id_evento')]);

  const fetchAsignacionesExistentes = async (eventoId: number) => {
    try {
      const response = await fetch(`${apiUrl}/evento/${eventoId}/empleados`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar las asignaciones existentes');
      }
      const data = await response.json();
      setAsignacionesExistentes(data);
    } catch (error) {
      console.error('Error al cargar asignaciones existentes:', error);
      message.error('Error al cargar las asignaciones existentes');
    }
  };

  const fetchEventos = async () => {
    try {
      setLoadingEventos(true);
      const response = await fetch(`${apiUrl}/evento`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar los eventos');
      }
      const data = await response.json();
      setEventos(data);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      message.error('Error al cargar los eventos');
    } finally {
      setLoadingEventos(false);
    }
  };

  const fetchEmpleados = async () => {
    try {
      setLoadingEmpleados(true);
      const response = await fetch(`${apiUrl}/usuario/rol/3`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar los empleados');
      }
      const data = await response.json();
      setEmpleados(data.usuarios);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      message.error('Error al cargar los empleados');
    } finally {
      setLoadingEmpleados(false);
    }
  };

  const validarAsignacionExistente = (idEvento: number, cedulaEmpleado: string): boolean => {
    return asignacionesExistentes.some(
      asignacion => 
        asignacion.id_evento === idEvento && 
        asignacion.cedula_empleado === cedulaEmpleado
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      // Validar si el empleado ya está asignado al evento
      if (validarAsignacionExistente(values.id_evento, values.empleado_evento)) {
        message.error('El empleado ya tiene un cargo asignado para este evento');
        return;
      }

      // Preparar los datos para enviar
      const asignacionData = {
        cedula_empleado: values.empleado_evento,
        puesto_evento: values.puesto_evento
      };

      const response = await fetch(`${apiUrl}/evento/${values.id_evento}/empleados`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(asignacionData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al asignar el empleado');
      }

      message.success('Empleado asignado exitosamente');
      onSubmit(data);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Error al asignar empleado:', error);
      message.error(error instanceof Error ? error.message : 'Error al asignar el empleado');
    } finally {
      setIsSubmitting(false);
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
          loading={isSubmitting}
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
            allowClear
            filterOption={(input, option) => {
              if (typeof option?.label === 'string') {
                return option.label.toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
            options={eventos.map(evento => ({
              value: evento.id_evento,
              label: `${evento.cliente?.nombre_usuario || ''} ${evento.cliente?.apellido_usuario || ''} - ${new Date(evento.fecha_evento).toLocaleDateString()}`
            }))}
          />
        </Form.Item>

        <Form.Item
          name="empleado_evento"
          label="Empleado"
          rules={[{ required: true, message: 'Por favor seleccione el empleado' }]}
        >
          <Select
            placeholder="Seleccione un empleado"
            loading={loadingEmpleados}
            showSearch
            allowClear
            filterOption={(input, option) => {
              if (typeof option?.label === 'string') {
                return option.label.toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
            options={empleados.map(empleado => ({
              value: empleado.cedula_usuario,
              label: `${empleado.nombre_usuario} ${empleado.apellido_usuario} (${empleado.cedula_usuario})`
            }))}
          />
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