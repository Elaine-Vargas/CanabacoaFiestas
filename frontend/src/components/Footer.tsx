import "../styles/Footer.scss";
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import MailIcon from '@mui/icons-material/MailOutlineRounded';

const Footer = () => {
  return (
<>
<footer>
    <div className='footer'>
        <div className="footerMap">
            <h3>Nos encuentras en...</h3>
            <h5>Santiago de los Caballeros</h5>
            <iframe className="mapFrame" src="https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d2390.0520887179878!2d-70.65605755554813!3d19.424924246701103!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sdo!4v1747679609801!5m2!1ses!2sdo" loading="lazy"></iframe>
        </div>

        <div className="footerComments">
        <p>comentarios</p>
        </div>

 <div className='footerInfo'>
        <div className='footerInfo'>
            <div className="ContactItem">
                <InstagramIcon className="contactIcons" sx={{fontSize:'3vw'}}/>
                <a href="https://www.instagram.com/canabacoa_fiestas?igsh=MTB4Ymg4N3o4NXI3dw==" target="_blank">@canabacoa_fiestas</a>
            </div>
            
            <div className="ContactItem">
                <a className='contactPhones' href="tel:+18297700926">829-770-0926</a> 
                <WhatsAppIcon className="contactIcons"  sx={{fontSize:'3vw'}}/>
                <a className='contactPhones' href="tel:+18093918940">809-391-8940</a>
            </div>

            <div className="ContactItem">
                <MailIcon className="contactIcons"  sx={{fontSize:'3vw'}}/>
                <a className='contactMail' href="mailto:soporte@canabacoafiesta.online">soporte@canabacoafiesta.online</a>
            </div>
    </div>
    </div>

        {/* //footer v1
 */}
    </div>

</footer>
</>
  )
}

export default Footer
