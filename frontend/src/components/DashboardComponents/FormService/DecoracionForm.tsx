import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Table, message, Descriptions } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Evento {
  id_evento: number;
  nombre_cliente: string;
  fecha_evento: string;
  hora_evento: string;
  tipo_evento: string | { tipo_evento: string };
  espacio_evento: string;
  desea_supervision: boolean;
  estado_solicitud: string;
  total_evento: number;
  nombre_asesor: string | null;
  cliente?: {
    nombre_usuario: string;
    apellido_usuario: string;
  };
  asesor?: {
    nombre_usuario: string;
    apellido_usuario: string;
  };
}

interface ElementoDecoracion {
  id_elemento?: number;
  elemento_decoracion: string;
  cantelemento_decoracion: number;
  precio_elemento: number;
  precio_decoracion: number;
}

interface Decoracion {
  id_decoracion: number;
  id_evento: number;
  tema_decoracion: string;
  colores_decoracion: string;
  precioneto_decoracion: number;
  itbis_decoracion: number;
  total_decoracion: number;
  estado_decoracion: string;
  detalle_decoracion?: {
    id_detdecoracion: number;
    elemento_decoracion: string;
    cantelemento_decoracion: number;
    precio_elemento: number;
    precio_decoracion: number;
    estado_detdecoracion: string;
  }[];
  evento?: {
    id_evento: number;
    fecha_evento: string;
    tipo_evento: {
      id_tipo_evento: number;
      tipo_evento: string;
    };
    cliente?: {
      nombre_usuario: string;
      apellido_usuario: string;
    };
  };
}

interface DecoracionFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
  initialValues?: Decoracion | null;
}

