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
        console.log('=== INICIO EDICIÓN EVENTO ===');
        console.log('Initial values recibidos:', initialValues);
        console.log('Datos de dirección disponibles:', initialValues.direccion);
        console.log('Estructura completa de dirección:', JSON.stringify(initialValues.direccion, null, 2));
        
        // Mapear todos los campos relevantes del evento
        let provinciaId = null;
        if (initialValues.id_provincia != null) {
          provinciaId = Number(initialValues.id_provincia);
          console.log('Provincia ID desde initialValues.id_provincia:', provinciaId);
        } else if (initialValues.direccion?.ciudad?.provincia?.id_provincia != null) {
          provinciaId = Number(initialValues.direccion.ciudad.provincia.id_provincia);
          console.log('Provincia ID desde direccion.ciudad.provincia.id_provincia:', provinciaId);
        } else if (initialValues.direccion?.ciudad?.id_provincia != null) {
          provinciaId = Number(initialValues.direccion.ciudad.id_provincia);
          console.log('Provincia ID desde direccion.ciudad.id_provincia:', provinciaId);
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
          estado_solicitud: userRole === 'Cliente' ? 'Pendiente' : (initialValues.estado_solicitud ?? 'Pendiente'),
          total_evento: initialValues.total_evento ?? '',
          subtotal_evento: initialValues.subtotal_evento ?? '',
          itbis_evento: initialValues.itbis_evento ?? '',
          id_direccion: initialValues.id_direccion ?? initialValues.direccion?.id_direccion ?? '',
        };
        
        console.log('Valores mapeados para el formulario:', values);
        console.log('Provincia ID final:', values.id_provincia);
        console.log('Ciudad ID final:', values.id_ciudad);
        console.log('Sector final:', values.sector);
        console.log('Calle final:', values.calle);
        
        form.setFieldsValue(values);
        setSelectedProvincia(provinciaId);
        console.log('=== FIN EDICIÓN EVENTO ===');
      } else {
        setIsEditMode(false);
        // Si es un nuevo evento, establecer valores según el rol
        const formValues: any = {
          estado_solicitud: 'Pendiente',
          desea_supervision: false
        };

        // Lógica según el rol del usuario
        if (userRole === 'Cliente') {
          // Cliente: se auto-asigna como cliente, no puede seleccionar asesor
          formValues.cedula_cliente = userCedula;
          formValues.cedula_asesor = null; // El asesor se asigna después por el admin
          formValues.estado_solicitud = 'Pendiente'; // Clientes siempre inician con estado pendiente
        } else if (userRole === 'Empleado') {
          // Empleado: puede seleccionar cliente, se auto-asigna como asesor
          formValues.cedula_asesor = userCedula;
        } else if (userRole === 'Administrador') {
          // Admin: puede seleccionar tanto cliente como asesor
          // No se establecen valores por defecto
        }

        form.setFieldsValue(formValues);
        setSelectedProvincia(null);
      }
    } else {
      form.resetFields();
      setSelectedProvincia(null);
      setIsEditMode(false);
    }
  }, [visible, initialValues, form, userCedula, userRole]);

  const handleProvinciaChange = (value: number) => {
    setSelectedProvincia(value);
    form.setFieldValue('id_ciudad', undefined);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('Valores del formulario antes de enviar:', values);
      
      // Validar campos obligatorios
      if (!values.fecha_evento || !values.hora_evento) {
        message.error('La fecha y hora del evento son requeridas');
        return;
      }

      if (!values.cedula_cliente) {
        message.error('El cliente es requerido');
        return;
      }

      if (!values.id_tipo_evento) {
        message.error('El tipo de evento es requerido');
        return;
      }

      if (!values.espacio_evento) {
        message.error('El espacio del evento es requerido');
        return;
      }

      if (!values.id_ciudad) {
        message.error('La ciudad es requerida');
        return;
      }

      if (!values.sector) {
        message.error('El sector es requerido');
        return;
      }

      if (!values.calle) {
        message.error('La calle es requerida');
        return;
      }

      // Formatear fecha y hora para el backend
      const formattedValues = {
        ...values,
        fecha_evento: values.fecha_evento ? values.fecha_evento.format('YYYY-MM-DD') : null,
        hora_evento: values.hora_evento ? values.hora_evento.format('HH:mm:ss') : null
      };

      console.log('Valores formateados para enviar:', formattedValues);

      // Lógica específica según el rol
      if (userRole === 'Cliente') {
        // Cliente: se auto-asigna como cliente, no puede seleccionar asesor
        formattedValues.cedula_cliente = userCedula;
        formattedValues.cedula_asesor = null; // El asesor se asigna después por el admin
        formattedValues.estado_solicitud = 'Pendiente'; // Clientes siempre mantienen estado pendiente
      } else if (userRole === 'Empleado') {
        // Empleado: puede seleccionar cliente, se auto-asigna como asesor
        formattedValues.cedula_asesor = userCedula;
      } else if (userRole === 'Administrador') {
        // Admin: puede seleccionar tanto cliente como asesor
        // Validar que se haya seleccionado un asesor
        if (!formattedValues.cedula_asesor) {
          message.error('El asesor es requerido para el administrador');
          return;
        }
      }

      await onSubmit(formattedValues);
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
        hidden={userRole === 'Cliente'}
      >
        <Select
          placeholder="Seleccione un cliente"
          options={Array.isArray(clientes) ? clientes.map(cliente => ({
            label: `${cliente.nombre_usuario} ${cliente.apellido_usuario}`,
            value: cliente.cedula_usuario
          })) : []}
          showSearch
          optionFilterProp="label"
          disabled={userRole === 'Cliente'}
        />
      </Form.Item>

      <Form.Item
        name="cedula_asesor"
        label="Asesor"
        rules={[{ required: userRole === 'Administrador', message: 'Por favor seleccione un asesor' }]}
        hidden={userRole === 'Cliente'}
      >
        <Select
          placeholder={userRole === 'Empleado' ? 'Se auto-asignará como asesor' : 'Seleccione un asesor'}
          options={Array.isArray(asesores) ? asesores.map(asesor => ({
            label: `${asesor.nombre_usuario} ${asesor.apellido_usuario}`,
            value: asesor.cedula_usuario
          })) : []}
          showSearch
          optionFilterProp="label"
          disabled={userRole === 'Cliente' || userRole === 'Empleado'}
        />
      </Form.Item>

      <Form.Item
        name="estado_solicitud"
        label="Estado"
        rules={[{ required: true, message: 'Por favor seleccione un estado' }]}
        hidden={userRole === 'Cliente'}
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
          disabled={userRole === 'Cliente'}
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
          options={Array.isArray(tiposEvento) ? tiposEvento.map(tipo => ({
            label: tipo.tipo_evento,
            value: tipo.id_tipo_evento
          })) : []}
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
          options={Array.isArray(provincias) ? provincias.map(provincia => ({
            label: provincia.nombre_provincia,
            value: provincia.id_provincia
          })) : []}
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
          options={Array.isArray(ciudades) ? ciudades
            .filter(ciudad => ciudad.id_provincia === selectedProvincia)
            .map(ciudad => ({
              label: ciudad.nombre_ciudad,
              value: ciudad.id_ciudad
            })) : []}
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