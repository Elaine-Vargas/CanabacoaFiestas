import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, TimePicker, Modal, InputNumber, message } from 'antd';
import dayjs from 'dayjs';

interface PagoFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading: boolean;
  eventos: any[];
  initialValues?: any;
}

const tipoPagoOptions = [
  { label: 'Inicial', value: 'Inicial' },
  { label: 'Final', value: 'Final' },
  { label: 'Adicional', value: 'Adicional' },
];

const modoPagoOptions = [
  { label: 'Efectivo', value: 'Efectivo' },
  { label: 'Transferencia', value: 'Transferencia' },
];

const PagoForm: React.FC<PagoFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading,
  eventos,
  initialValues
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && initialValues) {
      const values = {
        ...initialValues,
        fecha_pago: initialValues.fecha_pago ? dayjs(initialValues.fecha_pago) : null,
        hora_pago: initialValues.hora_pago ? dayjs(initialValues.hora_pago, 'HH:mm:ss') : null,
      };
      form.setFieldsValue(values);
    } else {
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!values.fecha_pago || !values.hora_pago) {
        message.error('La fecha y hora del pago son requeridas');
        return;
      }
      await onSubmit(values);
    } catch (error) {
      //
    }
  };

  return (
    <Modal
      title={initialValues ? 'Editar Pago' : 'Añadir Pago'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={500}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="id_evento"
          label="Evento"
          rules={[{ required: true, message: 'Seleccione el evento' }]}
        >
          <Select
            placeholder="Seleccione el evento"
            options={eventos.map(evento => ({
              label: `#${evento.id_evento} - ${evento.nombre_cliente || evento.cliente?.nombre_usuario || ''}`,
              value: evento.id_evento
            }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item
          name="monto"
          label="Monto"
          rules={[{ required: true, message: 'Ingrese el monto' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} prefix="$" />
        </Form.Item>
        <Form.Item
          name="tipo_pago"
          label="Tipo de Pago"
          rules={[{ required: true, message: 'Seleccione el tipo de pago' }]}
        >
          <Select options={tipoPagoOptions} placeholder="Seleccione el tipo de pago" />
        </Form.Item>
        <Form.Item
          name="modo_pago"
          label="Modo de Pago"
          rules={[{ required: true, message: 'Seleccione el modo de pago' }]}
        >
          <Select options={modoPagoOptions} placeholder="Seleccione el modo de pago" />
        </Form.Item>
        <Form.Item
          name="fecha_pago"
          label="Fecha de Pago"
          rules={[{ required: true, message: 'Seleccione la fecha de pago' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="hora_pago"
          label="Hora de Pago"
          rules={[{ required: true, message: 'Seleccione la hora de pago' }]}
        >
          <TimePicker style={{ width: '100%' }} format="HH:mm" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PagoForm;
