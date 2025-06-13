import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Button, message, Descriptions } from 'antd';
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
      asignacion => 
        asignacion.id_evento === idEvento && 
        asignacion.empleado_evento === empleado_evento
    );
  };

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      const asignacionData = {
        id_evento: values.id_evento,
        empleado_evento: values.empleado_evento,
        puesto_evento: values.puesto_evento
      };

      let response;
      if (initialValues) {
        // Si estamos editando, actualizamos la asignación existente
        response = await fetch(`${apiUrl}/evento/asignar-empleados/${initialValues.id_evento}/${initialValues.empleado_evento}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(asignacionData)
        });
        console.log('Asignación actualizada:', initialValues);
      } else {
        // Si estamos creando, insertamos una nueva asignación
        response = await fetch(`${apiUrl}/evento/asignar-empleados`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(asignacionData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || `Error al ${initialValues ? 'actualizar' : 'crear'} la asignación`);
      }

      const data = await response.json();
      message.success(`Asignación ${initialValues ? 'actualizada' : 'creada'} exitosamente`);
      onSubmit(data);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.log(`Error al actualizar asignación:`, error);
      message.error(error instanceof Error ? error.message : `Error al ${initialValues ? 'actualizar' : 'crear'} la asignación`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showEventoDetailsModal = () => {
    if (selectedEvento) {
      setShowEventoDetails(true);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleEventoChange = (value: number) => {
    console.log('Select onChange value:', value);
    form.setFieldsValue({ id_evento: value });
    console.log('id_evento after setFieldsValue:', form.getFieldValue('id_evento'));
    const evento = eventos.find(e => e.id_evento === value);
    if (evento) {
      setSelectedEvento(evento);
      // Limpiar la selección del empleado cuando cambia el evento
      form.setFieldValue('empleado_evento', undefined);
    } else {
      setSelectedEvento(null);
      setShowEventoDetails(false);
    }
  };

  // Filtrar empleados excluyendo al asesor del evento seleccionado
  const getEmpleadosFiltrados = () => {
    if (!selectedEvento) return empleados;
    return empleados.filter(empleado => 
      empleado.cedula_usuario !== selectedEvento.cedula_asesor
    );
  };

  return (
    <>
      <Modal
        title={initialValues ? "Editar Asignación" : "Asignar Empleado a Evento"}
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="asignacion-form"
        >
          <Form.Item
            name="id_evento"
            label="Evento"
            rules={[{ required: true, message: 'Por favor seleccione el evento' }]}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <Select
                value={form.getFieldValue('id_evento')}
                placeholder="Seleccione el evento"
                loading={loadingEventos}
                showSearch
                allowClear
                onChange={handleEventoChange}
                onClear={() => {
                  form.setFieldsValue({ id_evento: undefined });
                  setSelectedEvento(null);
                  setShowEventoDetails(false);
                }}
                filterOption={(input, option) => {
                  if (typeof option?.label === 'string') {
                    return option.label.toLowerCase().includes(input.toLowerCase());
                  }
                  return false;
                }}
                options={eventos.map(evento => ({
                  value: evento.id_evento,
                  label: `ID: ${evento.id_evento} - ${evento.cliente?.nombre_usuario || ''} ${evento.cliente?.apellido_usuario || ''}`
                }))}
                style={{ flex: 1 }}
              />
              {selectedEvento && (
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={showEventoDetailsModal}
                  title="Ver detalles del evento"
                />
              )}
            </div>
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
              disabled={!selectedEvento}
              filterOption={(input, option) => {
                if (typeof option?.label === 'string') {
                  return option.label.toLowerCase().includes(input.toLowerCase());
                }
                return false;
              }}
              options={getEmpleadosFiltrados().map(empleado => ({
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

          <Form.Item>
            <div className="form-buttons">
              <Button onClick={handleCancel}>Cancelar</Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {initialValues ? "Actualizar Asignación" : "Asignar Empleado"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Detalles del Evento"
        open={showEventoDetails}
        onCancel={() => setShowEventoDetails(false)}
        footer={[
          <Button key="close" onClick={() => setShowEventoDetails(false)}>
            Cerrar
          </Button>
        ]}
        width={600}
      >
        {selectedEvento && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="ID del Evento">{selectedEvento.id_evento}</Descriptions.Item>
            <Descriptions.Item label="Cliente">
              {`${selectedEvento.cliente?.nombre_usuario || ''} ${selectedEvento.cliente?.apellido_usuario || ''}`}
            </Descriptions.Item>
            <Descriptions.Item label="Asesor">
            {selectedEvento.asesor 
            ? `${selectedEvento.asesor.nombre_usuario} ${selectedEvento.asesor.apellido_usuario}`
            : selectedEvento.nombre_asesor || 'No asignado'}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha">{new Date(selectedEvento.fecha_evento).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Hora">{selectedEvento.hora_evento}</Descriptions.Item>
            <Descriptions.Item label="Tipo de Evento">
              {typeof selectedEvento.tipo_evento === 'object' 
                ? selectedEvento.tipo_evento.tipo_evento 
                : selectedEvento.tipo_evento}
            </Descriptions.Item>
            <Descriptions.Item label="Espacio">{selectedEvento.espacio_evento}</Descriptions.Item>
            <Descriptions.Item label="Dirección">
              {selectedEvento.direccion && (
                <>
                {`${selectedEvento.direccion.calle || ''} ${selectedEvento.direccion.sector || ''}, ${selectedEvento.direccion.ciudad?.nombre_ciudad || ''}, ${selectedEvento.direccion.provincia?.nombre_provincia || ''}`}
                {selectedEvento.direccion.detalles && (
                  <div style={{ marginTop: '4px', color: '#666' }}>
                    <small>Detalles adicionales: {selectedEvento.direccion.detalles}</small>
                    </div>
                  )}
                  </>
                )}
                </Descriptions.Item>
            <Descriptions.Item label="Supervisión">{selectedEvento.desea_supervision ? 'Sí' : 'No'}</Descriptions.Item>
            <Descriptions.Item label="Estado">{selectedEvento.estado_solicitud}</Descriptions.Item>
            <Descriptions.Item label="Total">${selectedEvento.total_evento?.toLocaleString() || '0'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default AsignacionEmpleadoForm; 