import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, TimePicker, Select, Switch, Button, message, Space } from 'antd';
import dayjs from 'dayjs';

interface Provincia {
  id_provincia: number;
  nombre_provincia: string;
}

interface Ciudad {
  id_ciudad: number;
  nombre_ciudad: string;
  provincia: Provincia;
}

interface EventoEditFormProps {
  evento: {
    id_evento: number;
    cedula_cliente: string;
    cedula_asesor: string | null;
    fecha_evento: string;
    hora_evento: string;
    id_tipo_evento: number;
    id_direccion: number;
    espacio_evento: string;
    estado_solicitud: 'Pendiente' | 'Aceptada' | 'Rechazada' | 'Completada' | 'Cancelada';
    desea_supervision: boolean;
    nota_cliente?: string;
    creacion_evento: string;
    subtotal_evento: number;
    itbis_evento: number;
    total_evento: number;
    direccion: {
      id_direccion: number;
      id_ciudad: number;
      sector: string;
      calle: string;
      detalles?: string;
      ciudad: Ciudad;
    };
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const EventoEditForm: React.FC<EventoEditFormProps> = ({ evento, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [asesores, setAsesores] = useState<any[]>([]);
  const [tiposEvento, setTiposEvento] = useState<any[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState<Ciudad[]>([]);

  useEffect(() => {
    fetchData();
    if (evento) {
      form.setFieldsValue({
        cedula_cliente: evento.cedula_cliente,
        cedula_asesor: evento.cedula_asesor,
        fecha_evento: dayjs(evento.fecha_evento),
        hora_evento: dayjs(evento.hora_evento, 'HH:mm'),
        id_tipo_evento: evento.id_tipo_evento,
        id_provincia: evento.direccion.ciudad.provincia.id_provincia,
        id_ciudad: evento.direccion.id_ciudad,
        sector: evento.direccion.sector,
        calle: evento.direccion.calle,
        detalles: evento.direccion.detalles,
        espacio_evento: evento.espacio_evento,
        desea_supervision: evento.desea_supervision,
        estado_solicitud: evento.estado_solicitud,
        nota_cliente: evento.nota_cliente
      });
    }
  }, [evento, form]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      // Obtener clientes
      const clientesRes = await fetch(`${apiUrl}/usuario`, { headers });
      const clientesData = await clientesRes.json();
      setClientes(clientesData.filter((u: any) => u.rol_usuario === '2'));

      // Obtener asesores
      const asesoresRes = await fetch(`${apiUrl}/usuario`, { headers });
      const asesoresData = await asesoresRes.json();
      setAsesores(asesoresData.filter((u: any) => u.rol_usuario === '3'));

      // Obtener tipos de evento
      const tiposRes = await fetch(`${apiUrl}/evento/tipo-eventos/list`, { headers });
      const tiposData = await tiposRes.json();
      setTiposEvento(tiposData);

      // Obtener provincias
      const provinciasRes = await fetch(`${apiUrl}/direccion/provincias`, { headers });
      const provinciasData = await provinciasRes.json();
      setProvincias(provinciasData);

      // Si hay provincia seleccionada, cargar sus ciudades
      if (evento.direccion.ciudad.provincia.id_provincia) {
        const ciudadesRes = await fetch(`${apiUrl}/direccion/ciudades/${evento.direccion.ciudad.provincia.id_provincia}`, { headers });
        const ciudadesData = await ciudadesRes.json();
        setCiudades(ciudadesData);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      message.error('Error al cargar los datos necesarios');
    }
  };

  const handleProvinciaChange = (value: number) => {
    // Actualizar las ciudades cuando cambia la provincia
    const ciudadesFiltradas = ciudades.filter(ciudad => ciudad.provincia.id_provincia === value);
    setCiudadesFiltradas(ciudadesFiltradas);
    form.setFieldsValue({ id_ciudad: undefined }); // Resetear la ciudad
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Primero actualizar la dirección
      const direccionResponse = await fetch(`${apiUrl}/direccion/${evento.id_direccion}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_ciudad: values.id_ciudad,
          sector: values.sector,
          calle: values.calle,
          detalles: values.detalles
        })
      });

      if (!direccionResponse.ok) {
        throw new Error('Error al actualizar la dirección');
      }

      // Luego actualizar el evento
      const eventoResponse = await fetch(`${apiUrl}/evento/${evento.id_evento}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cedula_cliente: values.cedula_cliente,
          cedula_asesor: values.cedula_asesor,
          fecha_evento: values.fecha_evento.format('YYYY-MM-DD'),
          hora_evento: values.hora_evento.format('HH:mm'),
          id_tipo_evento: values.id_tipo_evento,
          espacio_evento: values.espacio_evento,
          desea_supervision: values.desea_supervision,
          estado_solicitud: values.estado_solicitud,
          nota_cliente: values.nota_cliente
        })
      });

      if (!eventoResponse.ok) {
        throw new Error('Error al actualizar el evento');
      }

      message.success('Evento actualizado exitosamente');
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      message.error('Error al actualizar el evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
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
          allowClear
          options={asesores.map(asesor => ({
            value: asesor.cedula_usuario,
            label: `${asesor.nombre_usuario} ${asesor.apellido_usuario}`
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
        <TimePicker format="HH:mm" style={{ width: '100%' }} />
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
        name="id_provincia"
        label="Provincia"
        rules={[{ required: true, message: 'Por favor seleccione una provincia' }]}
      >
        <Select
          placeholder="Seleccione una provincia"
          onChange={handleProvinciaChange}
          options={provincias.map(provincia => ({
            value: provincia.id_provincia,
            label: provincia.nombre_provincia
          }))}
        />
      </Form.Item>

      <Form.Item
        name="id_ciudad"
        label="Ciudad"
        rules={[{ required: true, message: 'Por favor seleccione una ciudad' }]}
      >
        <Select
          placeholder="Seleccione una ciudad"
          options={ciudadesFiltradas.map(ciudad => ({
            value: ciudad.id_ciudad,
            label: ciudad.nombre_ciudad
          }))}
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
        <Input placeholder="Ingrese el espacio del evento" />
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
        <Select
          placeholder="Seleccione el estado"
          options={[
            { value: 'Pendiente', label: 'Pendiente' },
            { value: 'Aceptada', label: 'Aceptada' },
            { value: 'Rechazada', label: 'Rechazada' },
            { value: 'Completada', label: 'Completada' },
            { value: 'Cancelada', label: 'Cancelada' }
          ]}
        />
      </Form.Item>

      <Form.Item
        name="nota_cliente"
        label="Notas del Cliente"
      >
        <Input.TextArea placeholder="Ingrese las notas del cliente" />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Guardar Cambios
          </Button>
          <Button onClick={onCancel}>
            Cancelar
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default EventoEditForm; 