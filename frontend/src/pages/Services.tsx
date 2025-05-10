import NavBar from '../components/NavBar';
import "../styles/services.scss";
{/*Importacion de cada imagen*/}
import alquilerImg from '../assets/servicesPhotos/alquilerServices.jpg';
import decoracionImg from '../assets/servicesPhotos/decorServices.jpg';
import cateringImg from '../assets/servicesPhotos/cateringServices.jpg';
import transporteImg from '../assets/servicesPhotos/transportServices.jpg';
import supervisionImg from '../assets/servicesPhotos/supervisionServices.jpg';
import montdesImg from '../assets/servicesPhotos/MonyDesServices.jpg';

const servicesData = [
  {
    title: 'Alquiler',
    description: 'Aquí encuentras todo lo que necesitas para tu evento. Alquila el lugar/espacio ideal, busca el mobiliario perfecto, las carpas mas blancas, el sonido ideal y mucho más.',
    image: alquilerImg,
  },
  {
    title: 'Decoración',
    description: 'Un evento no es nada sin una buena decoración. Te realizamos la decoración ideal para tu evento, ya sea una fiesta de cumpleaños, una boda o un evento corporativo.',
    image: decoracionImg,
  },
  {
    title: 'Catering',
    description: 'Deleita a tus invitados con un servicio de catering excepcional. Ofrecemos una deliciosa variedad de platos y bebidas para satisfacer todos los gustos.',
    image: cateringImg,
  },
  {
    title: 'Transporte',
    description: 'Llevamos todo lo que necesitas a donde lo necesites. Transporte seguro y confiable para nuestros clientes.',
    image: transporteImg,
  },
  {
    title: 'Supervisión',
    description: 'Durante tu evento contarás con una supervición de primera, no tendrás que preocuparte por nada. Nuestro equipo se encargará de que todo salga como lo desees.',
    image: supervisionImg,
  },
  {
    title: 'Montaje y Desmontaje',
    description: 'Hora de montar todo y Canabacoa Fiestas está más que preparado. Y al finalizar, no te preocupes, lo dejamos todo como lo encontramos o hasta mejor.',
    image: montdesImg,
  },
];

export default function Services() {
  return (
    <>
    <div className="servicioContent">
        <div className="servicioFondo">
      <div className="servicioContainer">
        <NavBar />
      </div>

      
        <div className="servicioArriba">
        <h1>Nuestros servicios</h1>
        <p>Canabacoa Fiestas te ofrece una buena variedad de servicios</p>
        </div>
        <br />
        </div>
        <div className="servicesGrid">
          {servicesData.map((service, index) => (
            <div key={index} className="serviceCard">
              <img src={service.image} alt={service.title} className="serviceImage" />
              <h4>{service.title}</h4>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}