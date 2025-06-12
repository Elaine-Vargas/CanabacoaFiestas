import { useState, useEffect } from "react";
import { Card, Typography, Table, Button, Modal, Form, Input, Rate, message, Select, DatePicker } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import "../../../styles/dashboard/ServicesSubpages.scss";
import EventoForm from "../FormService/EventoForm";
import DecoracionForm from "../FormService/DecoracionForm";
import TableFilters from "../MoreDash/TableFilters";
import type { Dayjs } from 'dayjs';

const { Title } = Typography;

interface Evento {
  id_evento: number;
  tipo_evento: {
    id_tipo_evento: number;
    tipo_evento: string;
  };
  fecha_evento: Dayjs | null;
  hora_evento: Dayjs | null;
  estado_solicitud: string;
  sector: string;
  calle: string;
  detalles: string;
  cedula_cliente: string;
  cedula_asesor: string;
  id_tipo_evento: number;
  nota_cliente: string;
  id_direccion: number;
  espacio_evento: string;
  desea_supervision: boolean;
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
  fecha_decoracion: string;
  detalle_decoracion: string;
  evento: {
    id_evento: number;
    tipo_evento: {
      id_tipo_evento: number;
      tipo_evento: string;
    };
  };
}

interface Comentario {
  id_comentario: number;
  id_evento: number;
  comentario: string;
  calificacion: number;
  estado: string;
  fecha_creacion: string;
}

interface Empleado {
  id_empleado: number;
  nombre: string;
  apellido: string;
  cargo: string;
  id_evento: number;
}

interface TipoEvento {
  id_tipo_evento: number;
  tipo_evento: string;
}

