import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message, Descriptions } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

interface Evento {
  id_evento: number;
  tipo_evento: {
    id_tipo_evento: number;
    tipo_evento: string;
  };
  fecha_evento: Dayjs;
  hora_evento: Dayjs;
  id_direccion: number,
  direccion: {
    ciudad: {
      id_ciudad: number;
      nombre_ciudad: string;
      provincia: {
        id_provincia: number;
        nombre_provincia: string;
      }
    }
    sector: string;
    calle: string;
    detalles?: string;
  }
  estado_solicitud: string;
  cliente: {
    cedula_usuario: string;
    nombre_usuario: string;
  }
  asesor: {
    cedula_usuario: string;
    nombre_usuario: string;
    apellido_usuario: string;
    tel_usuario: string;
  };
  id_tipo_evento: number;
  nota_cliente: string;
  espacio_evento: string;
  desea_supervision: boolean;
}

interface Decoracion {
  id_decoracion?: number;
  id_evento: number;
  tema_decoracion: string;
  colores_decoracion: string;
  precioneto_decoracion?: number;
  itbis_decoracion?: number;
  total_decoracion?: number;
  estado_decoracion?: string;
  detalle_decoracion?: {
    id_detdecoracion: number;
    elemento_decoracion: string;
    cantelemento_decoracion: number;
    precio_elemento: number;
    precio_decoracion: number;
    estado_detdecoracion: string;
  }[];
  evento?: Evento;
}

interface DecoracionFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: Decoracion) => Promise<void>;
  loading?: boolean;
  initialValues?: Decoracion | undefined;
  eventosCliente: Evento[];
  userCedula: string;
}

const DecoracionForm: React.FC<DecoracionFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
  initialValues,
  eventosCliente,
  userCedula
}) => {
  const [form] = Form.useForm();
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [showEventoDetails, setShowEventoDetails] = useState(false);

  const filteredEventos = eventosCliente || [];

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        tema_decoracion: initialValues.tema_decoracion,
        colores_decoracion: initialValues.colores_decoracion,
        id_evento: initialValues.id_evento,
        estado_decoracion: initialValues.estado_decoracion
      });
    } else if (visible && !initialValues) {
      form.resetFields();
      setSelectedEvento(null);
    }
  }, [visible, initialValues, form]);

  useEffect(() => {
    const currentIdEvento = form.getFieldValue('id_evento');
    if (currentIdEvento) {
      const evento = filteredEventos.find(e => e.id_evento === currentIdEvento);
      setSelectedEvento(evento || null);
    } else {
      setSelectedEvento(null);
    }
  }, [form, filteredEventos]);

  const handleSubmit = async (values: any) => {
    try {
      console.log('Valores del formulario al enviar:', values);
      const decoracionToSubmit: Decoracion = {
        id_evento: values.id_evento,
        tema_decoracion: values.tema_decoracion,
        colores_decoracion: values.colores_decoracion,
      };

      if (initialValues) {
        decoracionToSubmit.id_decoracion = initialValues.id_decoracion;
        decoracionToSubmit.precioneto_decoracion = initialValues.precioneto_decoracion;
        decoracionToSubmit.itbis_decoracion = initialValues.itbis_decoracion;
        decoracionToSubmit.total_decoracion = initialValues.total_decoracion;
        decoracionToSubmit.estado_decoracion = initialValues.estado_decoracion;
        decoracionToSubmit.detalle_decoracion = initialValues.detalle_decoracion || [];
      } else {
        decoracionToSubmit.estado_decoracion = 'solicitado';
        decoracionToSubmit.detalle_decoracion = [];
      }
      
      await onSubmit(decoracionToSubmit);
      
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error(`Error al procesar formulario de decoración:`, error);
      message.error(error instanceof Error ? error.message : `Error al procesar el formulario de decoración`);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const showEventoDetailsModal = () => {
    setShowEventoDetails(true);
  };

  const hideEventoDetailsModal = () => {
    setShowEventoDetails(false);
  };

  return (
    <Modal
      title={initialValues ? "Editar Decoración" : "Crear Decoración"}
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ 
          ...initialValues,
          id_evento: initialValues?.id_evento,
          estado_decoracion: initialValues?.estado_decoracion || 'solicitado' 
        }}
        className="dashboard-form"
      >
        <Form.Item
          name="id_evento"
          label="Evento"
          rules={[{ required: true, message: 'Por favor seleccione un evento' }]}
        >
          <Select
            placeholder="Seleccione el evento"
            options={filteredEventos.map(evento => ({
              label: `ID: ${evento.id_evento} - ${evento.tipo_evento.tipo_evento} - ${dayjs(evento.fecha_evento).format('DD/MM/YYYY')} - Cliente: ${evento.cliente?.nombre_usuario}`,
              value: evento.id_evento
            }))}
            showSearch
            optionFilterProp="label"
            loading={loading}
          />
        </Form.Item>

        {selectedEvento && (
          <Button type="link" onClick={showEventoDetailsModal}>
            Ver Detalles del Evento
          </Button>
        )}

        <Form.Item
          name="tema_decoracion"
          label="Tema de Decoración"
          rules={[{ required: true, message: 'Por favor describa el tema de la decoración' }]}
        >
          <Input.TextArea rows={2} placeholder="Describa el tema de la decoración" maxLength={255} />
        </Form.Item>

        <Form.Item
          name="colores_decoracion"
          label="Colores"
          rules={[{ required: true, message: 'Por favor ingrese los colores de la decoración' }]}
        >
          <Input placeholder="Ingrese los colores de la decoración" maxLength={255} />
        </Form.Item>

        <Modal
          title="Detalles del Evento"
          open={showEventoDetails}
          onCancel={hideEventoDetailsModal}
          footer={null}
        >
          {selectedEvento && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tipo de Evento">
                {selectedEvento.tipo_evento.tipo_evento}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha">
                {selectedEvento.fecha_evento && dayjs.isDayjs(selectedEvento.fecha_evento) && selectedEvento.fecha_evento.isValid() ? selectedEvento.fecha_evento.format('DD/MM/YYYY') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Hora">
                {selectedEvento.hora_evento && dayjs.isDayjs(selectedEvento.hora_evento) && selectedEvento.hora_evento.isValid() ? selectedEvento.hora_evento.format('HH:mm') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                {selectedEvento.estado_solicitud}
              </Descriptions.Item>
              <Descriptions.Item label="Espacio">
                {selectedEvento.espacio_evento}
              </Descriptions.Item>
              <Descriptions.Item label="Dirección">
                {selectedEvento.direccion ? 
                  `${selectedEvento.direccion.calle || ''} ${selectedEvento.direccion.sector || ''} ${selectedEvento.direccion.ciudad?.nombre_ciudad || ''} ${selectedEvento.direccion.ciudad?.provincia?.nombre_provincia || ''}`
                  : 'No disponible'}
              </Descriptions.Item>
              <Descriptions.Item label="Notas">
                {selectedEvento.nota_cliente || selectedEvento.direccion?.detalles || 'Sin notas'}
              </Descriptions.Item>
              <Descriptions.Item label="Cliente">
                {selectedEvento.cliente ? 
                  `${selectedEvento.cliente.nombre_usuario} (Cédula: ${selectedEvento.cliente.cedula_usuario})`
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Asesor">
                {selectedEvento.asesor ? 
                  `${selectedEvento.asesor.nombre_usuario} ${selectedEvento.asesor.apellido_usuario} (Cédula: ${selectedEvento.asesor.cedula_usuario}, Teléfono: ${selectedEvento.asesor.tel_usuario})`
                  : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </Form>
    </Modal>
  );
};

export default DecoracionForm;