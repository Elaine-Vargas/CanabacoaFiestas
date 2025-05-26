import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaBoxOpen,
  FaBrush,
  FaConciergeBell,
  FaCar,
  FaTachometerAlt,
  FaTools,
} from "react-icons/fa";

interface ServicesMenuProps {
  selectedService: string;
}

export default function ServicesMenu({ selectedService }: ServicesMenuProps) {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <div className="user-profile" onClick={() => navigate("/Menu-Servicios/Ajustes-Usuario")}>
        <FaUser size={30} />
        <p>Configurar cuenta</p>
      </div>
      <ul>
        <li
          className={selectedService === "Bienvenida" ? "active" : ""}
          onClick={() => navigate("/Menu-Servicios/Bienvenida")}
        >
          <FaTachometerAlt /> Bienvenida
        </li>
        <li
          className={selectedService === "Alquiler" ? "active" : ""}
          onClick={() => navigate("/Menu-Servicios/Alquiler")}
        >
          <FaBoxOpen /> Alquiler
        </li>
        <li
        className={selectedService === "Decoracion" ? "active" : ""}
        onClick={() => navigate("/Menu-Servicios/Decoracion")}
        >
          <FaBrush /> Decoracion
        </li>

        <li
          className={selectedService === "Catering" ? "active" : ""}
          onClick={() => navigate("/Menu-Servicios/Catering")}
        >
          <FaConciergeBell /> Catering
        </li>
        <li
          className={selectedService === "Supervision" ? "active" : ""}
          onClick={() => navigate("/Menu-Servicios/Supervision")}
        >
          <FaTachometerAlt /> Supervision
        </li>
        <li
          className={selectedService === "Transporte" ? "active" : ""}
          onClick={() => navigate("/Menu-Servicios/Transporte")}
        >
          <FaCar /> Transporte
        </li>
        <li
          className={selectedService === "Montaje-Desmontaje" ? "active" : ""}
          onClick={() => navigate("/Menu-Servicios/Montaje-Desmontaje")}
        >
          <FaTools /> Montaje y Desmontaje
        </li>
      </ul>
    </div>
  );
}
