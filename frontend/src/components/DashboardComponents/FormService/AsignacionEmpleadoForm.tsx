import React, { useState, useEffect } from 'react';
import { Form, Select, Button, message, Descriptions, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import '../../../styles/dashboard/DashboardForms.scss';

interface TipoEvento {
  id_tipo_evento: number;
  tipo_evento: string;
}

interface Evento {
  id_evento: number;
  nombre_cliente: string;
  nombre_asesor: string | null;
  fecha_evento: string;
  hora_evento: string;
  tipo_evento: string | TipoEvento;
  direccion_evento: string;
  espacio_evento: string;
  desea_supervision: boolean;
  estado_solicitud: string;
  total_evento: number;
  cedula_asesor: string;
  cliente?: {
    nombre_usuario: string;
    apellido_usuario: string;
  };
  asesor?: {
    nombre_usuario: string;
    apellido_usuario: string;
  };
  direccion?: {
    provincia?: {
      id_provincia: number;
      nombre_provincia: string;
    };
    ciudad?: {
      id_ciudad: number;
      nombre_ciudad: string;
    };
    sector?: string;
    calle?: string;
    detalles?: string;
  }
}

interface Empleado {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
}

interface AsignacionExistente {
  id_evento: number;
  empleado_evento: string;
  puesto_evento: string;
}

interface AsignacionEmpleado {
  id_evento: number;
  empleado_evento: string;
  puesto_evento: string;
  evento: {
    id_evento: number;
    fecha_evento: string;
    hora_evento: string;
    cliente: {
      nombre_usuario: string;
      apellido_usuario: string;
    };
  };
  empleado: {
    cedula_usuario: string;
    nombre_usuario: string;
    apellido_usuario: string;
  };
}

interface AsignacionEmpleadoFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
  initialValues?: AsignacionEmpleado;
}

