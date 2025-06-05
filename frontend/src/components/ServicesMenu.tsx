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
import "../styles/dashboard/DashboardServices.scss";
import { useMediaQuery } from "@mui/material";
import { Drawer, IconButton, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

export type UserRole = 'admin' | 'client' | 'supervisor' | 'inventory';

export type Permission = {
  id: string;
  name: string;
  description: string;
};

export type RolePermissions = {
  [key in UserRole]: Permission[];
};

interface ServicesMenuProps {
  selectedService: string;
}

export default function ServicesMenu({ selectedService }: ServicesMenuProps) {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:450px)");
  
  //console.log('User Data from localStorage:', userData); // Debug log

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const getRolName = (rolId: number) => {
    //console.log('Rol ID:', rolId); // Debug log
    switch(Number(rolId)) {
      case 1: return 'Admin';
      case 2: return 'Cliente';
      case 3: return 'Organizador de Eventos';
      case 4: return 'Encargado de Inventario';
      default: return 'Usuario';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    navigate("/Login");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const renderMenuItems = () => {
    const rolId = Number(userData.rol);

    if (rolId === 4) { // Empleado de inventario
      return (
        <ul>
          <li
            className={selectedService === "Bienvenida" ? "active" : ""}
            onClick={() => handleNavigation("/Menu-Servicios/Bienvenida")}
          >
            <FaTachometerAlt /> Bienvenida
          </li>
          <li
            className={selectedService === "Alquiler" ? "active" : ""}
            onClick={() => handleNavigation("/Menu-Servicios/Alquiler")}
          >
            <FaBoxOpen /> Alquiler
          </li>
          <li
            className={selectedService === "Transporte" ? "active" : ""}
            onClick={() => handleNavigation("/Menu-Servicios/Transporte")}
          >
            <FaCar /> Transporte
          </li>
        </ul>
      );
    }

    return (
      <ul>
        <li
          className={selectedService === "Bienvenida" ? "active" : ""}
          onClick={() => handleNavigation("/Menu-Servicios/Bienvenida")}
        >
          <FaTachometerAlt /> Bienvenida
        </li>
        <li
          className={selectedService === "Alquiler" ? "active" : ""}
          onClick={() => handleNavigation("/Menu-Servicios/Alquiler")}
        >
          <FaBoxOpen /> Alquiler
        </li>
        <li
          className={selectedService === "Decoracion" ? "active" : ""}
          onClick={() => handleNavigation("/Menu-Servicios/Decoracion")}
        >
          <FaBrush /> Decoracion
        </li>
        <li
          className={selectedService === "Catering" ? "active" : ""}
          onClick={() => handleNavigation("/Menu-Servicios/Catering")}
        >
          <FaConciergeBell /> Catering
        </li>
        {(rolId === 1 || rolId === 3) && (
          <>
            <li
              className={selectedService === "Supervision" ? "active" : ""}
              onClick={() => handleNavigation("/Menu-Servicios/Supervision")}
            >
              <FaTachometerAlt /> Supervision
            </li>
            <li
              className={selectedService === "Transporte" ? "active" : ""}
              onClick={() => handleNavigation("/Menu-Servicios/Transporte")}
            >
              <FaCar /> Transporte
            </li>
            <li
              className={selectedService === "Montaje-Desmontaje" ? "active" : ""}
              onClick={() => handleNavigation("/Menu-Servicios/Montaje-Desmontaje")}
            >
              <FaTools /> Montaje y Desmontaje
            </li>
          </>
        )}
      </ul>
    );
  };

  const renderMobileMenu = () => {
    const rolId = Number(userData.rol);
    const menuItems = [
      { text: "Bienvenida", path: "/Menu-Servicios/Bienvenida", icon: <FaTachometerAlt /> },
      { text: "Alquiler", path: "/Menu-Servicios/Alquiler", icon: <FaBoxOpen /> },
    ];

    if (rolId !== 4) {
      menuItems.push(
        { text: "Decoracion", path: "/Menu-Servicios/Decoracion", icon: <FaBrush /> },
        { text: "Catering", path: "/Menu-Servicios/Catering", icon: <FaConciergeBell /> }
      );
    }

    if (rolId === 1 || rolId === 3) {
      menuItems.push(
        { text: "Supervision", path: "/Menu-Servicios/Supervision", icon: <FaTachometerAlt /> },
        { text: "Transporte", path: "/Menu-Servicios/Transporte", icon: <FaCar /> },
        { text: "Montaje y Desmontaje", path: "/Menu-Servicios/Montaje-Desmontaje", icon: <FaTools /> }
      );
    }

    if (rolId === 4) {
      menuItems.push(
        { text: "Transporte", path: "/Menu-Servicios/Transporte", icon: <FaCar /> }
      );
    }

    return (
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            background: "var(--color-background2)",
            color: "var(--color-text)",
            fontFamily: '"Nunito Sans", sans-serif',
            width: 250,
            padding: 2,
            display: 'flex',
            flexDirection: 'column'
          },
        }}
      >
        <div className="user-profile">
          <FaUserCog size={30} className="user-icon"
            title="Ajustes de Usuario"
            onClick={() => {
              navigate("/Menu-Servicios/Ajustes-Usuario");
              setDrawerOpen(false);
            }}
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

        <ColorTheme colorDark="black" colorLight="white" />

        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  handleNavigation(item.path);
                  setDrawerOpen(false);
                }}
                sx={{
                  color: selectedService === item.text ? "var(--gold)" : "var(--color-text)",
                  "&:hover": {
                    color: "var(--gold)",
                  },
                  
                }}
              >
                <span style={{ marginRight: 10 }}>{item.icon}</span>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontFamily: 'inherit', // Asegura que herede la fuente
                    fontWeight: selectedService === item.text ? 'bold' : 'normal' // Opcional: resalta el activo
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <IoIosExit 
          className="logout-button" 
          title="Cerrar Sesión" 
          onClick={() => {
            setShowLogoutModal(true);
          }} 
        />
      </Drawer>
    );
  };

  return (
    <>
      {/* Modal de cierre de sesión - Renderizado fuera de la lógica responsive */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content logout-modal">
            <h4>¿Está seguro que desea cerrar sesión?</h4>
            <div className="modal-buttons">
              <button onClick={handleLogout}>Sí</button>
              <button onClick={() => setShowLogoutModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {isMobile && (
        <IconButton 
          className="menu-icon" 
          onClick={toggleDrawer(true)}
          sx={{ 
            color: "var(--color-text)",
            position: "fixed",
            top: 20,
            left: 20,
            zIndex: 1000,
            backgroundColor: "var(--color-background2)",
            '&:hover': {
              backgroundColor: "var(--gold)",
              color: "var(--white)"
            }
          }}
        >
          <MenuRoundedIcon />
        </IconButton>
      )}
      
      {isMobile && renderMobileMenu()}

      {/* Sidebar normal - Renderizado solo en desktop */}
      {!isMobile && (
        <div className="sidebar">
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
      )}
    </>
  );
}
