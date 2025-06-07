import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Table } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface Evento {
  id_evento: number;
  nombre_evento: string;
  fecha_evento: string;
}

interface ElementoDecoracion {
  id_decoracion: number;
  elemento_decoracion: string;
  cantelemento_decoracion: number;
  precio_elemento: number;
  precio_decoracion: number;
  estado_detdecoracion: 'Aceptado' | 'Cancelado';
}

interface DecoracionFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
}

const DecoracionForm: React.FC<DecoracionFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [elementos, setElementos] = useState<ElementoDecoracion[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchEventos();
    }
  }, [visible]);

  const fetchEventos = async () => {
    try {
      setLoadingEventos(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/evento`);
      if (!response.ok) {
        throw new Error('Error al cargar los eventos');
      }
      const data = await response.json();
      setEventos(data);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setLoadingEventos(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        elementos: elementos
      };
      onSubmit(formData);
      form.resetFields();
      setElementos([]);
    } catch (error) {
      console.error('Error al validar el formulario:', error);
    }
  };

  const handleAddElemento = () => {
    const newElemento: ElementoDecoracion = {
      id_decoracion: 0,
      elemento_decoracion: '',
      cantelemento_decoracion: 1,
      precio_elemento: 0,
      precio_decoracion: 0,
      estado_detdecoracion: 'Aceptado'
    };
    setElementos([...elementos, newElemento]);
  };

  const handleRemoveElemento = (index: number) => {
    const newElementos = [...elementos];
    newElementos.splice(index, 1);
    setElementos(newElementos);
  };

  const handleElementoChange = (index: number, field: keyof ElementoDecoracion, value: any) => {
    const newElementos = [...elementos];
    newElementos[index] = {
      ...newElementos[index],
      [field]: value,
      precio_decoracion: field === 'cantelemento_decoracion' || field === 'precio_elemento'
        ? newElementos[index].cantelemento_decoracion * newElementos[index].precio_elemento
        : newElementos[index].precio_decoracion
    };
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
        {...{
    formatter: (value: any) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    parser: (value: any) =>
      typeof value === 'string' ? value.replace(/\$\s?|(,*)/g, '') : '',
  }}
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

  return (
    <Modal
      title="Nueva Decoración"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} className="cancel-button">
          Cancelar
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
          className="submit-button"
        >
          Enviar Decoración
        </Button>
      ]}
      width={800}
      className="dashboard-modal"
    >
      <Form
        form={form}
        layout="vertical"
        className="dashboard-form"
      >
        <Form.Item
          name="id_evento"
          label="Evento"
          rules={[{ required: true, message: 'Por favor seleccione el evento' }]}
        >
          <Select
            placeholder="Seleccione el evento"
            loading={loadingEventos}
            showSearch
            optionFilterProp="children"
          >
            {eventos.map(evento => (
              <Select.Option key={evento.id_evento} value={evento.id_evento}>
                {`${evento.nombre_evento} - ${new Date(evento.fecha_evento).toLocaleDateString()}`}
              </Select.Option>
            ))}
          </Select>
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

        <Form.Item
          name="estado_decoracion"
          label="Estado"
          initialValue="Solicitado"
        >
          <Select>
            <Select.Option value="Solicitado">Solicitado</Select.Option>
            <Select.Option value="Aceptado">Aceptado</Select.Option>
            <Select.Option value="Completado">Completado</Select.Option>
            <Select.Option value="Cancelado">Cancelado</Select.Option>
          </Select>
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
        />
      </Form>
    </Modal>
  );
};

export default DecoracionForm; 