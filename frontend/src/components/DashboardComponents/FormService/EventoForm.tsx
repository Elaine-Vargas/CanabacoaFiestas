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
  userCedula?: string;
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
  userCedula
}) => {
  const [form] = Form.useForm();
  const [selectedProvincia, setSelectedProvincia] = useState<string | null>(null);
  const isEditing = !!initialValues;
  const canEdit = !isEditing || initialValues.estado_solicitud === 'Pendiente';

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        // Convertir las fechas a objetos dayjs
        const values = {
          ...initialValues,
          fecha_evento: initialValues.fecha_evento ? dayjs(initialValues.fecha_evento) : null,
          hora_evento: initialValues.hora_evento ? dayjs(initialValues.hora_evento, 'HH:mm:ss') : null,
          id_provincia: initialValues.direccion?.ciudad?.provincia?.id_provincia,
          id_ciudad: initialValues.direccion?.ciudad?.id_ciudad,
          sector: initialValues.direccion?.sector,
          calle: initialValues.direccion?.calle,
          detalles: initialValues.direccion?.detalles,
          id_tipo_evento: initialValues.tipo_evento?.id_tipo_evento,
          espacio_evento: initialValues.espacio_evento,
          desea_supervision: initialValues.desea_supervision,
          nota_cliente: initialValues.nota_cliente,
          cedula_cliente: initialValues.cliente?.cedula_usuario,
          cedula_asesor: initialValues.asesor?.cedula_usuario,
          estado_solicitud: initialValues.estado_solicitud
        };
        form.setFieldsValue(values);
        setSelectedProvincia(initialValues.direccion?.ciudad?.provincia?.id_provincia);
      } else {
        // Si es un nuevo evento, establecer la cédula del usuario actual
        form.setFieldsValue({
          cedula_cliente: userCedula,
          estado_solicitud: 'Pendiente',
          desea_supervision: false
        });
      }
    } else {
      form.resetFields();
      setSelectedProvincia(null);
    }
  }, [visible, initialValues, form, userCedula]);

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
      title={isEditing ? "Editar Evento" : "Crear Evento"}
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
          hidden={true}
        >
          <Input disabled={true} />
        </Form.Item>

        <Form.Item
          name="cedula_asesor"
          label="Asesor"
          hidden={true}
        >
          <Input disabled={true} />
        </Form.Item>

        <Form.Item
          name="estado_solicitud"
          label="Estado"
          hidden={true}
        >
          <Input disabled={true} />
        </Form.Item>

        <Form.Item
          name="fecha_evento"
          label="Fecha del Evento"
          rules={[{ required: true, message: 'Por favor seleccione una fecha' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            disabled={!canEdit}
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
            disabled={!canEdit}
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
            disabled={!canEdit}
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
            disabled={!canEdit}
          />
        </Form.Item>

        <Form.Item
          name="id_ciudad"
          label="Ciudad"
          rules={[{ required: true, message: 'Por favor seleccione una ciudad' }]}
        >
          <Select
            placeholder="Seleccione una ciudad"
            disabled={!selectedProvincia || !canEdit}
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
          <Input disabled={!canEdit} />
        </Form.Item>

        <Form.Item
          name="calle"
          label="Calle"
          rules={[{ required: true, message: 'Por favor ingrese la calle' }]}
        >
          <Input disabled={!canEdit} />
        </Form.Item>

        <Form.Item
          name="detalles"
          label="Detalles Adicionales"
        >
          <Input.TextArea rows={4} disabled={!canEdit} />
        </Form.Item>

        <Form.Item
          name="espacio_evento"
          label="Espacio del Evento"
          rules={[{ required: true, message: 'Por favor ingrese el espacio del evento' }]}
        >
          <Input disabled={!canEdit} />
        </Form.Item>

        <Form.Item
          name="desea_supervision"
          label="¿Desea supervisión?"
          valuePropName="checked"
        >
          <Switch disabled={!canEdit} />
        </Form.Item>

        <Form.Item
          name="nota_cliente"
          label="Notas"
        >
          <Input.TextArea rows={4} disabled={!canEdit} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EventoForm; 