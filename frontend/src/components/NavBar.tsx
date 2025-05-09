import circuloLogo from "../assets/logoVariants/CIRCULO-CF(blanco).svg";
import ColorTheme from '../functions/ColorTheme'

const NavBar = () => {
  return (
<>
<nav className="navbar">
      <a href="/" className="logo">
        <img src={circuloLogo} alt="Logo" />
      </a>
      <ul className="navList">
        <li className="navItem"><a href="/">Inicio</a></li>
        <li className="navItem"><a href="/Nosotros">Nosotros</a></li>
        <li className="navItem"><a href="/Servicios">Servicios</a></li>
        <li className="navItem"><a href="/Contacto">Contacto</a></li>
        <button className="login">Ingresar</button>
        <li className="navItem colortheme"><ColorTheme/></li>
      </ul>
    </nav>

</>
  )
}

export default NavBar
