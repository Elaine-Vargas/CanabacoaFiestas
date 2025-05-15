import ColorTheme from "../functions/ColorTheme";
import "../styles/Login.scss";
export default function LoginNav() {
  return (
    <>
 <nav className="navbarLogin">
      <ul className="navListLogin">
        <li className="navItemLogin"><a href="/">Inicio</a></li>
        <li className="navColor theme"><ColorTheme colorDark='black' colorLight='white' /></li>
      </ul>
    </nav>
    </>
  )
}
