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

export type UserRole = 'admin' | 'cliente' | 'empleado';

interface ServicesMenuProps {
  selectedService: string;
}

export default function ServicesMenu({ selectedService }: ServicesMenuProps) {
  const navigate = useNavigate();
  const { setUserRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isTabletOrMobile = useMediaQuery("(max-width:720px)");
  const isShortScreen = useMediaQuery("(max-height:460px)");
  const shouldUseDrawer = isTabletOrMobile || isShortScreen;

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const getRolName = (rolId: number) => {
    switch(Number(rolId)) {
      case 1: return 'Admin';
      case 2: return 'Cliente';
      case 3: return 'Empleado';
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
    setDrawerOpen(false);
  };

  const renderMenuItems = () => {
    const rolId = Number(userData.rol);

    return (
      <ul style={{ width: '100%', textAlign: 'center' }}>
        <li
          className={selectedService === "Bienvenida" ? "active" : ""}
          onClick={() => handleNavigation("/Menu-Servicios/Bienvenida")}
        >
          <FaTachometerAlt /> <span style={{ display: 'inline-block', width: '100%' }}>{'Bienvenida'}</span>
        </li>
        <li
          className={
            selectedService === "Alquiler" || 
            selectedService === "Alquileres-Compras" ? 
            "active" : ""
          }
          onClick={() => handleNavigation("/Menu-Servicios/Alquiler")}
        >
          <FaBoxOpen /> <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>{rolId === 1 ? 'Alquileres y Compras' : 'Alquiler'}</span>
        </li>
        <li
          className={selectedService === "Catering" ? "active" : ""}
          onClick={() => handleNavigation("/Menu-Servicios/Catering")}
        >
          <FaConciergeBell /> <span style={{ display: 'inline-block', width: '100%' }}>{'Catering'}</span>
        </li>
        <li
          className={selectedService === "Facturas" ? "active" : ""}
          onClick={() => handleNavigation("/Menu-Servicios/Facturas")}
        >
          <FaFileInvoiceDollar /> <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>{rolId === 1 ? 'Reportes y Facturas' : 'Facturas'}</span>
        </li>
      </ul>
    );
  };

  const renderDrawerMenu = () => {
    const rolId = Number(userData.rol);
    let menuItems = [];

    menuItems = [
      { text: "Bienvenida", path: "/Menu-Servicios/Bienvenida", icon: <FaTachometerAlt /> },
      { text: rolId === 1 ? "Alquileres y Compras" : "Alquiler", path: "/Menu-Servicios/Alquiler", icon: <FaBoxOpen /> },
      { text: "Catering", path: "/Menu-Servicios/Catering", icon: <FaConciergeBell /> },
      { text: rolId === 1 ? "Reportes y Facturas" : "Facturas", path: "/Menu-Servicios/Facturas", icon: <FaFileInvoiceDollar /> }
    ];

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
            width: 280,
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            height: isShortScreen ? '100%' : 'auto',
            maxHeight: isShortScreen ? '100%' : 'none'
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

        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  color: selectedService === item.text ? "var(--gold)" : "var(--color-text)",
                  justifyContent: 'center',
                  textAlign: 'center',
                  '& .MuiListItemText-root': { width: '100%', textAlign: 'center' },
                  "&:hover": {
                    color: "var(--gold)",
                  },
                }}
              >
                <span style={{ marginRight: 10 }}>{item.icon}</span>
                <ListItemText 
                  primary={<span style={{ width: '100%', display: 'inline-block', textAlign: 'center' }}>{item.text}</span>} 
                  primaryTypographyProps={{ 
                    fontFamily: 'inherit',
                    fontWeight: selectedService === item.text ? 'bold' : 'normal',
                    width: '100%',
                    textAlign: 'center'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <div className="theme-exit-container">
          <ColorTheme colorDark="black" colorLight="white" />
          <IoIosExit className="logout-button" title="Cerrar Sesión" onClick={() => setShowLogoutModal(true)} />
        </div>
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

      {shouldUseDrawer && (
        <>
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
          {renderDrawerMenu()}
        </>
      )}

      {!shouldUseDrawer && (
        <div className="sidebar">
          <div className="theme-exit-container">
            <ColorTheme colorDark="black" colorLight="white" />
            <IoIosExit className="logout-button" title="Cerrar Sesión" onClick={() => setShowLogoutModal(true)} />
          </div>
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
        </div>
      )}
    </>
  );
}