const AsignacionEmpleadoForm: React.FC<AsignacionEmpleadoFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
}) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [form] = Form.useForm();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [asignacionesExistentes, setAsignacionesExistentes] = useState<AsignacionExistente[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [showEventoDetails, setShowEventoDetails] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchEventos();
      fetchEmpleados();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  useEffect(() => {
    const eventoSeleccionadoId = form.getFieldValue('id_evento');
    if (eventoSeleccionadoId) {
      fetchAsignacionesExistentes();
      const evento = eventos.find(e => e.id_evento === eventoSeleccionadoId);
      if (evento) {
        setSelectedEvento(evento);
      } else {
        setSelectedEvento(null);
        setShowEventoDetails(false);
      }
    } else {
      setAsignacionesExistentes([]);
      setSelectedEvento(null);
      setShowEventoDetails(false);
    }
  }, [form.getFieldValue('id_evento'), eventos]);

  const fetchAsignacionesExistentes = async () => {
    try {
      const response = await fetch(`${apiUrl}/evento/asignar-empleados`, {
        method: 'GET',
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
      const response = await fetch(`${apiUrl}/evento?include=direccion,cliente,asesor,tipo_evento`, {
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

  const validarAsignacionExistente = (idEvento: number, empleado_evento: string): boolean => {
    return asignacionesExistentes.some(
      (asignacion) =>
        asignacion.id_evento === idEvento &&
        asignacion.empleado_evento === empleado_evento
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();

      if (initialValues) {
        // Si estamos editando, solo permitimos cambiar el puesto
        await onSubmit({ ...initialValues, puesto_evento: values.puesto_evento });
      } else {
        // Si estamos creando una nueva asignación, validamos que no exista ya
        if (validarAsignacionExistente(values.id_evento, values.empleado_evento)) {
          message.error('Este empleado ya está asignado a este evento.');
          setIsSubmitting(false);
          return;
        }
        await onSubmit(values);
      }

      onCancel(); // Cerrar el modal después de un submit exitoso
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      message.error(error instanceof Error ? error.message : 'Error al enviar el formulario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showEventoDetailsModal = () => {
    setShowEventoDetails(true);
  };

  const handleCancelEventoDetails = () => {
    setShowEventoDetails(false);
  };

  const handleEventoChange = (value: number) => {
    const evento = eventos.find(e => e.id_evento === value);
    setSelectedEvento(evento || null);
    form.setFieldsValue({ empleado_evento: undefined, puesto_evento: undefined });
  };

  const getEmpleadosFiltrados = () => {
    if (!selectedEvento) return [];
    const asignacionesDelEvento = asignacionesExistentes.filter(a => a.id_evento === selectedEvento.id_evento);
    return empleados.filter(empleado => {
      const yaAsignado = asignacionesDelEvento.some(a => a.empleado_evento === empleado.cedula_usuario);
      return !yaAsignado;
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      className="dashboard-form"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="id_evento"
        label="Evento"
        rules={[{ required: true, message: 'Por favor seleccione un evento' }]}
      >
        <Select
          placeholder="Seleccione un evento"
          loading={loadingEventos}
          onChange={handleEventoChange}
          disabled={!!initialValues}
          showSearch
          optionFilterProp="children"
        >
          {eventos.map((evento) => (
            <Select.Option key={evento.id_evento} value={evento.id_evento}>
              {`Evento ${evento.id_evento} - Cliente: ${evento.cliente?.nombre_usuario || 'N/A'} ${evento.cliente?.apellido_usuario || ''} - Fecha: ${evento.fecha_evento}`}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {selectedEvento && (
        <Button
          type="link"
          onClick={showEventoDetailsModal}
          icon={<EyeOutlined />}
          style={{ marginBottom: '16px' }}
        >
          Ver Detalles del Evento Seleccionado
        </Button>
      )}

      <Form.Item
        name="empleado_evento"
        label="Empleado a Asignar"
        rules={[{ required: true, message: 'Por favor seleccione un empleado' }]}
        hidden={!!initialValues}
      >
        <Select
          placeholder="Seleccione un empleado"
          loading={loadingEmpleados}
          disabled={!selectedEvento || !!initialValues}
          showSearch
          optionFilterProp="children"
        >
          {getEmpleadosFiltrados().map((empleado) => (
            <Select.Option key={empleado.cedula_usuario} value={empleado.cedula_usuario}>
              {`${empleado.nombre_usuario} ${empleado.apellido_usuario}`}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="puesto_evento"
        label="Puesto Asignado"
        rules={[{ required: true, message: 'Por favor seleccione un puesto' }]}
      >
        <Select placeholder="Seleccione un puesto">
          <Select.Option value="Decorador">Decorador</Select.Option>
          <Select.Option value="Camarero">Camarero</Select.Option>
          <Select.Option value="Conductor">Conductor</Select.Option>
          <Select.Option value="Supervisor">Supervisor</Select.Option>
          <Select.Option value="Encargado de Logística">Encargado de Logística</Select.Option>
          <Select.Option value="Encargado de Limpieza">Encargado de Limpieza</Select.Option>
        </Select>
      </Form.Item>

      <div style={{ textAlign: 'right', marginTop: '20px' }}>
        <Button onClick={onCancel} style={{ marginRight: '8px' }}>
          Cancelar
        </Button>
        <Button type="primary" htmlType="submit" loading={isSubmitting}>
          {initialValues ? 'Actualizar Asignación' : 'Asignar Empleado'}
        </Button>
      </div>

      <Modal
        title="Detalles del Evento"
        open={showEventoDetails}
        onCancel={handleCancelEventoDetails}
        footer={null}
        width={800}
      >
        {selectedEvento && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="ID Evento">{selectedEvento.id_evento}</Descriptions.Item>
            <Descriptions.Item label="Cliente">{`${selectedEvento.cliente?.nombre_usuario || 'N/A'} ${selectedEvento.cliente?.apellido_usuario || ''}`}</Descriptions.Item>
            <Descriptions.Item label="Asesor">{`${selectedEvento.asesor?.nombre_usuario || 'N/A'} ${selectedEvento.asesor?.apellido_usuario || ''}`}</Descriptions.Item>
            <Descriptions.Item label="Fecha">{selectedEvento.fecha_evento}</Descriptions.Item>
            <Descriptions.Item label="Hora">{selectedEvento.hora_evento}</Descriptions.Item>
            <Descriptions.Item label="Tipo">{typeof selectedEvento.tipo_evento === 'object' ? selectedEvento.tipo_evento.tipo_evento : selectedEvento.tipo_evento}</Descriptions.Item>
            <Descriptions.Item label="Dirección">{`${selectedEvento.direccion?.calle || 'N/A'}, ${selectedEvento.direccion?.sector || 'N/A'}, ${selectedEvento.direccion?.ciudad?.nombre_ciudad || 'N/A'}, ${selectedEvento.direccion?.ciudad?.provincia?.nombre_provincia || 'N/A'}`}</Descriptions.Item>
            <Descriptions.Item label="Espacio">{selectedEvento.espacio_evento}</Descriptions.Item>
            <Descriptions.Item label="Supervisión">{selectedEvento.desea_supervision ? 'Sí' : 'No'}</Descriptions.Item>
            <Descriptions.Item label="Estado">{selectedEvento.estado_solicitud}</Descriptions.Item>
            <Descriptions.Item label="Total">{`$${selectedEvento.total_evento?.toLocaleString()}`}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Form>
  );
};

export default AsignacionEmpleadoForm; 