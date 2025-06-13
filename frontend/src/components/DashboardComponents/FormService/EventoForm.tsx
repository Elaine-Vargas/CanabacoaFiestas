import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, TimePicker, Switch, Modal, message } from 'antd';
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
  initialValues
}) => {
  const [form] = Form.useForm();
  const [selectedProvincia, setSelectedProvincia] = useState<string | null>(null);

  useEffect(() => {
    if (visible && initialValues) {
      // Convertir las fechas a objetos dayjs
      const values = {
        ...initialValues,
        fecha_evento: initialValues.fecha_evento ? dayjs(initialValues.fecha_evento) : null,
        hora_evento: initialValues.hora_evento ? dayjs(initialValues.hora_evento, 'HH:mm:ss') : null,
        id_provincia: initialValues.direccion?.ciudad?.id_provincia,
        id_ciudad: initialValues.direccion?.id_ciudad,
        sector: initialValues.direccion?.sector,
        calle: initialValues.direccion?.calle,
        detalles: initialValues.direccion?.detalles
      };
      form.setFieldsValue(values);
      setSelectedProvincia(initialValues.direccion?.ciudad?.id_provincia);
    } else {
      form.resetFields();
      setSelectedProvincia(null);
    }
  }, [visible, initialValues, form]);

  const handleProvinciaChange = (value: string) => {
    setSelectedProvincia(value);
    form.setFieldValue('id_ciudad', undefined);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Validar que las fechas sean válidas
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
    <Modal
      title={initialValues ? "Editar Evento" : "Crear Evento"}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          desea_supervision: false,
          estado_solicitud: 'Pendiente'
        }}
      >
        <Form.Item
          name="cedula_cliente"
          label="Cliente"
          rules={[{ required: true, message: 'Por favor seleccione un cliente' }]}
        >
          <Select
            placeholder="Seleccione un cliente"
            options={clientes.map(cliente => ({
              label: `${cliente.nombre_usuario} ${cliente.apellido_usuario} - ${cliente.cedula_usuario}`,
              value: cliente.cedula_usuario
            }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          name="cedula_asesor"
          label="Asesor"
          rules={[{ required: true, message: 'Por favor seleccione un asesor' }]}
        >
          <Select
            placeholder="Seleccione un asesor"
            options={asesores.map(asesor => ({
              label: `${asesor.nombre_usuario} ${asesor.apellido_usuario} - ${asesor.cedula_usuario}`,
              value: asesor.cedula_usuario
            }))}
            showSearch
            optionFilterProp="label"
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
          <Input.TextArea placeholder="Ingrese detalles adicionales de la dirección" />
        </Form.Item>

        <Form.Item
          name="espacio_evento"
          label="Espacio del Evento"
          rules={[{ required: true, message: 'Por favor ingrese el espacio del evento' }]}
        >
          <Input.TextArea placeholder="Describa el espacio del evento" />
        </Form.Item>

        <Form.Item
          name="desea_supervision"
          label="Desea Supervisión"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="estado_solicitud"
          label="Estado de la Solicitud"
          rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
        >
          <Select>
            <Select.Option value="Pendiente">Pendiente</Select.Option>
            <Select.Option value="Aceptada">Aceptada</Select.Option>
            <Select.Option value="Rechazada">Rechazada</Select.Option>
            <Select.Option value="Completada">Completada</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="nota_cliente"
          label="Nota del Cliente"
        >
          <Input.TextArea placeholder="Ingrese notas adicionales" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EventoForm; 