import React from 'react';
import '../../../styles/dashboard/ServicesSubpages.scss';
import { Card, Button, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const WelcomeAdmin: React.FC = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        {/* Primera fila: Eventos (a ancho completo) */}
        <div className="dashboard-row">
          <Card 
            title="EVENTOS" 
            className="dashboard-card full-width"
            extra={<Button type="primary" icon={<PlusOutlined />} className="action-button primary">Nuevo Evento</Button>}
          >
            <Table 
              className="dashboard-table"
              columns={[
                { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
                { title: 'Fecha', dataIndex: 'fecha', key: 'fecha' },
                { title: 'Estado', dataIndex: 'estado', key: 'estado' },
                { title: 'Acciones', key: 'acciones' }
              ]}
              dataSource={[]}
              pagination={false}
              scroll={{ y: 300 }}
            />
          </Card>
        </div>

        {/* Segunda fila: Usuarios y Proveedores */}
        <div className="dashboard-row">
          <Card 
            title="USUARIOS" 
            className="dashboard-card"
            extra={<Button type="primary" icon={<PlusOutlined />} className="action-button primary">Nuevo Usuario</Button>}
          >
            <Table 
              className="dashboard-table"
              columns={[
                { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
                { title: 'Email', dataIndex: 'email', key: 'email' },
                { title: 'Rol', dataIndex: 'rol', key: 'rol' },
                { title: 'Acciones', key: 'acciones' }
              ]}
              dataSource={[]}
              pagination={false}
              scroll={{ y: 300 }}
            />
          </Card>

          <Card 
            title="PROVEEDORES" 
            className="dashboard-card"
            extra={<Button type="primary" icon={<PlusOutlined />} className="action-button primary">Nuevo Proveedor</Button>}
          >
            <Table 
              className="dashboard-table"
              columns={[
                { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
                { title: 'Servicio', dataIndex: 'servicio', key: 'servicio' },
                { title: 'Contacto', dataIndex: 'contacto', key: 'contacto' },
                { title: 'Acciones', key: 'acciones' }
              ]}
              dataSource={[]}
              pagination={false}
              scroll={{ y: 300 }}
            />
          </Card>
        </div>

        {/* Tercera fila: Asignación de Equipo y Decoraciones */}
        <div className="dashboard-row">
          <Card 
            title="ASIGNACIÓN DE EQUIPO" 
            className="dashboard-card"
            extra={<Button type="primary" icon={<PlusOutlined />} className="action-button primary">Asignar Equipo</Button>}
          >
            <Table 
              className="dashboard-table"
              columns={[
                { title: 'Evento', dataIndex: 'evento', key: 'evento' },
                { title: 'Empleado', dataIndex: 'empleado', key: 'empleado' },
                { title: 'Rol', dataIndex: 'rol', key: 'rol' },
                { title: 'Acciones', key: 'acciones' }
              ]}
              dataSource={[]}
              pagination={false}
              scroll={{ y: 300 }}
            />
          </Card>

          <Card 
            title="DECORACIONES" 
            className="dashboard-card"
            extra={<Button type="primary" icon={<PlusOutlined />} className="action-button primary">Nueva Decoración</Button>}
          >
            <Table 
              className="dashboard-table"
              columns={[
                { title: 'Evento', dataIndex: 'evento', key: 'evento' },
                { title: 'Especificaciones', dataIndex: 'especificaciones', key: 'especificaciones' },
                { title: 'Estado', dataIndex: 'estado', key: 'estado' },
                { title: 'Acciones', key: 'acciones' }
              ]}
              dataSource={[]}
              pagination={false}
              scroll={{ y: 300 }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WelcomeAdmin;

