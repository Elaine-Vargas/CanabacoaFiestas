import { Drawer, List, ListItem, ListItemButton, ListItemText, Button, IconButton } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import circuloLogo from "../assets/logoVariants/CIRCULO-CF(blanco).svg";
import ColorTheme from '../functions/ColorTheme';
import { useMediaQuery } from '@mui/material';

import Back from '@mui/icons-material/ArrowBackRounded';

import '../styles/principal.scss'; 

const NavBar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:650px)');
  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  return (
    <nav className="navbar">
      <a href="/" className="logo">
        <img src={circuloLogo} alt="Logo" />
      </a>

      <ul className="navList">
        <li className="navItem"><a href="/">Inicio</a></li>
        <li className="navItem"><a href="/Nosotros">Nosotros</a></li>
        <li className="navItem"><a href="/Servicios">Servicios</a></li>
        <li className="navItem"><a href="/Contacto">Contacto</a></li>
        <button className="login">INGRESAR</button>
        <li className="navItem colortheme"><ColorTheme /></li>
      </ul>

      <IconButton className="menuIcon" onClick={toggleDrawer(true)}>
{isMobile && <MenuRoundedIcon sx={{ color: 'white' }} />}
      </IconButton>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <List sx={{ width: 250 }}>
          <IconButton onClick={toggleDrawer(false)} sx={{ margin: '10px' }}>
            <Back sx={{ color: 'black' }} /></IconButton>
          {['Inicio', 'Nosotros', 'Servicios', 'Contacto'].map((text) => (
            <ListItem key={text} disablePadding>
              <ListItemButton component="a" href={`/${text === 'Inicio' ? '' : text}`}>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem>
            <Button variant="contained" fullWidth>Ingresar</Button>
          </ListItem>
        </List>
      </Drawer>
    </nav>
  );
};

export default NavBar;
