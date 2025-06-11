import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import type { Dayjs } from 'dayjs';
import '../../../styles/dashboard/DashboardForms.scss';

interface Cliente {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
}

interface Evento {
id_evento: number;
  cedula_cliente: string;
  cedula_asesor: string;
  id_tipo_evento: number;
  fecha_evento: Dayjs | null;
  hora_evento: Dayjs | null;
  id_direccion: number;
  espacio_evento: string;
  desea_supervision: boolean;
  nota_cliente: string;
  sector: string;
  calle: string;
  detalles: string;
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
  clientes: Cliente[];
  asesores: Asesor[];
  tiposEvento: TipoEvento[];
  provincias: Provincia[];
  ciudades: Ciudad[];
  loadingClientes?: boolean;
  loadingAsesores?: boolean;
  loadingTipos?: boolean;
  loadingProvincias?: boolean;
  loadingCiudades?: boolean;
  initialValues: Evento;
}

const EventoForm: React.FC<EventoFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
  clientes,
  asesores,
  tiposEvento,
  provincias,
  ciudades,
  loadingClientes = false,
  loadingAsesores = false,
  loadingTipos = false,
  loadingProvincias = false,
  loadingCiudades = false,
  initialValues,
}) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [form] = Form.useForm();
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState<Ciudad[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        fecha_evento: initialValues.fecha_evento ? dayjs(initialValues.fecha_evento) : undefined,
        hora_evento: initialValues.hora_evento ? dayjs(initialValues.hora_evento) : undefined
      });
    }
  }, [visible, initialValues, form]);

  useEffect(() => {
    if (visible) {
      setCiudadesFiltradas(ciudades);
    }
  }, [visible, ciudades]);

  const handleProvinciaChange = (value: number) => {
    const ciudadesFiltradas = ciudades.filter(ciudad => ciudad.id_provincia === value);
    setCiudadesFiltradas(ciudadesFiltradas);
    form.setFieldsValue({ id_ciudad: undefined });
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

      // Preparar los datos del evento
      const eventoData = {
        cedula_cliente: values.cedula_cliente,
        cedula_asesor: values.cedula_asesor,
        id_tipo_evento: values.id_tipo_evento,
        fecha_evento: values.fecha_evento.format('YYYY-MM-DD'),
        hora_evento: values.hora_evento.format('HH:mm:ss'),
        espacio_evento: values.espacio_evento,
        desea_supervision: values.desea_supervision === 1,
        nota_cliente: values.nota_cliente,
        id_direccion: id_direccion
      };

      let eventoResponse;
      if (initialValues) {
        // Si estamos editando, actualizamos el evento existente
        eventoResponse = await fetch(`${apiUrl}/evento/${initialValues.id_evento}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventoData)
        });
      } else {
        // Si estamos creando, insertamos un nuevo evento
        eventoResponse = await fetch(`${apiUrl}/evento`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventoData)
        });
      }

      if (!eventoResponse.ok) {
        const errorData = await eventoResponse.json();
        throw new Error(errorData.mensaje || `Error al ${initialValues ? 'actualizar' : 'crear'} el evento`);
      }

      const data = await eventoResponse.json();
      message.success(`Evento ${initialValues ? 'actualizado' : 'creado'} exitosamente`);
      onSubmit(data.evento);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error(`Error al ${initialValues ? 'actualizar' : 'crear'} evento:`, error);
      message.error(error instanceof Error ? error.message : `Error al ${initialValues ? 'actualizar' : 'crear'} el evento`);
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
      title={initialValues ? "Editar Evento" : "Crear Nuevo Evento"}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="evento-form"
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
        >
          <Select>
            <Select.Option value={1}>Sí</Select.Option>
            <Select.Option value={0}>No</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="nota_cliente"
          label="Nota del Cliente"
        >
          <Input.TextArea rows={4} placeholder="Ingrese cualquier nota o detalle adicional" />
        </Form.Item>

        <Form.Item>
          <div className="form-buttons">
            <Button onClick={handleCancel}>Cancelar</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {initialValues ? "Actualizar Evento" : "Crear Evento"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EventoForm; 