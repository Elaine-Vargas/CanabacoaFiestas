import React from 'react';
import { Card, Row, Col } from 'antd';

const ReportClient = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Reportes para Cliente</h2>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Mis Eventos" style={{ minHeight: '200px' }}>
            Contenido de reportes para clientes
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportClient;