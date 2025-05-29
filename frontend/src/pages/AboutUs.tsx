import React from "react";
import "../styles/AboutUs.scss"; 
import "../styles/theme.scss";
import NavBar from "../components/NavBar";

const Nosotros: React.FC = () => {
  return (
    <section className="sobre-nosotros">
      <NavBar />
      <div className="contenido">
        <div className="header">
        <div style={{ height: "50px" }}></div>
          <h2 className="titulo-seccion">Sobre Nosotros</h2>
        </div>

        <div className="info-section">
          <div className="info-card">
            <p className="descripcion">
              <strong>Canabacoa Fiestas</strong> es una empresa especializada en alquiler de espacios y artículos para eventos, así como en la planificación y decoración de celebraciones memorables. Nos apasiona convertir tus ideas en experiencias inolvidables, combinando profesionalismo, creatividad e innovación.
            </p>
          </div>

          <div className="info-card">
            <h3 className="subtitulo">Misión</h3>
            <p>Crear experiencias memorables a través de servicios personalizados de alquiler y planificación de eventos, con atención meticulosa al detalle, calidad excepcional y ejecución impecable.</p>
          </div>

          <div className="info-card">
            <h3 className="subtitulo">Visión</h3>
            <p>Ser líderes regionales en el sector de eventos, destacándonos por la innovación, creatividad y excelencia en cada celebración.</p>
          </div>

          <div className="info-card">
            <h3 className="subtitulo">Valores</h3>
            <ul>
              <li><strong>Calidad:</strong> Comprometidos con la excelencia en cada detalle.</li>
              <li><strong>Creatividad:</strong> Innovamos para ofrecer experiencias únicas.</li>
              <li><strong>Profesionalismo:</strong> Trabajamos con responsabilidad y pasión.</li>
              <li><strong>Innovación:</strong> Buscamos soluciones modernas y efectivas.</li>
            </ul>
          </div>
        </div>

        <div className="personal-section">
          <h3 className="subtitulo">Nuestro Equipo</h3>
          <div className="info-section">
            <div className="info-card">
              <h4 className="cargo">Encargada de Decoración</h4>
              <p className="nombre">Claribel Tavárez</p>
            </div>
            <div className="info-card">
              <h4 className="cargo">Conductores</h4>
              <p className="nombre">Jose Radhames</p>
              <p className="nombre">Josué Contreras</p>
            </div>
            <div className="info-card">
              <h4 className="cargo">Encargada de Marketing</h4>
              <p className="nombre">Abigail Contreras</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Nosotros;
