import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, TimePicker, Select, InputNumber, Switch, Button, message, Modal } from 'antd';

interface EventoFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: EventoFormValues) => Promise<void>;
  loading: boolean;
  clientes: Cliente[];
  asesores: Asesor[];
  tiposEvento: TipoEvento[];
  initialValues?: Evento | null;
}

const EventoForm: React.FC<EventoFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading,
  clientes,
  asesores,
  tiposEvento,
  initialValues
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        cedula_cliente: initialValues.cedula_cliente,
        cedula_asesor: initialValues.cedula_asesor,
        fecha_evento: initialValues.fecha_evento,
        hora_evento: initialValues.hora_evento,
        id_tipo_evento: initialValues.id_tipo_evento,
        sector: initialValues.sector,
        calle: initialValues.calle,
        detalles: initialValues.detalles,
        espacio_evento: initialValues.espacio_evento,
        desea_supervision: initialValues.desea_supervision,
        estado_solicitud: initialValues.estado_solicitud,
        nota_cliente: initialValues.nota_cliente
      });
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async (values: EventoFormValues) => {
    try {
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Error al guardar evento:', error);
    }
  };

  return (
    <Modal
      title={initialValues ? "Editar Evento" : "Crear Evento"}
      open={visible}
      onCancel={onCancel}
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
            options={clientes.map(cliente => ({
              value: cliente.cedula_usuario,
              label: `${cliente.nombre_usuario} ${cliente.apellido_usuario}`
            }))}
          />
        </Form.Item>

        <Form.Item
          name="cedula_asesor"
          label="Asesor"
        >
          <Select
            placeholder="Seleccione un asesor"
            options={asesores.map(asesor => ({
              value: asesor.cedula_usuario,
              label: `${asesor.nombre_usuario} ${asesor.apellido_usuario}`
            }))}
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
              value: tipo.id_tipo_evento,
              label: tipo.tipo_evento
            }))}
          />
        </Form.Item>

        <Form.Item
          name="fecha_evento"
          label="Fecha del Evento"
          rules={[{ required: true, message: 'Por favor seleccione una fecha' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="hora_evento"
          label="Hora del Evento"
          rules={[{ required: true, message: 'Por favor seleccione una hora' }]}
        >
          <TimePicker style={{ width: '100%' }} format="HH:mm" />
        </Form.Item>

        <Form.Item
          name="sector"
          label="Sector"
          rules={[{ required: true, message: 'Por favor ingrese el sector' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="calle"
          label="Calle"
          rules={[{ required: true, message: 'Por favor ingrese la calle' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="detalles"
          label="Detalles de la Dirección"
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item
          name="espacio_evento"
          label="Espacio del Evento"
          rules={[{ required: true, message: 'Por favor ingrese el espacio del evento' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="desea_supervision"
          label="Desea Supervisión"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        {initialValues && (
          <Form.Item
            name="estado_solicitud"
            label="Estado de la Solicitud"
            rules={[{ required: true, message: 'Por favor seleccione un estado' }]}
          >
            <Select
              options={[
                { value: 'Pendiente', label: 'Pendiente' },
                { value: 'Aceptada', label: 'Aceptada' },
                { value: 'Rechazada', label: 'Rechazada' },
                { value: 'Completada', label: 'Completada' },
                { value: 'Cancelada', label: 'Cancelada' }
              ]}
            />
          </Form.Item>
        )}

        <Form.Item
          name="nota_cliente"
          label="Notas del Cliente"
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {initialValues ? 'Actualizar Evento' : 'Crear Evento'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EventoForm; 