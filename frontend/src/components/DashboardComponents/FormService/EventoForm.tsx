import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, TimePicker, Switch, message, Button } from 'antd';
import dayjs from 'dayjs';

interface EventoFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading: boolean;
  clientes: any[];
  asesores: any[];
  tiposEvento: any[];
  provincias: any[];
  ciudades: any[];
  initialValues?: any;
  userCedula?: string;
  userRole?: string;
}

const EventoForm: React.FC<EventoFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading,
  clientes,
  asesores,
  tiposEvento,
  provincias,
  ciudades,
  initialValues,
  userCedula,
  userRole
}) => {
  const [form] = Form.useForm();
  const [selectedProvincia, setSelectedProvincia] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        setIsEditMode(true);
        // Mapear todos los campos relevantes del evento
        let provinciaId = null;
        if (initialValues.id_provincia != null) {
          provinciaId = Number(initialValues.id_provincia);
        } else if (initialValues.direccion?.ciudad?.provincia?.id_provincia != null) {
          provinciaId = Number(initialValues.direccion.ciudad.provincia.id_provincia);
        } else if (initialValues.direccion?.ciudad?.id_provincia != null) {
          provinciaId = Number(initialValues.direccion.ciudad.id_provincia);
        }
        const values = {
          ...initialValues,
          fecha_evento: initialValues.fecha_evento ? dayjs(initialValues.fecha_evento) : null,
          hora_evento: initialValues.hora_evento ? dayjs(initialValues.hora_evento, 'HH:mm:ss') : null,
          id_provincia: provinciaId,
          id_ciudad: initialValues.direccion?.ciudad?.id_ciudad != null ? Number(initialValues.direccion.ciudad.id_ciudad) : initialValues.id_ciudad ?? null,
          sector: initialValues.direccion?.sector ?? initialValues.sector ?? '',
          calle: initialValues.direccion?.calle ?? initialValues.calle ?? '',
          detalles: initialValues.direccion?.detalles ?? initialValues.detalles ?? '',
          id_tipo_evento: initialValues.tipo_evento?.id_tipo_evento != null ? Number(initialValues.tipo_evento.id_tipo_evento) : initialValues.id_tipo_evento ?? null,
          espacio_evento: initialValues.espacio_evento ?? '',
          desea_supervision: initialValues.desea_supervision ?? false,
          nota_cliente: initialValues.nota_cliente ?? '',
          cedula_cliente: initialValues.cliente?.cedula_usuario ?? initialValues.cedula_cliente ?? '',
          cedula_asesor: initialValues.asesor?.cedula_usuario ?? initialValues.cedula_asesor ?? '',
          estado_solicitud: initialValues.estado_solicitud ?? 'Pendiente',
          total_evento: initialValues.total_evento ?? '',
          subtotal_evento: initialValues.subtotal_evento ?? '',
          itbis_evento: initialValues.itbis_evento ?? '',
          id_direccion: initialValues.id_direccion ?? initialValues.direccion?.id_direccion ?? '',
        };
        form.setFieldsValue(values);
        setSelectedProvincia(provinciaId);
      } else {
        setIsEditMode(false);
        // Si es un nuevo evento, establecer la cédula del usuario actual
        form.setFieldsValue({
          cedula_cliente: userCedula,
          estado_solicitud: 'Pendiente',
          desea_supervision: false
        });
        setSelectedProvincia(null);
      }
    } else {
      form.resetFields();
      setSelectedProvincia(null);
      setIsEditMode(false);
    }
  }, [visible, initialValues, form, userCedula]);

  const handleProvinciaChange = (value: number) => {
    setSelectedProvincia(value);
    form.setFieldValue('id_ciudad', undefined);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!values.fecha_evento || !values.hora_evento) {
        message.error('La fecha y hora del evento son requeridas');
        return;
      }
      await onSubmit(values);
    } catch (error) {
      console.error('Error al validar el formulario:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        desea_supervision: false,
        estado_solicitud: 'Pendiente'
      }}
      className="dashboard-form"
    >
      <Form.Item
        name="cedula_cliente"
        label="Cliente"
        rules={[{ required: true, message: 'Por favor seleccione un cliente' }]}
        hidden={userRole === 'cliente'}
      >
        <Select
          placeholder="Seleccione un cliente"
          options={clientes.map(cliente => ({
            label: `${cliente.nombre_usuario} ${cliente.apellido_usuario}`,
            value: cliente.cedula_usuario
          }))}
          showSearch
          optionFilterProp="label"
          disabled={userRole === 'cliente'}
        />
      </Form.Item>

      <Form.Item
        name="cedula_asesor"
        label="Asesor"
        rules={[{ required: true, message: 'Por favor seleccione un asesor' }]}
        hidden={userRole === 'cliente'}
      >
        <Select
          placeholder="Seleccione un asesor"
          options={asesores.map(asesor => ({
            label: `${asesor.nombre_usuario} ${asesor.apellido_usuario}`,
            value: asesor.cedula_usuario
          }))}
          showSearch
          optionFilterProp="label"
          disabled={userRole === 'cliente'}
        />
      </Form.Item>

      <Form.Item
        name="estado_solicitud"
        label="Estado"
        rules={[{ required: true, message: 'Por favor seleccione un estado' }]}
      >
        <Select
          placeholder="Seleccione un estado"
          options={[
            { value: 'Pendiente', label: 'Pendiente' },
            { value: 'Aceptada', label: 'Aceptada' },
            { value: 'Rechazada', label: 'Rechazada' },
            { value: 'Completada', label: 'Completada' },
            { value: 'Cancelada', label: 'Cancelada' }
          ]}
          disabled={false}
        />
      </Form.Item>

      <Form.Item
        name="fecha_evento"
        label="Fecha del Evento"
        rules={[{ required: true, message: 'Por favor seleccione una fecha' }]}
      >
        <DatePicker 
          style={{ width: '100%' }} 
          disabled={false}
        />
      </Form.Item>

      <Form.Item
        name="hora_evento"
        label="Hora del Evento"
        rules={[{ required: true, message: 'Por favor seleccione una hora' }]}
      >
        <TimePicker 
          style={{ width: '100%' }} 
          format="HH:mm" 
          disabled={false}
        />
      </Form.Item>

      <Form.Item
        name="id_tipo_evento"
        label="Tipo de Evento"
        rules={[{ required: true, message: 'Por favor seleccione un tipo de evento' }]}
      >
        <Select
          placeholder="Seleccione un tipo de evento"
          options={tiposEvento.map(tipo => ({
            label: tipo.tipo_evento,
            value: tipo.id_tipo_evento
          }))}
          showSearch
          optionFilterProp="label"
          disabled={false}
        />
      </Form.Item>

      <Form.Item
        name="id_provincia"
        label="Provincia"
        rules={[{ required: true, message: 'Por favor seleccione una provincia' }]}
      >
        <Select
          placeholder="Seleccione una provincia"
          onChange={handleProvinciaChange}
          options={provincias.map(provincia => ({
            label: provincia.nombre_provincia,
            value: provincia.id_provincia
          }))}
          showSearch
          optionFilterProp="label"
          disabled={false}
        />
      </Form.Item>

      <Form.Item
        name="id_ciudad"
        label="Ciudad"
        rules={[{ required: true, message: 'Por favor seleccione una ciudad' }]}
      >
        <Select
          placeholder="Seleccione una ciudad"
          disabled={!selectedProvincia}
          options={ciudades
            .filter(ciudad => ciudad.id_provincia === selectedProvincia)
            .map(ciudad => ({
              label: ciudad.nombre_ciudad,
              value: ciudad.id_ciudad
            }))}
          showSearch
          optionFilterProp="label"
        />
      </Form.Item>

      <Form.Item
        name="sector"
        label="Sector"
        rules={[{ required: true, message: 'Por favor ingrese el sector' }]}
      >
        <Input disabled={false} />
      </Form.Item>

      <Form.Item
        name="calle"
        label="Calle"
        rules={[{ required: true, message: 'Por favor ingrese la calle' }]}
      >
        <Input disabled={false} />
      </Form.Item>

      <Form.Item
        name="detalles"
        label="Detalles Adicionales"
      >
        <Input.TextArea rows={4} disabled={false} />
      </Form.Item>

      <Form.Item
        name="espacio_evento"
        label="Espacio del Evento"
        rules={[{ required: true, message: 'Por favor ingrese el espacio del evento' }]}
      >
        <Input disabled={false} />
      </Form.Item>

      <Form.Item
        name="desea_supervision"
        label="¿Desea supervisión?"
        valuePropName="checked"
      >
        <Switch disabled={false} />
      </Form.Item>

      <Form.Item
        name="nota_cliente"
        label="Notas"
      >
        <Input.TextArea rows={4} disabled={false} />
      </Form.Item>

      <div style={{ textAlign: 'right', marginTop: '20px' }}>
        <Button onClick={onCancel} style={{ marginRight: '8px' }}>
          Cancelar
        </Button>
        <Button type="primary" onClick={handleSubmit} loading={loading}>
          {isEditMode ? 'Actualizar Evento' : 'Crear Evento'}
        </Button>
      </div>
    </Form>
  );
};

export default EventoForm;