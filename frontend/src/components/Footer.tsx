import { lazy, Suspense } from "react";
import "../styles/Footer.scss";
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import MailIcon from '@mui/icons-material/MailOutlineRounded';

// Lazy load the map component
const MapComponent = lazy(() => import('./MapComponent'));

const Footer = () => {
  return (
    <footer id="footer">
      <div className='footer'>
        <div className="footerMap">
          <h3>Nos encuentras en...</h3>
          <h5>Santiago de los Caballeros</h5>
          <Suspense fallback={<div className="mapFrame">Cargando mapa...</div>}>
            <MapComponent />
          </Suspense>
        </div>

        <div className="footerComments">
          <p>comentarios</p>
        </div>

        <div className='footerInfo'>
          <div className='footerInfo'>
            <h3>Contáctanos</h3>
            <div className="ContactItem">
              <InstagramIcon className="contactIcons" />
              <a href="https://www.instagram.com/canabacoa_fiestas?igsh=MTB4Ymg4N3o4NXI3dw==" target="_blank" rel="noopener noreferrer">@canabacoa_fiestas</a>
            </div>
            
            <div className="ContactItem">
              <a className='contactPhones' href="tel:+18297700926">829-770-0926</a> 
              <WhatsAppIcon className="contactIcons"/>
              <a className='contactPhones' href="tel:+18093918940">809-391-8940</a>
            </div>

            <div className="ContactItem">
              <MailIcon className="contactIcons" />
              <a className='contactMail' href="mailto:soporte@canabacoafiesta.online">soporte@canabacoafiesta.online</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
