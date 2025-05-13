import "../../styles/principal.scss";
import "../../styles/fonts.scss"
import Navbar from "../NavBar";
const PrincipalMenu = () => {
  return (
    <>
  <header className="principalHeader">
   <Navbar/>
<div className="principalContent">
    <h4 className="welcome">Te damos la bienvenida a</h4>
    <hr className="line"/>
    <h1 className="principalTitle">Canabacoa Fiestas</h1>
   
    <button className="principalButton"><a href="/Login">INGRESAR</a></button>
    </div>
<div className="principalInfo">
  <p className="principalPhrase">¡Transformamos tus eventos en experiencias inolvidables!</p>
  <p>En Canabacoa Fiestas, nos especializamos en hacer realidad tus sueños para cualquier ocasión especial. Ofrecemos alquiler de mobiliario, decoración personalizada y detalles únicos que se adaptan a tu estilo y temática.</p>
</div>    
  </header>
</>
  )
}

export default PrincipalMenu;