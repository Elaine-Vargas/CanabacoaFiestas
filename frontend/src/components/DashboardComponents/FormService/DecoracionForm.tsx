import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Table, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Evento {
  id_evento: number;
  nombre_evento: string;
  fecha_evento: string;
}

interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
  subcategorias: Subcategoria[];
}

interface Subcategoria {
  id_subcategoria: number;
  nombre_subcategoria: string;
  id_categoria: number;
}

interface ElementoDecoracion {
  id_elemento?: number;
  elemento_decoracion: string;
  cantelemento_decoracion: number;
  precio_elemento: number;
  precio_decoracion: number;
  id_categoria?: number;
  id_subcategoria?: number;
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
  const [elementos, setElementos] = useState<ElementoDecoracion[]>([{
    elemento_decoracion: '',
    cantelemento_decoracion: 1,
    precio_elemento: 0,
    precio_decoracion: 0,
    id_categoria: undefined,
    id_subcategoria: undefined
  }]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loadingSubcategorias, setLoadingSubcategorias] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (visible) {
      fetchEventos();
      fetchCategorias();
    }
  }, [visible]);

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
      setEventos(data);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setLoadingEventos(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const response = await axios.get(`${apiUrl}/elemento/categorias/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Respuesta de categorías:', response.data);
      if (response.data && Array.isArray(response.data)) {
        setCategorias(response.data);
      } else {
        console.error('Formato de datos inválido para categorías', response.data);
        message.error('Error al cargar las categorías');
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      message.error('Error al cargar las categorías');
      setCategorias([]);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const fetchSubcategorias = async (idCategoria: number) => {
    try {
      setLoadingSubcategorias(true);
      const categoria = categorias.find(cat => cat.id_categoria === idCategoria);
      if (categoria) {
        setSubcategorias(categoria.subcategorias);
      }
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
    } finally {
      setLoadingSubcategorias(false);
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
      elemento_decoracion: '',
      cantelemento_decoracion: 1,
      precio_elemento: 0,
      precio_decoracion: 0,
      id_categoria: undefined,
      id_subcategoria: undefined
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

    // Si se cambia la categoría, actualizar las subcategorías disponibles
    if (field === 'id_categoria') {
      const categoriaSeleccionada = categorias.find(cat => cat.id_categoria === value);
      if (categoriaSeleccionada) {
        setSubcategorias(categoriaSeleccionada.subcategorias || []);
        // Limpiar la subcategoría seleccionada
        newElementos[index].id_subcategoria = undefined;
      } else {
        setSubcategorias([]);
      }
    }

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
      title: 'Categoría',
      dataIndex: 'id_categoria',
      key: 'id_categoria',
      render: (_: any, record: ElementoDecoracion, index: number) => (
        <Select
          value={record.id_categoria}
          onChange={(value) => handleElementoChange(index, 'id_categoria', value)}
          placeholder="Seleccione categoría"
          style={{ width: '100%' }}
          loading={loadingCategorias}
        >
          <Select.Option value="">Todas las categorías</Select.Option>
          {categorias.map(categoria => (
            <Select.Option key={categoria.id_categoria} value={categoria.id_categoria}>
              {categoria.nombre_categoria}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Subcategoría',
      dataIndex: 'id_subcategoria',
      key: 'id_subcategoria',
      render: (_: any, record: ElementoDecoracion, index: number) => (
        <Select
          value={record.id_subcategoria}
          onChange={(value) => handleElementoChange(index, 'id_subcategoria', value)}
          placeholder="Seleccione subcategoría"
          style={{ width: '100%' }}
          loading={loadingSubcategorias}
          disabled={!record.id_categoria}
        >
          <Select.Option value="">Todas las subcategorías</Select.Option>
          {subcategorias
            .filter(sub => !record.id_categoria || sub.id_categoria === record.id_categoria)
            .map(subcategoria => (
              <Select.Option key={subcategoria.id_subcategoria} value={subcategoria.id_subcategoria}>
                {subcategoria.nombre_subcategoria}
              </Select.Option>
            ))}
        </Select>
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
      width={1000}
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
          scroll={{ x: 'max-content' }}
        />
      </Form>
    </Modal>
  );
};

export default DecoracionForm; 