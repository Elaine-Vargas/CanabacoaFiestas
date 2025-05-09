import "../styles/principal.scss";
import Navbar from "./NavBar";
const PrincipalMenu = () => {
  return (
  <header className="principalHeader">
   <Navbar/>
<div className="principalContent">
    <h4 className="welcome">Te damos la bienvenida a</h4>
    <hr className="line"/>
    <h1 className="principalTitle">Canabacoa Fiestas</h1>
    </div>
    
  </header>
  )
}

export default PrincipalMenu
