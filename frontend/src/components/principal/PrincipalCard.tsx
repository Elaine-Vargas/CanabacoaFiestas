import Alquiler from "../../assets/principalPhotos/Alquiler.jpg"
import Decoracion from "../../assets/principalPhotos/Decoracion.jpg"
import Catering from "../../assets/principalPhotos/Catering.jpg"
const PrincipalCard = () => {
  return (
<>
  <div className="cardsContainer">
  <h6 className="contentTitle">Podemos servirle en:</h6>

  <div className="card">
    <img src={Alquiler} alt="Alquiler" className="cardIcon" />
    <div className="cardContent">
      <h3 className="cardTitle">Alquiler</h3>
      <p className="cardText">
        Alquila todo lo que necesites para tu evento, desde mesas y sillas hasta manteles.
      </p>
    </div>
  </div>

  <div className="card">
    <img src={Decoracion} alt="Decoración" className="cardIcon" />
    <div className="cardContent">
      <h3 className="cardTitle">Decoración</h3>
      <p className="cardText">
        Convierte tu espacio en un lugar mágico con nuestra decoración personalizada.
      </p>
    </div>
  </div>

  <div className="card">
    <img src={Catering} alt="Catering" className="cardIcon" />
    <div className="cardContent">
      <h3 className="cardTitle">Catering</h3>
      <p className="cardText">
        Disfruta de la mejor comida y bebida para tu evento, adaptada a tus gustos y necesidades.
      </p>
    </div>
  </div>
        <button className="ButtonFindMore"><h6>Descubre más</h6></button>

</div>

</>
  )
}

export default PrincipalCard
