import Logo from "../assets/logoVariants/OVALO-CF(titulo blanco).svg";
import "../styles/Footer.scss";
const Footer = () => {
  return (
<>
<footer>
    <div className='footer'>
        <div className="footerImgContainer">
            <img className='footerLogo' src={Logo} alt="CF Logo"/>
        </div>
        <div className='footerContainer'>
        <div className='footerInfo'>
            <h3>Información</h3>
            <p>Dirección: Calle 1, Santiago de los Caballeros, República Dominicana</p>
            <p>Teléfono: +0 (000) 000-0000</p>
            <p>Email:</p>
            </div>
            </div>
            <div className='footerMap'>
<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1685.953302039527!2d-70.65642057213539!3d19.424195904234644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sdo!4v1747414186066!5m2!1ses!2sdo"  loading="lazy"></iframe>
</div></div>

</footer>
</>
  )
}

export default Footer
