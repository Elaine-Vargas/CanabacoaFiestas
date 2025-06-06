import {Drawer, List, ListItem, ListItemButton, ListItemText, Button, IconButton} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import circuloLogo from "../../assets/logoVariants/CIRCULO-CF(blanco).svg";
import { useMediaQuery } from "@mui/material";
import { useState, lazy, Suspense } from "react";
import React from "react";
import "../../styles/mainPages/Navbar.scss";
const BackIcon = lazy(() => import("@mui/icons-material/ArrowBackRounded"));

const NavBar = React.memo(() => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:740px)");

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  return (
    <nav className="navbar">
      <a href="/" className="logo">
        <img src={circuloLogo} alt="Logo" />
      </a>

      <ul className="navList">
        <li className="navItem">
          <a href="/">Inicio</a>
        </li>
        <li className="navItem">
          <a href="/Principal/Nosotros">Nosotros</a>
        </li>
        <li className="navItem">
          <a href="/Principal/Servicios">Servicios</a>
        </li>
        <li className="navItem">
          <a href="/Principal/Catalogo">Catálogo</a>
        </li>
        <li className="navItem">
          <a href="#footer">Contacto</a>
        </li>
        <button className="login">
          <a href="/Login">INGRESAR</a>
        </button>
      </ul>

      {isMobile && (
        <IconButton className="menuIcon" onClick={toggleDrawer(true)}>
          <MenuRoundedIcon sx={{ color: "white" }} />
        </IconButton>
      )}

      {drawerOpen && (
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          PaperProps={{
            sx: {
              background: "var(--color-background)",
              backgroundBlendMode: "multiply",
              color: "var(--color-text)",
              fontFamily: '"Nunito Sans", sans-serif',
              maxWidth: 250,
              minWidth: 100,
              padding: 2,
            },
          }}
        >
          <Suspense fallback={<div style={{ padding: 20 }}>Cargando...</div>}>
            <IconButton
              onClick={toggleDrawer(false)}
              sx={{ color: "var(--color-text)" }}
            >
              <BackIcon sx={{ alignSelf: "left" }} />
            </IconButton>
            <List>
              {["Inicio", "Nosotros", "Servicios", "Catálogo", "Contacto"].map((text) => (
                <ListItem key={text} disablePadding>
                  <ListItemButton
                    component="a"
                    href={`/${text === "Inicio" ? "" : text}`}
                    sx={{
                      color: "var(--color-text)",
                      fontWeight: "bold",
                      fontFamily: '"Nunito Sans", sans-serif',
                      "&:hover": {
                        color: "var(--dark-gold)",
                      },
                    }}
                  >
                    <ListItemText
                      primary={text}
                      primaryTypographyProps={{
                        fontFamily: '"Nunito Sans", sans-serif',
                        fontWeight: "bold",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              <ListItem sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  sx={{
                    backgroundColor: "var(--gold)",
                    fontFamily: '"Montserrat Alternates", cursive',
                    fontWeight: 800,
                    color: "var(--white)",
                    "&:hover": {
                      backgroundColor: "var(--white)",
                      color: "var(--color-background)",
                      boxShadow:
                        "var(--color-shadow) 0px 8px 20px rgba(var(--color-input-border), 0.1)",
                      transform: "translateY(-2px)",
                      transition: "all ease-in-out .2s",
                    },
                  }}
                  href="/Login"
                >
                  INGRESAR
                </Button>
              </ListItem>
            </List>
          </Suspense>
        </Drawer>
      )}
    </nav>
  );
});

export default NavBar;
