import React from "react";
import "../styles/mainPages/Info.scss";
import Footer from "../components/Footer";
import { Box, Container } from "@mui/material";

const Nosotros: React.FC = () => {
  return (
    <>
      <Box sx={{ 
        background: 'var(--login-bg)',
        backgroundBlendMode: 'var(--login-blend)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }} />
      <Container maxWidth="lg" sx={{ 
        position: 'relative',
        zIndex: 1,
        py: { xs: 2, sm: 4 }, 
        mt: { xs: 6, sm: 8 },
        px: { xs: 1, sm: 2 },
        pb: { xs: 4, sm: 6 }
      }}>
        <main className="info-page">
          <div className="page-header">
            <h1 className="page-title">Sobre Nosotros</h1>
          </div>

          <div className="full-width-card">
            <p className="card-text">
              <strong>Canabacoa Fiestas</strong> es un negocio especializado en ofrecer servicios de alquiler de equipos y espacios para eventos especiales, desde fiestas privadas hasta eventos corporativos. Además del alquiler de equipo, ofrecemos servicios adicionales como decoración y planificación de eventos para garantizar una experiencia completa y sin problemas para nuestros clientes.
            </p>
          </div>

          <div className="content-grid">
            <div className="info-card">
              <h3 className="card-title">Misión</h3>
              <p className="card-text">Nuestra misión es crear experiencias memorables, proporcionando servicios de alquiler y planificación de eventos personalizados, que superen las expectativas de nuestros clientes a través de una atención meticulosa al detalle, calidad excepcional y una ejecución impecable. Nos esforzamos por transformar cada evento en un momento inolvidable, ofreciendo soluciones integrales y personalizadas que reflejen los deseos y necesidades únicos de cada cliente.</p>
            </div>

            <div className="info-card">
              <h3 className="card-title">Visión</h3>
              <p className="card-text">Ser reconocidos como la empresa líder en el sector de alquiler y eventos en la región, destacándonos por nuestra innovación, creatividad y compromiso con la excelencia. Aspiramos a expandir nuestra presencia y convertirse en la primera opción para aquellos que buscan celebrar momentos especiales con estilo y sofisticación, estableciendo nuevos estándares de calidad y servicio en la industria de eventos.</p>
            </div>

            <div className="info-card">
              <h3 className="card-title">Valores</h3>
              <ul>
                <li><strong>Calidad:</strong> Comprometidos con la excelencia en cada detalle.</li>
                <li><strong>Creatividad:</strong> Innovamos para ofrecer experiencias únicas.</li>
                <li><strong>Profesionalismo:</strong> Trabajamos con responsabilidad y pasión.</li>
                <li><strong>Innovación:</strong> Buscamos soluciones modernas y efectivas.</li>
              </ul>
            </div>
          </div>

          <div className="team-section">
            <h3 className="section-title">Nuestro Equipo</h3>
            <div className="team-grid">
              <div className="team-card">
                <h4 className="team-position">Encargada de Decoración</h4>
                <p className="team-member">Claribel Tavárez</p>
              </div>
              
              <div className="team-card">
                <h4 className="team-position">Conductores</h4>
                <p className="team-member">Jose Radhames</p>
                <p className="team-member">Josué Contreras</p>
              </div>
              
              <div className="team-card">
                <h4 className="team-position">Encargada de Marketing</h4>
                <p className="team-member">Abigail Contreras</p>
              </div>
            </div>
          </div>
        </main>
      </Container>
    </>
  );
};

export default Nosotros;