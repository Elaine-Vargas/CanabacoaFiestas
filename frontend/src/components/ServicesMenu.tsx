import { useNavigate } from "react-router-dom";
import {
  FaUserCog,
  FaBoxOpen,
  FaBrush,
  FaConciergeBell,
  FaCar,
  FaTachometerAlt,
  FaTools,
} from "react-icons/fa";
import { IoIosExit } from "react-icons/io";
import { useState } from "react";
import ColorTheme from "../functions/ColorTheme";
import "../styles/DashboardServices.scss";
import { useUser } from "../context/UserContext";

interface ServicesMenuProps {
  selectedService: string;
}

export default function ServicesMenu({ selectedService }: ServicesMenuProps) {
  const navigate = useNavigate();
  const { userRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  //console.log('User Data from localStorage:', userData); // Debug log

  const getRolName = (rolId: number) => {
    //console.log('Rol ID:', rolId); // Debug log
    switch(Number(rolId)) {
      case 1: return 'Administrador';
      case 2: return 'Cliente';
      case 3: return 'Supervisor';
      default: return 'Usuario';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    navigate("/");
  };

  const renderMenuItems = () => {
    return (
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
        {userRole === 'admin' && (
          <>
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
          </>
        )}
      </ul>
    );
  };

  return (
    <div className="sidebar">
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>¿Está seguro que desea cerrar sesión?</h4>
            <div className="modal-buttons">
              <button onClick={handleLogout}>Sí</button>
              <button onClick={() => setShowLogoutModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
      <ColorTheme colorDark="black" colorLight="white" />

      <div className="user-profile">
        <FaUserCog size={30} className="user-icon"
          title="Ajustes de Usuario"
          onClick={() => navigate("/Menu-Servicios/Ajustes-Usuario")}
        />
        <div className="user-info">
          <p className="user-name">
            {userData.nombre_usuario || ''} {userData.apellido_usuario || ''}
          </p>
          <p className="user-role">
            {getRolName(userData.rol)}
          </p>
        </div>
      </div>

      {renderMenuItems()}
      <IoIosExit className="logout-button" title="Cerrar Sesión" onClick={() => setShowLogoutModal(true)} />
    </div>
  );
}