export default function WelcomeClient() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [decoraciones, setDecoraciones] = useState<Decoracion[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [modalEventoVisible, setModalEventoVisible] = useState(false);
  const [modalDecoracionVisible, setModalDecoracionVisible] = useState(false);
  const [modalComentarioVisible, setModalComentarioVisible] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [selectedDecoracion, setSelectedDecoracion] = useState<Decoracion | null>(null);
  const [selectedComentario, setSelectedComentario] = useState<Comentario | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filtrosEventos, setFiltrosEventos] = useState({
    estado: '',
    tipo: '',
    fecha: ''
  });
  const [filtrosDecoraciones, setFiltrosDecoraciones] = useState({
    estado: '',
    tema: ''
  });
  const [filtrosComentarios, setFiltrosComentarios] = useState({
    calificacion: ''
  });

  useEffect(() => {
    fetchData();
    fetchTiposEvento();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      // Obtener datos del usuario actual
      const userResponse = await fetch(`${apiUrl}/auth/current`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Error al obtener datos del usuario');
      }

      const userData = await userResponse.json();
      const userCedula = userData.cedula_usuario;

      // Obtener eventos del cliente
      const eventosResponse = await fetch(`${apiUrl}/evento/cliente/${userCedula}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!eventosResponse.ok) {
        throw new Error('Error al obtener eventos');
      }
      const eventosData = await eventosResponse.json();
      setEventos(eventosData);

      // Obtener decoraciones del cliente
      const decoracionesResponse = await fetch(`${apiUrl}/decoracion/cliente/${userCedula}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!decoracionesResponse.ok) {
        throw new Error('Error al obtener decoraciones');
      }
      const decoracionesData = await decoracionesResponse.json();
      setDecoraciones(decoracionesData);

      // Obtener comentarios del cliente
      const comentariosResponse = await fetch(`${apiUrl}/comentario/cliente/${userCedula}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!comentariosResponse.ok) {
        throw new Error('Error al obtener comentarios');
      }
      const comentariosData = await comentariosResponse.json();
      setComentarios(comentariosData);

      // Obtener empleados asignados a eventos del cliente
      const empleadosResponse = await fetch(`${apiUrl}/evento/empleados/cliente/${userCedula}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!empleadosResponse.ok) {
        throw new Error('Error al obtener empleados');
      }
      const empleadosData = await empleadosResponse.json();
      setEmpleados(empleadosData);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchTiposEvento = async () => {
    try {
      setLoadingTipos(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const response = await fetch(`${apiUrl}/evento/tipo-eventos/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Error al obtener tipos de evento');
      }
      const data = await response.json();
      setTiposEvento(data);
    } catch (error) {
      console.error('Error al cargar tipos de evento:', error);
      message.error('Error al cargar los tipos de evento');
    } finally {
      setLoadingTipos(false);
    }
  };

  // Columnas para la tabla de eventos
  const eventosColumns = [
    {
      title: 'Tipo de Evento',
      dataIndex: ['tipo_evento', 'tipo_evento'],
      key: 'tipo_evento',
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_evento',
      key: 'fecha_evento',
    },
    {
      title: 'Hora',
      dataIndex: 'hora_evento',
      key: 'hora_evento',
    },
    {
      title: 'Estado',
      dataIndex: 'estado_solicitud',
      key: 'estado_solicitud',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Evento) => (
        <>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleVerDetalles(record)}
            style={{ marginRight: 8 }}
          />
          {record.estado_solicitud === 'pendiente' && (
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditarEvento(record)}
              style={{ marginRight: 8 }}
            />
          )}
        </>
      ),
    },
  ];

  // Columnas para la tabla de decoraciones
  const decoracionesColumns = [
    {
      title: 'Evento',
      dataIndex: ['evento', 'tipo_evento', 'tipo_evento'],
      key: 'evento',
    },
    {
      title: 'Estado',
      dataIndex: 'estado_decoracion',
      key: 'estado_decoracion',
    },
    {
      title: 'Fecha Solicitud',
      dataIndex: 'fecha_decoracion',
      key: 'fecha_decoracion',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Decoracion) => (
        <>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleVerDetallesDecoracion(record)}
            style={{ marginRight: 8 }}
          />
          {record.estado_decoracion === 'solicitado' && (
            <>
              <Button
                icon={<EditOutlined />}
                onClick={() => handleEditarDecoracion(record)}
                style={{ marginRight: 8 }}
              />
              <Button
                icon={<DeleteOutlined />}
                onClick={() => handleEliminarDecoracion(record)}
                danger
              />
            </>
          )}
        </>
      ),
    },
  ];

  // Columnas para la tabla de comentarios
  const comentariosColumns = [
    {
      title: 'Evento',
      dataIndex: ['evento', 'tipo_evento', 'tipo_evento'],
      key: 'evento',
    },
    {
      title: 'Comentario',
      dataIndex: 'comentario',
      key: 'comentario',
    },
    {
      title: 'Calificación',
      dataIndex: 'calificacion',
      key: 'calificacion',
      render: (calificacion: number) => <Rate disabled defaultValue={calificacion} />,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Comentario) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditarComentario(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleEliminarComentario(record)}
            danger
          />
        </>
      ),
    },
  ];

  // Columnas para la tabla de empleados
  const empleadosColumns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'Apellido',
      dataIndex: 'apellido',
      key: 'apellido',
    },
    {
      title: 'Cargo',
      dataIndex: 'cargo',
      key: 'cargo',
    },
    {
      title: 'Evento',
      dataIndex: ['evento', 'tipo_evento', 'tipo_evento'],
      key: 'evento',
    },
  ];

  const handleVerDetalles = (evento: Evento) => {
    setSelectedEvento(evento);
    // Implementar lógica para mostrar detalles
  };

  const handleEditarEvento = (evento: Evento) => {
    setSelectedEvento(evento);
    setModalEventoVisible(true);
  };

  const handleVerDetallesDecoracion = (decoracion: Decoracion) => {
    setSelectedDecoracion(decoracion);
    // Implementar lógica para mostrar detalles
  };

  const handleEditarDecoracion = (decoracion: Decoracion) => {
    setSelectedDecoracion(decoracion);
    setModalDecoracionVisible(true);
  };

  const handleEliminarDecoracion = async (decoracion: Decoracion) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const response = await fetch(`${apiUrl}/decoracion/${decoracion.id_decoracion}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la decoración');
      }

      message.success('Decoración eliminada exitosamente');
      fetchData();
    } catch (error) {
      console.error('Error al eliminar decoración:', error);
      message.error('Error al eliminar la decoración');
    }
  };

  const handleEditarComentario = (comentario: Comentario) => {
    setSelectedComentario(comentario);
    form.setFieldsValue({
      comentario: comentario.comentario,
      calificacion: comentario.calificacion
    });
    setModalComentarioVisible(true);
  };

  const handleEliminarComentario = async (comentario: Comentario) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const response = await fetch(`${apiUrl}/comentario/${comentario.id_comentario}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el comentario');
      }

      message.success('Comentario eliminado exitosamente');
      fetchData();
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      message.error('Error al eliminar el comentario');
    }
  };

  const handleSubmitComentario = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No hay sesión activa');
        return;
      }

      const url = selectedComentario
        ? `${apiUrl}/comentario/${selectedComentario.id_comentario}`
        : `${apiUrl}/comentario`;

      const method = selectedComentario ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...values,
          id_evento: selectedEvento?.id_evento
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar el comentario');
      }

      message.success(selectedComentario ? 'Comentario actualizado exitosamente' : 'Comentario creado exitosamente');
      setModalComentarioVisible(false);
      setSelectedComentario(null);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error('Error al guardar comentario:', error);
      message.error('Error al guardar el comentario');
    }
  };

  // Funciones de filtrado
  const getFilteredEventos = () => {
    return eventos.filter(evento => {
      const matchesSearch = 
        evento.tipo_evento.tipo_evento.toLowerCase().includes(searchText.toLowerCase()) ||
        evento.espacio_evento.toLowerCase().includes(searchText.toLowerCase());

      const matchesEstado = !filtrosEventos.estado || evento.estado_solicitud === filtrosEventos.estado;
      const matchesTipo = !filtrosEventos.tipo || evento.tipo_evento.tipo_evento === filtrosEventos.tipo;
      const matchesFecha = !filtrosEventos.fecha || evento.fecha_evento?.format('YYYY-MM-DD') === filtrosEventos.fecha;

      return matchesSearch && matchesEstado && matchesTipo && matchesFecha;
    });
  };

  const getFilteredDecoraciones = () => {
    return decoraciones.filter(decoracion => {
      const matchesSearch = 
        decoracion.tema_decoracion.toLowerCase().includes(searchText.toLowerCase()) ||
        decoracion.colores_decoracion.toLowerCase().includes(searchText.toLowerCase());

      const matchesEstado = !filtrosDecoraciones.estado || decoracion.estado_decoracion === filtrosDecoraciones.estado;
      const matchesTema = !filtrosDecoraciones.tema || decoracion.tema_decoracion === filtrosDecoraciones.tema;

      return matchesSearch && matchesEstado && matchesTema;
    });
  };

  const getFilteredComentarios = () => {
    return comentarios.filter(comentario => {
      const matchesSearch = 
        comentario.comentario.toLowerCase().includes(searchText.toLowerCase());

      const matchesCalificacion = !filtrosComentarios.calificacion || 
        comentario.calificacion === parseInt(filtrosComentarios.calificacion);

      return matchesSearch && matchesCalificacion;
    });
  };

  // Contenido de los filtros
  const filterContentEventos = (
    <div style={{ padding: '8px' }}>
      <Select
        style={{ width: '100%', marginBottom: '8px' }}
        placeholder="Estado"
        allowClear
        onChange={(value) => setFiltrosEventos(prev => ({ ...prev, estado: value }))}
      >
        <Select.Option value="pendiente">Pendiente</Select.Option>
        <Select.Option value="aprobado">Aprobado</Select.Option>
        <Select.Option value="rechazado">Rechazado</Select.Option>
      </Select>
      <Select
        style={{ width: '100%', marginBottom: '8px' }}
        placeholder="Tipo de Evento"
        allowClear
        onChange={(value) => setFiltrosEventos(prev => ({ ...prev, tipo: value }))}
      >
        {tiposEvento.map(tipo => (
          <Select.Option key={tipo.id_tipo_evento} value={tipo.tipo_evento}>
            {tipo.tipo_evento}
          </Select.Option>
        ))}
      </Select>
      <DatePicker
        style={{ width: '100%' }}
        placeholder="Fecha"
        onChange={(date) => setFiltrosEventos(prev => ({ ...prev, fecha: date?.format('YYYY-MM-DD') || '' }))}
      />
    </div>
  );

  const filterContentDecoraciones = (
    <div style={{ padding: '8px' }}>
      <Select
        style={{ width: '100%', marginBottom: '8px' }}
        placeholder="Estado"
        allowClear
        onChange={(value) => setFiltrosDecoraciones(prev => ({ ...prev, estado: value }))}
      >
        <Select.Option value="solicitado">Solicitado</Select.Option>
        <Select.Option value="aprobado">Aprobado</Select.Option>
        <Select.Option value="completado">Completado</Select.Option>
        <Select.Option value="cancelado">Cancelado</Select.Option>
      </Select>
      <Select
        style={{ width: '100%' }}
        placeholder="Tema"
        allowClear
        onChange={(value) => setFiltrosDecoraciones(prev => ({ ...prev, tema: value }))}
      >
        {Array.from(new Set(decoraciones.map(d => d.tema_decoracion))).map(tema => (
          <Select.Option key={tema} value={tema}>
            {tema}
          </Select.Option>
        ))}
      </Select>
    </div>
  );

  const filterContentComentarios = (
    <div style={{ padding: '8px' }}>
      <Select
        style={{ width: '100%' }}
        placeholder="Calificación"
        allowClear
        onChange={(value) => setFiltrosComentarios(prev => ({ ...prev, calificacion: value }))}
      >
        <Select.Option value="5">5 estrellas</Select.Option>
        <Select.Option value="4">4 estrellas</Select.Option>
        <Select.Option value="3">3 estrellas</Select.Option>
        <Select.Option value="2">2 estrellas</Select.Option>
        <Select.Option value="1">1 estrella</Select.Option>
      </Select>
    </div>
  );

  // Contar filtros activos
  const getActiveFiltersCount = (filtros: any) => {
    return Object.values(filtros).filter(value => value !== '').length;
  };

  return (
    <div className="welcome-container">
      <Card className="welcome-card">
        <Title level={2} className="welcome-title">
          ¡Te damos la bienvenida a tu panel de Cliente!
        </Title>
        <p className="welcome-subtitle">
          Aquí podrás gestionar tus eventos y servicios con Canabacoa Fiestas
        </p>
      </Card>

      <div className="dashboard-container">
        <div className="dashboard-grid">
          {/* Primera fila: Eventos */}
          <div className="dashboard-row">
            <Card
              title="EVENTOS"
              className="dashboard-card full-width"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="action-button primary"
                  onClick={() => {
                    setSelectedEvento(null);
                    setModalEventoVisible(true);
                  }}
                >
                  Solicitar Evento
                </Button>
              }
            >
              <TableFilters
                type="eventos"
                searchText={searchText}
                onSearchChange={setSearchText}
                clearFilters={() => setFiltrosEventos({ estado: '', tipo: '', fecha: '' })}
                activeFiltersCount={getActiveFiltersCount(filtrosEventos)}
                filterContent={filterContentEventos}
              />
              <Table
                className="dashboard-table"
                columns={eventosColumns}
                dataSource={getFilteredEventos()}
                loading={loading}
                pagination={{ pageSize: 3 }}
                rowKey="id_evento"
                scroll={{ x: 'max-content' }}
              />
            </Card>
          </div>

          {/* Segunda fila: Decoraciones y Comentarios */}
          <div className="dashboard-row">
            <Card
              title="DECORACIONES"
              className="dashboard-card"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="action-button primary"
                  onClick={() => {
                    setSelectedDecoracion(null);
                    setModalDecoracionVisible(true);
                  }}
                >
                  Solicitar Decoración
                </Button>
              }
            >
              <TableFilters
                type="decoraciones"
                searchText={searchText}
                onSearchChange={setSearchText}
                clearFilters={() => setFiltrosDecoraciones({ estado: '', tema: '' })}
                activeFiltersCount={getActiveFiltersCount(filtrosDecoraciones)}
                filterContent={filterContentDecoraciones}
              />
              <Table
                className="dashboard-table"
                columns={decoracionesColumns}
                dataSource={getFilteredDecoraciones()}
                loading={loading}
                pagination={{ pageSize: 3 }}
                rowKey="id_decoracion"
                scroll={{ x: 'max-content' }}
              />
            </Card>

            <Card
              title="COMENTARIOS"
              className="dashboard-card"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="action-button primary"
                  onClick={() => {
                    setSelectedComentario(null);
                    setModalComentarioVisible(true);
                  }}
                >
                  Agregar Comentario
                </Button>
              }
            >
              <TableFilters
                type="comentarios"
                searchText={searchText}
                onSearchChange={setSearchText}
                clearFilters={() => setFiltrosComentarios({ calificacion: '' })}
                activeFiltersCount={getActiveFiltersCount(filtrosComentarios)}
                filterContent={filterContentComentarios}
              />
              <Table
                className="dashboard-table"
                columns={comentariosColumns}
                dataSource={getFilteredComentarios()}
                loading={loading}
                pagination={{ pageSize: 3 }}
                rowKey="id_comentario"
                scroll={{ x: 'max-content' }}
              />
            </Card>
          </div>

          {/* Tercera fila: Equipo de Trabajo */}
          <div className="dashboard-row">
            <Card
              title="EQUIPO DE TRABAJO"
              className="dashboard-card full-width"
            >
              <Table
                className="dashboard-table"
                columns={empleadosColumns}
                dataSource={empleados}
                loading={loading}
                pagination={{ pageSize: 3 }}
                rowKey="id_empleado"
                scroll={{ x: 'max-content' }}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Evento */}
      {modalEventoVisible && (
        <EventoForm
          visible={modalEventoVisible}
          onCancel={() => {
            setModalEventoVisible(false);
            setSelectedEvento(null);
          }}
          onSubmit={async (values) => {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                message.error('No hay sesión activa');
                return;
              }

              const url = selectedEvento
                ? `${apiUrl}/evento/${selectedEvento.id_evento}`
                : `${apiUrl}/evento`;

              const method = selectedEvento ? 'PUT' : 'POST';

              const response = await fetch(url, {
                method,
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
              });

              if (!response.ok) {
                throw new Error('Error al guardar el evento');
              }

              message.success(selectedEvento ? 'Evento actualizado exitosamente' : 'Evento creado exitosamente');
              setModalEventoVisible(false);
              setSelectedEvento(null);
              fetchData();
            } catch (error) {
              console.error('Error al guardar evento:', error);
              message.error('Error al guardar el evento');
            }
          }}
          loading={loading}
          clientes={[]}
          asesores={[]}
          tiposEvento={tiposEvento}
          initialValues={selectedEvento || undefined}
        />
      )}

      {/* Modal de Decoración */}
      {modalDecoracionVisible && (
        <DecoracionForm
          visible={modalDecoracionVisible}
          onCancel={() => {
            setModalDecoracionVisible(false);
            setSelectedDecoracion(null);
          }}
          onSubmit={async (values) => {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                message.error('No hay sesión activa');
                return;
              }

              const url = selectedDecoracion
                ? `${apiUrl}/decoracion/${selectedDecoracion.id_decoracion}`
                : `${apiUrl}/decoracion`;

              const method = selectedDecoracion ? 'PUT' : 'POST';

              const response = await fetch(url, {
                method,
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
              });

              if (!response.ok) {
                throw new Error('Error al guardar la decoración');
              }

              message.success(selectedDecoracion ? 'Decoración actualizada exitosamente' : 'Decoración creada exitosamente');
              setModalDecoracionVisible(false);
              setSelectedDecoracion(null);
              fetchData();
            } catch (error) {
              console.error('Error al guardar decoración:', error);
              message.error('Error al guardar la decoración');
            }
          }}
          loading={loading}
        />
      )}

      {/* Modal de Comentario */}
      <Modal
        title={selectedComentario ? "Editar Comentario" : "Agregar Comentario"}
        open={modalComentarioVisible}
        onCancel={() => {
          setModalComentarioVisible(false);
          setSelectedComentario(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitComentario}
        >
          <Form.Item
            name="comentario"
            label="Comentario"
            rules={[{ required: true, message: 'Por favor ingrese su comentario' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="calificacion"
            label="Calificación"
            rules={[{ required: true, message: 'Por favor seleccione una calificación' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {selectedComentario ? 'Actualizar' : 'Guardar'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
