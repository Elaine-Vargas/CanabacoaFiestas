import { useNavigate } from "react-router-dom";
import {
  FaUserCog,
  FaBoxOpen,
  FaConciergeBell,
  FaTachometerAlt,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { IoIosExit } from "react-icons/io";
import { useState } from "react";
import ColorTheme from "../../../functions/ColorTheme";
import "../../../styles/dashboard/DashboardServices.scss";
import { useMediaQuery } from "@mui/material";
import { Drawer, IconButton, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { useUser } from '../../../contexts/UserContext';

export type UserRole = 'admin' | 'client' | 'employee' | 'driver';

interface ServicesMenuProps {
  selectedService: string;
}

export default function ServicesMenu({ selectedService }: ServicesMenuProps) {
  const navigate = useNavigate();
  const { setUserRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:450px)");

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const getRolName = (rolId: number) => {
    switch(Number(rolId)) {
      case 1: return 'Admin';
      case 2: return 'Cliente';
      case 3: return 'Empleado';
      case 4: return 'Conductor';
      default: return 'Usuario';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    setUserRole(null);
    navigate("/Login");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const renderMenuItems = () => {
    const rolId = Number(userData.rol);

    // Menú para conductor (solo bienvenida)
    if (rolId === 4) {
      return (
        <ul>
          <li
            className={selectedService === "Bienvenida" ? "active" : ""}
            onClick={() => handleNavigation("/Menu-Servicios/Bienvenida")}
          >
            <FaTachometerAlt /> Bienvenida
          </li>
        </ul>
      );
    }

    // Menú para empleado
    if (rolId === 3) {
      return (
        <ul>
          <li
            className={selectedService === "Bienvenida" ? "active" : ""}
            onClick={() => handleNavigation("/Menu-Servicios/Bienvenida")}
          >
            <FaTachometerAlt /> Bienvenida
          </li>
          <li
            className={selectedService === "Reportes" ? "active" : ""}
            onClick={() => handleNavigation("/Menu-Servicios/Reportes")}
          >
            <FaFileInvoiceDollar /> Reportes y Facturas
          </li>
        </ul>
      );
    }

    // Menú para admin y cliente
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
          <FaBoxOpen /> {rolId === 1 ? 'Alquileres y Compras' : 'Alquiler'}
        </li>
        <li
          className={selectedService === "Catering" ? "active" : ""}
          onClick={() => handleNavigation("/Menu-Servicios/Catering")}
        >
          <FaConciergeBell /> Catering
        </li>
        <li
          className={selectedService === "Facturas" ? "active" : ""}
          onClick={() => handleNavigation("/Menu-Servicios/Facturas")}
        >
          <FaFileInvoiceDollar /> {rolId === 1 ? 'Reportes y Facturas' : 'Facturas'}
        </li>
      </ul>
    );
  };

  const renderMobileMenu = () => {
    const rolId = Number(userData.rol);
    let menuItems = [];

    // Menú para conductor
    if (rolId === 4) {
      menuItems = [
        { text: "Bienvenida", path: "/Menu-Servicios/Bienvenida", icon: <FaTachometerAlt /> }
      ];
    }
    // Menú para empleado
    else if (rolId === 3) {
      menuItems = [
        { text: "Bienvenida", path: "/Menu-Servicios/Bienvenida", icon: <FaTachometerAlt /> },
        { text: "Reportes y Facturas", path: "/Menu-Servicios/Reportes", icon: <FaFileInvoiceDollar /> }
      ];
    }
    // Menú para admin y cliente
    else {
      menuItems = [
        { text: "Bienvenida", path: "/Menu-Servicios/Bienvenida", icon: <FaTachometerAlt /> },
        { text: rolId === 1 ? "Alquileres y Compras" : "Alquiler", path: "/Menu-Servicios/Alquiler", icon: <FaBoxOpen /> },
        { text: "Catering", path: "/Menu-Servicios/Catering", icon: <FaConciergeBell /> },
        { text: rolId === 1 ? "Reportes y Facturas" : "Facturas", path: "/Menu-Servicios/Facturas", icon: <FaFileInvoiceDollar /> }
      ];
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
          <FaUserCog 
            size={30} 
            className={`user-icon ${selectedService === "Ajustes-Usuario" ? "active" : ""}`}
            title="Ajustes de Usuario"
            onClick={() => {
              navigate("/Menu-Servicios/Ajustes-Usuario");
              setDrawerOpen(false);
            }}
            style={{
              color: selectedService === "Ajustes-Usuario" ? "var(--white)" : "var(--color-text)",
              backgroundColor: selectedService === "Ajustes-Usuario" ? "var(--dark-gold)" : "transparent",
              padding: "8px",
              borderRadius: "4px",
              transition: "all 0.3s ease",
              cursor: "pointer"
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
                    fontFamily: 'inherit',
                    fontWeight: selectedService === item.text ? 'bold' : 'normal'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <IoIosExit 
          className="logout-button" 
          title="Cerrar Sesión" 
          onClick={() => setShowLogoutModal(true)} 
        />
      </Drawer>
    );
  };

  return (
    <>
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

      {!isMobile && (
        <div className="sidebar">
          <ColorTheme colorDark="black" colorLight="white" />
          <div className="user-profile">
            <FaUserCog 
              size={30} 
              className={`user-icon ${selectedService === "Ajustes-Usuario" ? "active" : ""}`}
              title="Ajustes de Usuario"
              onClick={() => {
                navigate("/Menu-Servicios/Ajustes-Usuario");
                setDrawerOpen(false);
              }}
              style={{
                color: selectedService === "Ajustes-Usuario" ? "var(--white)" : "var(--color-text)",
                backgroundColor: selectedService === "Ajustes-Usuario" ? "var(--dark-gold)" : "transparent",
                padding: "8px",
                borderRadius: "4px",
                transition: "all 0.3s ease",
                cursor: "pointer"
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
          {renderMenuItems()}
          <IoIosExit className="logout-button" title="Cerrar Sesión" onClick={() => setShowLogoutModal(true)} />
        </div>
      )}
    </>
  );
}