const DecoracionForm: React.FC<DecoracionFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [showEventoDetails, setShowEventoDetails] = useState(false);
  const [elementos, setElementos] = useState<ElementoDecoracion[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchEventos();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        tema_decoracion: initialValues.tema_decoracion,
        colores_decoracion: initialValues.colores_decoracion,
        id_evento: initialValues.id_evento,
        estado_decoracion: initialValues.estado_decoracion
      });
      if (initialValues.detalle_decoracion) {
        setElementos(initialValues.detalle_decoracion);
      }
    }
  }, [visible, initialValues, form]);

  const fetchEventos = async () => {
    try {
      setLoadingEventos(true);
      const response = await fetch(`${apiUrl}/evento`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar los eventos');
      }
      
      const data = await response.json();
      setEventos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      message.error('Error al cargar los eventos');
    } finally {
      setLoadingEventos(false);
    }
  };

  const calculateTotals = (elementos: ElementoDecoracion[]) => {
    const precioneto = elementos.reduce((total, elemento) => 
      total + (elemento.precio_elemento * elemento.cantelemento_decoracion), 0);
    const itbis = precioneto * 0.18;
    const total = precioneto + itbis;
    
    return { precioneto, itbis, total };
  };

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      const decoracionData = {
        id_evento: values.id_evento,
        tema_decoracion: values.tema_decoracion,
        colores_decoracion: values.colores_decoracion,
        detalle_decoracion: elementos.map(elemento => ({
          elemento_decoracion: elemento.elemento_decoracion,
          cantelemento_decoracion: elemento.cantelemento_decoracion,
          precio_elemento: elemento.precio_elemento,
          precio_decoracion: elemento.precio_decoracion,
          estado_detdecoracion: 'Activo'
        }))
      };

      let response;
      if (initialValues) {
        // Si estamos editando, actualizamos la decoración existente
        response = await fetch(`${apiUrl}/decoracion/${initialValues.id_decoracion}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(decoracionData)
        });
      } else {
        // Si estamos creando, insertamos una nueva decoración
        response = await fetch(`${apiUrl}/decoracion`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(decoracionData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || `Error al ${initialValues ? 'actualizar' : 'crear'} la decoración`);
      }

      const data = await response.json();
      message.success(`Decoración ${initialValues ? 'actualizada' : 'creada'} exitosamente`);
      onSubmit(data);
      form.resetFields();
      setElementos([]);
      onCancel();
    } catch (error) {
      console.error(`Error al ${initialValues ? 'actualizar' : 'crear'} decoración:`, error);
      message.error(error instanceof Error ? error.message : `Error al ${initialValues ? 'actualizar' : 'crear'} la decoración`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddElemento = () => {
    const newElemento: ElementoDecoracion = {
      elemento_decoracion: '',
      cantelemento_decoracion: 1,
      precio_elemento: 0,
      precio_decoracion: 0
    };
    setElementos([...elementos, newElemento]);
  };

  const handleRemoveElemento = (index: number) => {
    const newElementos = [...elementos];
    newElementos.splice(index, 1);
    setElementos(newElementos);
  };

  const handleElementoChange = (index: number, field: string, value: any) => {
    const newElementos = [...elementos];
    newElementos[index] = {
      ...newElementos[index],
      [field]: value
    };

    // Calcular el precio total si cambia la cantidad o el precio unitario
    if (field === 'cantelemento_decoracion' || field === 'precio_elemento') {
      const cantidad = field === 'cantelemento_decoracion' ? value : newElementos[index].cantelemento_decoracion;
      const precioUnitario = field === 'precio_elemento' ? value : newElementos[index].precio_elemento;
      newElementos[index].precio_decoracion = cantidad * precioUnitario;
    }

    setElementos(newElementos);
  };

  const columns = [
    {
      title: 'Elemento',
      dataIndex: 'elemento_decoracion',
      key: 'elemento_decoracion',
      render: (_: any, record: ElementoDecoracion, index: number) => (
        <Input
          value={record.elemento_decoracion}
          onChange={(e) => handleElementoChange(index, 'elemento_decoracion', e.target.value)}
          placeholder="Nombre del elemento"
          maxLength={50}
        />
      ),
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantelemento_decoracion',
      key: 'cantelemento_decoracion',
      render: (_: any, record: ElementoDecoracion, index: number) => (
        <InputNumber
          value={record.cantelemento_decoracion}
          onChange={(value) => handleElementoChange(index, 'cantelemento_decoracion', value)}
          min={1}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Precio Unitario',
      dataIndex: 'precio_elemento',
      key: 'precio_elemento',
      render: (_: any, record: ElementoDecoracion, index: number) => (
        <InputNumber
          value={record.precio_elemento}
          onChange={(value) => handleElementoChange(index, 'precio_elemento', value)}
          min={0}
          precision={2}
          style={{ width: '100%' }}
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, ''))}
        />
      ),
    },
    {
      title: 'Total',
      dataIndex: 'precio_decoracion',
      key: 'precio_decoracion',
      render: (value: number) => `$ ${value.toFixed(2)}`,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, __: any, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveElemento(index)}
        />
      ),
    },
  ];

  const handleCancel = () => {
    form.resetFields();
    setElementos([]);
    onCancel();
  };

  // Calcular el total general
  const { precioneto, itbis, total } = calculateTotals(elementos);

  const handleEventoSelect = (value: number) => {
    const eventoSeleccionado = eventos.find(evento => evento.id_evento === value);
    setSelectedEvento(eventoSeleccionado || null);
  };

  const showEventoDetailsModal = () => {
    if (selectedEvento) {
      Modal.info({
        title: 'Detalles del Evento',
        width: 600,
        content: (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Cliente" span={2}>
              {selectedEvento.cliente?.nombre_usuario} {selectedEvento.cliente?.apellido_usuario}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha">{selectedEvento.fecha_evento}</Descriptions.Item>
            <Descriptions.Item label="Hora">{selectedEvento.hora_evento}</Descriptions.Item>
            <Descriptions.Item label="Tipo de Evento" span={2}>
              {typeof selectedEvento.tipo_evento === 'string' 
                ? selectedEvento.tipo_evento 
                : selectedEvento.tipo_evento.tipo_evento}
            </Descriptions.Item>
            <Descriptions.Item label="Espacio">{selectedEvento.espacio_evento}</Descriptions.Item>
            <Descriptions.Item label="Supervisión">
              {selectedEvento.desea_supervision ? 'Sí' : 'No'}
            </Descriptions.Item>
          </Descriptions>
        ),
      });
    }
  };

  return (
    <Modal
      title={initialValues ? "Editar Decoración" : "Crear Decoración"}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="decoracion-form"
      >
        <Form.Item
            name="id_evento"
            label="Evento"
            rules={[{ required: true, message: 'Por favor seleccione el evento' }]}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <Select
                placeholder="Seleccione el evento"
                loading={loadingEventos}
                showSearch
                allowClear
                onChange={(value) => {
                  form.setFieldsValue({ id_evento: value });
                  handleEventoSelect(value);
                }}
                onClear={() => {
                  form.setFieldsValue({ id_evento: undefined });
                  setSelectedEvento(null);
                  setShowEventoDetails(false);
                }}
                filterOption={(input, option) => {
                  if (typeof option?.label === 'string') {
                    return option.label.toLowerCase().includes(input.toLowerCase());
                  }
                  return false;
                }}
                options={eventos.map(evento => ({
                  value: evento.id_evento,
                  label: `ID: ${evento.id_evento} - ${evento.cliente?.nombre_usuario || ''} ${evento.cliente?.apellido_usuario || ''}`
                }))}
                style={{ flex: 1 }}
              />
              {selectedEvento && (
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={showEventoDetailsModal}
                  title="Ver detalles del evento"
                />
              )}
            </div>
          </Form.Item>
          <Form.Item
            name="tema_decoracion"
            label="Tema de Decoración"
            rules={[{ required: true, message: 'Por favor ingrese el tema de decoración' }]}
          >
            <Input.TextArea rows={3} placeholder="Describa el tema de la decoración" />
          </Form.Item>

          <Form.Item
            name="colores_decoracion"
            label="Colores"
            rules={[
              { required: true, message: 'Por favor ingrese los colores' },
              { max: 100, message: 'Los colores no pueden exceder los 100 caracteres' }
            ]}
          >
            <Input placeholder="Ingrese los colores de la decoración" maxLength={100} />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <Button
              type="dashed"
              onClick={handleAddElemento}
              icon={<PlusOutlined />}
              style={{ 
                width: '100%',
                borderColor: 'var(--gold)',
                color: 'var(--gold)'
              }}
              className="gold-button"
            >
              Agregar Elemento
            </Button>
          </div>

        <Table
          columns={columns}
          dataSource={elementos}
          rowKey={(_, index) => (index !== undefined ? index.toString() : '')}
          pagination={false}
          size="small"
          scroll={{ x: 'max-content' }}
        />

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ marginRight: 16 }}>Subtotal: $ {precioneto.toFixed(2)}</span>
            <span style={{ marginRight: 16 }}>ITBIS (18%): $ {itbis.toFixed(2)}</span>
            <span style={{ fontWeight: 'bold' }}>Total: $ {total.toFixed(2)}</span>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default DecoracionForm;