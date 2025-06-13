import '../../components/principal/Footer';
import "../../styles/mainPages/Info.scss";
import alquilerImg from '../../assets/servicesPhotos/alquilerServices.webp';
import decoracionImg from '../../assets/servicesPhotos/decorServices.webp';
import cateringImg from '../../assets/servicesPhotos/cateringServices.webp';
import transporteImg from '../../assets/servicesPhotos/transportServices.webp';
import supervisionImg from '../../assets/servicesPhotos/supervisionServices.webp';
import montdesImg from '../../assets/servicesPhotos/MonyDesServices.webp';
import { Box, Container } from "@mui/material";

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
      <Box sx={{ 
        background: 'var(--login-bg)',
        backgroundBlendMode: 'var(--login-blend)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }} />
      <Container maxWidth="lg" sx={{ 
        position: 'relative',
        zIndex: 1,
        py: { xs: 2, sm: 4 }, 
        mt: { xs: 6, sm: 8 },
        px: { xs: 1, sm: 2 },
        pb: { xs: 4, sm: 6 }
      }}>
        <main className="info-page">
          <div className="page-header">
            <h1 className="page-title">Nuestros servicios</h1>
          </div>
          
          <div className="full-width-card">
            <p className="card-text">
              <strong>Canabacoa Fiestas</strong> te ofrece una buena variedad de servicios para que puedas disfrutar de tu evento. Desde el alquiler de equipos hasta la decoración y el catering, nos encargamos de todo para que tu evento sea perfecto. Incluimos una serie de adicionales como la supervisión del evento, el montaje y desmontaje, y el transporte de los alimentos pedidos y elementos alquilados.
            </p>
          </div>
         
          <div className="content-grid">
            {servicesData.map((service, index) => (
              <div key={index} className="info-card">
                <img src={service.image} alt={service.title} loading="lazy" className="card-image" />
                <h3 className="card-title">{service.title}</h3>
                <p className="card-text">{service.description}</p>
              </div>
            ))}
          </div>
        </main>
      </Container>
    </>
  );
}