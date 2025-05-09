import "../styles/principal.scss";
import circuloLogo from "../assets/logoVariants/CIRCULO-CF(blanco).svg";

const PrincipalMenu = () => {
  return (
  <header className="principalHeader">
    <nav className="navbar">
      <a href="/" className="logo">
        <img src={circuloLogo} alt="Logo" />
      </a>
      <ul className="navList">
        <li className="navItem"><a href="/">Inicio</a></li>
        <li className="navItem"><a href="/about">Nosotros</a></li>
        <li className="navItem"><a href="/services">Servicios</a></li>
        <li className="navItem"><a href="/contact">Contacto</a></li>
      </ul>
    </nav>

<div className="principalContent">
    <h4 className="welcome">Te damos la bienvenida a</h4>
    <hr className="line"/>
    <h1 className="principalTitle">Canabacoa Fiestas</h1>
    </div>
    
  </header>
  )
}

export default PrincipalMenu
