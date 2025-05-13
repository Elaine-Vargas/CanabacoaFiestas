import React from "react";
import "../styles/AboutUs.scss"; 
import "../styles/theme.scss";
import NavBar from "../components/NavBar";
import Imagen from "../assets/AboutUs.svg";

const Nosotros: React.FC = () => {
  return (
<>
<section className="sobre-nosotros">
  <NavBar />
  <div className="contenido">
    <div className="columna-izquierda">
      <h2 className="titulo-seccion">Sobre Nosotros</h2>
      <div className="imagen">
        <img src={Imagen} alt="Sobre Nosotros" />
      </div>
    </div>

    <div className="columna-derecha">
      <p><strong>Canabacoa Fiestas</strong> es una empresa especializada en alquiler de espacios y artículos para eventos, así como en la planificación y decoración de celebraciones memorables. Nos apasiona convertir tus ideas en experiencias inolvidables, combinando profesionalismo, creatividad e innovación.</p>

      <h3 className="subtitulo">Misión</h3>
      <p>Crear experiencias memorables a través de servicios personalizados de alquiler y planificación de eventos, con atención meticulosa al detalle, calidad excepcional y ejecución impecable.</p>

      <h3 className="subtitulo">Visión</h3>
      <p>Ser líderes regionales en el sector de eventos, destacándonos por la innovación, creatividad y excelencia en cada celebración.</p>

      <h3 className="subtitulo">Valores</h3>
      <ul>
        <li><strong>Calidad:</strong> Comprometidos con la excelencia en cada detalle.</li>
        <li><strong>Creatividad:</strong> Innovamos para ofrecer experiencias únicas.</li>
        <li><strong>Profesionalismo:</strong> Trabajamos con responsabilidad y pasión.</li>
        <li><strong>Innovación:</strong> Buscamos soluciones modernas y efectivas.</li>
      </ul>
    </div>
  </div>
</section>

</>
  );
};

export default Nosotros;
