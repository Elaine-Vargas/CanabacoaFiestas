import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import type { Dayjs } from 'dayjs';
import '../../../styles/dashboard/DashboardForms.scss';

interface Cliente {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
}

interface Asesor {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
}

interface TipoEvento {
  id_tipo_evento: number;
  tipo_evento: string;
}

interface Provincia {
  id_provincia: number;
  nombre_provincia: string;
}

interface Ciudad {
  id_ciudad: number;
  nombre_ciudad: string;
  id_provincia: number;
}

interface EventoFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
}

const EventoForm: React.FC<EventoFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [form] = Form.useForm();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState<Ciudad[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingAsesores, setLoadingAsesores] = useState(false);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchClientes();
      fetchAsesores();
      fetchTiposEvento();
      fetchProvincias();
      fetchCiudades();
    }
  }, [visible]);

  const fetchClientes = async () => {
    try {
      setLoadingClientes(true);
      const response = await fetch(`${apiUrl}/usuario?rol=2`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar los clientes');
      }
      const data = await response.json();
      setClientes(data.usuarios);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      message.error('Error al cargar los clientes');
    } finally {
      setLoadingClientes(false);
    }
  };

  const fetchAsesores = async () => {
    try {
      setLoadingAsesores(true);
      const response = await fetch(`${apiUrl}/usuario/rol/3`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar los asesores');
      }
      const data = await response.json();
      setAsesores(data.usuarios);
    } catch (error) {
      console.error('Error al cargar asesores:', error);
      message.error('Error al cargar los asesores');
    } finally {
      setLoadingAsesores(false);
    }
  };

  const fetchTiposEvento = async () => {
    try {
      setLoadingTipos(true);
      const response = await fetch(`${apiUrl}/evento/tipo-eventos/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar los tipos de evento');
      }
      const data = await response.json();
      setTiposEvento(data);
    } catch (error) {
      console.error('Error al cargar tipos de evento:', error);
      message.error('Error al cargar los tipos de evento');
    } finally {
      setLoadingTipos(false);
    }
  };

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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      // Formatear la fecha y hora
      const fechaEvento = values.fecha_evento.format('YYYY-MM-DD');
      const horaEvento = values.hora_evento.format('HH:mm:ss');

      // Preparar los datos para enviar
      const eventoData = {
        ...values,
        fecha_evento: fechaEvento,
        hora_evento: horaEvento,
        desea_supervision: values.desea_supervision === 1
      };

      console.log('Enviando datos:', eventoData);

      const response = await fetch(`${apiUrl}/evento`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventoData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al crear el evento');
      }

      message.success('Evento creado exitosamente');
      onSubmit(data.evento);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Error al crear evento:', error);
      message.error(error instanceof Error ? error.message : 'Error al crear el evento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Nuevo Evento"
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
          Crear Evento
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
          name="cedula_cliente"
          label="Cliente"
          rules={[{ required: true, message: 'Por favor seleccione un cliente' }]}
        >
          <Select
            placeholder="Seleccione un cliente"
            loading={loadingClientes}
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
            {clientes.map(cliente => (
              <Select.Option key={cliente.cedula_usuario} value={cliente.cedula_usuario}>
                {`${cliente.nombre_usuario} ${cliente.apellido_usuario} (${cliente.cedula_usuario})`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="cedula_asesor"
          label="Asesor"
        >
          <Select
            placeholder="Seleccione un asesor"
            loading={loadingAsesores}
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
            {asesores.map(asesor => (
              <Select.Option key={asesor.cedula_usuario} value={asesor.cedula_usuario}>
                {`${asesor.nombre_usuario} ${asesor.apellido_usuario} (${asesor.cedula_usuario})`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="fecha_evento"
          label="Fecha del Evento"
          rules={[{ required: true, message: 'Por favor seleccione la fecha del evento' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          name="hora_evento"
          label="Hora del Evento"
          rules={[{ required: true, message: 'Por favor seleccione la hora del evento' }]}
        >
          <DatePicker.TimePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="id_tipo_evento"
          label="Tipo de Evento"
          rules={[{ required: true, message: 'Por favor seleccione el tipo de evento' }]}
        >
          <Select
            placeholder="Seleccione el tipo de evento"
            loading={loadingTipos}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              if (typeof option?.children === 'string') {
                return (option.children as string).toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
          >
            {tiposEvento.map(tipo => (
              <Select.Option key={tipo.id_tipo_evento} value={tipo.id_tipo_evento}>
                {tipo.tipo_evento}
              </Select.Option>
            ))}
          </Select>
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
          rules={[{ required: true, message: 'Por favor ingrese el sector' }]}
        >
          <Input placeholder="Ingrese el sector" />
        </Form.Item>

        <Form.Item
          name="calle"
          label="Calle"
          rules={[{ required: true, message: 'Por favor ingrese la calle' }]}
        >
          <Input placeholder="Ingrese la calle" />
        </Form.Item>

        <Form.Item
          name="detalles"
          label="Detalles de la Dirección"
        >
          <Input.TextArea rows={2} placeholder="Ingrese detalles adicionales de la dirección" />
        </Form.Item>

        <Form.Item
          name="espacio_evento"
          label="Espacio del Evento"
          rules={[{ required: true, message: 'Por favor ingrese el espacio del evento' }]}
        >
          <Input placeholder="Ingrese el espacio donde se realizará el evento" />
        </Form.Item>

        <Form.Item
          name="desea_supervision"
          label="¿Desea supervisión?"
          valuePropName="checked"
          initialValue={0}
        >
          <Select>
            <Select.Option value={1}>Sí</Select.Option>
            <Select.Option value={0}>No</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="estado_solicitud"
          label="Estado de la Solicitud"
          initialValue="Pendiente"
        >
          <Select>
            <Select.Option value="Pendiente">Pendiente</Select.Option>
            <Select.Option value="Aceptada">Aceptada</Select.Option>
            <Select.Option value="Rechazada">Rechazada</Select.Option>
            <Select.Option value="Completada">Completada</Select.Option>
            <Select.Option value="Cancelada">Cancelada</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="estado_solicitud"
          label="Estado del Evento"
          initialValue="Pendiente"
        >
          <Select>
            <Select.Option value="Pendiente">Pendiente</Select.Option>
            <Select.Option value="Completado">Completado</Select.Option>
            <Select.Option value="Cancelado">Cancelado</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="nota_cliente"
          label="Notas del Cliente"
        >
          <Input.TextArea rows={4} placeholder="Ingrese notas del cliente" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EventoForm; 